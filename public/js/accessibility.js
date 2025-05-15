// Font size adjustment functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the font size buttons
  const increaseFontBtn = document.getElementById('font-size-increase');
  const decreaseFontBtn = document.getElementById('font-size-decrease');
  
  // Set initial font size from localStorage or use default
  let currentFontSize = localStorage.getItem('fontSize') || 16;
  document.documentElement.style.setProperty('--font-base-size', `${currentFontSize}px`);
  
  // Increase font size
  increaseFontBtn.addEventListener('click', function() {
    if (currentFontSize < 24) {
      currentFontSize = parseInt(currentFontSize) + 2;
      document.documentElement.style.setProperty('--font-base-size', `${currentFontSize}px`);
      localStorage.setItem('fontSize', currentFontSize);
    }
  });
  
  // Decrease font size
  decreaseFontBtn.addEventListener('click', function() {
    if (currentFontSize > 14) {
      currentFontSize = parseInt(currentFontSize) - 2;
      document.documentElement.style.setProperty('--font-base-size', `${currentFontSize}px`);
      localStorage.setItem('fontSize', currentFontSize);
    }
  });
});