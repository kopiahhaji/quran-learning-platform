document.addEventListener('DOMContentLoaded', () => {
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');

    // Font size control
    fontSizeSelect.addEventListener('change', (e) => {
        const size = e.target.value;
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        
        document.documentElement.style.fontSize = sizes[size];
        localStorage.setItem('preferred-font-size', size);
    });

    // Theme control
    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);
    });

    // Language control
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        const currentPath = window.location.pathname;
        window.location.href = `/${lang}${currentPath}`;
    });

    // Load saved preferences
    function loadPreferences() {
        // Load font size preference
        const savedFontSize = localStorage.getItem('preferred-font-size');
        if (savedFontSize) {
            fontSizeSelect.value = savedFontSize;
            const sizes = {
                small: '14px',
                medium: '16px',
                large: '18px'
            };
            document.documentElement.style.fontSize = sizes[savedFontSize];
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme) {
            themeSelect.value = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        // Load language preference
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage) {
            languageSelect.value = savedLanguage;
        }
    }

    loadPreferences();
});
