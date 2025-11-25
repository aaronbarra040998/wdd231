// scripts/spotlights.js - Enhanced Random Gold/Silver Member Spotlights
(function() {
  'use strict';
  
  const dataUrl = 'data/members.json';
  const spotlightsContainer = document.getElementById('spotlights-container');
  
  async function fetchSpotlightMembers() {
    try {
      const response = await fetch(dataUrl);
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const members = data.members || [];
      
      if (members.length === 0) {
        throw new Error('No member data available');
      }
      
      displayRandomSpotlights(members);
      
    } catch (error) {
      console.error('Error loading spotlight members:', error);
      showSpotlightsError('Unable to load featured members. Please try again later.');
    }
  }
  
  function displayRandomSpotlights(members) {
    // Filter for gold (3) and silver (2) members only
    const eligibleMembers = members.filter(member => 
      member.membership === 3 || member.membership === 2
    );
    
    if (eligibleMembers.length === 0) {
      showSpotlightsError('No gold or silver members available for spotlight.');
      return;
    }
    
    // Enhanced random selection with Fisher-Yates shuffle
    const shuffledMembers = shuffleArray([...eligibleMembers]);
    
    // Select 2-3 members (prefer 3 if available, otherwise 2)
    const numToShow = Math.min(shuffledMembers.length, Math.random() > 0.3 ? 3 : 2);
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
    
    // Create member image with error handling
    const img = document.createElement('img');
    img.src = `images/${member.image}`;
    img.alt = `${member.name} logo`;
    img.loading = 'lazy';
    img.width = 100;
    img.height = 100;
    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjhGOUZBIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjREVERkRGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0E1QTVBNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4K';
      this.alt = 'Default business logo';
    };
    
    // Create member name heading
    const heading = document.createElement('h3');
    heading.id = `spotlight-title-${index}`;
    heading.textContent = member.name;
    
    // Create description
    const description = document.createElement('p');
    description.textContent = member.description || 'Featured chamber member';
    description.className = 'spotlight-description';
    
    // Create contact info
    const phone = document.createElement('p');
    phone.innerHTML = `<strong>Phone:</strong> ${member.phone}`;
    
    const address = document.createElement('p');
    address.innerHTML = `<strong>Address:</strong> ${member.address.split(',')[0]}`;
    
    // Create website link
    const websiteLink = document.createElement('a');
    websiteLink.href = member.website;
    websiteLink.textContent = 'Visit Website';
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.className = 'website';
    
    // Create membership badge
    const badge = document.createElement('span');
    badge.className = 'spotlight-badge';
    badge.textContent = `${getMembershipLevel(member.membership)} Member`;
    
    // Assemble card
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
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchSpotlightMembers);
  } else {
    fetchSpotlightMembers();
  }
})();