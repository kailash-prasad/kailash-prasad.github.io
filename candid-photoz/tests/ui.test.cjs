/* Optional DOM interaction checks: npm install --prefix /tmp/candid-qa jsdom
   NODE_PATH=/tmp/candid-qa/node_modules node --test candid-photoz/tests/ui.test.cjs */
const {JSDOM, VirtualConsole} = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function page(file, suffix='', saved={}) {
  const errors=[];
  const console = new VirtualConsole();
  console.on('jsdomError',e=>{if(!e.message.includes('navigation'))errors.push(e.message)});
  const dom = new JSDOM(fs.readFileSync(path.join(root,file+'.html'),'utf8'), {url:'https://kailashprasad.com/candid-photoz/'+file+'.html'+suffix,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
  w.addEventListener('error',e=>errors.push(e.message));
  for(const [key,val] of Object.entries(saved))w.sessionStorage.setItem(key,JSON.stringify(val));
  for(const script of ['data.js','core.js','app.js','planning.js'])w.eval(fs.readFileSync(path.join(root,'assets',script),'utf8'));
  const q=s=>w.document.querySelector(s), qa=s=>[...w.document.querySelectorAll(s)];
  const change=(s,value,event='change')=>{const e=q(s);if(e.type==='checkbox')e.checked=value;else e.value=value;e.dispatchEvent(new w.Event(event,{bubbles:true}));return e;};
  return {w,q,qa,change,done(){assert.deepEqual(errors,[]);w.close();}};
}
{
 const p=page('answers','#%E0%A4%A');assert.match(p.q('#answer-count').textContent,/40/);
 p.change('#answer-search','outfits','input');assert(p.qa('.answer:not([hidden])').length>0);
 p.change('#answer-search','zzzznonexistent','input');assert(!p.q('#answer-empty').hidden);
 p.q('#clear-answers').click();assert.equal(p.qa('.answer:not([hidden])').length,40);p.done();
}
{
 const p=page('locations');p.change('#setting-filter','beach');p.change('#travel-filter','international');assert(!p.q('#location-empty').hidden);
 p.change('#setting-filter','city');assert.equal(p.qa('[data-location-card]:not([hidden])').length,1);assert(!p.q('#dubai').hidden);
 p.q('#reset-locations').click();assert.equal(p.qa('[data-location-card]:not([hidden])').length,4);p.done();
}
let saved;
{
 const p=page('plan','?kind=pre-wedding&place=purulia');assert.equal(p.q('[name=kind]').value,'pre-wedding');assert(p.q('[name=guests]').disabled);
 p.change('[name=date]','2027-02-20');p.change('[name=endDate]','2027-02-19');p.q('[data-step-go="1"]').click();assert(!p.q('[data-step="0"]').hidden);
 p.change('[name=flexible]',true);p.q('[data-step-go="1"]').click();assert(!p.q('[data-step="1"]').hidden);assert(p.q('[name=date]').disabled);
 p.change('[name=city]','Purulia');p.change('[name=outfits]','2');p.q('[name=guests]').value='300';p.q('[data-step-go="2"]').click();assert(!p.q('[data-step="2"]').hidden);
 assert.match(p.q('#plan-summary').textContent,/Purulia/);assert(!p.q('#plan-summary').textContent.includes('300'));
 p.q('#use-plan').click();saved=JSON.parse(p.w.sessionStorage.getItem('candid.plan.v1'));assert.equal(saved.kind,'pre-wedding');assert.equal(saved.date,'');assert.equal(saved.guests,null);p.done();
}
{
 const p=page('contact','?collection=Gold',{'candid.plan.v1':saved});assert.equal(p.q('[name=kind]').value,'wedding');assert.equal(p.q('[name=collection]').value,'Gold');p.done();
}
{
 const p=page('contact','?kind=pre-wedding&place=purulia&question=makeup',{'candid.plan.v1':saved,'candid.looks.v1':[{id:'couple-forest',label:'Forest portrait'}]});
 p.change('[name=name]','Example Couple');p.change('[name=contact]','example@example.com');p.change('[name=city]','Purulia');p.change('[name=flexible]',true);p.change('[name=consent]',true);
 p.q('#enquiry-form').requestSubmit();assert(!p.q('#enquiry-result').hidden);assert.match(p.q('#enquiry-preview').textContent,/Are makeup, hair, clothes and props included/);assert.match(p.q('#enquiry-preview').textContent,/reference: couple-forest/);assert.match(p.q('#whatsapp-send').href,/https:\/\/wa.me\/917980630085\?text=/);assert.equal(p.w.location.pathname,'/candid-photoz/contact.html');
 p.q('#clear-enquiry-context').click();assert.equal(p.w.sessionStorage.length,0);assert(p.q('#enquiry-result').hidden);p.done();
}
{
 const p=page('work');p.q('[data-filter=prewedding]').click();assert.equal(p.qa('.gallery-item:not([hidden])').length,6);
 p.q('[data-inspiration=couple-forest]').click();const list=JSON.parse(p.w.sessionStorage.getItem('candid.looks.v1'));assert.equal(list[0].id,'couple-forest');assert.equal(p.q('[data-inspiration=couple-forest]').getAttribute('aria-pressed'),'true');
 p.q('[data-photo=couple-forest]').click();assert(p.q('#lightbox').open);p.done();
}
{
 const p=page('investment');assert.match(p.q('#cost-status').textContent,/9 costs/);
 p.change('[data-cost-status]','known');assert(!p.q('[data-cost-amount]').disabled);p.q('#use-costs').click();assert.match(p.q('#cost-feedback').textContent,/correct/);assert.equal(p.w.sessionStorage.length,0);
 p.change('[data-cost-amount]','12000','input');assert.match(p.q('#known-subtotal').textContent,/12,000/);p.q('#use-costs').click();assert.match(p.w.sessionStorage.getItem('candid.costs.v1'),/12,000/);
 p.change('[data-cost-status]','included');assert.match(p.q('#known-subtotal').textContent,/confirmed amount/);p.done();
}
{
 const p=page('checklists');assert.equal(p.qa('.family-row').length,4);p.q('#add-family').click();assert.equal(p.qa('.family-row').length,5);
 p.q('#use-family').click();assert.match(p.w.sessionStorage.getItem('candid.family.v1'),/Couple with parents/);
 p.change('[data-prep-check]',true);assert.match(p.q('#preparation-count').textContent,/1 of 24/);p.q('#reset-preparation').click();assert.match(p.q('#preparation-count').textContent,/0 of 24/);
 p.change('[name=total]','20','input');assert.match(p.q('#schedule-total').textContent,/minutes over/);p.done();
}
for(const name of ['index','weddings','pre-wedding','films','experience','journal','proposal']){const p=page(name);p.q('.menu-toggle').click();assert.equal(p.q('.menu-toggle').getAttribute('aria-expanded'),'true');p.done();}
console.log('DOM checks passed: FAQ search, location filters, planner validation, branch handoff, draft message, gallery shortlist/viewer, cost errors, checklists and all page boot paths. No network requests or messages sent.');
