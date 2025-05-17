document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('quranSearch');
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    const recentSearchesContainer = document.getElementById('recentSearches');
    const recentSearchItems = document.querySelector('.recent-search-items');
    const clearHistoryButton = document.querySelector('.clear-history');
    const voiceSearchButton = document.getElementById('voiceSearch');
    const clearSearchButton = document.getElementById('clearSearch');
    const searchLoading = document.querySelector('.search-loading');

    let currentSuggestions = [];
    let selectedSuggestionIndex = -1;
    let isVoiceSearching = false;

    // Load recent searches from localStorage
    const RECENT_SEARCHES_KEY = 'quran_recent_searches';
    const MAX_RECENT_SEARCHES = 5;

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to load recent searches
    function loadRecentSearches() {
        const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
        if (searches.length > 0) {
            recentSearchesContainer.classList.add('active');
            renderRecentSearches(searches);
        }
    }

    // Function to save recent search
    function saveRecentSearch(query, type) {
        const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
        const newSearch = { query, type, timestamp: Date.now() };
        
        // Remove duplicate if exists
        const filteredSearches = searches.filter(s => s.query !== query);
        
        // Add new search to beginning
        filteredSearches.unshift(newSearch);
        
        // Keep only MAX_RECENT_SEARCHES items
        while (filteredSearches.length > MAX_RECENT_SEARCHES) {
            filteredSearches.pop();
        }
        
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filteredSearches));
        renderRecentSearches(filteredSearches);
    }

    // Function to render recent searches
    function renderRecentSearches(searches) {
        if (searches.length === 0) {
            recentSearchesContainer.classList.remove('active');
            return;
        }

        recentSearchesContainer.classList.add('active');
        recentSearchItems.innerHTML = searches.map(search => `
            <div class="recent-search-item" data-query="${search.query}" data-type="${search.type}">
                <span class="recent-search-text">${search.query}</span>
                <span class="recent-search-remove" role="button" aria-label="Remove from recent searches">×</span>
            </div>
        `).join('');
    }

    // Show/hide loading indicator
    function setLoading(isLoading) {
        searchLoading.classList.toggle('active', isLoading);
    }

    // Function to fetch search suggestions
    async function fetchSuggestions(query, type) {
        setLoading(true);
        try {
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&type=${type}`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }

    // Voice search implementation
    function setupVoiceSearch() {
        if (!('webkitSpeechRecognition' in window)) {
            voiceSearchButton.style.display = 'none';
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA'; // Set to Arabic by default

        recognition.onstart = () => {
            isVoiceSearching = true;
            voiceSearchButton.classList.add('recording');
        };

        recognition.onend = () => {
            isVoiceSearching = false;
            voiceSearchButton.classList.remove('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            handleInputChange();
        };

        voiceSearchButton.addEventListener('click', () => {
            if (isVoiceSearching) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    }

    // Clear search functionality
    function updateClearButton() {
        clearSearchButton.style.display = searchInput.value ? 'flex' : 'none';
    }

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        suggestionsContainer.classList.remove('active');
        updateClearButton();
        searchInput.focus();
    });

    // Enhanced suggestion rendering
    function renderSuggestions(suggestions) {
        if (!suggestions.length) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        const html = suggestions.map((suggestion, index) => `
            <div class="suggestion-item" 
                data-index="${index}" 
                role="option" 
                tabindex="0"
                aria-selected="${index === selectedSuggestionIndex}"
            >
                <span class="suggestion-number">${suggestion.number}</span>
                <div class="suggestion-text">
                    <div class="arabic" dir="rtl">${suggestion.arabic}</div>
                    <div class="translation">${suggestion.translation}</div>
                </div>
            </div>
        `).join('');

        suggestionsContainer.innerHTML = html;
        suggestionsContainer.classList.add('active');
    }

    // Handle input changes with enhanced feedback
    const handleInputChange = debounce(async () => {
        const query = searchInput.value.trim();
        const type = document.querySelector('input[name="type"]:checked').value;
        updateClearButton();

        if (query.length < 2) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        currentSuggestions = await fetchSuggestions(query, type);
        renderSuggestions(currentSuggestions);
    }, 300);

    // Handle keyboard navigation
    function handleKeyboard(event) {
        if (!suggestionsContainer.classList.contains('active')) return;

        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSelection(suggestions);
                break;

            case 'ArrowUp':
                event.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSelection(suggestions);
                break;

            case 'Enter':
                if (selectedSuggestionIndex >= 0) {
                    event.preventDefault();
                    const selected = currentSuggestions[selectedSuggestionIndex];
                    if (selected) handleSuggestionSelect(selected);
                }
                break;

            case 'Escape':
                suggestionsContainer.classList.remove('active');
                selectedSuggestionIndex = -1;
                break;
        }
    }

    // Update visual selection
    function updateSelection(suggestions) {
        suggestions.forEach((el, index) => {
            el.classList.toggle('selected', index === selectedSuggestionIndex);
            if (index === selectedSuggestionIndex) {
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    // Handle suggestion selection
    function handleSuggestionSelect(suggestion) {
        const type = document.querySelector('input[name="type"]:checked').value;
        window.location.href = `/quran/${type}/${suggestion.id}`;
    }

    // Event Listeners
    searchInput.addEventListener('input', handleInputChange);
    searchInput.addEventListener('keydown', handleKeyboard);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            suggestionsContainer.classList.add('active');
        }
    });

    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (searchInput.value.trim().length >= 2) {
                handleInputChange();
            }
        });
    });

    // Recent searches event delegation
    recentSearchItems.addEventListener('click', (event) => {
        const item = event.target.closest('.recent-search-item');
        const removeButton = event.target.closest('.recent-search-remove');
        
        if (removeButton) {
            event.stopPropagation();
            const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
            const newSearches = searches.filter(s => s.query !== item.dataset.query);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
            renderRecentSearches(newSearches);
        } else if (item) {
            searchInput.value = item.dataset.query;
            document.querySelector(`input[name="type"][value="${item.dataset.type}"]`).checked = true;
            handleInputChange();
        }
    });

    clearHistoryButton.addEventListener('click', () => {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        renderRecentSearches([]);
    });

    // Initialize features
    loadRecentSearches();
    setupVoiceSearch();
    updateClearButton();

    // Handle form submission with recent searches
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        const type = document.querySelector('input[name="type"]:checked').value;
        
        if (query) {
            saveRecentSearch(query, type);
            window.location.href = `/search?q=${encodeURIComponent(query)}&type=${type}`;
        }
    });
});
