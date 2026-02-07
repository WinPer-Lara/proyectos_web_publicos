/* Global configuration for Conecta Mayor
   Determines the correct base paths for resources based on current location
*/
window.ConectaMayorConfig = (function(){
  const path = window.location.pathname;
  // Detect if we're in /pages/ subdirectory
  const isInPages = path.indexOf('/pages/') !== -1 || 
                    path.indexOf('\\pages\\') !== -1 || 
                    path.startsWith('/pages');
  
  // Determine the relative base path for going to root
  const baseRelative = isInPages ? '../' : './';
  
  return {
    isInPages: isInPages,
    baseRelative: baseRelative,
    getAssetPath: function(asset) {
      // For an asset like "icons/logo.svg", returns the correct relative path
      return this.baseRelative + asset;
    },
    getScriptPath: function(script) {
      // For a script like "scripts.js", returns the correct relative path
      return this.baseRelative + 'js/' + script;
    }
  };
})();
