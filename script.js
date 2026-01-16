// Scroll to top on page load
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Tab switching with event delegation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const tabId = this.getAttribute('data-tab');
    showTab(tabId);
  });
});

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Popup toggle with event delegation
document.querySelectorAll('.info-btn').forEach(button => {
  button.addEventListener('click', function() {
    const popup = this.nextElementSibling;
    popup.classList.toggle('show');
  });
});
