// scripts/thankyou.js - Thank you page functionality
(function() {
  'use strict';
  
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  function formatTimestamp(timestamp) {
    if (!timestamp) return 'No disponible';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp; // Devolver el string original si no es una fecha válida
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando timestamp:', error);
      return timestamp;
    }
  }
  
  function displayApplicationSummary() {
    const summaryElement = document.getElementById('applicationSummary');
    if (!summaryElement) return;
    
    const firstName = getQueryParam('firstName') || 'No proporcionado';
    const lastName = getQueryParam('lastName') || 'No proporcionado';
    const email = getQueryParam('email') || 'No proporcionado';
    const phone = getQueryParam('phone') || 'No proporcionado';
    const business = getQueryParam('business') || 'No proporcionado';
    const timestamp = getQueryParam('timestamp') || 'No disponible';
    
    let membership = getQueryParam('membership') || 'No seleccionado';
    switch(membership) {
      case 'np':
        membership = 'NP Membership (No lucrativa)';
        break;
      case 'bronze':
        membership = 'Bronze Membership';
        break;
      case 'silver':
        membership = 'Silver Membership';
        break;
      case 'gold':
        membership = 'Gold Membership';
        break;
      default:
        membership = 'No seleccionado';
    }
    
    const formattedDate = formatTimestamp(timestamp);
    
    summaryElement.innerHTML = `
      <div class="summary-item">
        <strong>Nombre:</strong> ${firstName} ${lastName}
      </div>
      <div class="summary-item">
        <strong>Email:</strong> ${email}
      </div>
      <div class="summary-item">
        <strong>Teléfono:</strong> ${phone}
      </div>
      <div class="summary-item">
        <strong>Empresa/Organización:</strong> ${business}
      </div>
      <div class="summary-item">
        <strong>Nivel de Membresía:</strong> ${membership}
      </div>
      <div class="summary-item">
        <strong>Fecha y Hora de Envío:</strong> ${formattedDate}
      </div>
    `;
  }
  
  function init() {
    displayApplicationSummary();
    
    // Log para debugging
    console.log('Parámetros de URL:', window.location.search);
    console.log('Timestamp recibido:', getQueryParam('timestamp'));
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();