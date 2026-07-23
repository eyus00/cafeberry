/**
 * newsletter.js
 * Handles the newsletter signup form: prevents the default submit,
 * shows a translated "subscribed" confirmation on the button, then
 * resets after a short delay.
 */
(function () {
  'use strict';

  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = newsletterForm.querySelector('button');
    const original = btn.textContent;
    btn.textContent = window.translate ? window.translate('newsletter.subscribed') : 'Subscribed';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      newsletterForm.reset();
    }, 3000);
  });
})();
