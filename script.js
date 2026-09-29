'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const booking = document.querySelector('#booking');
const form = document.querySelector('#booking-form');
const status = document.querySelector('.form-status');
let previousFocus = null;

function closeMenu(restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('open');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.querySelectorAll('[data-book]').forEach(button => {
  button.addEventListener('click', () => {
    previousFocus = navigation.contains(button) && navigation.classList.contains('open') ? menuToggle : button;
    closeMenu();
    form.reset();
    status.textContent = '';
    form.querySelector('[type="submit"]').disabled = false;
    if (button.dataset.service) form.elements.service.value = button.dataset.service;
    booking.showModal();
    document.body.classList.add('locked');
  });
});
document.querySelector('.close-dialog').addEventListener('click', () => booking.close());
booking.addEventListener('click', event => {
  const bounds = booking.getBoundingClientRect();
  if (event.target === booking && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) booking.close();
});
booking.addEventListener('close', () => {
  document.body.classList.remove('locked');
  form.reset();
  previousFocus?.focus();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name;
  if (!name.value.trim()) {
    name.setCustomValidity('Введите имя для примера.');
    name.reportValidity();
    return;
  }
  status.textContent = 'Демо завершено. Вы выбрали: ' + form.elements.service.value + '. Настоящая запись не создана, данные не отправлены.';
  form.querySelector('[type="submit"]').disabled = true;
  status.focus();
});
form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
form.addEventListener('input', () => {
  status.textContent = '';
  form.querySelector('[type="submit"]').disabled = false;
});

const backTop = document.querySelector('.back-top');
let scrollScheduled = false;
function updateBackTop() {
  backTop.classList.toggle('visible', window.scrollY > 500);
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateBackTop);
  }
}, { passive: true });
updateBackTop();
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.querySelector('.logo').focus({ preventScroll: true });
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
