// Accesibilidad: control de tamaño de fuente y alto contraste
// Expose initialization function so it can be called after header partial is inserted.
(function(){
  const STORAGE_KEY = 'conecta_mayor_settings';
  const defaultSettings = { scale: 1, inverted: false };
  let settings = null;
  let initialized = false;

  function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSettings; }catch(e){return defaultSettings} }
  function save(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

  function apply(root){
    const htmlRoot = document.documentElement;
    htmlRoot.style.fontSize = (18 * settings.scale) + 'px';
    if(settings.inverted) document.body.classList.add('inverted-colors'); else document.body.classList.remove('inverted-colors');
    const invertBtn = document.getElementById('invert-colors');
    if(invertBtn) invertBtn.setAttribute('aria-pressed', settings.inverted);
    // mark body to provide fallback padding when JS runs
    document.body.classList.add('has-fixed-header');
  }

  function changeScale(delta){ settings.scale = Math.max(0.8, Math.min(1.6, +(settings.scale + delta).toFixed(2))); save(settings); apply(); }

  function initAccessibilityControls(){
    if(initialized) return; // avoid duplicate binding
    settings = load();
    const decrease = document.getElementById('decrease-font');
    const increase = document.getElementById('increase-font');
    const reset = document.getElementById('reset-font');
    const invert = document.getElementById('invert-colors');

    if(increase) increase.addEventListener('click', ()=> changeScale(0.125));
    if(decrease) decrease.addEventListener('click', ()=> changeScale(-0.125));
    if(reset) reset.addEventListener('click', ()=> { settings.scale = 1; save(settings); apply(); });
    if(invert) invert.addEventListener('click', ()=> { settings.inverted = !settings.inverted; save(settings); apply(); });

    apply();
    // Back-button behavior and brand link adjustment
    const backBtn = document.getElementById('back-button');
    const brandLink = document.getElementById('brand-link');
    if(backBtn){
      backBtn.addEventListener('click', ()=>{
        if(document.referrer && document.referrer !== ''){
          history.back();
        } else {
          const fallback = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
          location.href = fallback;
        }
      });
      // Hide back button on the site index page
      try{
        const name = location.pathname.split('/').pop();
        const isIndex = (name === '' || name === 'index.html' || name === 'index.htm');
        if(isIndex){ backBtn.style.display = 'none'; }
        else { backBtn.style.display = ''; }
      }catch(e){ /* ignore */ }
    }
    if(brandLink){
      const href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
      brandLink.setAttribute('href', href);
    }
    // Make header fixed and implement shrink-on-scroll
    try{
      const headerContainer = document.getElementById('site-header');
      const navEl = headerContainer ? headerContainer.querySelector('nav') : document.querySelector('nav.navbar');
      if(navEl){
        navEl.classList.add('navbar-fixed');
        // set padding-top to avoid content covered by fixed header
        const updateBodyPadding = ()=>{ document.body.style.paddingTop = navEl.offsetHeight + 'px'; };
        updateBodyPadding();
        let ticking = false;
        const onScroll = ()=>{
          if(!ticking){
            window.requestAnimationFrame(()=>{
              if(window.scrollY > 50) navEl.classList.add('navbar-shrink'); else navEl.classList.remove('navbar-shrink');
              updateBodyPadding();
              ticking = false;
            });
            ticking = true;
          }
        };
        window.addEventListener('scroll', onScroll, {passive:true});
        window.addEventListener('resize', updateBodyPadding);
      }
    }catch(e){/* ignore */}
    initialized = true;
  }

  window.initAccessibilityControls = initAccessibilityControls;

  // Auto-init on DOM ready, waiting for partials to be loaded if necessary
  function tryInit() {
    // Wait for partials to be loaded (they're loaded asynchronously)
    if(window.ConectaMayorPartialsLoaded || document.getElementById('site-header')) {
      if(window.initAccessibilityControls) window.initAccessibilityControls();
    } else {
      // Check again after a short delay or on next DOM modification
      setTimeout(tryInit, 100);
    }
  }
  
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    setTimeout(tryInit, 0);
  }

})();
