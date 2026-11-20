'use strict';
const nav=document.querySelector('#main-nav');
const toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close':'Menu';nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';toggle.focus()}});
const filters=[...document.querySelectorAll('[data-filter]')];
const photos=[...document.querySelectorAll('[data-photo]')];
function setFilter(value){filters.forEach(b=>{const selected=b.dataset.filter===value;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});photos.forEach(p=>{p.hidden=value!=='all'&&p.dataset.category!==value;const item=p.closest('.gallery-item');if(item)item.hidden=p.hidden});const count=photos.filter(p=>!p.hidden).length;const status=document.querySelector('.filter-count');if(status)status.textContent=`${count} photographs · Select an image to explore`}
filters.forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
if(location.hash==='#prewedding'||location.hash==='#dubai')setFilter('prewedding');
if(location.hash==='#weddings')setFilter('wedding');
window.addEventListener('hashchange',()=>{if(location.hash==='#prewedding'||location.hash==='#dubai')setFilter('prewedding');else if(location.hash==='#weddings')setFilter('wedding')});
const lightbox=document.querySelector('#lightbox');let selectedPhoto=0;let currentPhotos=[];
function showPhoto(index){if(!currentPhotos.length)return;selectedPhoto=(index+currentPhotos.length)%currentPhotos.length;const p=currentPhotos[selectedPhoto];const image=document.querySelector('#large-photo');image.src=`./assets/${p.dataset.photo}.webp`;image.alt=p.querySelector('img').alt;document.querySelector('#photo-caption').textContent=`${image.alt} · ${selectedPhoto+1} / ${currentPhotos.length}`}
photos.forEach(p=>p.addEventListener('click',()=>{currentPhotos=photos.filter(p=>!p.hidden);showPhoto(currentPhotos.indexOf(p));lightbox.showModal();document.body.classList.add('dialog-open')}));
document.querySelector('.lightbox-prev')?.addEventListener('click',()=>showPhoto(selectedPhoto-1));document.querySelector('.lightbox-next')?.addEventListener('click',()=>showPhoto(selectedPhoto+1));
lightbox?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(selectedPhoto-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(selectedPhoto+1)}});
// Films stay in the page, in the exact area where their cover was selected.
const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-film]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.film;
    if (!/^[\w-]{11}$/.test(id)) return;
    const host = button.closest('.film-art') || button;
    const player = document.createElement('div');
    player.className = 'inline-film';
    const iframe = document.createElement('iframe');
    iframe.title = button.getAttribute('aria-label')?.replace(/^Play /, '') || 'Candid Photography film';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.append(iframe);
    host.replaceWith(player);
    iframe.focus({preventScroll: true});
  });
});
lightbox?.querySelector('.dialog-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', e => {
  if (e.target !== lightbox) return;
  const r = lightbox.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) lightbox.close();
});
lightbox?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
// Slow photographic crossfades with a visible pause control and reduced-motion support.
const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('[data-slide]')];
const pauseMotion = document.querySelector('.hero-pause');
let activeSlide = 0;
let motionPaused = mediaQuery.matches;
let slideTimer;
function showSlide(index) {
  activeSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === index); dot.setAttribute('aria-pressed', String(i === index)); });
}
function updateMotion() {
  clearInterval(slideTimer);
  document.querySelector('.hero-cinematic')?.classList.toggle('motion-paused', motionPaused || mediaQuery.matches);
  if (pauseMotion) {
    pauseMotion.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
    pauseMotion.setAttribute('aria-pressed', String(motionPaused));
  }
  if (slides.length > 1 && !motionPaused && !mediaQuery.matches && !document.hidden) slideTimer = setInterval(() => showSlide((activeSlide + 1) % slides.length), 6500);
}
dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.slide)); updateMotion(); }));
pauseMotion?.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
mediaQuery.addEventListener('change', () => { motionPaused = mediaQuery.matches; updateMotion(); });
document.addEventListener('visibilitychange', updateMotion);
updateMotion();
// Keep the floating enquiry button clear of the opening and planning-card links.
const enquiryClearAreas = [...document.querySelectorAll('.hero-cinematic, .planning-hub')];
const floatingEnquiry = document.querySelector('.mobile-enquire');
if (enquiryClearAreas.length && floatingEnquiry && 'IntersectionObserver' in window) {
  const visibleAreas = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) visibleAreas.add(entry.target); else visibleAreas.delete(entry.target); });
    floatingEnquiry.classList.toggle('hidden-by-hero', visibleAreas.size > 0);
  }, {threshold: 0});
  enquiryClearAreas.forEach(area => observer.observe(area));
}
