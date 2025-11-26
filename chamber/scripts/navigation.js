// scripts/navigation.js - Accessible Mobile Navigation
(function() {
  'use strict';
  
  const menuBtn = document.getElementById('menuBtn');
  const mainNav = document.getElementById('mainNav');
  
  if (!menuBtn || !mainNav) {
    console.warn('Navigation elements not found');
    return;
  }
  
  let focusTrapEnabled = false;
  
  function toggleNavigation() {
    const isExpanded = mainNav.classList.toggle('open');
    
    menuBtn.setAttribute('aria-expanded', isExpanded.toString());
    
    const menuIcon = menuBtn.querySelector('.menu-icon');
    if (menuIcon) {
      menuIcon.textContent = isExpanded ? '✕' : '☰';
    }
    
    if (isExpanded) {
      enableFocusTrap();
    } else {
      disableFocusTrap();
    }
  }
  
  function enableFocusTrap() {
    if (focusTrapEnabled) return;
    
    const focusableElements = Array.from(mainNav.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    mainNav.addEventListener('keydown', handleKeydown);
    focusTrapEnabled = true;
    
    function handleKeydown(e) {
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
        disableFocusTrap();
        menuBtn.focus();
      }
    }
    
    // Store reference for cleanup
    mainNav._focusHandler = handleKeydown;
    
    // Focus first element
    setTimeout(() => firstElement.focus(), 100);
  }
  
  function disableFocusTrap() {
    if (!focusTrapEnabled || !mainNav._focusHandler) return;
    
    mainNav.removeEventListener('keydown', mainNav._focusHandler);
    delete mainNav._focusHandler;
    focusTrapEnabled = false;
  }
  
  function closeNavigation() {
    mainNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    
    const menuIcon = menuBtn.querySelector('.menu-icon');
    if (menuIcon) {
      menuIcon.textContent = '☰';
    }
  }
  
  function handleClickOutside(event) {
    if (mainNav.classList.contains('open') && 
        !mainNav.contains(event.target) && 
        !menuBtn.contains(event.target)) {
      closeNavigation();
      disableFocusTrap();
    }
  }
  
  function handleEscapeKey(event) {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      closeNavigation();
      disableFocusTrap();
      menuBtn.focus();
    }
  }
  
  function handleResize() {
    if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
      closeNavigation();
      disableFocusTrap();
    }
  }
  
  // Event listeners
  menuBtn.addEventListener('click', toggleNavigation);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscapeKey);
  window.addEventListener('resize', handleResize);
  
  mainNav.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      closeNavigation();
      disableFocusTrap();
    }
  });
})();