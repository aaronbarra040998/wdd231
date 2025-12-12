/**
 * attributions.js - Módulo ES6 para interacciones en la página de atribuciones
 * CORREGIDO: Añadido manejo de errores robusto
 * CORREGIDO: Añadido console.log para debugging
 * CORREGIDO: Verificación de existencia de elementos antes de operar
 */

/**
 * Inicializa la página de atribuciones
 */
export function initAttributions() {
  console.log('📄 Initializing attributions page...');
  
  try {
    // Verificar que el DOM esté listo y los elementos existan
    if (!document.querySelector('.attributions-grid')) {
      console.warn('⚠️ Attributions grid not found. Skipping initialization.');
      return;
    }
    
    countResources();
    addResourceInteractions();
    animateCategories();
    
    console.log('✅ Attributions page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing attributions:', error);
    // No lanzar el error para no romper la experiencia del usuario
  }
}

/**
 * Cuenta recursos por categoría
 */
function countResources() {
  const categories = [
    { id: 'images-resources', countId: 'images-count' },
    { id: 'fonts-resources', countId: 'fonts-count' },
    { id: 'tools-resources', countId: 'tools-count' }
  ];
  
  categories.forEach(category => {
    try {
      const list = document.getElementById(category.id);
      const counter = document.getElementById(category.countId);
      
      if (list && counter) {
        const items = list.querySelectorAll('.resource-item').length;
        counter.textContent = items;
        console.log(`📊 Counted ${items} resources for ${category.id}`);
      } else {
        console.warn(`⚠️ Elements not found for category: ${category.id}`);
      }
    } catch (error) {
      console.error(`❌ Error counting resources for ${category.id}:`, error);
    }
  });
}

/**
 * Añade interacciones a los recursos
 */
function addResourceInteractions() {
  const resourceLinks = document.querySelectorAll('.resource-link');
  
  if (resourceLinks.length === 0) {
    console.warn('⚠️ No resource links found.');
    return;
  }
  
  resourceLinks.forEach(link => {
    try {
      // Añadir target="_blank" a enlaces externos automáticamente
      if (link.hostname && link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
      
      // Añadir evento de click con animación
      link.addEventListener('click', (e) => {
        console.log(`🔗 Navigating to: ${link.href}`);
        
        // Añadir clase de animación
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
          link.style.transform = '';
        }, 150);
      });
      
      // Hover effect para accesibilidad
      link.addEventListener('mouseenter', () => {
        link.style.transition = 'transform 0.2s ease';
      });
    } catch (error) {
      console.error('❌ Error adding interaction to link:', error);
    }
  });
}

/**
 * Anima las categorías al cargar
 */
function animateCategories() {
  const cards = document.querySelectorAll('.category-card');
  
  if (cards.length === 0) {
    console.warn('⚠️ No category cards found for animation.');
    return;
  }
  
  cards.forEach((card, index) => {
    try {
      // Estado inicial
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      // Animar después de un delay escalonado
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    } catch (error) {
      console.error(`❌ Error animating card ${index}:`, error);
    }
  });
}

// Inicialización automática con múltiples verificaciones
if (document.readyState === 'loading') {
  // Document aún cargando
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM content loaded for attributions');
    initAttributions();
  });
} else {
  // Document ya cargado
  console.log('📄 DOM already loaded for attributions');
  initAttributions();
}

// Exportar para uso en otros módulos si es necesario
export default { initAttributions };