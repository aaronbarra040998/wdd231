/**
 * attributions.js - Módulo ES6 para interacciones en la página de atribuciones
 * FIX: Inicialización segura y verificación de elementos
 */

// ✅ NUEVO: Verifica que el DOM esté listo y los elementos existan
function isPageReady() {
  return document.querySelector('.attributions-grid') !== null;
}

/**
 * Inicializa la página de atribuciones de forma segura
 */
export function initAttributions() {
  if (!isPageReady()) {
    console.warn('Attributions page not ready. Initialization skipped.');
    return;
  }
  
  console.log('📋 Initializing attributions page...');
  
  try {
    countResources();
    addResourceInteractions();
    animateCategories();
    console.log('✅ Attributions page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing attributions page:', error);
  }
}

/**
 * Cuenta recursos por categoría de forma segura
 */
function countResources() {
  const categories = [
    { id: 'images-resources', countId: 'images-count' },
    { id: 'fonts-resources', countId: 'fonts-count' },
    { id: 'tools-resources', countId: 'tools-count' }
  ];
  
  categories.forEach(category => {
    const list = document.getElementById(category.id);
    const counter = document.getElementById(category.countId);
    
    if (list && counter) {
      const items = list.querySelectorAll('.resource-item').length;
      counter.textContent = items;
    } else {
      console.warn(`⚠️ Elements not found: ${category.id} or ${category.countId}`);
    }
  });
}

/**
 * Añade interacciones a los recursos de forma segura
 */
function addResourceInteractions() {
  const resourceLinks = document.querySelectorAll('.resource-link');
  
  resourceLinks.forEach(link => {
    // ✅ Verifica que sea un enlace externo
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Añadir animación hover
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-2px)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });
}

/**
 * Anima las categorías al cargar de forma segura
 */
function animateCategories() {
  const cards = document.querySelectorAll('.category-card');
  
  if (!cards || cards.length === 0) {
    console.warn('⚠️ No category cards found for animation');
    return;
  }
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// ✅ Inicialización automática con verificación doble
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAttributions);
} else {
  // DOM ya está listo
  initAttributions();
}

export default { initAttributions };