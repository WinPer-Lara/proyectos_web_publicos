/* Load header/footer partials into pages and initialize accessibility controls
   Tries common relative paths so it works from root or from pages/ folder.
*/
(function(){
  const headerTargetId = 'site-header';
  const footerTargetId = 'site-footer';

  const partialPaths = ['partials/','../partials/','./partials/'];

  async function fetchPartial(name){
    for(const p of partialPaths){
      try{
        const res = await fetch(p + name);
        if(res.ok){
          return await res.text();
        }
      }catch(e){/* try next */}
    }
    return null;
  }

  async function load(){
    const headerEl = document.getElementById(headerTargetId);
    const footerEl = document.getElementById(footerTargetId);
    const headerHtml = await fetchPartial('header.html');
    const footerHtml = await fetchPartial('footer.html');
    // Fallback HTML in case fetch fails (e.g., opening files via file://)
    const FALLBACK_HEADER = `
<nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3">
  <div class="container">
    <div class="d-flex align-items-center">
      <button id="back-button" class="btn btn-outline-secondary btn-sm me-2" aria-label="Volver">← Volver</button>
      <a id="brand-link" class="navbar-brand fw-bold fs-4" href="#">Conecta Mayor</a>
    </div>
  </div>
</nav>
<div class="fixed-accessible-controls" role="region" aria-label="Controles de accesibilidad">
  <button id="decrease-font" class="btn btn-outline-secondary" aria-label="Disminuir tamaño">A-</button>
  <button id="reset-font" class="btn btn-outline-secondary" aria-label="Restablecer tamaño">A</button>
  <button id="increase-font" class="btn btn-outline-secondary" aria-label="Aumentar tamaño">A+</button>
  <button id="invert-colors" class="btn btn-outline-dark" aria-pressed="false" aria-label="Invertir colores">Invertir</button>
</div>
`;
    const FALLBACK_FOOTER = `<footer class="py-4 bg-white border-top"><div class="container text-center text-muted small">Conecta Mayor</div></footer>`;

    if(headerEl) headerEl.innerHTML = headerHtml || FALLBACK_HEADER;
    if(footerEl) footerEl.innerHTML = footerHtml || FALLBACK_FOOTER;

    // Signal that partials have been loaded
    window.ConectaMayorPartialsLoaded = true;
    
    // Ensure accessibility init runs after insertion
    if(window.initAccessibilityControls) window.initAccessibilityControls();
  }

  // Load as soon as possible
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
