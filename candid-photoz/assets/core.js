/* Pure planning calculations and text generation, shared by the UI and checks. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CandidCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function clean(value, limit = 1800) {
    return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, limit);
  }
  function searchText(value) {
    return clean(value, 20000).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-–—]/g, ' ');
  }
  function validDate(value) {
    const s = clean(value, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
    const d = new Date(s + 'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : '';
  }
  function nonNegative(value) {
    if (value === null || value === undefined || clean(value) === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1e9 ? n : null;
  }
  function costTotals(rows) {
    let subtotal = 0, known = 0, unresolved = 0;
    const invalid = [];
    rows.forEach((row, index) => {
      if (row.status === 'known') {
        const amount = nonNegative(row.amount);
        if (amount === null) { unresolved++; invalid.push(index); }
        else { subtotal += amount; known++; }
      } else if (!['included', 'not-needed'].includes(row.status)) unresolved++;
    });
    return {subtotal: Math.round(subtotal * 100) / 100, known, unresolved, invalid, complete: unresolved === 0 && invalid.length === 0};
  }
  function remainingTime(input) {
    const keys = ['total', 'travel', 'changes', 'perChange', 'breaks'];
    const n = Object.fromEntries(keys.map(k => [k, nonNegative(input[k])]));
    if (keys.some(k => n[k] === null) || n.total < 1 || n.total > 1440 || n.travel > 1440 || n.breaks > 1440 || n.perChange > 180 || n.changes > 20 || !Number.isInteger(n.changes)) return {valid: false};
    const changing = n.changes * n.perChange;
    const remaining = n.total - n.travel - changing - n.breaks;
    return {valid: true, ...n, changing, remaining, feasible: remaining > 0};
  }
  function normalisePlan(input = {}) {
    const p = {
      kind: input.kind === 'pre-wedding' ? 'pre-wedding' : 'wedding',
      flexible: input.flexible === true || input.flexible === 'yes' || input.flexible === 'on',
      date: validDate(input.date), endDate: validDate(input.endDate),
      city: clean(input.city, 120), service: clean(input.service, 100) || 'Please guide us',
      style: clean(input.style, 120) || 'Please guide us', privacy: clean(input.privacy, 180) || 'We would like to discuss it',
      notes: clean(input.notes, 1800), place: clean(input.place, 50), approach: clean(input.approach, 150),
      styling: clean(input.styling, 150), preparations: clean(input.preparations, 150),
      guests: nonNegative(input.guests), outfits: nonNegative(input.outfits), events: []
    };
    if (p.flexible) { p.date = ''; p.endDate = ''; }
    if (p.kind === 'wedding') {
      p.place = ''; p.approach = ''; p.styling = ''; p.outfits = null;
      p.events = (Array.isArray(input.events) ? input.events : []).slice(0, 20).map(e => ({name: clean(e.name, 80), when: clean(e.when, 100), location: clean(e.location, 120)})).filter(e => e.name || e.when || e.location);
    } else { p.guests = null; p.preparations = ''; }
    return p;
  }
  function locationLabel(id, locations = []) {
    return locations.find(l => l.id === id)?.name || (id === 'other' ? 'Another location' : 'Help us choose');
  }
  function planSummary(input, locations = []) {
    const p = normalisePlan(input);
    const out = [p.kind === 'wedding' ? 'OUR WEDDING PLAN' : 'OUR PRE-WEDDING SHOOT PLAN', '', 'Dates: ' + (p.flexible ? 'Flexible / not fixed' : p.date ? p.date + (p.endDate ? ' to ' + p.endDate : '') : 'Still deciding'), 'City / venue: ' + (p.city || 'Still deciding'), 'Coverage: ' + p.service, 'Photographic feel: ' + p.style];
    if (p.kind === 'wedding') {
      if (p.guests !== null && p.guests > 0) out.push('Approximate guests: ' + p.guests);
      if (p.preparations) out.push('Preparations: ' + p.preparations);
      if (p.events.length) out.push('', 'Events to discuss:', ...p.events.map(e => '• ' + [e.name || 'Event', e.when, e.location].filter(Boolean).join(' · ')));
    } else {
      out.push('Place to explore: ' + locationLabel(p.place, locations));
      if (p.approach) out.push('Session approach: ' + p.approach);
      if (p.outfits !== null && p.outfits > 0) out.push('Outfits in mind: ' + p.outfits);
      if (p.styling) out.push('Styling arrangements: ' + p.styling);
    }
    out.push('Publishing preference: ' + p.privacy);
    if (p.notes) out.push('', 'Important moments and needs:', p.notes);
    return out.join('\n');
  }
  function filterQuestions(items, query, category = 'all') {
    const words = searchText(query).split(/\s+/).filter(Boolean);
    return items.filter(f => (category === 'all' || f.category === category) && words.every(w => searchText([f.title, f.answer, f.confirm, f.keywords].join(' ')).includes(w)));
  }
  function matchesLocation(place, setting, travel) {
    return (!setting || setting === 'all' || place.setting === setting) && (!travel || travel === 'all' || place.travel === travel);
  }
  function enquirySummary(fields, context = {}, locations = []) {
    const p = normalisePlan({...context.plan, ...fields});
    const out = ['Hello Candid Photography! I’d like to enquire about our celebration.', '', 'Name: ' + clean(fields.name, 100), 'Contact: ' + clean(fields.contact, 150), '', planSummary(p, locations)];
    if (p.kind === 'wedding' && ['Silver', 'Gold', 'Premium', 'Custom coverage'].includes(fields.collection)) out.push('Collection to discuss: ' + fields.collection);
    if (nonNegative(fields.budget) !== null && Number(fields.budget) > 0) out.push('Budget in mind: INR ' + Number(fields.budget));
    else out.push('Budget: Please guide us');
    if (context.question) out.push('', 'Question we would like to discuss:', clean(context.question, 250));
    const looks = (Array.isArray(context.looks) ? context.looks : []).slice(0, 12).map(x => clean(x.label, 180) + ' (reference: ' + clean(x.id, 60) + ')');
    if (looks.length) out.push('', 'Portfolio references we liked:', ...looks.map(x => '• ' + x));
    if (context.family) out.push('', 'Family-photo planning notes:', clean(context.family, 5000));
    if (context.costs) out.push('', 'Our own planning cost worksheet (not a studio quote):', clean(context.costs, 5000));
    if (clean(fields.message)) out.push('', 'Our additional plans / questions:', clean(fields.message));
    out.push('', 'Please confirm availability and share your current written proposal.', 'Prepared using Kailash’s independent website preview.');
    return out.join('\n');
  }
  return {clean, searchText, validDate, nonNegative, costTotals, remainingTime, normalisePlan, planSummary, filterQuestions, matchesLocation, enquirySummary, locationLabel};
});
