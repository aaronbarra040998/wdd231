// scripts/discover.js - Discover page functionality
(function() {
  'use strict';
  
  const CONFIG = {
    VISIT_MESSAGE_ID: 'visit-message',
    DISCOVER_GRID_ID: 'discover-grid',
    STORAGE_KEY: 'lastVisit',
    MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
    PLACES_DATA_URL: 'data/places.json'
  };
  
  let places = [];
  
  async function loadPlacesData() {
    try {
      const response = await fetch(CONFIG.PLACES_DATA_URL);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data.places || [];
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
      message = '¡Bienvenido! Déjanos saber si tienes alguna pregunta.';
    } else {
      const lastVisitTime = parseInt(lastVisit);
      const timeDifference = currentTime - lastVisitTime;
      const daysDifference = Math.floor(timeDifference / CONFIG.MILLISECONDS_PER_DAY);
      
      if (daysDifference < 1) {
        message = '¡Regresas tan pronto! ¡Increíble!';
      } else {
        const dayText = daysDifference === 1 ? 'día' : 'días';
        message = `Tu última visita fue hace ${daysDifference} ${dayText}.`;
      }
    }
    
    messageElement.innerHTML = `
      <div class="visit-banner">
        <p>${message}</p>
      </div>
    `;
    
    localStorage.setItem(CONFIG.STORAGE_KEY, currentTime.toString());
  }
  
  function createPlaceCard(place, index) {
    const card = document.createElement('article');
    card.className = 'discover-card';
    card.setAttribute('data-card', `card${index + 1}`);
    
    card.innerHTML = `
      <figure class="discover-figure">
        <img 
          src="images/places/${place.image}" 
          alt="${place.name}" 
          loading="lazy"
          width="300"
          height="200"
          class="discover-image"
        >
        <figcaption class="visually-hidden">${place.name}</figcaption>
      </figure>
      <div class="discover-content">
        <h2>${place.name}</h2>
        <address>${place.address}</address>
        <p>${place.description}</p>
        <button class="button button-primary discover-button" aria-label="Aprender más sobre ${place.name}">
          Conocer Más
        </button>
      </div>
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
  }
  
  async function init() {
    displayVisitMessage();
    
    // Cargar datos desde JSON
    places = await loadPlacesData();
    
    if (places.length > 0) {
      renderDiscoverGrid(places);
    } else {
      const grid = document.getElementById(CONFIG.DISCOVER_GRID_ID);
      grid.innerHTML = `
        <div class="error-state">
          <p>No se pudieron cargar los lugares de interés. Por favor, intenta más tarde.</p>
        </div>
      `;
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();