const moduleEl=document.getElementById('module');
const viewport=document.getElementById('viewport');
const white=document.getElementById('whiteCover');
const c1=document.getElementById('img1'),c2=document.getElementById('img2'),c3=document.getElementById('img3');
const ctx1=c1.getContext('2d');
const wctx=white.getContext('2d');
const stone=document.getElementById('stone');

let imgs=[];
let drawing=false;
let lastPointer=null;
let pathDistance=0;
let stage=0;
let seed=1;

// Global unlock rules requested by William:
// - layer 2 becomes available after 99% of layer 1 has been discovered
//   (here: 99% of the white veil removed, so photo 1 is essentially revealed)
// - every following photo starts after 90% of the current transition
const THRESHOLD_2=0.995;
const THRESHOLD_NEXT_PHOTO=0.90;
const HALF_WHITE=46.7;
const HALF_IMG1=23.3;
const HALF_IMG2=15.7;
const GUARD_RADIUS=60;
const GUARD_MAX_DENSITY=0.12;

// The new engine does not interpolate points at fixed intervals.
// It processes the whole swept segment between pointer samples, so fast motion
// cannot leave geometric gaps.
let MW=1,MH=1,VW=1,VH=1,OFFX=0,OFFY=0;
let whiteAlive=null;
let whiteRemaining=0;
let lastAdvance=null;
let whitePixels=null;
let displayPixels=null;
let sourcePixels=[];

let dirtyWhite=null;
let dirtyPhoto=null;
let TOTAL_PHOTO_PIXELS=0;
let photoStep=null;
let photoState=null;
let visiblePhotoCounts=null;
let activeStep=0;
let currentTargetReached=0;
let guardWhiteIntegral=null;
let guardPhotoIntegral=null;
let guardDirty=true;
let loopCount=0;
let pendingPointerPoints=[];
let pointerFrame=0;

function rects(){
  const mr=moduleEl.getBoundingClientRect(),vr=viewport.getBoundingClientRect();
  return {mr,vr,offX:vr.left-mr.left,offY:vr.top-mr.top};
}

function resetDirty(){
  dirtyWhite={minX:Infinity,minY:Infinity,maxX:-1,maxY:-1};
  dirtyPhoto={minX:Infinity,minY:Infinity,maxX:-1,maxY:-1};
}
function markDirty(d,x,y){
  if(x<d.minX)d.minX=x;
  if(y<d.minY)d.minY=y;
  if(x>d.maxX)d.maxX=x;
  if(y>d.maxY)d.maxY=y;
}
function flushDirty(){
  if(dirtyWhite.maxX>=dirtyWhite.minX){
    wctx.putImageData(
      whitePixels,0,0,
      dirtyWhite.minX,dirtyWhite.minY,
      dirtyWhite.maxX-dirtyWhite.minX+1,
      dirtyWhite.maxY-dirtyWhite.minY+1
    );
  }
  if(dirtyPhoto.maxX>=dirtyPhoto.minX){
    ctx1.putImageData(
      displayPixels,0,0,
      dirtyPhoto.minX,dirtyPhoto.minY,
      dirtyPhoto.maxX-dirtyPhoto.minX+1,
      dirtyPhoto.maxY-dirtyPhoto.minY+1
    );
  }
}

function buildCoverPixels(im,w,h){
  const oc=document.createElement('canvas');
  oc.width=w; oc.height=h;
  const ox=oc.getContext('2d',{willReadFrequently:true});
  const scale=Math.max(w/im.width,h/im.height);
  const dw=im.width*scale,dh=im.height*scale;
  ox.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);
  return ox.getImageData(0,0,w,h);
}

function size(){
  const R=rects();
  MW=Math.max(1,Math.round(R.mr.width));
  MH=Math.max(1,Math.round(R.mr.height));
  VW=Math.max(1,Math.round(R.vr.width));
  VH=Math.max(1,Math.round(R.vr.height));
  OFFX=Math.round(R.offX);
  OFFY=Math.round(R.offY);

  c1.width=VW; c1.height=VH;
  c2.width=VW; c2.height=VH;
  c3.width=VW; c3.height=VH;
  white.width=MW; white.height=MH;

  whiteAlive=new Uint8Array(MW*MH);
  whiteAlive.fill(1);
  whiteRemaining=MW*MH;

  // One distance memory per module pixel. A point may advance only one layer
  // per local pass; after travelling away and coming back during the same click,
  // it can advance again.
  lastAdvance=new Float32Array(MW*MH);
  lastAdvance.fill(-1e9);

  TOTAL_PHOTO_PIXELS=VW*VH;
  photoStep=new Uint32Array(TOTAL_PHOTO_PIXELS);
  photoState=new Uint8Array(TOTAL_PHOTO_PIXELS);
  photoState.fill(1);
  visiblePhotoCounts=new Uint32Array(imgs.length);
  activeStep=0;
  currentTargetReached=0;
  guardWhiteIntegral=new Uint32Array((MW+1)*(MH+1));
  guardPhotoIntegral=new Uint32Array((VW+1)*(VH+1));
  guardDirty=true;
  loopCount=0;
  pendingPointerPoints=[];
  if(pointerFrame) cancelAnimationFrame(pointerFrame);
  pointerFrame=0;

  sourcePixels=imgs.map(im=>buildCoverPixels(im,VW,VH));
  displayPixels=ctx1.createImageData(VW,VH);
  displayPixels.data.set(sourcePixels[0].data);
  ctx1.putImageData(displayPixels,0,0);

  whitePixels=wctx.createImageData(MW,MH);
  const d=whitePixels.data;
  for(let i=0;i<d.length;i+=4){
    d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=255;
  }
  wctx.putImageData(whitePixels,0,0);

  stage=0;
  pathDistance=0;
  lastPointer=null;
  resetDirty();
}

function layerCount(){return Math.max(1,sourcePixels.length)}

function updateStage(){
  if(activeStep===0){
    const whiteErased=1-(whiteRemaining/(MW*MH));
    if(whiteErased>=THRESHOLD_2){
      activeStep=1;
      stage=1;
      currentTargetReached=0;
    }
    return;
  }

  const targetReady=currentTargetReached/Math.max(1,TOTAL_PHOTO_PIXELS)>=THRESHOLD_NEXT_PHOTO;
  // The loop is global and continuous: once 90% reaches the current target,
  // the next transition opens even if a few older pixels remain elsewhere.
  // Those pixels keep advancing locally one layer at a time and never freeze.
  if(targetReady){
    activeStep++;
    stage=activeStep;
    currentTargetReached=0;
    loopCount=Math.floor(activeStep/layerCount());
  }
}

function rebuildGuardSnapshot(){
  // The white-cover guard remains density based so isolated antialiased crumbs
  // cannot stop the first photo transition.
  guardWhiteIntegral.fill(0);
  const whiteStride=MW+1;
  for(let y=0;y<MH;y++){
    let rowSum=0;
    const srcRow=y*MW;
    const intRow=(y+1)*whiteStride;
    const prevRow=y*whiteStride;
    for(let x=0;x<MW;x++){
      if(whiteAlive[srcRow+x]) rowSum++;
      guardWhiteIntegral[intRow+x+1]=guardWhiteIntegral[prevRow+x+1]+rowSum;
    }
  }

  // One summed-area table marks pixels that are older than the current source
  // layer. The query is O(1) per erased pixel and works for any layer count.
  guardPhotoIntegral.fill(0);
  const photoStride=VW+1;
  const blockerStep=Math.max(0,activeStep-1);
  for(let y=0;y<VH;y++){
    let rowSum=0;
    const srcRow=y*VW;
    const intRow=(y+1)*photoStride;
    const prevRow=y*photoStride;
    for(let x=0;x<VW;x++){
      if(photoStep[srcRow+x]<blockerStep) rowSum++;
      guardPhotoIntegral[intRow+x+1]=guardPhotoIntegral[prevRow+x+1]+rowSum;
    }
  }
}

function whiteGuardAllows(vx,vy){
  const mx=vx+OFFX,my=vy+OFFY,r=GUARD_RADIUS;
  const x0=Math.max(0,mx-r),x1=Math.min(MW-1,mx+r);
  const y0=Math.max(0,my-r),y1=Math.min(MH-1,my+r);
  const stride=MW+1;
  const count=
    guardWhiteIntegral[(y1+1)*stride+x1+1]-guardWhiteIntegral[(y1+1)*stride+x0]-
    guardWhiteIntegral[y0*stride+x1+1]+guardWhiteIntegral[y0*stride+x0];
  const area=(x1-x0+1)*(y1-y0+1);
  return count/Math.max(1,area)<=GUARD_MAX_DENSITY;
}

function guardAllowsTransition(step,vx,vy){
  if(step===0) return whiteGuardAllows(vx,vy);
  // Lagging pixels always get priority so they can catch up instead of being
  // frozen by the global phase. The active source keeps the 60px guard rail.
  if(step<activeStep-1) return true;
  const r=GUARD_RADIUS;
  const x0=Math.max(0,vx-r),x1=Math.min(VW-1,vx+r);
  const y0=Math.max(0,vy-r),y1=Math.min(VH-1,vy+r);
  const stride=VW+1;
  const count=
    guardPhotoIntegral[(y1+1)*stride+x1+1]-guardPhotoIntegral[(y1+1)*stride+x0]-
    guardPhotoIntegral[y0*stride+x1+1]+guardPhotoIntegral[y0*stride+x0];
  const area=(x1-x0+1)*(y1-y0+1);
  return count/Math.max(1,area)<=GUARD_MAX_DENSITY;
}

function modulePoint(cx,cy){
  const r=moduleEl.getBoundingClientRect();
  return {x:cx-r.left,y:cy-r.top};
}

function insideViewport(x,y){
  return x>=OFFX && y>=OFFY && x<OFFX+VW && y<OFFY+VH;
}

function organicNoise(x,y,amp){
  // Soft, low-amplitude edge variation: keeps the previously approved
  // torn-paper character without returning to a spiky outline.
  const a=Math.sin(x*0.165+y*0.115+seed*0.000003);
  const b=Math.sin(x*0.071-y*0.094+1.7);
  return (a*0.65+b*0.35)*amp;
}

function radiusForStep(step){
  return step===0 ? HALF_IMG1 : HALF_IMG2;
}

function cooldownAfterRadius(r){
  // Store the distance at which this exact point may advance again.
  // Crucially this uses the radius of the layer JUST changed, not the
  // smaller radius of the layer underneath. That prevents one fast straight
  // sweep from revealing two layers at the same point.
  return Math.max(34,r*2+12);
}

function copyPhotoPixel(photoIndex,pi){
  const src=sourcePixels[photoIndex-1].data;
  const dst=displayPixels.data;
  const o=pi*4;
  dst[o]=src[o];
  dst[o+1]=src[o+1];
  dst[o+2]=src[o+2];
  dst[o+3]=255;
}

function processCapsule(a,b,pathStart){
  const dx=b.x-a.x,dy=b.y-a.y;
  const segLen=Math.hypot(dx,dy);
  const segLen2=dx*dx+dy*dy;
  const maxR=HALF_WHITE+3;

  const minX=Math.max(0,Math.floor(Math.min(a.x,b.x)-maxR));
  const maxX=Math.min(MW-1,Math.ceil(Math.max(a.x,b.x)+maxR));
  const minY=Math.max(0,Math.floor(Math.min(a.y,b.y)-maxR));
  const maxY=Math.min(MH-1,Math.ceil(Math.max(a.y,b.y)+maxR));

  for(let y=minY;y<=maxY;y++){
    const py=y+0.5;
    const row=y*MW;
    for(let x=minX;x<=maxX;x++){
      const px=x+0.5;
      const mi=row+x;

      let kind=null;
      let currentStep=0;
      let radius=0;

      if(whiteAlive[mi]){
        kind='white';
        radius=HALF_WHITE;
      }else if(insideViewport(x,y)){
        const vx=x-OFFX,vy=y-OFFY;
        const pi=vy*VW+vx;
        currentStep=photoStep[pi];
        if(activeStep===0 || currentStep>=activeStep) continue;
        kind='photo';
        radius=radiusForStep(currentStep);
      }else{
        continue;
      }

      let t=segLen2<0.0001 ? 0 : ((px-a.x)*dx+(py-a.y)*dy)/segLen2;
      if(t<0)t=0; else if(t>1)t=1;
      const qx=px-(a.x+dx*t),qy=py-(a.y+dy*t);
      const d2=qx*qx+qy*qy;
      const edgeAmp=(kind==='white') ? 1.7 : (currentStep===0 ? 1.15 : 0.9);
      const effectiveR=radius+organicNoise(x,y,edgeAmp);
      if(d2>effectiveR*effectiveR) continue;

      const travelHere=pathStart+t*segLen;
      if(travelHere < lastAdvance[mi]) continue;

      if(kind==='white'){
        whiteAlive[mi]=0;
        whiteRemaining--;
        if(insideViewport(x,y)){
          const pi=(y-OFFY)*VW+(x-OFFX);
          visiblePhotoCounts[photoState[pi]-1]++;
        }
        const o=mi*4;
        whitePixels.data[o+3]=0;
        guardDirty=true;
        lastAdvance[mi]=travelHere+cooldownAfterRadius(HALF_WHITE);
        markDirty(dirtyWhite,x,y);
      }else{
        const vx=x-OFFX,vy=y-OFFY;
        const pi=vy*VW+vx;

        // A blocked pixel receives no cooldown. As soon as its guard rail is
        // clear it responds on the very next pointer sample.
        if(!guardAllowsTransition(currentStep,vx,vy)) continue;

        const nextStep=currentStep+1;
        const nextLayer=(nextStep%layerCount())+1;
        visiblePhotoCounts[photoState[pi]-1]--;
        visiblePhotoCounts[nextLayer-1]++;
        photoStep[pi]=nextStep;
        photoState[pi]=nextLayer;
        copyPhotoPixel(nextLayer,pi);
        guardDirty=true;
        if(nextStep===activeStep) currentTargetReached++;
        lastAdvance[mi]=travelHere+cooldownAfterRadius(radius);
        markDirty(dirtyPhoto,vx,vy);
      }
    }
  }
}

function processSweptSegment(a,b){
  const dx=b.x-a.x,dy=b.y-a.y;
  const segLen=Math.hypot(dx,dy);
  processCapsule(a,b,pathDistance);
  pathDistance+=segLen;
}

function processPointerPoint(p){
  if(!lastPointer){
    processSweptSegment(p,p);
    lastPointer=p;
    return;
  }
  processSweptSegment(lastPointer,p);
  lastPointer=p;
}

function moveStone(e){
  stone.style.left=e.clientX+'px';
  stone.style.top=e.clientY+'px';
}

function flushPointerQueue(){
  pointerFrame=0;
  if(!drawing || !pendingPointerPoints.length) return;
  const points=pendingPointerPoints;
  pendingPointerPoints=[];
  resetDirty();

  // One generic guard snapshot per frame, regardless of whether PHOTO_SRC
  // contains three, five, or more layers.
  if(activeStep>0 && guardDirty){
    rebuildGuardSnapshot();
    guardDirty=false;
  }

  for(const point of points) processPointerPoint(point);
  flushDirty();
  updateStage();
  if(pendingPointerPoints.length) pointerFrame=requestAnimationFrame(flushPointerQueue);
}

function queuePointerEvent(e){
  const coalesced=e.getCoalescedEvents ? e.getCoalescedEvents() : null;
  const events=coalesced && coalesced.length ? coalesced : [e];
  for(const ev of events){
    const p=modulePoint(ev.clientX,ev.clientY);
    const prev=pendingPointerPoints[pendingPointerPoints.length-1];
    if(!prev || prev.x!==p.x || prev.y!==p.y) pendingPointerPoints.push(p);
  }
  if(!pointerFrame) pointerFrame=requestAnimationFrame(flushPointerQueue);
}

function eraseCursorCanReveal(){
  return !document.body.classList.contains('bridge-pre');
}
function revealEraseCursor(e){
  if(!eraseCursorCanReveal()) return false;
  moduleEl.classList.add('erase-cursor-live');
  stone.classList.add('visible');
  if(e) moveStone(e);
  return true;
}
function hideEraseCursor(){
  stone.classList.remove('visible','active');
  moduleEl.classList.remove('erase-cursor-live');
}

moduleEl.onpointerenter=e=>{
  moveStone(e);
  // If the pointer enters only after the threshold is already visible,
  // the entry itself is the first intentional interaction: reveal immediately.
  if(eraseCursorCanReveal()) revealEraseCursor(e);
  else hideEraseCursor();
};

moduleEl.onpointerleave=()=>{
  if(!drawing) hideEraseCursor();
};

function drawFromPointerEvent(e){
  if(drawing && e.pointerType==='mouse' && !(e.buttons&1)){
    stop(e);
    return;
  }
  // Recover immediately if a browser dropped pointerdown/pointer-capture while
  // the primary button is visibly still held.
  if(!drawing && (e.buttons&1)){
    drawing=true;
    lastPointer=null;
    pathDistance=0;
    lastAdvance.fill(-1e9);
    stone.classList.add('active');
  }
  if(!drawing) return;
  queuePointerEvent(e);
}

moduleEl.onpointermove=e=>{
  moveStone(e);
  // v39: when the threshold appears underneath a stationary pointer, keep the
  // normal arrow and do NOT reveal the erase cursor. The first real movement
  // inside the module switches to the custom erase cursor.
  if(eraseCursorCanReveal() && !stone.classList.contains('visible')) revealEraseCursor(e);
  // Coalesced standard pointer samples plus swept segments are enough to retain
  // the complete path without the duplicate workload of pointerrawupdate.
  drawFromPointerEvent(e);
};

moduleEl.onpointerdown=e=>{
  if(eraseCursorCanReveal()) revealEraseCursor(e);
  drawing=true;
  seed=((e.clientX*73856093)^(e.clientY*19349663))>>>0;
  lastPointer=null;
  pathDistance=0;
  lastAdvance.fill(-1e9);
  pendingPointerPoints=[];
  stone.classList.add('active');
  moduleEl.setPointerCapture?.(e.pointerId);
  moveStone(e);
  queuePointerEvent(e);
};

function stop(e){
  // Process the release coordinate too: a quick gesture may end between the
  // final move sample and pointerup, and that short tail must not be lost.
  if(drawing){
    if(e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) queuePointerEvent(e);
    if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0}
    if(pendingPointerPoints.length) flushPointerQueue();
  }
  drawing=false;
  lastPointer=null;
  stone.classList.remove('active');
  try{if(e)moduleEl.releasePointerCapture?.(e.pointerId)}catch(_){}
}
moduleEl.onpointerup=stop;
moduleEl.onpointercancel=stop;
moduleEl.onlostpointercapture=e=>{if(drawing)stop(e)};
window.addEventListener('blur',()=>{if(drawing)stop(null)});

window.__resetEraseCursorForThreshold=hideEraseCursor;

function ratioAtStep(step){
  if(!TOTAL_PHOTO_PIXELS) return 0;
  let count=0;
  for(let i=0;i<TOTAL_PHOTO_PIXELS;i++) if(photoStep[i]>=step) count++;
  return count/TOTAL_PHOTO_PIXELS;
}

function stepSummary(){
  const counts={};
  for(let i=0;i<TOTAL_PHOTO_PIXELS;i++){
    const key=photoStep[i];
    counts[key]=(counts[key]||0)+1;
  }
  return counts;
}

window.__eraseDebug={
  get stage(){return stage},
  get whiteErasedRatio(){return 1-(whiteRemaining/(MW*MH))},
  get layer2DiscoveredRatio(){return ratioAtStep(1)},
  get layer3DiscoveredRatio(){return ratioAtStep(2)},
  get layerCount(){return layerCount()},
  get activeStep(){return activeStep},
  get cyclePhase(){return activeStep===0 ? 0 : ((activeStep-1)%layerCount())+1},
  get activeLayer(){return activeStep===0 ? 1 : (activeStep%layerCount())+1},
  get phaseProgress(){
    return activeStep===0
      ? 1-(whiteRemaining/(MW*MH))
      : currentTargetReached/Math.max(1,TOTAL_PHOTO_PIXELS);
  },
  get loopCount(){return loopCount},
  get stepSummary(){return stepSummary()},
  get photoStep(){return photoStep},
  get photoState(){return photoState},
  get visiblePhotoCounts(){return visiblePhotoCounts ? Array.from(visiblePhotoCounts) : []},
  get visiblePhotoRatios(){return visiblePhotoCounts ? Array.from(visiblePhotoCounts,count=>count/Math.max(1,TOTAL_PHOTO_PIXELS)) : []},
  get dimensions(){return {MW,MH,VW,VH,OFFX,OFFY}}
};


function setCursorMode(mode){
  stone.classList.remove('mode-clear','mode-ink');
  stone.classList.add('mode-'+mode);
}

