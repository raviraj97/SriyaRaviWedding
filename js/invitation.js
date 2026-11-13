/* Classic deferred scripts keep this invitation usable directly from a local file. */
(()=>{
  const telugu=window.INVITATION_TRANSLATIONS;
  let language='en';
  const tr=text=>language==='te'?(telugu[text]||text):text;
  const languageButton=document.querySelector('#language-toggle');
  const translationNodes=[],translationAttributes=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.parentElement.closest('script,style,noscript,svg,[data-no-translate],#language-toggle,#scroll-label,#motion-toggle,#open-invitation,#motion-note,.toast'))continue;
    const key=node.textContent.trim();
    if(telugu[key])translationNodes.push({node,original:node.textContent,key});
  }
  document.querySelectorAll('[aria-label],[alt]').forEach(el=>{for(const name of ['aria-label','alt']){const value=el.getAttribute(name);if(value&&telugu[value])translationAttributes.push({el,name,value});}});
  function setLanguage(next){
    language=next;document.documentElement.lang=next;
    translationNodes.forEach(({node,original,key})=>node.textContent=next==='te'?original.replace(key,telugu[key]):original);
    translationAttributes.forEach(({el,name,value})=>el.setAttribute(name,tr(value)));
    languageButton.textContent=next==='en'?'తెలుగు':'English';languageButton.lang=next==='en'?'te':'en';
    languageButton.setAttribute('aria-label',next==='en'?'View invitation in Telugu':'View invitation in English');
    document.title=next==='en'?'Sriya & Sai RaviRaj · You’re invited':'శ్రియ & సాయి రవిరాజ్ · శుభ వివాహ ఆహ్వానం';
    sync();update();updateDayGuide();updateBlessingText();renderIllustration();
  }
  languageButton.addEventListener('click',()=>setLanguage(language==='en'?'te':'en'));

  const root=document.documentElement, motion=matchMedia('(prefers-reduced-motion: reduce)');
  const chapter=document.querySelector('.door-chapter'),sticky=document.querySelector('.door-sticky'),left=document.querySelector('.door-leaf.left'),right=document.querySelector('.door-leaf.right'),inside=document.querySelector('.invitation-inside'),label=document.querySelector('#scroll-label'),welcome=document.querySelector('.welcome'),closing=document.querySelector('.closing'),muggu=document.querySelector('.muggu'),events=[...document.querySelectorAll('.event')];
  const toggle=document.querySelector('#motion-toggle'),openButton=document.querySelector('#open-invitation'),note=document.querySelector('#motion-note');
  const clamp=x=>Math.max(0,Math.min(1,x));
  let enabled=true,frame=0,playFrame=0,manual=null,current=0,introTimer=0,savedScrollBehavior=null,introCancelled=false;
  function sync(){
    root.classList.toggle('motion-ready',enabled);
    toggle.textContent=tr(enabled?'Reduce motion':'Enable animation');toggle.setAttribute('aria-pressed',String(enabled));
    note.textContent=enabled?'':tr('Motion is reduced. Tap “Play door animation” to watch it.');
    openButton.textContent=tr(enabled?'Open invitation':'Play door animation');
  }
  function paint(opening){
    current=opening;const angle=opening*100;
    left.style.transform=`rotateY(${-angle}deg)`;right.style.transform=`rotateY(${angle}deg)`;
    left.style.setProperty('--shade',opening*.45);right.style.setProperty('--shade',opening*.45);
    inside.style.setProperty('--reveal',clamp((opening-.08)/.65));
    chapter.style.setProperty('--emerge',clamp((opening-.5)/.5));
    label.textContent=tr(opening>.95?'Scroll to the celebrations':opening>.05?'A beautiful beginning awaits':'Scroll to open the doors');
    openButton.textContent=tr(opening>.95?'Replay door opening':'Open invitation');
  }
  function update(){
    frame=0;const h=innerHeight;
    const portrait=document.querySelector('.portrait-section');if(portrait.getBoundingClientRect().top<h*.87)portrait.classList.add('is-revealed');
    const dusk=document.querySelector('.dusk-transition'),duskBox=dusk.getBoundingClientRect();
    const nightProgress=clamp((h*.9-duskBox.top)/(duskBox.height+h*.25));
    dusk.style.setProperty('--dusk',enabled?nightProgress:1);
    root.classList.toggle('past-intro',chapter.getBoundingClientRect().bottom<h*.55);
    document.querySelectorAll('.mobile-shortcuts a').forEach(link=>{const box=document.getElementById(link.dataset.section).getBoundingClientRect();if(box.top<h*.55&&box.bottom>h*.3)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    if(closing.getBoundingClientRect().top<h*.85)closing.classList.add('is-revealed');
    if(!enabled){label.textContent=tr('With love, Sriya & Sai RaviRaj');return;}
    const rect=chapter.getBoundingClientRect();
    const stickyTop=parseFloat(getComputedStyle(sticky).top)||0;
    const progress=clamp((-rect.top+stickyTop)/Math.max(1,chapter.offsetHeight-sticky.offsetHeight));
    paint(manual===null?clamp(progress/.82):manual);
    const wb=welcome.getBoundingClientRect();muggu.style.setProperty('--draw',clamp((h*.94-wb.top)/(h*.48)));
    [welcome,closing].forEach(section=>section.style.setProperty('--section-progress',clamp((h*.95-section.getBoundingClientRect().top)/(h*.42))));
    events.forEach(event=>{const box=event.querySelector('.event-stage').getBoundingClientRect();if(box.top<h*.82&&box.bottom>0)event.classList.add('is-revealed');});
  }
  events.forEach(event=>event.addEventListener('focusin',()=>event.classList.add('is-revealed')));
  function queue(){if(!frame)frame=requestAnimationFrame(update);}
  function stopPlay(){clearTimeout(introTimer);cancelAnimationFrame(playFrame);playFrame=0;if(savedScrollBehavior!==null){root.style.scrollBehavior=savedScrollBehavior;savedScrollBehavior=null;}}
  function setMotion(value){stopPlay();enabled=value;manual=null;sync();queue();}
  toggle.addEventListener('click',()=>setMotion(!enabled));
  function playOpening(){
    stopPlay();if(!enabled)setMotion(true);
    const from=current>.95?0:current;manual=from;paint(from);let start;
    savedScrollBehavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';
    const release=chapter.getBoundingClientRect().top+scrollY+chapter.offsetHeight-sticky.offsetHeight-(parseFloat(getComputedStyle(sticky).top)||0);
    const scrollStart=Math.min(scrollY,release);
    window.scrollTo(0,scrollStart);
    function tick(time){
      if(start===undefined)start=time;
      const p=clamp((time-start)/3200),ease=p*p*(3-2*p);
      // Finish at the sticky section's release point, including short screens.
      const chapterTop=chapter.getBoundingClientRect().top+scrollY;
      const stickyTop=parseFloat(getComputedStyle(sticky).top)||0;
      const scrollEnd=chapterTop+chapter.offsetHeight-sticky.offsetHeight-stickyTop;
      manual=from+(1-from)*ease;
      window.scrollTo(0,scrollStart+(Math.max(scrollStart,scrollEnd)-scrollStart)*ease);
      update();
      if(p<1)playFrame=requestAnimationFrame(tick);
      else{stopPlay();manual=null;queue();}
    }
    playFrame=requestAnimationFrame(tick);
  }
  // Wheel, touch, keyboard, and navigation take over immediately from autoplay.
  function takeOver(){introCancelled=true;stopPlay();manual=null;queue();}
  addEventListener('wheel',takeOver,{passive:true});
  addEventListener('touchstart',takeOver,{passive:true});
  addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))takeOver();});
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',takeOver));
  openButton.addEventListener('click',playOpening);
  let lastScroll=scrollY;
  function onScroll(){if(!playFrame&&scrollY<lastScroll&&chapter.getBoundingClientRect().top>=-1)manual=null;lastScroll=scrollY;queue();}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',queue);addEventListener('pageshow',queue);
  // This invitation explicitly starts with motion enabled. The visible control
  // still lets each guest turn it off immediately; no stale saved state can hide it.
  sync();queue();
  function startIntro(){
    if(!enabled || scrollY>80)return;
    const art=new Image();
    art.src=new URL('images/doorway.jpg',document.baseURI).href;
    const begin=()=>{if(!introCancelled&&enabled&&scrollY<80)introTimer=setTimeout(playOpening,900);};
    if(art.decode)art.decode().then(begin,begin);else if(art.complete)begin();else{art.onload=begin;art.onerror=begin;}
  }
  if(document.readyState==='complete')startIntro();else addEventListener('load',startIntro,{once:true});

  // Absolute IST instant: every guest sees the same remaining duration worldwide.
  const celebrationDayStartsAt=Date.parse('2027-02-10T00:00:00+05:30');
  const receptionStartsAt=Date.parse('2027-02-10T19:00:00+05:30');

  function celebrationPhase(now){
    if(now<Date.parse('2027-02-10T00:00:00+05:30'))return 'before';
    if(now<receptionStartsAt)return 'today';
    if(now<Date.parse('2027-02-10T22:00:00+05:30'))return 'reception';
    if(now<Date.parse('2027-02-11T01:04:00+05:30'))return 'wedding';
    if(now<Date.parse('2027-02-12T00:00:00+05:30'))return 'married';
    return 'thanks';
  }
  function updateDayGuide(){
    const phase=celebrationPhase(Date.now());
    const messages={today:['TODAY, WE CELEBRATE','Reception begins at 7 PM. The wedding follows after midnight at 1:04 AM.'],reception:['THE RECEPTION HAS BEGUN','Join us until 10 PM at Summer Green Resort.'],wedding:['NEXT, THE WEDDING','Muhurtham is at 1:04 AM on 11 February, at the same venue.'],married:['OUR WEDDING DAY','Our muhurtham has arrived. Thank you for your love and blessings.'],thanks:['WITH HEARTFELT THANKS','Thank you for being part of our beginning, near or far.']};
    const guide=document.querySelector('#day-guide');guide.hidden=phase==='before'||phase==='thanks';
    const message=messages[phase];
    if(message){document.querySelector('#day-guide-title').textContent=tr(message[0]);document.querySelector('#day-guide-copy').textContent=tr(message[1]);}
    document.querySelector('#countdown-title').textContent=tr(phase==='before'?'UNTIL CELEBRATION DAY':phase==='today'?'CELEBRATION DAY IS HERE':message[0]);
    document.querySelector('#countdown-complete').textContent=tr(phase==='today'?'Celebration Day is here. We can’t wait to see you!':message?message[1]:'Celebration Day is here. We can’t wait to see you!');
    document.querySelector('.countdown-date').hidden=phase!=='before';
  }
  function countdownParts(now){
    const total=Math.max(0,Math.ceil((celebrationDayStartsAt-now)/1000));
    return {days:Math.floor(total/86400),hours:Math.floor(total%86400/3600),minutes:Math.floor(total%3600/60),seconds:total%60,complete:total===0};
  }
  const countdown=document.querySelector('#countdown');
  function updateCountdown(){
    const parts=countdownParts(Date.now());
    countdown.hidden=parts.complete;
    document.querySelector('#countdown-complete').hidden=!parts.complete;
    for(const unit of ['days','hours','minutes','seconds'])document.querySelector('#countdown-'+unit).textContent=String(parts[unit]).padStart(2,'0');
    updateDayGuide();
  }
  let countdownInterval=0;
  updateCountdown();
  countdownInterval=setInterval(updateCountdown,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateCountdown();});
  addEventListener('pageshow',updateCountdown);

  /* Calendar data uses explicit IST offsets. No server or external library is needed. */
  const calendarEvents=[
    ['wedding','Wedding','2027-02-11T01:04:00+05:30',null,'Summer Green Resort, Thumkunta, Shamirpet, Secunderabad, Telangana 500078','Muhurtham: 1:04 AM IST on 11 February, after midnight following the reception on 10 February.'],
    ['reception','Reception','2027-02-10T19:00:00+05:30','2027-02-10T22:00:00+05:30','Summer Green Resort, Thumkunta, Shamirpet, Secunderabad, Telangana 500078','Reception: 7:00–10:00 PM IST on 10 February. Wedding follows after midnight, at 1:04 AM on 11 February.']
  ];
  const utc=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const escape=s=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const fold=line=>{let lines=[],part='',bytes=0;for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>74){lines.push(part);part=' ';bytes=1;}part+=c;bytes+=size;}lines.push(part);return lines.join('\r\n');};
  let toastTimer;
  function save(selected){
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sriya and Sai RaviRaj//Wedding//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    selected.forEach(([id,name,start,end,venue,note])=>lines.push('BEGIN:VEVENT',`UID:${id}-202702@sriya-sai-raviraj.example`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(start)}`,...(end?[`DTEND:${utc(end)}`]:[]),`SUMMARY:${escape('Sriya & Sai RaviRaj — '+name)}`,`LOCATION:${escape(venue)}`,`DESCRIPTION:${escape(note)}`,'END:VEVENT'));
    lines.push('END:VCALENDAR');
    const url=URL.createObjectURL(new Blob([lines.map(fold).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=selected.length===1?selected[0][0]+'.ics':'Sriya-Sai RaviRaj-celebrations.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    const toast=document.querySelector('.toast');toast.textContent=selected.length===1?tr(selected[0][1])+' '+tr('calendar file is ready.'):tr('Both celebrations are in your calendar file.');toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);
  }
  document.querySelectorAll('[data-event]').forEach(button=>button.addEventListener('click',()=>save([calendarEvents[Number(button.dataset.event)]])));
  document.querySelector('#save-dates').addEventListener('click',()=>save([...calendarEvents].sort((a,b)=>new Date(a[2])-new Date(b[2]))));

  let blessingShown=false,petalTimer;
  function updateBlessingText(){document.querySelector('#blessing-response').textContent=blessingShown?tr('May this new beginning be filled with love and happiness.'):'';}
  document.querySelector('#bless-button').addEventListener('click',()=>{
    blessingShown=true;updateBlessingText();
    const petals=document.querySelector('.blessing-petals');petals.replaceChildren();clearTimeout(petalTimer);
    if(!enabled||motion.matches)return;
    for(let i=0;i<22;i++){const petal=document.createElement('i');petal.style.cssText=`--x:${5+(i*37)%90}%;--delay:${(i%6)*.09}s;--drift:${(i%2?1:-1)*(12+i)}px;--petal:${['#c19245','#d3a0a1','#f0ce8a'][i%3]}`;petals.append(petal);}
    petalTimer=setTimeout(()=>petals.replaceChildren(),3300);
  });
  // Each illustration detail is a real keyboard-accessible button.
  let selectedScene='couple';
  const sceneCopy={couple:['THE TWO OF US','Sriya & Sai RaviRaj','Two journeys, one new beginning. We cannot wait to share it with you.'],moment:['BENEATH THE MOON','11 February · 1:04 AM','After the reception on 10 February, join us after midnight for our wedding at Summer Green Resort.'],wish:['A LIGHT FOR OUR BEGINNING','Love, laughter, and your blessings.','May our home always be filled with warmth, kindness, and the people we love.']};
  function renderIllustration(){
    const copy=sceneCopy[selectedScene];
    ['illustration-kicker','illustration-heading','illustration-description'].forEach((id,i)=>document.getElementById(id).textContent=tr(copy[i]));
    document.querySelector('.mandapam-scene').dataset.selected=selectedScene;
    document.querySelectorAll('[data-scene]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===selectedScene)));
  }
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{selectedScene=button.dataset.scene;renderIllustration();}));
  const traditionalDialog=document.querySelector('#traditional-dialog');
  let bodyOverflow='';
  document.querySelector('#traditional-open').addEventListener('click',()=>{
    takeOver();bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    traditionalDialog.showModal();traditionalDialog.scrollTop=0;
  });
  document.querySelector('#traditional-close').addEventListener('click',()=>traditionalDialog.close());
  traditionalDialog.addEventListener('close',()=>{document.body.style.overflow=bodyOverflow;document.body.classList.remove('printing-card');document.querySelector('#traditional-open').focus({preventScroll:true});});
  document.querySelector('#traditional-print').addEventListener('click',()=>{document.body.classList.add('printing-card');window.print();});
  addEventListener('beforeprint',()=>{if(traditionalDialog.open)document.body.classList.add('printing-card');});
  addEventListener('afterprint',()=>document.body.classList.remove('printing-card'));
  // HTTPS link only; credentials and files never pass through this static page.
  function photoUploadURL(raw){try{const url=new URL(raw);return url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch{return '';}}
  const photoConfig=window.INVITATION_CONFIG||{};
  const photoLinks=[['guest-photo-upload',photoConfig.photoUploadUrl],['guest-photo-album',photoConfig.photoAlbumUrl]];
  let hasPhotoLink=false;
  photoLinks.forEach(([id,raw])=>{const url=photoUploadURL((raw||'').trim());if(!url)return;const link=document.getElementById(id);link.href=url;link.hidden=false;hasPhotoLink=true;});
  document.querySelector('#guest-photo-pending').hidden=hasPhotoLink;
  document.querySelector('#guest-photo-ready').hidden=!hasPhotoLink;

})();
