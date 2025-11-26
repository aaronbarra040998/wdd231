// scripts/spotlights.js - Random Gold/Silver Member Spotlights
const CONFIG = {
  DATA_URL: 'data/members.json',
  ELIGIBLE_LEVELS: [2, 3], // Silver and Gold
  MAX_SPOTLIGHTS: 3,
  MIN_SPOTLIGHTS: 2,
  LOADING_TEXT: 'Cargando miembros destacados...',
  ERROR_TEXT: 'No se pudieron cargar los miembros destacados.',
  NO_ELIGIBLE_TEXT: 'No hay miembros Gold o Silver disponibles para destacar.'
};

(function() {
  'use strict';
  
  const spotlightsContainer = document.getElementById('spotlights-container');
  
  if (!spotlightsContainer) {
    console.warn('Spotlights container not found');
    return;
  }
  
  async function fetchSpotlightMembers() {
    try {
      const response = await fetch(CONFIG.DATA_URL);
      
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const members = data.members || [];
      
      if (members.length === 0) {
        throw new Error('No hay datos de miembros disponibles');
      }
      
      displayRandomSpotlights(members);
      
    } catch (error) {
      console.error('Error loading spotlight members:', error);
      showSpotlightsError(CONFIG.ERROR_TEXT);
    }
  }
  
  function displayRandomSpotlights(members) {
    const eligibleMembers = members.filter(member => 
      CONFIG.ELIGIBLE_LEVELS.includes(member.membership)
    );
    
    if (eligibleMembers.length === 0) {
      showSpotlightsError(CONFIG.NO_ELIGIBLE_TEXT);
      return;
    }
    
    const shuffledMembers = shuffleArray([...eligibleMembers]);
    const numToShow = Math.min(
      eligibleMembers.length, 
      Math.random() > 0.3 ? CONFIG.MAX_SPOTLIGHTS : CONFIG.MIN_SPOTLIGHTS
    );
    
    const selectedMembers = shuffledMembers.slice(0, numToShow);
    renderSpotlightCards(selectedMembers);
  }
  
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  function renderSpotlightCards(members) {
    const fragment = document.createDocumentFragment();
    
    members.forEach((member, index) => {
      const card = createSpotlightCard(member, index);
      fragment.appendChild(card);
    });
    
    spotlightsContainer.innerHTML = '';
    spotlightsContainer.appendChild(fragment);
  }
  
  function createSpotlightCard(member, index) {
    const card = document.createElement('article');
    card.className = 'spotlight-card';
    card.setAttribute('data-membership', getMembershipLevel(member.membership).toLowerCase());
    card.setAttribute('aria-labelledby', `spotlight-title-${index}`);
    
    const img = document.createElement('img');
    img.src = `images/${member.image}`;
    img.alt = `Logo de ${member.name}`;
    img.loading = 'lazy';
    img.width = 100;
    img.height = 100;
    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjhGOUZBIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjREVERkRGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0E1QTVBNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4K';
      this.alt = `Logo no disponible para ${member.name}`;
    };
    
    const heading = document.createElement('h3');
    heading.id = `spotlight-title-${index}`;
    heading.textContent = member.name;
    
    const description = document.createElement('p');
    description.textContent = member.description || 'Miembro destacado de la cámara';
    description.className = 'spotlight-description';
    
    const phone = document.createElement('p');
    phone.innerHTML = `<strong>Teléfono:</strong> +51 ${member.phone}`;
    
    const address = document.createElement('p');
    address.innerHTML = `<strong>Dirección:</strong> ${member.address.split(',')[0]}`;
    
    const websiteLink = document.createElement('a');
    websiteLink.href = member.website;
    websiteLink.textContent = 'Visitar Sitio Web';
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.className = 'website-link';
    
    const badge = document.createElement('span');
    badge.className = 'spotlight-badge';
    badge.textContent = `${getMembershipLevel(member.membership)} Member`;
    
    card.appendChild(img);
    card.appendChild(heading);
    card.appendChild(description);
    card.appendChild(phone);
    card.appendChild(address);
    card.appendChild(websiteLink);
    card.appendChild(badge);
    
    return card;
  }
  
  function getMembershipLevel(level) {
    switch(level) {
      case 3: return 'Gold';
      case 2: return 'Silver';
      case 1: return 'Member';
      default: return 'Member';
    }
  }
  
  function showSpotlightsError(message) {
    spotlightsContainer.innerHTML = `
      <div class="error-state" role="alert">
        <p>${message}</p>
      </div>
    `;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchSpotlightMembers);
  } else {
    fetchSpotlightMembers();
  }
})();