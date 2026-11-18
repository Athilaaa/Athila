
/* ===== Projects row: continuous auto-scroll + arrow buttons + swipe ===== */
(function(){
const box=document.getElementById('projMarquee'),track=box&&box.querySelector('.projects');
if(!box||!track)return;
const prev=document.getElementById('projPrev'),next=document.getElementById('projNext'),nav=box.parentElement;
const base=[...track.children].filter(c=>c.classList.contains('project'));
if(!base.length)return;
const SECS=44;            /* seconds for the row to travel one full set (auto-scroll speed) */
let step=0,W=0,copies=1,pos=0,anim=null,hold=0,hovering=false,inView=true,lastT=0,lastSet=0;
const now=()=>performance.now();
function measure(){
  const a=base[0].getBoundingClientRect(),b=base[1]&&base[1].getBoundingClientRect();
  step=b?Math.abs(b.left-a.left):a.width+18; W=step*base.length;
}
function ensure(){
  const need=2+Math.ceil(Math.max(innerWidth,1920)/Math.max(W,1));
  while(copies<need){
    base.forEach(b=>{const c=b.cloneNode(true);c.setAttribute('aria-hidden','true');c.tabIndex=-1;
      c.querySelectorAll('.gh').forEach(g=>g.remove());track.appendChild(c)});
    copies++;
  }
}
const mod=v=>((v%W)+W)%W;
function write(){const v=W+mod(pos);lastSet=v;box.scrollLeft=v}
function go(dir){
  measure();
  const start=anim?anim.to:pos, to=(Math.round(start/step)+dir)*step;
  anim={from:pos,to:to,t0:now(),d:Math.min(750,420+Math.abs(to-pos)/4)};
  hold=now()+3200;
}
function tick(t){
  const dt=Math.min(.25,(t-(lastT||t))/1000);lastT=t;let moved=false;
  if(anim){
    const k=Math.min(1,(now()-anim.t0)/anim.d),e=1-Math.pow(1-k,3);
    pos=anim.from+(anim.to-anim.from)*e;moved=true;
    if(k>=1){pos=mod(anim.to);anim=null}
  }else if(!hovering&&now()>hold&&inView&&!document.hidden){
    pos-=W/SECS*dt;if(pos<0)pos+=W;moved=true;   /* projects drift RIGHT, opposite to the skills strip and the design gallery */
  }else if(now()>hold&&(pos<0||pos>=W)){pos=mod(pos);moved=true}
  if(moved)write();
  requestAnimationFrame(tick);
}
box.addEventListener('scroll',()=>{
  if(Math.abs(box.scrollLeft-lastSet)>2){pos=box.scrollLeft-W;anim=null;hold=now()+3500;lastSet=box.scrollLeft}
},{passive:true});
['touchstart','wheel'].forEach(ev=>box.addEventListener(ev,()=>{hold=now()+3500},{passive:true}));
nav.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovering=true});
nav.addEventListener('pointerleave',()=>{hovering=false});
prev.addEventListener('click',()=>go(-1));
next.addEventListener('click',()=>go(1));
box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(-1);e.preventDefault()}if(e.key==='ArrowRight'){go(1);e.preventDefault()}});
if('IntersectionObserver' in window)new IntersectionObserver(es=>{inView=es[0].isIntersecting}).observe(nav);
function init(){measure();ensure();write()}
addEventListener('resize',()=>{const f=pos/(W||1);measure();ensure();pos=f*W;write()});
addEventListener('load',()=>{const f=pos/(W||1);measure();ensure();pos=f*W;write()});
prev.hidden=false;next.hidden=false;
init();requestAnimationFrame(tick);
})();

;

// Decorative particle field: lightweight canvas, no external dependencies.
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');let w,h,pts=[];function resize(){w=canvas.width=innerWidth*devicePixelRatio;h=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);pts=Array.from({length:Math.min(100,Math.floor(innerWidth/13))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.4+.3}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(let i=0;i<pts.length;i++){let p=pts[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='#d8c4ff';ctx.globalAlpha=.45;ctx.fill();for(let j=i+1;j<pts.length;j++){let q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<100){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='#ff9db7';ctx.globalAlpha=(1-d/100)*.09;ctx.stroke()}}}ctx.globalAlpha=1;requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw();
// Reveal content as it enters the viewport.
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const projects={games:{type:'LLM EVALUATION / 001',title:'Game Reasoning in LLMs',body:'Developed evaluation benchmarks for LLM reasoning in sequential perfect-information games: Tic-Tac-Toe, Connect 4 and Chopsticks. Built automated minimax-based pipelines that measure decision optimality, regret and legal-move accuracy across thousands of game states, then benchmarked GPT-4o, Claude Sonnet and Gemini to expose limits in multi-step reasoning, strategic lookahead and backward induction.',tags:['MINIMAX','LLM EVALUATION','REGRET SCORING','BENCHMARKS']},virality:{type:'PREDICTIVE ANALYTICS / 002',title:'TikTok Virality Prediction',body:'Cleaned and engineered features from 19,000+ TikTok records to predict above-median views, with leakage checks that excluded view count and post-posting metrics. A fine-tuned multimodal DistilBERT reached 0.994 ROC-AUC against 0.989 for a Random Forest baseline. On an unseen 565-video dataset AUC fell to 0.52, and the causes and limitations are documented. Includes unit tests and CI with GitHub Actions.',tags:['DISTILBERT','RANDOM FOREST','FEATURE ENGINEERING','GITHUB ACTIONS']},therapify:{type:'HUMAN-CENTERED AI / 003',title:'Therapify: A Voice Activated Virtual Therapist',body:'An AI-powered mental-health chatbot using NLP, sentiment analysis and transformer-based models for context-aware conversations. OpenAI Whisper handles speech-to-text and Pyttsx3 handles text-to-speech for real-time voice interaction, with preprocessing and intent-aware response handling to improve conversational flow.',tags:['WHISPER','NLP','SENTIMENT ANALYSIS','TRANSFORMERS']},sih:{type:'PRIVACY / RAG / 004',title:'ForgetMerag',body:'Designing a deletion-tracking layer for retrieval-augmented generation. It traces document-derived chunks, embeddings and metadata, then tests whether deleted information can still be retrieved after it has been removed.',tags:['RAG','PRIVACY','DELETION TRACKING','EMBEDDINGS']}};const modal=document.getElementById('projectModal');document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>{const p=projects[btn.dataset.project];document.getElementById('modalType').textContent=p.type;document.getElementById('modalTitle').textContent=p.title;document.getElementById('modalBody').textContent=p.body;document.getElementById('modalTags').innerHTML=p.tags.map(t=>`<span class="tag">${t}</span>`).join('');modal.classList.add('show')}));function closeModal(){modal.classList.remove('show')}document.getElementById('closeModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),subject=encodeURIComponent('Portfolio contact from '+f.get('name')),body=encodeURIComponent('Name: '+f.get('name')+'\nEmail: '+f.get('email')+'\n\n'+f.get('message'));location.href='mailto:athilakoli@gmail.com?subject='+subject+'&body='+body;const toast=document.getElementById('toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)});
// Interactive moodboard: move the cursor for depth, or shift the visual atmosphere.
const moodScene=document.getElementById('moodScene');
const moodCaption=document.getElementById('moodCaption');
const moodVibes=[{cls:'',caption:'A STUDY IN LIGHT, DEPTH & POSSIBILITY'},{cls:'vibe-two',caption:'A STUDY IN FLOW, SPACE & CLARITY'},{cls:'vibe-three',caption:'A STUDY IN FORM, CONTRAST & EXPRESSION'}];let moodIndex=0;
document.getElementById('shuffleMood').addEventListener('click',()=>{moodScene.classList.remove('vibe-two','vibe-three');moodIndex=(moodIndex+1)%moodVibes.length;if(moodVibes[moodIndex].cls)moodScene.classList.add(moodVibes[moodIndex].cls);moodCaption.textContent=moodVibes[moodIndex].caption;});

// Subtle pointer parallax on the simulation.


;

(()=>{const $=id=>document.getElementById(id),rm=false;
/* fairy lights, like the string lights in your photo */
const vb=$('vibeBg');for(let i=0;i<30;i++){const f=document.createElement('i'),z=4+Math.random()*9;f.className='fl';f.style.cssText=`left:${Math.random()*100}%;top:${Math.pow(Math.random(),1.6)*100}%;width:${z}px;height:${z}px;--d:${3+Math.random()*4}s;--l:-${Math.random()*6}s`;vb.appendChild(f)}
/* Spotify: real embedded player + custom play button, docks and follows while scrolling */
const ID='56st9CBVooIK3J5A4lQzJ5',card=$('spCard'),slot=$('current-fav'),emb=$('spEmbed'),btn=$('spPlay'),bar=$('spBar'),sub=$('spSub');let ctrl=null,docked=false;
function setP(v){card.classList.toggle('playing',v);btn.setAttribute('aria-pressed',v);btn.setAttribute('aria-label',v?'Pause':'Play');sub.textContent=v?'♫ NOW PLAYING · it follows you as you scroll':'⏸ PAUSED · press play to continue'}
function fallback(){if(ctrl||emb.querySelector('iframe'))return;emb.innerHTML=`<iframe title="Spotify player" src="https://open.spotify.com/embed/playlist/${ID}?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`}
window.onSpotifyIframeApiReady=api=>{if(emb.querySelector('iframe'))return;api.createController($('spMount'),{uri:'spotify:playlist:'+ID,width:'100%',height:152},c=>{ctrl=c;c.addListener('playback_update',e=>{const d=e.data;setP(!d.isPaused);if(d.duration)bar.style.width=(d.position/d.duration*100)+'%'})})};
const sc=document.createElement('script');sc.src='https://open.spotify.com/embed/iframe-api/v1';sc.async=true;sc.onerror=fallback;document.body.appendChild(sc);setTimeout(()=>{if(!ctrl)fallback()},5000);
btn.onclick=()=>ctrl?ctrl.togglePlay():window.open('https://open.spotify.com/playlist/'+ID,'_blank','noopener');
$('spMin').onclick=()=>card.classList.toggle('min');
function dock(v){if(v===docked)return;if(v)slot.style.height=card.offsetHeight+'px';else slot.style.height='';docked=v;card.classList.toggle('docked',v);if(!v)card.classList.remove('min')}
new IntersectionObserver(([e])=>dock(!e.isIntersecting&&e.boundingClientRect.bottom<80)).observe(slot);
/* hero simulation: reactive constellation + orbiting satellites + floating photos */
const sn=$('moodScene'),cv=$('sceneNet');
if(sn&&cv&&!rm){const x=cv.getContext('2d'),ph=sn.querySelector('.image-main'),ps=sn.querySelector('.image-small');let W,H,N=[],m={x:-1e3,y:-1e3},vis=true,px=0,py=0,tx=0,ty=0;
const fit=()=>{const r=sn.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0);N=Array.from({length:Math.round(Math.min(46,Math.max(24,W*H/7500)))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.6,c:Math.random()<.4?'255,157,183':'217,186,244'}))};fit();addEventListener('resize',fit);
sn.addEventListener('pointermove',e=>{const r=sn.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;if(e.pointerType!=='touch'){tx=m.x/W-.5;ty=m.y/H-.5}});
sn.addEventListener('pointerleave',()=>{m.x=m.y=-1e3;tx=ty=0});
sn.addEventListener('pointerdown',e=>{const r=sn.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;N.forEach(n=>{const dx=n.x-cx,dy=n.y-cy,d=Math.hypot(dx,dy)+1;if(d<200){n.vx+=dx/d*3.2;n.vy+=dy/d*3.2}})});
new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(sn);
const orb=[{a:.68,b:.31,r:-29,s:.0014,c:'255,240,255'},{a:.57,b:.55,r:55,s:-.001,c:'255,170,200'}];
const loop=t=>{requestAnimationFrame(loop);if(!vis||document.hidden)return;x.clearRect(0,0,W,H);
for(const n of N){const dx=m.x-n.x,dy=m.y-n.y,d=Math.hypot(dx,dy);if(d<150){n.vx+=dx/d*.012;n.vy+=dy/d*.012}n.vx*=.992;n.vy*=.992;if(Math.hypot(n.vx,n.vy)<.12){n.vx*=1.02;n.vy*=1.02}n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1}
x.lineWidth=.8;for(let i=0;i<N.length;i++){const a=N[i];for(let j=i+1;j<N.length;j++){const b=N[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<100){x.strokeStyle=`rgba(${a.c},${(1-d/100)*.35})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}const d=Math.hypot(a.x-m.x,a.y-m.y);if(d<150){x.strokeStyle=`rgba(255,255,255,${(1-d/150)*.5})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(m.x,m.y);x.stroke()}x.fillStyle=`rgba(${a.c},.8)`;x.beginPath();x.arc(a.x,a.y,a.r,0,7);x.fill()}
for(const o of orb){const rx=W*o.a/2,ry=H*o.b/2,q=o.r*Math.PI/180,cs=Math.cos(q),sg=Math.sin(q);for(let k=0;k<14;k++){const a=t*o.s-k*.07*Math.sign(o.s),ex=rx*Math.cos(a),ey=ry*Math.sin(a);x.fillStyle=`rgba(${o.c},${(1-k/14)*.9})`;x.beginPath();x.arc(W/2+ex*cs-ey*sg,H*.47+ex*sg+ey*cs,3.4-k*.2,0,7);x.fill()}}
px+=(tx-px)*.06;py+=(ty-py)*.06;if(ph)ph.style.translate=`${-px*26+Math.sin(t/1100)*4}px ${-py*22+Math.cos(t/1300)*6}px`;if(ps)ps.style.translate=`${px*34+Math.sin(t/900+2)*4}px ${py*28+Math.cos(t/1200+1)*7}px`};requestAnimationFrame(loop)}
/* sparkle trail */
if(!rm&&matchMedia('(pointer:fine)').matches){const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:60;pointer-events:none';document.body.appendChild(c);const g=c.getContext('2d');let P=[],run=false,lx=0,ly=0;const fit=()=>{c.width=innerWidth;c.height=innerHeight};fit();addEventListener('resize',fit);
const tick=()=>{g.clearRect(0,0,c.width,c.height);P=P.filter(p=>p.l>0);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.l-=.022;const s=p.s*p.l;g.fillStyle=`rgba(${p.c},${p.l})`;g.beginPath();g.moveTo(p.x,p.y-s*1.6);g.quadraticCurveTo(p.x,p.y,p.x+s*1.6,p.y);g.quadraticCurveTo(p.x,p.y,p.x,p.y+s*1.6);g.quadraticCurveTo(p.x,p.y,p.x-s*1.6,p.y);g.closePath();g.fill()}if(P.length)requestAnimationFrame(tick);else run=false};
addEventListener('pointermove',e=>{const d=Math.hypot(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY;for(let i=0;i<Math.min(3,d/14+.3);i++)P.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*.8,vy:Math.random()*.6+.2,l:1,s:Math.random()*3+2,c:['217,186,244','255,157,183','255,240,210'][i%3]});if(!run){run=true;requestAnimationFrame(tick)}})}
})();

;

(()=>{const vb=document.getElementById('vibeBg');let p='';for(let i=0;i<16;i++){const o=i*9;p+=`<path d="M1000 ${40+o} C820 ${110+o*1.4} 760 ${250+o} 640 ${330+o*1.2} S470 ${540+o} 260 ${640+o*.6}" style="animation-delay:-${i*.7}s"/>`}
vb.insertAdjacentHTML('beforeend',`<svg class="silk" viewBox="0 0 1000 800" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><defs><linearGradient id="sg" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe4ff"/><stop offset=".5" stop-color="#8a5cf0"/><stop offset="1" stop-color="#8a5cf0" stop-opacity="0"/></linearGradient><radialGradient id="stg"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b58cff" stop-opacity="0"/></radialGradient></defs><g class="ribbons" fill="none" stroke="url(#sg)" stroke-width="1.1">${p}</g></svg><svg class="orbits" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><circle cx="760" cy="230" r="190"/><circle cx="760" cy="230" r="330"/><path d="M760 40V420M560 230H960"/><path class="star" d="M760 130Q760 230 860 230Q760 230 760 330Q760 230 660 230Q760 230 760 130Z"/></svg>`)})();

;

(()=>{const $=id=>document.getElementById(id);
/* GitHub links per project: paste each exact repo URL below */
const GH='https://github.com/Athilaaa',REPOS={games:'https://github.com/Athilaaa/Making-LLM-s-Better-at-Games',virality:'https://github.com/Athilaaa/Tiktok-Trend-Analysis',therapify:'https://github.com/Athilaaa/Therapify'};
document.querySelectorAll('.project').forEach(b=>{const k=b.dataset.project,f=b.querySelector('.project-foot'),a=document.createElement('span');a.className='gh';a.textContent='GITHUB ↗';if(REPOS[k]){a.onclick=e=>{e.stopPropagation();window.open(REPOS[k],'_blank','noopener')};f&&f.insertBefore(a,f.lastElementChild)}b.addEventListener('click',()=>{const m=$('modalGh');if(REPOS[k]){m.href=REPOS[k];m.style.display='inline-block'}else{m.style.display='none'}},true)});
/* extra simulation layers */
const sc=$('moodScene');if(sc){let g='';['0','1','∑','λ','✦','π','∇','1','0','✦'].forEach((c,i)=>g+=`<span class="gl" style="left:${6+i*9.5}%;animation-delay:-${(i*1.9)%10}s">${c}</span>`);
sc.insertAdjacentHTML('afterbegin',`<div class="sonar"><i></i><i></i><i></i></div><svg class="ringtxt" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="rp" d="M100 100m-84 0a84 84 0 1 1 168 0a84 84 0 1 1-168 0"/></defs><text><textPath href="#rp">DATA · AI · DESIGN · CURIOSITY · DATA · AI · DESIGN · CURIOSITY ·</textPath></text></svg>${g}`)}
/* simulation reacts to the song */
const cd=$('spCard');if(cd)new MutationObserver(()=>document.body.classList.toggle('music',cd.classList.contains('playing'))).observe(cd,{attributes:true,attributeFilter:['class']});
})();

;
(()=>{const t=document.querySelector(".artist-track");if(t)[...t.children].forEach(c=>{const k=c.cloneNode(true);k.setAttribute("aria-hidden","true");t.appendChild(k)})})();
;
(()=>{const cd=document.getElementById('spCard');if(!cd)return;const t=document.createElement('div');t.className='sp-toast';t.textContent='♫ Still playing. It follows you as you scroll';document.body.appendChild(t);let was=false;new MutationObserver(()=>{const on=cd.classList.contains('docked')&&cd.classList.contains('playing');if(on&&!was){t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200)}was=on}).observe(cd,{attributes:true,attributeFilter:['class']})})();
;
(()=>{const cd=document.getElementById('spCard'),mb=document.getElementById('spMin');if(!cd||!mb)return;mb.addEventListener('click',e=>{if(innerWidth<=560){e.stopImmediatePropagation();cd.classList.toggle('open')}},true)})();