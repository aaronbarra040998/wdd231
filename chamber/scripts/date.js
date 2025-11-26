// scripts/date.js - Date utilities with localization
(function() {
  'use strict';
  
  const CONFIG = {
    LOCALE: 'es-ES',
    YEAR_ELEMENT: 'currentYear',
    LAST_MODIFIED_ELEMENT: 'lastModified'
  };
  
  function updateCopyrightYear() {
    try {
      const element = document.getElementById(CONFIG.YEAR_ELEMENT);
      if (element) {
        element.textContent = new Date().getFullYear();
      }
    } catch (error) {
      console.error('Error updating copyright year:', error);
    }
  }
  
  function updateLastModified() {
    try {
      const element = document.getElementById(CONFIG.LAST_MODIFIED_ELEMENT);
      if (element && document.lastModified) {
        const lastModified = new Date(document.lastModified);
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        const formattedDate = lastModified.toLocaleDateString(CONFIG.LOCALE, options);
        element.textContent = `Última modificación: ${formattedDate}`;
        element.setAttribute('datetime', lastModified.toISOString());
        element.setAttribute('aria-label', `Última modificación del documento: ${formattedDate}`);
      }
    } catch (error) {
      console.error('Error updating last modified date:', error);
      const element = document.getElementById(CONFIG.LAST_MODIFIED_ELEMENT);
      if (element) {
        element.textContent = `Última modificación: ${document.lastModified}`;
      }
    }
  }
  
  function init() {
    updateCopyrightYear();
    updateLastModified();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();