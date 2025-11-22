// scripts/navigation.js - Enhanced with better accessibility and mobile support
(function() {
  'use strict';
  
  const menuBtn = document.getElementById('menuBtn');
  const mainNav = document.getElementById('mainNav');
  
  if (!menuBtn || !mainNav) {
    console.warn('Navigation elements not found');
    return;
  }
  
  function toggleNavigation() {
    const isExpanded = mainNav.classList.toggle('open');
    
    // Update ARIA attributes
    menuBtn.setAttribute('aria-expanded', isExpanded.toString());
    
    // Update button text for screen readers
    const menuIcon = menuBtn.querySelector('.menu-icon');
    if (menuIcon) {
      menuIcon.textContent = isExpanded ? '✕' : '☰';
    }
    
    // Optional: trap focus in navigation when open
    if (isExpanded) {
      trapFocus(mainNav);
    }
  }
  
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function trapHandler(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        closeNavigation();
        element.removeEventListener('keydown', trapHandler);
      }
    });
  }
  
  function closeNavigation() {
    mainNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    
    const menuIcon = menuBtn.querySelector('.menu-icon');
    if (menuIcon) {
      menuIcon.textContent = '☰';
    }
    
    // Return focus to menu button
    menuBtn.focus();
  }
  
  function handleClickOutside(event) {
    if (mainNav.classList.contains('open') && 
        !mainNav.contains(event.target) && 
        !menuBtn.contains(event.target)) {
      closeNavigation();
    }
  }
  
  function handleEscapeKey(event) {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      closeNavigation();
    }
  }
  
  function handleResize() {
    // Close navigation on resize to larger screens
    if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
      closeNavigation();
    }
  }
  
  // Event listeners
  menuBtn.addEventListener('click', toggleNavigation);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscapeKey);
  window.addEventListener('resize', handleResize);
  
  // Close navigation when a nav link is clicked (useful for single page apps)
  mainNav.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      closeNavigation();
    }
  });
})();