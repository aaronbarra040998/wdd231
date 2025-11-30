// scripts/members.js - Enhanced Business Directory
const CONFIG = {
  DATA_URL: 'data/members.json',
  LOADING_TEXT: 'Cargando directorio empresarial...',
  ERROR_TEXT: 'No se pudo cargar el directorio. Por favor, verifica tu conexión.',
  MEMBER_COUNT_TEXT: 'Mostrando {count} empresas',
  NETWORK_ERROR: 'Error de red: {status} {statusText}',
  NO_DATA_ERROR: 'No hay datos empresariales disponibles'
};

(function() {
  'use strict';
  
  const directory = document.getElementById('directory');
  const memberCount = document.getElementById('memberCount');
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  
  if (!directory || !memberCount || !gridBtn || !listBtn) {
    console.warn('Directory elements not found');
    return;
  }
  
  directory.innerHTML = `
    <div class="loading-state" role="status" aria-live="polite">
      <p>${CONFIG.LOADING_TEXT}</p>
    </div>
  `;
  
  memberCount.textContent = CONFIG.LOADING_TEXT;
  
  async function fetchMembers() {
    try {
      const res = await fetch(CONFIG.DATA_URL);
      
      if (!res.ok) {
        throw new Error(CONFIG.NETWORK_ERROR.replace('{status}', res.status).replace('{statusText}', res.statusText));
      }
      
      const json = await res.json();
      const members = json.members || [];
      
      if (members.length === 0) {
        throw new Error(CONFIG.NO_DATA_ERROR);
      }
      
      renderMembers(members);
      
    } catch (err) {
      console.error('Error loading directory:', err);
      showErrorState(CONFIG.ERROR_TEXT);
      memberCount.textContent = 'Error al cargar empresas';
    }
  }
  
  function renderMembers(members) {
    memberCount.textContent = CONFIG.MEMBER_COUNT_TEXT.replace('{count}', members.length);
    memberCount.setAttribute('aria-live', 'polite');
    
    directory.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    members.forEach((member, index) => {
      const card = createMemberCard(member, index);
      fragment.appendChild(card);
    });
    
    directory.appendChild(fragment);
  }
  
  function createMemberCard(member, index) {
  const card = document.createElement('article');
  card.className = 'business-card';
  card.setAttribute('data-membership', getMembershipLevel(member.membership).toLowerCase());
  card.setAttribute('aria-labelledby', `member-title-${index}`);
  
  const img = document.createElement('img');
  img.src = `images/${member.image}`;
  img.alt = `Logo de ${member.name} - ${member.description || 'Empresa local'}`;
  
  // OPTIMIZACIÓN: Solo lazy load después del primer fold
  img.loading = index < 4 ? 'eager' : 'lazy';
  img.width = 280;
  img.height = 160;
  
  // OPTIMIZACIÓN: Preload para las primeras imágenes críticas
  if (index < 2) {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = `images/${member.image}`;
    document.head.appendChild(preloadLink);
  }
  
  img.onerror = function() {
    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDggODBMMTIwIDkyTDEzMiA4MEwxNDQgOTJMMTU2IDgwTDE2OCA5MkwxODAgODBMMTkyIDkyTDIwNCA4MEwyMTYgOTJMMjI4IDgwIiBzdHJva2U9IiNERURGREYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI3MCIgY3k9IjYwIiByPSI4IiBmaWxsPSIjREVERkRGIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQTVBNUE1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkxvZ28gTm8gRGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+Cg==';
    this.alt = `Logo no disponible para ${member.name}`;
  };

    const heading = document.createElement('h3');
    heading.id = `member-title-${index}`;
    heading.textContent = member.name;
    heading.className = 'member-name';

    const description = document.createElement('p');
    description.textContent = member.description || 'Empresa local al servicio de la comunidad';
    description.className = 'description';

    const address = document.createElement('p');
    address.textContent = member.address;
    address.className = 'address';

    const phone = document.createElement('p');
    phone.className = 'phone';
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:+51${member.phone.replace(/\D/g, '')}`;
    phoneLink.textContent = `+51 ${member.phone}`;
    phone.appendChild(phoneLink);

    const websiteLink = document.createElement('a');
    websiteLink.href = member.website;
    websiteLink.textContent = 'Visitar Sitio Web';
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.className = 'website-link';
    websiteLink.setAttribute('aria-label', `Sitio web de ${member.name}`);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = getMembershipLevel(member.membership);
    badge.setAttribute('aria-label', `Nivel ${getMembershipLevel(member.membership)}`);

    card.appendChild(img);
    card.appendChild(heading);
    card.appendChild(description);
    card.appendChild(address);
    card.appendChild(phone);
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
  
  function showErrorState(message) {
    directory.innerHTML = `
      <div class="error-state" role="alert" aria-live="assertive">
        <p>${message}</p>
        <button onclick="location.reload()" class="button button-primary" style="margin-top: 1rem;">
          Reintentar
        </button>
      </div>
    `;
  }
  
  function setActiveView(viewType) {
    const isGridView = viewType === 'grid';
    
    directory.classList.remove('grid-view', 'list-view');
    directory.classList.add(isGridView ? 'grid-view' : 'list-view');
    
    gridBtn.setAttribute('aria-pressed', isGridView.toString());
    listBtn.setAttribute('aria-pressed', (!isGridView).toString());
    
    gridBtn.setAttribute('aria-label', `Vista cuadrícula ${isGridView ? 'seleccionada' : ''}`);
    listBtn.setAttribute('aria-label', `Vista lista ${!isGridView ? 'seleccionada' : ''}`);
    
    localStorage.setItem('directoryView', viewType);
    
    const announcement = document.getElementById('view-announcement') || createViewAnnouncement();
    announcement.textContent = `Vista cambiada a ${isGridView ? 'cuadrícula' : 'lista'}`;
  }
  
  function createViewAnnouncement() {
    const announcement = document.createElement('div');
    announcement.id = 'view-announcement';
    announcement.className = 'visually-hidden';
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcement);
    return announcement;
  }
  
  gridBtn.addEventListener('click', () => setActiveView('grid'));
  listBtn.addEventListener('click', () => setActiveView('list'));
  
  document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('directoryView') || 'grid';
    setActiveView(savedView);
    
    setTimeout(() => {
      fetchMembers();
    }, 100);
  });
})();