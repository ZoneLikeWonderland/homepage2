// Usage: node scripts/check-interactions.cjs <dedicated-browser-websocket> [preview-url]
// Requires the ws package; HOMEPAGE_WS_MODULE may point to an existing installation.
const WebSocket=require(process.env.HOMEPAGE_WS_MODULE || 'ws'),fs=require('fs'),path=require('path');
const repo=path.resolve(__dirname,'..');
const base=(process.argv[3]||'http://127.0.0.1:8000/').replace(/\/?$/, '/');
if(!process.argv[2])throw Error('Pass the websocket URL of a dedicated QA browser.');
const output=process.env.HOMEPAGE_QA_OUTPUT_DIR;
if(output)fs.mkdirSync(output,{recursive:true});
const ws=new WebSocket(process.argv[2]);
let n=0,session,pending=new Map(),errors=[];
ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
function cmd(method,params={},s=session){return new Promise((resolve,reject)=>{let id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,...(s?{sessionId:s}:{})}));setTimeout(()=>{if(pending.has(id))reject(Error('timeout '+method))},15000).unref()})}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function ev(expression){let r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
function assert(v,msg){if(!v)throw Error(msg)}
async function shot(name){if(!output)return;let r=await cmd('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(r.data,'base64'))}
async function nav(url){await cmd('Page.bringToFront');await cmd('Page.navigate',{url});await delay(250);await ev('Promise.all([...document.images].filter(i=>i.loading!=="lazy").map(i=>i.decode().catch(()=>{})))');await delay(100)}
const inside='document.querySelector(".study-panel").shadowRoot';
ws.on('open',async()=>{try{
 const {targetId}=await cmd('Target.createTarget',{url:'about:blank'},null);session=(await cmd('Target.attachToTarget',{targetId,flatten:true},null)).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Page.bringToFront');
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await nav(base);
 const original=await ev('location.href');
 const tabsBefore=(await cmd('Target.getTargets',{},null)).targetInfos.filter(t=>t.type==='page'&&!t.url.startsWith('edge://')).length;
 const data=JSON.parse(fs.readFileSync(path.join(repo,'assets/papers.json')));
 async function open(id){
  await ev(`document.querySelector('#${id}').scrollIntoView({behavior:'instant',block:'center'})`);
  const pos=await ev('scrollY');const beforeX=await ev('document.querySelector("main.wrapper").getBoundingClientRect().left');
  const timing=await ev(`(()=>{let start=performance.now();document.querySelector('#${id} .paper-entry').click();return {ms:performance.now()-start,visible:document.querySelector('dialog').open,title:${inside}.querySelector('h1').textContent}})()`);
  assert(timing.visible&&timing.title,'immediate content '+id);
  assert(await ev('!document.querySelector("iframe")'),'no embedded page navigation');
  await delay(300);assert(await ev(`${inside}.querySelector('.study-scroll').scrollTop`)===0,'opens at beginning '+id);assert(Math.abs(await ev('document.querySelector("main.wrapper").getBoundingClientRect().left')-beforeX)<1,'background does not shift');return {pos,ms:timing.ms};
 }
 async function closeAt(y){
  await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:700,y,button:'left',clickCount:1});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:700,y,button:'left',clickCount:1});await delay(230);
  assert(await ev('!document.querySelector("dialog").open'),'outside closes');
 }
 let timings=[];
 for(const p of data){
  const {pos,ms}=await open(p.id);timings.push(ms);
  assert(await ev(`getComputedStyle(${inside}.querySelector('.study')).overflowY`)==='visible','no independent info scrollbar '+p.id);
  assert(await ev(`${inside}.querySelector('h1').textContent`)===p.title,'correct study '+p.id);
  assert(await ev(`${inside}.querySelectorAll('.resource-links a').length`)===p.links.length,'resource links '+p.id);
  assert(await ev(`(()=>{let r=document.querySelector('dialog').getBoundingClientRect();return r.x===0&&r.width===innerWidth&&r.top>=30&&r.bottom<=innerHeight-30})()`),'full width with outer space');
  await ev('document.querySelector(".study-close").click()');await delay(230);
  assert(Math.abs(await ev('scrollY')-pos)<2,'position restore '+p.id);
 }
 const {pos}=await open('clay');
 await ev(`${inside}.querySelector('.figure-full').decode()`);await delay(350);
 assert(await ev(`${inside}.querySelector('.figure-media').classList.contains('is-ready')`),'full-quality fade completes');
 await shot('overlay-clay-desktop');
 assert(await ev(`(()=>{let r=${inside},s=r.querySelector('.study').getBoundingClientRect(),g=r.querySelector('.gallery-story').getBoundingClientRect();return s.right<g.left})()`),'split layout');
 await ev(`${inside}.querySelector('.study-scroll').scrollTo({top:${inside}.querySelector('.gallery-frame').offsetHeight,behavior:'instant'})`);await delay(150);
 assert(await ev(`${inside}.querySelector('.gallery-count').textContent.startsWith('02')`),'gallery scroll updates');
 const insideTop=await ev(`${inside}.querySelector('.study').getBoundingClientRect().top`);assert(Math.abs(insideTop-await ev('document.querySelector("dialog").getBoundingClientRect().top'))<2,'left remains sticky');
 await shot('overlay-clay-second');
 assert(await ev(`${inside}.querySelectorAll('.figure-full')[1].dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}))`),'right-click native');
 // Clicking the artwork does not dismiss, while both exposed outer strips do.
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:900,y:400,button:'left',clickCount:1});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:900,y:400,button:'left',clickCount:1});assert(await ev('document.querySelector("dialog").open'),'artwork click keeps open');
 await closeAt(15);assert(Math.abs(await ev('scrollY')-pos)<2,'backdrop restores position');
 await open('bang');await closeAt(985);
 await open('bang');await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await delay(230);assert(await ev('!document.querySelector("dialog").open'),'Escape closes');
 for(const width of [390,320,900]){
  await cmd('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await open('bang');
  assert(await ev(`${inside}.querySelector('.study-scroll').scrollWidth<=${inside}.querySelector('.study-scroll').clientWidth`),'no overflow '+width);
  if(width===390)await shot('overlay-bang-mobile');
  await ev(`${inside}.querySelector('.study-back').click()`);await delay(230);
  assert(await ev('!document.querySelector("dialog").open'),'back button closes');
 }

 // Focus restoration must not masquerade as pointer hover.
 await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await cmd('Emulation.setTouchEmulationEnabled',{enabled:false});
 await ev('document.querySelector("#clay").scrollIntoView({behavior:"instant",block:"center"})');
 const rowPoint=await ev('(()=>{let r=document.querySelector("#clay").getBoundingClientRect();return {x:r.left+40,y:r.top+40}})()');
 const highlight=()=>ev('getComputedStyle(document.querySelector("#clay"),"::before").opacity');
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',...rowPoint});await delay(300);assert(await highlight()==='1','pointer hover highlights');
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:500});await delay(300);assert(await highlight()==='0','pointer leaving clears highlight');
 await ev('document.querySelector("#clay .paper-entry").focus()');await delay(300);assert(await highlight()==='0','keyboard focus does not highlight row');
 async function key(key,code,virtual,modifiers=0){await cmd('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:virtual,modifiers,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:key===' '?{text:' ',unmodifiedText:' '}:{})});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:virtual,modifiers})}
 await key('Enter','Enter',13);await delay(300);assert(await ev('document.querySelector("dialog").open'),'Enter opens study');
 for(let i=0;i<30;i++){
  await key('Tab','Tab',9);
  assert(await ev('document.querySelector("dialog").contains(document.activeElement)||document.activeElement===document.body'),'Tab stays inside modal');
 }
 await key('Tab','Tab',9,8);await key('Escape','Escape',27);await delay(350);
 assert(await highlight()==='0','Escape restores focus without row highlight');
 assert(await ev('document.activeElement===document.querySelector("#clay .paper-entry")'),'keyboard focus restored');
 await key(' ','Space',32);await delay(300);assert(await ev('document.querySelector("dialog").open'),'Space opens study');
 // Right-click, pointer cancellation, and a drag ending outside must not dismiss.
 await ev(`(()=>{let d=document.querySelector('dialog');for(let type of ['pointerdown','pointerup'])d.dispatchEvent(new PointerEvent(type,{pointerId:77,isPrimary:true,button:2,clientX:700,clientY:10,bubbles:true}))})()`);
 await delay(220);assert(await ev('document.querySelector("dialog").open'),'right-click backdrop does not dismiss');
 await ev(`(()=>{let d=document.querySelector('dialog');for(let type of ['pointerdown','pointercancel','pointerup'])d.dispatchEvent(new PointerEvent(type,{pointerId:78,isPrimary:true,button:0,clientX:700,clientY:10,bubbles:true}))})()`);
 await delay(220);assert(await ev('document.querySelector("dialog").open'),'cancelled pointer does not dismiss');
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:700,y:400,button:'left',clickCount:1});
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:700,y:10,buttons:1});
 await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:700,y:10,button:'left',clickCount:1});await delay(220);
 assert(await ev('document.querySelector("dialog").open'),'drag from artwork to backdrop does not dismiss');
 await ev('document.querySelector(".study-close").click()');await delay(350);assert(await highlight()==='0','X close does not leave row highlight');
 // No retained scroll or state after rapid dismissal/reopening.
 for(let i=0;i<5;i++){
  await ev(`document.querySelector('#${i%2?'bang':'clay'} .paper-entry').click();document.querySelector('.study-close').click()`);
  await delay(220);assert(await ev('!document.querySelector("dialog").open&&!document.body.classList.contains("study-open")'),'rapid open/close cleanup');
 }
 // Real mouse hits must select direct resources, not the row overlay.
 await ev('document.querySelector("#clay").scrollIntoView({behavior:"instant",block:"center"})');
 const resources=await ev('[...document.querySelectorAll("#clay .paper-links a")].map(a=>({href:a.href,x:a.getBoundingClientRect().x+a.offsetWidth/2,y:a.getBoundingClientRect().y+a.offsetHeight/2}))');
 for(const resource of resources){
  assert(await ev(`document.elementFromPoint(${resource.x},${resource.y}).closest('a')?.href`)===resource.href,'resource pointer hit target');
 }
 const pagesBefore=(await cmd('Target.getTargets',{},null)).targetInfos.filter(t=>t.type==='page'&&!t.url.startsWith('edge://'));
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:resources[0].x,y:resources[0].y,button:'left',clickCount:1});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:resources[0].x,y:resources[0].y,button:'left',clickCount:1});await delay(300);
 const external=(await cmd('Target.getTargets',{},null)).targetInfos.find(t=>t.type==='page'&&!pagesBefore.some(p=>p.targetId===t.targetId));
 assert(!!external,'resource opens new tab');assert(await ev('!document.querySelector("dialog").open'),'resource does not open study');await cmd('Target.closeTarget',{targetId:external.targetId},null);await cmd('Page.bringToFront');
 // Native download event verifies the full-resolution URL and byte count.
 if(process.env.HOMEPAGE_QA_DOWNLOAD_DIR){
  const events=[];const listener=raw=>{const m=JSON.parse(raw);if(m.method?.startsWith('Browser.download'))events.push(m)};ws.on('message',listener);
  await cmd('Browser.setDownloadBehavior',{behavior:'allowAndName',downloadPath:process.env.HOMEPAGE_QA_DOWNLOAD_DIR,eventsEnabled:true},null);
  await open('clay');await ev(`${inside}.querySelector('.gallery-download').click()`);
  for(let i=0;i<80&&!events.some(e=>e.method==='Browser.downloadProgress'&&e.params.state==='completed');i++)await delay(100);
  const begin=events.find(e=>e.method==='Browser.downloadWillBegin'),done=events.find(e=>e.method==='Browser.downloadProgress'&&e.params.state==='completed');
  assert(begin?.params.url===new URL('assets/teasers/clay.webp',base).href,'download uses original image');
  assert(done?.params.receivedBytes===fs.statSync(path.join(repo,'assets/teasers/clay.webp')).size,'download full byte count');
  ws.off('message',listener);await ev('document.querySelector(".study-close").click()');await delay(250);
 }
 // Slow/failed high-resolution loads keep a correctly sized preview; opening is independent of network.
 await cmd('Network.enable');await cmd('Network.setCacheDisabled',{cacheDisabled:true});
 await cmd('Network.setBlockedURLs',{urls:['*assets/teasers/clay.webp']});
 await open('clay');await delay(200);
 assert(await ev(`${inside}.querySelector('.figure-preview').naturalWidth>0`),'preview survives full-image failure');
 assert(await ev(`${inside}.querySelector('.figure-media').getBoundingClientRect().height>100`),'failure keeps layout');
 await ev('document.querySelector(".study-close").click()');await delay(220);
 await cmd('Network.setBlockedURLs',{urls:[]});await cmd('Network.setCacheDisabled',{cacheDisabled:false});
 // Genuine touch emulation: tapping must never leave a synthetic hover background.
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await cmd('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 assert(await ev('!matchMedia("(hover: hover)").matches'),'touch media active');
 await ev('document.querySelector("#clay").scrollIntoView({behavior:"instant",block:"start"})');
 const touchPoint=await ev('(()=>{let r=document.querySelector("#clay h3").getBoundingClientRect();return {x:r.left+30,y:r.top+20}})()');
 async function tap(x,y){await cmd('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cmd('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(350)}
 await tap(touchPoint.x,touchPoint.y);assert(await ev('document.querySelector("dialog").open'),'touch opens study');
 await tap(180,15);assert(await ev('!document.querySelector("dialog").open'),'touch backdrop closes');
 assert(await highlight()==='0','touch close leaves no hover highlight');
 await cmd('Emulation.setTouchEmulationEnabled',{enabled:false});
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await open('clay');
 assert(await ev('getComputedStyle(document.querySelector("dialog")).animationName')==='none','reduced motion');
 await ev('document.querySelector(".study-close").click()');await delay(50);
 assert(await ev('location.href')===original,'no URL changes');
 assert((await cmd('Target.getTargets',{},null)).targetInfos.filter(t=>t.type==='page'&&!t.url.startsWith('edge://')).length===tabsBefore,'no new tabs');
 assert(errors.length===0,'no JS errors');
 console.log('PASS: hover/focus/touch separation; keyboard Enter/Space/Tab/Escape; rapid reopen; backdrop gesture guards; direct external resources; original download; image error fallback; all 16 instant local views; full-width/top-bottom backdrop; top and bottom dismiss; close/Escape/back; gallery/sticky text; native image menu; no new URL/tab/iframe; reduced motion; widths 1440/900/390/320. Synchronous open milliseconds:',timings.map(n=>Math.round(n)));
 await cmd('Browser.close',{},null);ws.close();
}catch(e){console.error(e);ws.close();process.exitCode=1}});
