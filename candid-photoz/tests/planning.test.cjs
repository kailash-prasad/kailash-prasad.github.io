const assert = require('node:assert/strict');
const C = require('../assets/core.js');
const D = require('../data/content.json');
// A blank or negative known amount stays unresolved, and included items are not counted twice.
assert.deepEqual(C.costTotals([{status:'known',amount:''},{status:'unknown'},{status:'included',amount:500}]),{subtotal:0,known:0,unresolved:2,invalid:[0],complete:false});
assert.equal(C.costTotals([{status:'known',amount:'120000'},{status:'known',amount:'2500'},{status:'included',amount:'5000'}]).subtotal,122500);
assert.equal(C.costTotals([{status:'known',amount:'0'}]).known,1);
assert.equal(C.costTotals([{status:'known',amount:'-1'}]).unresolved,1);
assert.equal(C.costTotals([{status:'known',amount:'Infinity'}]).known,0);
assert.equal(C.costTotals([{status:'known',amount:'1.10'},{status:'known',amount:'2.20'}]).subtotal,3.3);
// Travel, changes and breaks can consume the session; an impossible plan must remain visible.
assert.equal(C.remainingTime({total:240,travel:40,changes:1,perChange:25,breaks:25}).remaining,150);
assert.equal(C.remainingTime({total:60,travel:40,changes:2,perChange:25,breaks:10}).feasible,false);
assert.equal(C.remainingTime({total:'',travel:0,changes:0,perChange:0,breaks:0}).valid,false);
assert.equal(C.remainingTime({total:240,travel:0,changes:1.5,perChange:0,breaks:0}).valid,false);
// Flexible dates do not resurrect a stale exact date, and wedding-only fields do not leak into a shoot.
const shoot=C.normalisePlan({kind:'pre-wedding',flexible:true,date:'2027-02-14',guests:300,events:[{name:'Wedding'}],place:'purulia'});
assert.equal(shoot.date,'');assert.equal(shoot.guests,null);assert.equal(shoot.events.length,0);
assert.equal(C.validDate('2027-02-31'),'');assert.equal(C.validDate('2028-02-29'),'2028-02-29');
assert.match(C.planSummary(shoot,D.locations),/Flexible \/ not fixed/);
assert.match(C.planSummary(shoot,D.locations),/Purulia/);
assert.doesNotMatch(C.planSummary(shoot,D.locations),/300/);
// Search and location filters must support combined criteria and a useful empty result.
assert.equal(D.faqs.length,40);
assert.equal(new Set(D.faqs.map(q=>q.id)).size,40);
assert(C.filterQuestions(D.faqs,'raw jpeg','delivery').some(q=>q.id==='raw-jpeg'));
assert(C.filterQuestions(D.faqs,'unfindable question xyz','all').length===0);
assert(C.filterQuestions(D.faqs,'outfits','planning').length>0);
assert.equal(D.locations.filter(l=>C.matchesLocation(l,'beach','local')).length,0);
assert.equal(D.locations.filter(l=>C.matchesLocation(l,'city','international'))[0].id,'dubai');
// The reviewed enquiry combines current form values and saved context without inventing a quote.
const msg=C.enquirySummary({kind:'pre-wedding',name:'A & B',contact:'example@example.com',flexible:true,city:'Kolkata',service:'Photography only',privacy:'Please ask before posting',message:'We prefer a relaxed shoot.'},{plan:{kind:'wedding',guests:300},looks:[{label:'Window-light bridal portrait'}],question:'Can we see a complete wedding gallery?'},D.locations);
assert.match(msg,/Photography only/);assert.match(msg,/Flexible \/ not fixed/);assert.match(msg,/Window-light bridal portrait/);assert.match(msg,/Please guide us/);assert.doesNotMatch(msg,/Approximate guests: 300/);
assert.match(msg,/confirm availability/);
console.log('Planning checks passed: unknown costs, arithmetic, session feasibility, date and route handling, search, filters and enquiry context.');
