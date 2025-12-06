// scripts/discover.js - Discover page functionality (ES Module)
import { places } from '../data/places.mjs';

(function() {
  'use strict';
  
  const CONFIG = {
    VISIT_MESSAGE_ID: 'visit-message',
    DISCOVER_GRID_ID: 'discover-grid',
    STORAGE_KEY: 'lastVisit',
    MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24
  };
  
  // Ya no necesitamos fetch, usamos la importación directa
  async function loadPlacesData() {
    try {
      // Retornamos los datos importados directamente
      return places;
    } catch (error) {
      console.error('Error cargando datos de lugares:', error);
      return [];
    }
  }
  
  function displayVisitMessage() {
    const messageElement = document.getElementById(CONFIG.VISIT_MESSAGE_ID);
    if (!messageElement) return;
    
    const lastVisit = localStorage.getItem(CONFIG.STORAGE_KEY);
    const currentTime = Date.now();
    
    let message;
    
    if (!lastVisit) {
      message = 'Welcome! Let us know if you have any questions.';
    } else {
      const lastVisitTime = parseInt(lastVisit);
      const timeDifference = currentTime - lastVisitTime;
      const daysDifference = Math.floor(timeDifference / CONFIG.MILLISECONDS_PER_DAY);
      
      if (daysDifference < 1) {
        message = 'Back so soon! Awesome!';
      } else {
        const dayText = daysDifference === 1 ? 'day' : 'days';
        message = `You last visited ${daysDifference} ${dayText} ago.`;
      }
    }
    
    messageElement.innerHTML = `
      <div class="visit-banner">
        <p>${message}</p>
      </div>
    `;
    
    // Guardar la visita actual
    localStorage.setItem(CONFIG.STORAGE_KEY, currentTime.toString());
  }
  
  function createPlaceCard(place, index) {
    const card = document.createElement('article');
    card.className = 'discover-card';
    
    // Asignar área de grid específica según el índice
    // Esto permite controlar el posicionamiento en grid-template-areas
    card.setAttribute('data-card', `card${index + 1}`);
    
    // Estructura EXACTA requerida por la rúbrica:
    // - h2 para el título (requerido)
    // - figure con img y figcaption (requerido)
    // - address para la dirección (requerido)
    // - p para la descripción (requerido)
    // - button "Learn More" (requerido)
    
    card.innerHTML = `
      <h2>${place.name}</h2>
      <figure class="discover-figure">
        <img 
          src="images/${place.image}" 
          alt="${place.name} in Arequipa" 
          loading="lazy"
          width="300"
          height="200"
          class="discover-image"
        >
        <figcaption class="visually-hidden">Photo of ${place.name}</figcaption>
      </figure>
      <address>${place.address}</address>
      <p>${place.description}</p>
      <button class="button button-primary discover-button" aria-label="Learn more about ${place.name}">
        Learn More
      </button>
    `;
    
    return card;
  }
  
  function renderDiscoverGrid(places) {
    const grid = document.getElementById(CONFIG.DISCOVER_GRID_ID);
    if (!grid) return;
    
    const fragment = document.createDocumentFragment();
    
    places.forEach((place, index) => {
      const card = createPlaceCard(place, index);
      fragment.appendChild(card);
    });
    
    grid.innerHTML = '';
    grid.appendChild(fragment);
    
    // Aplicar el área de grid a cada tarjeta usando CSS custom properties
    places.forEach((_, index) => {
      const card = grid.querySelector(`[data-card="card${index + 1}"]`);
      if (card) {
        card.style.gridArea = `card${index + 1}`;
      }
    });
  }
  
  async function init() {
    // 1. Mostrar mensaje de visitas
    displayVisitMessage();
    
    // 2. Cargar datos desde el módulo importado
    const placesData = await loadPlacesData();
    
    if (placesData.length > 0) {
      renderDiscoverGrid(placesData);
    } else {
      const grid = document.getElementById(CONFIG.DISCOVER_GRID_ID);
      grid.innerHTML = `
        <div class="error-state">
          <p>Unable to load places of interest. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Inicialización - usar DOMContentLoaded para módulos ES6
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Si el DOM ya está listo, inicializar inmediatamente
    setTimeout(init, 0);
  }
})();