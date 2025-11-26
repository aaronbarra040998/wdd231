// scripts/form-validation.js - Client-side form validation
(function() {
  'use strict';
  
  const form = document.getElementById('contactForm');
  const statusElement = document.getElementById('form-status');
  
  if (!form || !statusElement) {
    console.warn('Form elements not found');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  function showError(field, message) {
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'form-error';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
  }
  
  function clearError(field) {
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
  
  function validateField(field) {
    const value = field.value.trim();
    clearError(field);
    
    if (field.hasAttribute('required') && !value) {
      showError(field, 'Este campo es obligatorio');
      return false;
    }
    
    if (field.type === 'email' && value && !emailRegex.test(value)) {
      showError(field, 'Por favor, introduce un correo electrónico válido');
      return false;
    }
    
    return true;
  }
  
  function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  function showFormStatus(message, isSuccess = true) {
    statusElement.textContent = message;
    statusElement.className = isSuccess ? 'form-success' : 'form-error';
    statusElement.removeAttribute('aria-hidden');
    
    setTimeout(() => {
      statusElement.setAttribute('aria-hidden', 'true');
      statusElement.textContent = '';
    }, 5000);
  }
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    setTimeout(() => {
      showFormStatus('¡Mensaje enviado exitosamente! Te contactaremos pronto.', true);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  }
  
  function handleBlur(event) {
    validateField(event.target);
  }
  
  function handleInput(event) {
    if (event.target.hasAttribute('aria-invalid')) {
      clearError(event.target);
    }
  }
  
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('blur', handleBlur, true);
  form.addEventListener('input', handleInput);
  
  const style = document.createElement('style');
  style.textContent = `
    .form-error {
      color: var(--error-text);
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      padding: 0.5rem;
      margin-top: 0.25rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .form-success {
      color: #155724;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 0.5rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
  `;
  document.head.appendChild(style);
})();