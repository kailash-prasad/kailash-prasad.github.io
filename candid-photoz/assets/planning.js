/* Planning tools. Nothing is transmitted until the visitor opens their own message. */
(() => {
  'use strict';
  const C = window.CandidCore;
  const DATA = window.CANDID_DATA;
  if (!C || !DATA) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const keys = {plan: 'candid.plan.v1', looks: 'candid.looks.v1', family: 'candid.family.v1', costs: 'candid.costs.v1'};
  const params = new URLSearchParams(location.search);
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
  const write = (key, data) => { try { sessionStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } };
  const remove = key => { try { sessionStorage.removeItem(key); } catch {} };
  const money = n => new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 2}).format(n);
  const text = (selector, value) => { const e = $(selector); if (e) e.textContent = value; };
  const download = (name, value) => { const url = URL.createObjectURL(new Blob([value], {type: 'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const copy = async (value, target) => { try { await navigator.clipboard.writeText(value); text(target, 'Copied. You can paste this into a message or your own notes.'); } catch { text(target, 'Copy is unavailable in this browser. Use Download to keep a text copy.'); } };
  function node(tag, cls, value) { const n = document.createElement(tag); if (cls) n.className = cls; if (value !== undefined) n.textContent = value; return n; }
  function setKindFields(form, attr, kind) {
    $$('[' + attr + ']', form).forEach(box => { const active = box.getAttribute(attr) === kind; box.hidden = !active; $$('input,select,textarea,button', box).forEach(e => { e.disabled = !active; }); });
  }
  function validateDates(form) {
    const start = form.elements.date, end = form.elements.endDate, flexible = form.elements.flexible;
    if (!start) return;
    const isFlexible = !!flexible?.checked;
    start.disabled = isFlexible; if (end) end.disabled = isFlexible;
    if (end) { end.min = start.value || start.min || ''; end.setCustomValidity(!isFlexible && start.value && end.value && end.value < start.value ? 'The last date must be on or after the first date.' : ''); }
  }
  // Native details dropdown stays usable without JavaScript.
  document.addEventListener('click', e => { $$('.nav-more[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.nav-more[open]').forEach(d => { d.open = false; $('summary', d)?.focus(); }); });

  // Search and category filters. The complete answers remain in the HTML without JS.
  const answerSearch = $('#answer-search');
  if (answerSearch) {
    let topic = DATA.categories.some(c => c.id === params.get('topic')) ? params.get('topic') : 'all';
    answerSearch.value = C.clean(params.get('q'), 150);
    function updateAnswers() {
      const matches = new Set(C.filterQuestions(DATA.faqs, answerSearch.value, topic).map(f => f.id));
      $$('#answer-list .answer').forEach(e => { e.hidden = !matches.has(e.id); });
      $$('[data-answer-filter]').forEach(b => { const active = b.dataset.answerFilter === topic; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
      text('#answer-count', matches.size + (matches.size === 1 ? ' question' : ' questions'));
      $('#answer-empty').hidden = matches.size !== 0;
    }
    $$('[data-answer-filter]').forEach(b => b.addEventListener('click', () => { topic = b.dataset.answerFilter; updateAnswers(); }));
    answerSearch.addEventListener('input', updateAnswers);
    $('#clear-answers').addEventListener('click', () => { answerSearch.value = ''; topic = 'all'; updateAnswers(); answerSearch.focus(); });
    if (location.hash) {
      const id = location.hash.slice(1);
      if (DATA.faqs.some(f => f.id === id)) { topic = 'all'; answerSearch.value = ''; const detail = document.getElementById(id); if (detail) detail.open = true; }
    }
    updateAnswers();
  }
  const settingFilter = $('#setting-filter'), travelFilter = $('#travel-filter');
  if (settingFilter && travelFilter) {
    function updateLocations() {
      const visible = DATA.locations.filter(l => C.matchesLocation(l, settingFilter.value, travelFilter.value));
      const ids = new Set(visible.map(l => l.id));
      $$('[data-location-card]').forEach(card => { card.hidden = !C.matchesLocation({setting: card.dataset.setting, travel: card.dataset.travel}, settingFilter.value, travelFilter.value); });
      $$('.location-guide').forEach(g => { g.hidden = !ids.has(g.id); });
      text('#location-count', visible.length + (visible.length === 1 ? ' place in the portfolio' : ' places in the portfolio'));
      $('#location-empty').hidden = visible.length !== 0;
    }
    settingFilter.addEventListener('change', updateLocations); travelFilter.addEventListener('change', updateLocations);
    $('#reset-locations').addEventListener('click', () => { settingFilter.value = 'all'; travelFilter.value = 'all'; updateLocations(); });
    window.addEventListener('hashchange', () => { if (DATA.locations.some(l => '#' + l.id === location.hash)) { settingFilter.value = 'all'; travelFilter.value = 'all'; updateLocations(); } });
    updateLocations();
  }

  // Shortlist only the identifiers of photographs actually present in the gallery.
  const allowedLooks = ['bridal-window','wedding-01','wedding-02','bridal-palace','wedding-03','wedding-04','wedding-05','wedding-06','wedding-07','wedding-08','wedding-09','prewedding-rain','dubai-city','prewedding-moment','prewedding-garden','couple-forest','couple-embrace'];
  let looks = (Array.isArray(read(keys.looks)) ? read(keys.looks) : []).filter(x => x && allowedLooks.includes(x.id)).slice(0,12).map(x => ({id:x.id,label:C.clean(x.label,180)}));
  function renderLooks() {
    $$('[data-shortlist-link]').forEach(a => { a.textContent = looks.length ? 'Your saved looks (' + looks.length + ')' : 'Your saved looks'; });
    $$('[data-inspiration]').forEach(b => { const saved = looks.some(x => x.id === b.dataset.inspiration); b.setAttribute('aria-pressed', String(saved)); b.textContent = saved ? 'Look saved' : 'Save this look'; });
    $$('[data-shortlist-items]').forEach(box => {
      box.replaceChildren();
      if (!looks.length) box.append(node('p', 'small-note', 'No looks saved yet. Start with a few photographs you connect with.'));
      looks.forEach(x => { const row = node('div', 'shortlist-item'); const a = node('a', '', x.label); a.href = './work.html#look-' + x.id; const b = node('button', 'text-button', 'Remove'); b.type = 'button'; b.setAttribute('aria-label', 'Remove reference: ' + x.label); b.addEventListener('click', () => { looks = looks.filter(y => y.id !== x.id); write(keys.looks,looks); renderLooks(); }); row.append(a,b); box.append(row); });
    });
  }
  $$('[data-inspiration]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.inspiration;
    if (!allowedLooks.includes(id)) return;
    const old = looks.find(x => x.id === id);
    if (!old && looks.length >= 12) { text('#save-look-feedback', 'You have 12 references. Remove one before adding another.'); return; }
    looks = old ? looks.filter(x => x.id !== id) : [...looks,{id,label:C.clean(b.dataset.inspirationLabel,180)}];
    const stored = write(keys.looks, looks); renderLooks();
    text('#save-look-feedback', stored ? (old ? 'Reference removed.' : 'Look saved for this browser tab. Find it in Build your plan.') : 'Browser saving is unavailable. Your selection remains on this page; use a note of the photographs you like.');
  }));
  $$('[data-clear-shortlist]').forEach(b => b.addEventListener('click', () => { looks = []; remove(keys.looks); renderLooks(); }));
  $$('.gallery-item').forEach(item => { const photo = $('[data-photo]',item); if (photo) item.id = 'look-' + photo.dataset.photo; });
  function syncPhotoGroups() { $$('.gallery-item').forEach(item => { item.hidden = !!$('[data-photo]',item)?.hidden; }); }
  $$('[data-filter]').forEach(b => b.addEventListener('click', syncPhotoGroups));
  syncPhotoGroups(); renderLooks();
  if (location.hash.startsWith('#look-')) {
    const id = location.hash.slice(6);
    const photo = $$('[data-photo]').find(p => p.dataset.photo === id);
    if (photo) {
      const category = photo.dataset.category;
      $$('[data-filter]').find(b => b.dataset.filter === category)?.click();
      requestAnimationFrame(() => document.getElementById('look-' + id)?.scrollIntoView({block:'center'}));
    }
  }

  // Three-step discussion brief. Save only after an explicit handoff action.
  const planForm = $('#plan-form');
  let eventCounter = 0;
  function addEvent(data = {}) {
    const box = $('#event-rows'); if (!box || box.children.length >= 20) return;
    const index = ++eventCounter, row = node('div', 'event-row');
    [['name','Event','Haldi, wedding, reception…'],['when','Date / time','Approximate or still deciding'],['location','Venue / city','Where it happens']].forEach(([key,label,placeholder]) => { const l = node('label','',label); const input = document.createElement('input'); input.name = 'event-' + index + '-' + key; input.dataset.eventField = key; input.maxLength = key === 'location' ? 120 : 100; input.placeholder = placeholder; input.value = C.clean(data[key],input.maxLength); l.append(input); row.append(l); });
    const removeButton = node('button','text-button','Remove event'); removeButton.type='button'; removeButton.addEventListener('click',()=>row.remove()); row.append(removeButton); box.append(row);
  }
  function gatherPlan() {
    const raw = Object.fromEntries(new FormData(planForm));
    raw.flexible = planForm.elements.flexible.checked;
    raw.events = $$('.event-row',planForm).map(row=>Object.fromEntries($$('[data-event-field]',row).map(e=>[e.dataset.eventField,e.value])));
    return C.normalisePlan(raw);
  }
  if (planForm) {
    let saved = read(keys.plan);
    saved = saved && typeof saved === 'object' && !Array.isArray(saved) ? C.normalisePlan(saved) : {};
    Object.entries(saved).forEach(([key,value]) => { const input = planForm.elements.namedItem(key); if (!input || key==='events') return; if (input.type==='checkbox') input.checked = value === true; else if (value !== null) input.value=String(value); });
    if (['wedding','pre-wedding'].includes(params.get('kind'))) planForm.elements.kind.value=params.get('kind');
    if (DATA.locations.some(l=>l.id===params.get('place'))) { planForm.elements.place.value=params.get('place'); planForm.elements.kind.value='pre-wedding'; }
    const events = saved.events?.length ? saved.events : [{name:'Wedding ceremony'}]; events.forEach(addEvent);
    const updateKind = () => { setKindFields(planForm,'data-plan-kind',planForm.elements.kind.value); validateDates(planForm); };
    planForm.elements.kind.addEventListener('change',updateKind);
    planForm.elements.flexible.addEventListener('change',()=>validateDates(planForm));
    planForm.elements.date.addEventListener('change',()=>validateDates(planForm)); planForm.elements.endDate.addEventListener('change',()=>validateDates(planForm));
    $('#add-event').addEventListener('click',()=>addEvent());
    const showStep = index => {
      if (index > 0) {
        validateDates(planForm);
        const invalid = [...planForm.elements].find(e => e.willValidate && !e.validity.valid);
        if (invalid) {
          const invalidStep = invalid.closest('.plan-step');
          const stepIndex = Number(invalidStep?.dataset.step || 0);
          $$('.plan-step',planForm).forEach(s=>{s.hidden=Number(s.dataset.step)!==stepIndex;});
          $$('.step-tabs [data-step-go]',planForm).forEach(b=>{if(Number(b.dataset.stepGo)===stepIndex)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
          invalid.reportValidity();
          return;
        }
      }
      $$('.plan-step',planForm).forEach(s=>{s.hidden=Number(s.dataset.step)!==index;});
      $$('[data-step-go]',planForm).filter(b=>b.closest('.step-tabs')).forEach(b=>{if(Number(b.dataset.stepGo)===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
      if(index===2) text('#plan-summary',C.planSummary(gatherPlan(),DATA.locations));
      const legend=$('.plan-step:not([hidden]) legend',planForm); if(legend){legend.tabIndex=-1;legend.focus({preventScroll:true});}
    };
    $$('[data-step-go]',planForm).forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.stepGo))));
    $('#use-plan').addEventListener('click',()=>{const p=gatherPlan();if(write(keys.plan,p))location.href='./contact.html?kind='+p.kind;else text('#plan-status','Browser saving is unavailable. Download or copy your plan, then open the enquiry page to share it.');});
    $('#copy-plan').addEventListener('click',()=>copy(C.planSummary(gatherPlan(),DATA.locations),'#plan-status'));
    $('#download-plan').addEventListener('click',()=>download('Our_photography_plan.txt',C.planSummary(gatherPlan(),DATA.locations)));
    $('#clear-plan').addEventListener('click',()=>{remove(keys.plan);text('#plan-status','Saved plan cleared. The form remains available to edit.');});
    planForm.addEventListener('submit',e=>{e.preventDefault();showStep(2);});
    updateKind();
  }

  // Family list, preparation checklist and schedule worksheet.
  let familyCounter=0;
  function addFamily(data={}) {
    const box=$('#family-rows');if(!box||box.children.length>=30)return;
    const row=node('div','family-row');const index=++familyCounter;
    [['group','Group','Couple with parents'],['names','Names / notes','Optional names or roles']].forEach(([key,label,placeholder])=>{const l=node('label','',label);const input=document.createElement('input');input.name='family-'+index+'-'+key;input.dataset.familyField=key;input.maxLength=250;input.placeholder=placeholder;input.value=C.clean(data[key],250);l.append(input);row.append(l);});
    const l=node('label','','Priority');const select=document.createElement('select');select.dataset.familyField='priority';select.name='family-'+index+'-priority';['Must discuss','If time allows'].forEach(t=>select.append(new Option(t,t)));l.append(select);row.append(l);const b=node('button','text-button','Remove group');b.type='button';b.addEventListener('click',()=>row.remove());row.append(b);box.append(row);
  }
  function familyText() { const coordinator=C.clean($('#family-form')?.elements.coordinator.value,120);const rows=$$('.family-row').map(row=>Object.fromEntries($$('[data-family-field]',row).map(i=>[i.dataset.familyField,i.value]))).filter(x=>x.group||x.names);return ['FAMILY-PHOTO DISCUSSION LIST',coordinator?'Coordinator: '+coordinator:'Coordinator: to decide','',...rows.map(x=>'• '+(C.clean(x.group,250)||'Group')+(x.names?' — '+C.clean(x.names,250):'')+' ['+x.priority+']'),'','Agree this list and a realistic time window with the photographer. Attendance and timing still affect what is possible.'].join('\n'); }
  if($('#family-form')) {
    [{group:'Couple with parents'},{group:'Couple with siblings'},{group:'Important elders and relatives'},{group:'Close friends'}].forEach(addFamily);
    $('#add-family').addEventListener('click',()=>addFamily());
    $('#download-family').addEventListener('click',()=>download('Family_photo_discussion_list.txt',familyText()));
    $('#copy-family').addEventListener('click',()=>copy(familyText(),'#family-status'));
    $('#use-family').addEventListener('click',()=>{text('#family-status',write(keys.family,familyText())?'Family notes saved for this browser tab. They will appear in your enquiry for review.':'Browser saving is unavailable. Download or copy the list instead.');});
  }
  const prepChecks=$$('[data-prep-check]');
  const updatePrep=()=>text('#preparation-count',prepChecks.filter(c=>c.checked).length+' of '+prepChecks.length+' items checked');
  prepChecks.forEach(c=>c.addEventListener('change',updatePrep));
  $('#reset-preparation')?.addEventListener('click',()=>{prepChecks.forEach(c=>{c.checked=false;});updatePrep();});
  $('#download-preparation')?.addEventListener('click',()=>download('Photography_preparation_checklist.txt',['PHOTOGRAPHY PREPARATION CHECKLIST','',...prepChecks.map(c=>(c.checked?'[x] ':'[ ] ')+c.nextElementSibling.textContent)].join('\n')));
  $$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  const scheduleForm=$('#schedule-form');let scheduleValue='';
  function updateSchedule() {
    const r=C.remainingTime(Object.fromEntries(new FormData(scheduleForm)));
    if(!r.valid){text('#schedule-total','Check the time estimates');text('#schedule-explanation','Enter valid non-negative figures and a total between 1 and 1,440 minutes.');$('#time-breakdown').replaceChildren();scheduleValue='Please enter valid estimates before saving this worksheet.';return;}
    text('#schedule-total',r.remaining>0?r.remaining+' minutes':r.remaining===0?'No photography time left':Math.abs(r.remaining)+' minutes over');
    text('#schedule-explanation',r.feasible?'A planning allowance for photography. Check the actual light, venue access and agreed session hours with the studio.':'This plan leaves no positive time for photography. Reduce travel, changes or other commitments, or discuss a longer session.');
    const parts=[['Total available',r.total],['Travel and transfers',r.travel],['Outfit changes',r.changing],['Breaks and entry buffer',r.breaks]];$('#time-breakdown').replaceChildren(...parts.map(([label,n])=>node('p','',label+': '+n+' min')));
    scheduleValue=['SESSION TIME WORKSHEET','Planning example only; not a studio package.',...parts.map(([k,v])=>k+': '+v+' minutes'),'Time left for photography: '+r.remaining+' minutes'].join('\n');
  }
  if(scheduleForm){scheduleForm.addEventListener('submit',e=>{e.preventDefault();updateSchedule();});scheduleForm.addEventListener('input',updateSchedule);$('#download-schedule').addEventListener('click',()=>download('Session_time_worksheet.txt',scheduleValue));updateSchedule();}

  // A manual complete-cost worksheet. Unknown values are never silently made free.
  const costForm=$('#cost-form');let costText='';
  function costRows(){return $$('[data-cost-row]').map(row=>({name:$('.cost-name',row).textContent,status:$('[data-cost-status]',row).value,amount:$('[data-cost-amount]',row).value}));}
  function updateCosts(){const rows=costRows(),r=C.costTotals(rows);text('#known-subtotal',r.known?money(r.subtotal):'Add a confirmed amount');text('#cost-status',(r.complete?'Every cost has a status. Confirm the supplier quotes before booking.':r.unresolved+' cost'+(r.unresolved===1?'':'s')+' to confirm')+(r.invalid.length?' · Correct the blank or invalid known amounts.':''));costText=['COMPLETE-COST PLANNING WORKSHEET','These are our own entered figures, not a studio quotation.','',...rows.map(row=>row.name+': '+(row.status==='known'?(C.nonNegative(row.amount)===null?'Amount to confirm':money(Number(row.amount))):row.status==='included'?'Included in another entered quote':row.status==='not-needed'?'Not needed':'To confirm')),'','Known-cost subtotal: '+(r.known?money(r.subtotal):'No known figures entered'),r.unresolved+' costs still to confirm.','Check for expenses already included elsewhere to avoid double counting.'].join('\n');}
  if(costForm){$$('[data-cost-row]').forEach(row=>{const select=$('[data-cost-status]',row),input=$('[data-cost-amount]',row);select.addEventListener('change',()=>{input.disabled=select.value!=='known';input.required=select.value==='known';input.placeholder=select.value==='known'?'Enter quoted amount':'Not entered';updateCosts();});input.addEventListener('input',updateCosts);});costForm.addEventListener('submit',e=>e.preventDefault());$('#download-costs').addEventListener('click',()=>download('Complete_cost_worksheet.txt',costText));$('#use-costs').addEventListener('click',()=>{const r=C.costTotals(costRows());if(r.invalid.length){text('#cost-feedback','Complete or correct the known amounts before saving.');return;}text('#cost-feedback',write(keys.costs,costText)?'Cost notes saved in this tab for review in your enquiry. They are not a studio quote.':'Browser saving is unavailable. Download the worksheet instead.');});updateCosts();}

  // Relevant enquiry fields, prefilled from an explicitly saved plan or a known link.
  const form=$('#enquiry-form');
  if(form){
    let saved=read(keys.plan);saved=saved&&typeof saved==='object'&&!Array.isArray(saved)?C.normalisePlan(saved):null;
    const question=DATA.faqs.find(f=>f.id===params.get('question'));
    let family=C.clean(read(keys.family),5000),costs=C.clean(read(keys.costs),5000);
    Object.entries(saved||{}).forEach(([key,value])=>{const input=form.elements.namedItem(key);if(!input||key==='events')return;if(input.type==='checkbox')input.checked=value===true;else if(value!==null)input.value=String(value);});
    if(['wedding','pre-wedding'].includes(params.get('kind')))form.elements.kind.value=params.get('kind');
    if(['Silver','Gold','Premium'].includes(params.get('collection'))){form.elements.collection.value=params.get('collection');form.elements.kind.value='wedding';}
    if(DATA.locations.some(l=>l.id===params.get('place'))){form.elements.kind.value='pre-wedding';form.elements.place.value=params.get('place');}
    const today=new Date();form.elements.date.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const contextBox=$('#enquiry-context');
    function renderContext(){contextBox.replaceChildren();if(saved){contextBox.append(node('p','context-label','Your saved planning brief'));const p=node('pre','context-preview',C.planSummary(saved,DATA.locations));contextBox.append(p);}if(question){contextBox.append(node('p','context-label','Question to discuss'),node('p','',question.title));}if(looks.length)contextBox.append(node('p','',looks.length+' portfolio reference'+(looks.length===1?'':'s')+' saved for discussion.'));if(family)contextBox.append(node('p','','Family-photo planning notes will be included for review.'));if(costs)contextBox.append(node('p','','Your own cost worksheet will be included for review.'));if(params.get('collection')&&['Silver','Gold','Premium'].includes(params.get('collection')))contextBox.append(node('p','small-note','Collection: '+params.get('collection')+' · published reference; request a current quotation.'));if(!contextBox.children.length)contextBox.append(node('p','small-note','You can start here without a saved plan. Optional details can stay open.'));}
    const updateKind=()=>{setKindFields(form,'data-enquiry-kind',form.elements.kind.value);validateDates(form);};
    form.elements.kind.addEventListener('change',updateKind);['date','endDate','flexible'].forEach(k=>form.elements[k].addEventListener('change',()=>validateDates(form)));
    $('#clear-enquiry-context').addEventListener('click',()=>{Object.values(keys).forEach(remove);saved=null;family='';costs='';looks=[];renderLooks();renderContext();$('#enquiry-result').hidden=true;});
    let message='';form.addEventListener('submit',e=>{e.preventDefault();validateDates(form);if(!form.reportValidity())return;const fields=Object.fromEntries(new FormData(form));fields.flexible=form.elements.flexible.checked;message=C.enquirySummary(fields,{plan:saved,question:question?.title,looks,family,costs},DATA.locations);text('#enquiry-preview',message);$('#whatsapp-send').href='https://wa.me/917980630085?text='+encodeURIComponent(message);$('#enquiry-result').hidden=false;$('#enquiry-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
    $('#copy-message').addEventListener('click',()=>copy(message,'#copy-status'));$('#download-message').addEventListener('click',()=>download('Photography_enquiry.txt',message));updateKind();renderContext();
  }
})();
