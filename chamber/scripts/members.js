// scripts/members.js - Updated for Arequipa Chamber
const dataUrl = 'data/members.json';
const directory = document.getElementById('directory');
const memberCount = document.getElementById('memberCount');
const gridBtn = document.getElementById('gridBtn');
const listBtn = document.getElementById('listBtn');

// Loading state in English
directory.innerHTML = `
  <div class="loading-state" role="status" aria-live="polite">
    <p>Loading business directory information...</p>
  </div>
`;

// Add loading state to member count
if (memberCount) {
  memberCount.textContent = 'Loading businesses...';
}

async function fetchMembers() {
  try {
    const res = await fetch(dataUrl);
    
    if (!res.ok) {
      throw new Error(`Network error: ${res.status} ${res.statusText}`);
    }
    
    const json = await res.json();
    const members = json.members || [];
    
    if (members.length === 0) {
      throw new Error('No business data available in the directory');
    }
    
    renderMembers(members);
    
  } catch (err) {
    console.error('Error loading directory:', err);
    showErrorState('Unable to load business directory. Please check your connection and try again later.');
    
    // Update member count to show error state
    if (memberCount) {
      memberCount.textContent = 'Error loading businesses';
    }
  }
}

function renderMembers(members) {
  // Update member count with accessible announcement
  if (memberCount) {
    memberCount.textContent = `Showing ${members.length} businesses`;
    memberCount.setAttribute('aria-live', 'polite');
  }
  
  // Clear directory
  directory.innerHTML = '';
  
  // Create document fragment for better performance
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
  
  // Create image with error handling
  const img = document.createElement('img');
  img.src = `images/${member.image}`;
  img.alt = `${member.name} - ${member.description || 'Business profile image'}`;
  img.loading = 'lazy';
  img.width = 280;
  img.height = 160;
  img.onerror = function() {
    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDggODBMMTIwIDkyTDEzMiA4MEwxNDQgOTJMMTU2IDgwTDE2OCA5MkwxODAgODBMMTkyIDkyTDIwNCA4MEwyMTYgOTJMMjI4IDgwIiBzdHJva2U9IiNERURGREYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI3MCIgY3k9IjYwIiByPSI4IiBmaWxsPSIjREVERkRGIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQTVBNUE1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkJ1c2luZXNzIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    this.alt = 'Default business image - logo not available';
  };

  // Create member name heading
  const heading = document.createElement('h3');
  heading.id = `member-title-${index}`;
  heading.textContent = member.name;
  heading.className = 'member-name';

  // Create description
  const description = document.createElement('p');
  description.textContent = member.description || 'Local business serving the community';
  description.className = 'description';

  // Create address
  const address = document.createElement('p');
  address.textContent = member.address;
  address.className = 'address';

  // Create phone with semantic markup
  const phone = document.createElement('p');
  const phoneLink = document.createElement('a');
  phoneLink.href = `tel:${member.phone.replace(/\D/g, '')}`;
  phoneLink.textContent = member.phone;
  phone.appendChild(phoneLink);
  phone.className = 'phone';

  // Create website link
  const websiteLink = document.createElement('a');
  websiteLink.href = member.website;
  websiteLink.textContent = 'Visit Website';
  websiteLink.target = '_blank';
  websiteLink.rel = 'noopener noreferrer';
  websiteLink.className = 'website-link';
  websiteLink.setAttribute('aria-label', `Visit ${member.name} website`);

  // Create membership badge
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = getMembershipLevel(member.membership);
  badge.setAttribute('aria-label', `${getMembershipLevel(member.membership)} member level`);

  // Assemble card in logical order
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
      <button onclick="fetchMembers()" class="action-button action-primary" style="margin-top: 1rem;">
        Try Again
      </button>
    </div>
  `;
}

// View toggle functionality with enhanced accessibility
function setActiveView(viewType) {
  const isGridView = viewType === 'grid';
  
  // Update classes
  directory.classList.remove('grid-view', 'list-view');
  directory.classList.add(isGridView ? 'grid-view' : 'list-view');
  
  // Update button states
  gridBtn.setAttribute('aria-pressed', isGridView.toString());
  listBtn.setAttribute('aria-pressed', (!isGridView).toString());
  
  // Update button text for screen readers
  gridBtn.setAttribute('aria-label', `Grid view ${isGridView ? 'selected' : ''}`);
  listBtn.setAttribute('aria-label', `List view ${!isGridView ? 'selected' : ''}`);
  
  // Save preference
  localStorage.setItem('directoryView', viewType);
  
  // Announce view change for screen readers
  const announcement = document.getElementById('view-announcement') || createViewAnnouncement();
  announcement.textContent = `View changed to ${viewType} layout`;
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

// Event listeners for view toggle
gridBtn.addEventListener('click', () => setActiveView('grid'));
listBtn.addEventListener('click', () => setActiveView('list'));

// Keyboard navigation for view toggle
gridBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setActiveView('grid');
  }
});

listBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setActiveView('list');
  }
});

// Restore view preference on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedView = localStorage.getItem('directoryView') || 'grid';
  setActiveView(savedView);
});

// Initial data load with error handling
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure DOM is fully ready
  setTimeout(() => {
    fetchMembers().catch(err => {
      console.error('Failed to load members:', err);
    });
  }, 100);
});