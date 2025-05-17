// Theme switcher functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Function to set theme
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update button icons visibility
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.style.display = 'none';
        });
        document.querySelector(`.theme-icon.${theme === 'dark' ? 'light' : 'dark'}`).style.display = 'inline';
        
        // If we're switching to dark theme, initialize AMOLED effects
        if (theme === 'dark' && window.initAmoledEffects) {
            window.initAmoledEffects();
        }
    }
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for theme toggle button clicks
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) { // Only if user hasn't manually set a theme
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
});