/**
 * community.js - Módulo ES6 para Community (SIN guardado duplicado)
 */

import { Storage } from '../modules/storage.js';
import { isValidEmail } from '../utils/helpers.js';

const TYPE_DATA = {
  Fire: { icon: '🔥', color: '#F08030' },
  Water: { icon: '💧', color: '#6890F0' },
  Electric: { icon: '⚡', color: '#F8D030' },
  Grass: { icon: '🌿', color: '#78C850' },
  Ice: { icon: '❄️', color: '#98D8D8' },
  Fighting: { icon: '🥊', color: '#C03028' },
  Poison: { icon: '☠️', color: '#A040A0' },
  Ground: { icon: '🌍', color: '#E0C068' },
  Flying: { icon: '🦅', color: '#A890F0' },
  Psychic: { icon: '🔮', color: '#F85888' },
  Bug: { icon: '🐛', color: '#A8B820' },
  Rock: { icon: '🪨', color: '#B8A038' },
  Ghost: { icon: '👻', color: '#705898' },
  Dragon: { icon: '🐉', color: '#7038F8' },
  Dark: { icon: '🌙', color: '#705848' },
  Steel: { icon: '🔩', color: '#B8B8D0' },
  Fairy: { icon: '🧚', color: '#EE99AC' },
  Normal: { icon: '⚪', color: '#A8A878' }
};

const FAN_ART_IMAGES = Array.from({ length: 15 }, (_, i) => ({
  src: `images/fanart/fanart${i + 1}.webp`,
  alt: `Fan Art ${i + 1} - Pokémon artwork by community trainer`,
  artist: `Trainer ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 13) % 26))}`,
  likes: Math.floor(Math.random() * 100) + 10
}));

let displayedImages = 0;
const IMAGES_PER_LOAD = 6;

export function initCommunity() {
  console.log('Initializing community page...');
  
  initCommunityStats();
  initFanArtGallery();
  initCommunityForm();
  loadRecentSubmissions();
  initModal();
  
  console.log('Community page initialized successfully');
}

function initModal() {
  const modal = document.getElementById('fanart-modal');
  if (!modal) {
    console.error('Modal element not found!');
    return;
  }
  
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
  
  console.log('Modal initialized successfully');
}

function closeModal() {
  const modal = document.getElementById('fanart-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
  modal.classList.remove('fanart-modal-active');
}

function initCommunityStats() {
  const submissions = JSON.parse(localStorage.getItem('communitySubmissions') || '[]');
  
  animateCounter('memberCount', submissions.length + 50);
  animateCounter('fanArtCount', FAN_ART_IMAGES.length);
  animateCounter('submissionCount', submissions.length);
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let current = 0;
  const increment = targetValue / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 30);
}

function initFanArtGallery() {
  const gallery = document.getElementById('fanart-grid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  
  if (!gallery) return;
  
  displayedImages = 0;
  loadMoreImages(gallery);
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => loadMoreImages(gallery));
  }
}

function loadMoreImages(gallery) {
  const endIndex = Math.min(displayedImages + IMAGES_PER_LOAD, FAN_ART_IMAGES.length);
  const imagesToLoad = FAN_ART_IMAGES.slice(displayedImages, endIndex);
  
  imagesToLoad.forEach(img => {
    const container = document.createElement('div');
    container.className = 'fanart-item';
    container.setAttribute('tabindex', '0');
    
    const imgElement = document.createElement('img');
    imgElement.src = img.src;
    imgElement.alt = img.alt;
    imgElement.loading = 'lazy';
    imgElement.title = `By ${img.artist} • ❤️ ${img.likes} likes`;
    
    imgElement.addEventListener('error', () => {
      console.warn(`Failed to load: ${img.src}`);
      imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
      imgElement.alt = 'Fan art placeholder';
      container.classList.add('error-load');
    });
    
    imgElement.addEventListener('click', () => openImageModal(img));
    
    container.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openImageModal(img);
      }
    });
    
    container.appendChild(imgElement);
    
    const info = document.createElement('div');
    info.className = 'fanart-info';
    info.innerHTML = `
      <span class="artist-name">${img.artist}</span>
      <span class="likes">❤️ ${img.likes}</span>
    `;
    container.appendChild(info);
    
    gallery.appendChild(container);
  });
  
  displayedImages = endIndex;
  
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (displayedImages >= FAN_ART_IMAGES.length && loadMoreBtn) {
    loadMoreBtn.style.display = 'none';
  }
}

function openImageModal(img) {
  const modal = document.getElementById('fanart-modal');
  if (!modal) {
    console.error('Modal not found when trying to open!');
    return;
  }
  
  const modalBody = modal.querySelector('.modal-body');
  if (!modalBody) {
    console.error('Modal body not found!');
    return;
  }
  
  modalBody.innerHTML = `
    <img src="${img.src}" alt="${img.alt}" style="width:100%; max-height:80vh; object-fit:contain;">
    <div class="modal-info">
      <h3 id="fanart-modal-title">${img.alt}</h3>
      <p><strong>Artist:</strong> ${img.artist}</p>
      <p>❤️ ${img.likes} likes</p>
    </div>
  `;
  
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.classList.add('fanart-modal-active');
  
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 100);
  }
  
  console.log('Modal opened for:', img.src);
}

function initCommunityForm() {
  const form = document.getElementById('communityForm');
  const timestamp = document.getElementById('timestamp');
  const charCount = document.getElementById('charCount');
  const messageField = document.getElementById('message');
  
  if (!form) return;
  
  if (timestamp) {
    timestamp.value = new Date().toISOString();
  }
  
  if (messageField && charCount) {
    messageField.addEventListener('input', () => {
      const count = messageField.value.length;
      charCount.textContent = count;
      charCount.parentElement.classList.toggle('warning', count > 180);
    });
  }
  
  form.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
      validateField(e.target);
    }
  });
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ✅ VALIDAR ANTES DE ENVIAR
    const isValid = Array.from(form.elements).every(element => {
      if (element.required || element.type === 'email') {
        return validateField(element);
      }
      return true;
    });
    
    if (!isValid) {
      const errorField = document.querySelector('.error-message.general');
      if (errorField) {
        errorField.textContent = 'Please fix the errors above before submitting.';
        errorField.classList.add('show');
      }
      return;
    }
    
    // ✅ SOLO VALIDAR Y ENVIAR - NO GUARDAR AQUÍ
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.submit-text');
    const spinner = submitBtn.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // ✅ PERMITIR QUE action.html PROCESE LOS DATOS
    setTimeout(() => {
      // Limpiar datos guardados del formulario
      localStorage.removeItem('formData');
      
      // ✅ ENVIAR FORMULARIO NORMALMENTE
      form.submit();
    }, 800);
  });
  
  loadSavedFormData(form);
}

function validateField(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  let isValid = true;
  let message = '';
  
  if (field.required && !field.value.trim()) {
    isValid = false;
    message = 'This field is required.';
  } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    isValid = false;
    message = 'Please enter a valid email address.';
  } else if (field.id === 'trainerName' && field.value.length < 3) {
    isValid = false;
    message = 'Trainer name must be at least 3 characters.';
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.toggle('show', !isValid);
  }
  
  field.setAttribute('aria-invalid', !isValid);
  
  return isValid;
}

function loadSavedFormData(form) {
  const savedData = Storage.getFormData();
  Object.keys(savedData).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field && savedData[key]) {
      field.value = savedData[key];
      field.dispatchEvent(new Event('input'));
    }
  });
}

function loadRecentSubmissions() {
  const submissionsList = document.getElementById('submissionsList');
  const submissions = JSON.parse(localStorage.getItem('communitySubmissions') || '[]');
  
  if (!submissionsList) return;
  
  if (submissions.length === 0) {
    submissionsList.innerHTML = '<p class="placeholder">No submissions yet. Be the first to join!</p>';
    return;
  }
  
  submissionsList.innerHTML = submissions.slice(0, 5).map(sub => {
    const date = new Date(sub.submittedAt || sub.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const typeIcon = TYPE_DATA[sub.favoriteType]?.icon || '❓';
    
    return `
      <div class="submission-item">
        <div class="submission-header">
          <h4>${sub.trainerName || 'Anonymous Trainer'}</h4>
          <span class="trainer-type" title="${sub.favoriteType || 'Unknown'} type">${typeIcon}</span>
        </div>
        ${sub.message ? `<p class="trainer-message">"${sub.message.substring(0, 120)}${sub.message.length > 120 ? '...' : ''}"</p>` : ''}
        <p class="submission-date">${formattedDate}</p>
      </div>
    `;
  }).join('');
  
  document.getElementById('memberCount').textContent = submissions.length + 50;
  document.getElementById('submissionCount').textContent = submissions.length;
}

if (document.getElementById('communityForm')) {
  document.addEventListener('DOMContentLoaded', initCommunity);
}

export default { initCommunity };