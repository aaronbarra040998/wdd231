// scripts/join.js - Join page functionality
(function() {
  'use strict';
  
  const CONFIG = {
    TIMESTAMP_ID: 'timestamp',
    FORM_ID: 'joinForm'
  };
  
  function initTimestamp() {
    const timestampField = document.getElementById(CONFIG.TIMESTAMP_ID);
    if (timestampField) {
      // Usar formato más legible y asegurar que se establezca inmediatamente
      const now = new Date();
      timestampField.value = now.toISOString();
      
      // También establecer un atributo data-timestamp para referencia
      timestampField.setAttribute('data-timestamp', now.toLocaleString('es-ES'));
      
      console.log('Timestamp establecido:', timestampField.value);
    }
  }
  
  function initModals() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Open modal
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          // Enfocar el primer elemento enfocable del modal para accesibilidad
          const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) firstFocusable.focus();
        }
      });
    });
    
    // Close modal with close button
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        modals.forEach(modal => {
          if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        });
      }
    });
  }
  
  function initFormValidation() {
    const form = document.getElementById(CONFIG.FORM_ID);
    const titleField = document.getElementById('title');
    
    if (titleField) {
      titleField.addEventListener('input', function() {
        const pattern = /^[A-Za-záéíóúñÑ\s\-]{7,}$/;
        if (this.value && !pattern.test(this.value)) {
          this.setCustomValidity('El cargo debe tener al menos 7 caracteres y solo contener letras, espacios y guiones.');
        } else {
          this.setCustomValidity('');
        }
      });
    }
    
    if (form) {
      form.addEventListener('submit', function(e) {
        // Validar que el timestamp esté establecido
        const timestampField = document.getElementById(CONFIG.TIMESTAMP_ID);
        if (!timestampField || !timestampField.value) {
          e.preventDefault();
          alert('Error: El timestamp no se ha establecido correctamente. Por favor, recargue la página.');
          return;
        }
        
        console.log('Formulario enviado con timestamp:', timestampField.value);
      });
    }
  }
  
  function initCardAnimations() {
    const cards = document.querySelectorAll('.membership-card');
    
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }
  
  function init() {
    // Establecer timestamp inmediatamente
    initTimestamp();
    
    // Inicializar el resto de funcionalidades
    initModals();
    initFormValidation();
    initCardAnimations();
    
    // Verificación adicional del timestamp
    setTimeout(() => {
      const timestampField = document.getElementById(CONFIG.TIMESTAMP_ID);
      if (timestampField && !timestampField.value) {
        console.warn('Timestamp no se estableció, reintentando...');
        initTimestamp();
      }
    }, 100);
  }
  
  // Inicializar inmediatamente, no esperar DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
  document.addEventListener('DOMContentLoaded', function() {
    const timestampField = document.getElementById('timestamp');
    if (timestampField && !timestampField.value) {
      timestampField.value = new Date().toISOString();
      console.log('Timestamp establecido via fallback:', timestampField.value);
    }
  });