/**
 * action.js - Módulo ES6 para la página de acción con sanitización y redirección
 */

import { getQueryParam, formatTimestamp } from '../utils/helpers.js';
import { Storage } from '../modules/storage.js';

// ✅ SANITIZACIÓN HTML - Previene XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Inicializa la página de acción
 */
export function initAction() {
  console.log('Initializing action page...');
  
  // Validar que hay datos antes de procesar
  const hasData = validateQueryParams();
  if (!hasData) {
    showErrorState();
    return;
  }
  
  displaySubmissionSummary();
  recordSubmission();
  initAutoRedirect();
  
  console.log('Action page initialized successfully');
}

/**
 * Valida que existan query parameters
 */
function validateQueryParams() {
  const trainerName = getQueryParam('trainerName');
  const email = getQueryParam('email');
  return !!(trainerName || email);
}

/**
 * Muestra estado de error si no hay datos
 */
function showErrorState() {
  const summary = document.getElementById('submissionSummary');
  if (summary) {
    summary.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--pokemon-red);">
        <h2>⚠️ No submission data found</h2>
        <p>Please return to the <a href="community.html">Community page</a> and submit the form.</p>
      </div>
    `;
  }
  
  // Ocultar contador de redirección
  const redirectNotice = document.getElementById('redirectNotice');
  if (redirectNotice) redirectNotice.style.display = 'none';
}

/**
 * Muestra resumen SANITIZADO de la sumisión
 */
function displaySubmissionSummary() {
  const summary = document.getElementById('submissionSummary');
  if (!summary) return;
  
  // ✅ SANITIZAR TODOS LOS DATOS DEL URL
  const trainerName = sanitizeHTML(getQueryParam('trainerName') || 'Not provided');
  const email = sanitizeHTML(getQueryParam('email') || 'Not provided');
  const favoriteType = sanitizeHTML(getQueryParam('favoriteType') || 'Not selected');
  const message = sanitizeHTML(getQueryParam('message') || 'No message');
  const timestamp = getQueryParam('timestamp') || 'Not available';
  
  summary.innerHTML = `
    <div class="summary-item">
      <strong>🏆 Trainer Name:</strong>
      <span class="summary-value">${trainerName}</span>
    </div>
    <div class="summary-item">
      <strong>📧 Email:</strong>
      <span class="summary-value">${email}</span>
    </div>
    <div class="summary-item">
      <strong>❤️ Favorite Type:</strong>
      <span class="summary-value">${favoriteType}</span>
    </div>
    <div class="summary-item">
      <strong>💭 Message:</strong>
      <span class="summary-value">${message || '(empty)'}</span>
    </div>
    <div class="summary-item">
      <strong>📅 Submitted:</strong>
      <span class="summary-value">${formatTimestamp(timestamp)}</span>
    </div>
  `;
}

/**
 * REGISTRA la sumisión en localStorage (SOLO UNA VEZ)
 */
function recordSubmission() {
  // Verificar si ya fue procesada en esta sesión
  const hasProcessed = sessionStorage.getItem('submissionProcessed');
  if (hasProcessed) {
    console.log('Submission already processed in this session');
    return;
  }
  
  const submission = {
    trainerName: getQueryParam('trainerName'),
    email: getQueryParam('email'),
    favoriteType: getQueryParam('favoriteType'),
    message: getQueryParam('message'),
    timestamp: getQueryParam('timestamp'),
    submittedAt: new Date().toISOString()
  };
  
  // Validar datos mínimos
  if (!submission.trainerName || !submission.email) {
    console.warn('Incomplete submission data');
    return;
  }
  
  const submissions = JSON.parse(localStorage.getItem('communitySubmissions') || '[]');
  
  // Evitar duplicados exactos en los últimos 5 segundos
  const isDuplicate = submissions.some(sub => 
    sub.trainerName === submission.trainerName && 
    sub.email === submission.email &&
    new Date() - new Date(sub.submittedAt) < 5000
  );
  
  if (!isDuplicate) {
    submissions.unshift(submission);
    localStorage.setItem('communitySubmissions', JSON.stringify(submissions));
    console.log('Submission recorded:', submission);
    
    // Marcar como procesada
    sessionStorage.setItem('submissionProcessed', 'true');
  }
}

/**
 * Inicializa redirección automática con contador
 */
function initAutoRedirect() {
  const redirectNotice = document.getElementById('redirectNotice');
  const countdownElement = document.getElementById('countdown');
  
  if (!redirectNotice) return;
  
  let secondsLeft = 5;
  countdownElement.textContent = secondsLeft;
  redirectNotice.style.display = 'block';
  
  const countdown = setInterval(() => {
    secondsLeft--;
    countdownElement.textContent = secondsLeft;
    
    if (secondsLeft <= 0) {
      clearInterval(countdown);
      // Limpiar marca de procesamiento
      sessionStorage.removeItem('submissionProcessed');
      // Redirigir
      window.location.href = 'community.html';
    }
  }, 1000);
  
  // Botón para volver inmediatamente
  const returnBtn = document.getElementById('returnNow');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      clearInterval(countdown);
      sessionStorage.removeItem('submissionProcessed');
      window.location.href = 'community.html';
    });
  }
}

// Inicialización automática
if (document.getElementById('submissionSummary')) {
  document.addEventListener('DOMContentLoaded', initAction);
}

export default { initAction };