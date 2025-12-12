/**
 * attributions.js - Módulo ES6 para interacciones en la página de atribuciones
 * FIXED: Mejoras de rendimiento y accesibilidad
 */

/**
 * Inicializa la página de atribuciones cuando el DOM está listo
 */
export function initAttributions() {
  console.log('Initializing attributions page...');
  
  countResources();
  addResourceInteractions();
  animateCategories();
  enhanceAccessibility();
  
  console.log('Attributions page initialized successfully');
}

/**
 * Cuenta recursos por categoría de forma eficiente
 */
function countResources() {
  const categories = [
    { id: 'images-resources', countId: 'images-count' },
    { id: 'fonts-resources', countId: 'fonts-count' },
    { id: 'tools-resources', countId: 'tools-count' }
  ];
  
  categories.forEach(({ id, countId }) => {
    const list = document.getElementById(id);
    const counter = document.getElementById(countId);
    
    if (list && counter) {
      const items = list.querySelectorAll('.resource-item').length;
      counter.textContent = items;
    }
  });
}

/**
 * Añade interacciones avanzadas a los recursos
 */
function addResourceInteractions() {
  const resourceLinks = document.querySelectorAll('.resource-link');
  
  resourceLinks.forEach(link => {
    // Seguridad: Añadir target="_blank" a enlaces externos automáticamente
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Analytics: Console log para debugging
    link.addEventListener('click', (e) => {
      console.log(`Navigating to: ${link.href}`);
    });
    
    // Accesibilidad: Avisar a screen readers de enlace externo
    if (link.getAttribute('target') === '_blank') {
      link.setAttribute('aria-label', `${link.textContent} (opens in new tab)`);
    }
  });
}

/**
 * Anima las categorías al cargar con performance optimizada
 */
function animateCategories() {
  const cards = document.querySelectorAll('.category-card');
  
  cards.forEach((card, index) => {
    // Optimización: Usar will-change para mejor rendimiento
    card.style.willChange = 'opacity, transform';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // Usar requestAnimationFrame para animaciones suaves
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  });
}

/**
 * Mejora la accesibilidad de la página
 */
function enhanceAccessibility() {
  // Añadir tabindex a tarjetas para navegación por teclado
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    
    // Permitir activar con tecla Enter
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        // Enfocar el primer enlace dentro de la tarjeta
        const firstLink = card.querySelector('.resource-link');
        if (firstLink) {
          firstLink.focus();
        }
      }
    });
  });
  
  // Mejorar anuncios de screen reader para contadores
  const counters = document.querySelectorAll('.resource-count');
  counters.forEach(counter => {
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
  });
}

/**
 * Inicialización segura del módulo
 */
if (document.querySelector('.attributions-grid')) {
  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAttributions);
  } else {
    // DOM ya está listo
    initAttributions();
  }
}

export default { initAttributions };