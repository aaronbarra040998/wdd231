// scripts/date.js - Enhanced with better formatting and error handling
(function() {
  'use strict';
  
  // Function to update copyright year
  function updateCopyrightYear() {
    try {
      const currentYearElement = document.getElementById('currentYear');
      if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
      }
    } catch (error) {
      console.error('Error updating copyright year:', error);
    }
  }
  
  // Function to update last modified date
  function updateLastModified() {
    try {
      const lastModifiedElement = document.getElementById('lastModified');
      if (lastModifiedElement && document.lastModified) {
        const lastModified = new Date(document.lastModified);
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        const formattedDate = lastModified.toLocaleDateString('en-US', options);
        lastModifiedElement.textContent = `Last modified: ${formattedDate}`;
        
        // Add machine-readable date for accessibility
        lastModifiedElement.setAttribute('datetime', lastModified.toISOString());
      }
    } catch (error) {
      console.error('Error updating last modified date:', error);
      const lastModifiedElement = document.getElementById('lastModified');
      if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
      }
    }
  }
  
  // Initialize when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateCopyrightYear();
      updateLastModified();
    });
  } else {
    updateCopyrightYear();
    updateLastModified();
  }
  
  // Export functions for testing if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateCopyrightYear, updateLastModified };
  }
})();