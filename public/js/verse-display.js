// Enhanced verse display functionality
class VerseDisplay {
    constructor() {
        this.container = document.querySelector('.word-by-word-container');
        this.arabicText = document.getElementById('practice-text');
        this.wordDetails = document.querySelector('.word-details');
        this.transliteration = document.querySelector('.transliteration');
        this.wordTranslation = document.querySelector('.word-translation');
        this.fullTranslation = document.querySelector('.full-translation');
        this.currentVerse = null;
        this.currentSpeed = 1;
        this.isWordView = false;
        this.isTajweedHighlighted = false;

        this.initializeControls();
    }

    initializeControls() {
        // Toggle word view
        document.querySelector('.toggle-word-view')?.addEventListener('click', () => {
            this.isWordView = !this.isWordView;
            this.updateDisplay();
        });

        // Toggle Tajweed highlighting
        document.querySelector('.toggle-tajweed')?.addEventListener('click', () => {
            this.isTajweedHighlighted = !this.isTajweedHighlighted;
            this.updateTajweedHighlighting();
        });

        // Playback speed control
        document.querySelector('.playback-speed')?.addEventListener('click', () => {
            this.cyclePlaybackSpeed();
        });

        // Word click handlers
        this.container?.addEventListener('click', (e) => {
            if (e.target.classList.contains('arabic-word')) {
                this.showWordDetails(e.target.dataset.wordIndex);
            }
        });
    }

    async loadVerse(surahId, verseNumber) {
        try {
            // In a real implementation, this would fetch from an API
            const verseData = {
                arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                words: [
                    {
                        arabic: 'بِسْمِ',
                        transliteration: 'bismi',
                        translation: 'In the name',
                        tajweedRules: ['iqlab'],
                        grammar: 'Preposition',
                        root: 'س م و'
                    },
                    {
                        arabic: 'اللَّهِ',
                        transliteration: 'Allah',
                        translation: 'of Allah',
                        tajweedRules: ['madd'],
                        grammar: 'Proper noun',
                        root: 'ا ل ه'
                    },
                    // Add more words...
                ],
                translation: 'In the name of Allah, the Most Gracious, the Most Merciful'
            };

            this.currentVerse = verseData;
            this.updateDisplay();
            return true;
        } catch (error) {
            console.error('Error loading verse:', error);
            return false;
        }
    }

    updateDisplay() {
        if (!this.currentVerse) return;

        if (this.isWordView) {
            this.displayWordByWord();
        } else {
            this.displayFullVerse();
        }

        this.updateTajweedHighlighting();
    }

    displayWordByWord() {
        if (!this.arabicText) return;
        this.arabicText.innerHTML = this.currentVerse.words
            .map((word, index) => `
                <span class="arabic-word" data-word-index="${index}">
                    ${word.arabic}
                    <div class="word-details">
                        <div class="word-info">
                            <div class="word-info-item">
                                <div class="label">Transliteration</div>
                                <div>${word.transliteration}</div>
                            </div>
                            <div class="word-info-item">
                                <div class="label">Translation</div>
                                <div>${word.translation}</div>
                            </div>
                            <div class="word-info-item">
                                <div class="label">Grammar</div>
                                <div>${word.grammar}</div>
                            </div>
                            <div class="word-info-item">
                                <div class="label">Root</div>
                                <div>${word.root}</div>
                            </div>
                        </div>
                    </div>
                </span>
            `).join('');
    }

    displayFullVerse() {
        if (!this.arabicText || !this.fullTranslation) return;
        this.arabicText.textContent = this.currentVerse.arabic;
        this.fullTranslation.textContent = this.currentVerse.translation;
    }

    updateTajweedHighlighting() {
        if (!this.container) return;
        
        if (!this.isTajweedHighlighted) {
            this.container.querySelectorAll('.arabic-word').forEach(word => {
                word.classList.remove(...Array.from(word.classList)
                    .filter(c => c.startsWith('tajweed-')));
            });
            return;
        }

        this.currentVerse.words.forEach((word, index) => {
            const wordElement = this.container.querySelector(`[data-word-index="${index}"]`);
            if (wordElement && word.tajweedRules) {
                word.tajweedRules.forEach(rule => {
                    wordElement.classList.add(`tajweed-${rule}`);
                });
            }
        });
    }

    showWordDetails(index) {
        if (!this.currentVerse?.words || !this.wordDetails) return;
        
        const word = this.currentVerse.words[index];
        
        // Highlight the clicked word
        this.container.querySelectorAll('.arabic-word').forEach(w => 
            w.classList.remove('word-focus'));
        this.container.querySelector(`[data-word-index="${index}"]`)
            ?.classList.add('word-focus');

        // Update translations
        if (this.wordTranslation && this.transliteration) {
            this.wordTranslation.textContent = word.translation;
            this.transliteration.textContent = word.transliteration;
        }
    }

    cyclePlaybackSpeed() {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(this.currentSpeed);
        this.currentSpeed = speeds[(currentIndex + 1) % speeds.length];
        
        const speedButton = document.querySelector('.playback-speed .speed-value');
        if (speedButton) {
            speedButton.textContent = `${this.currentSpeed}x`;
        }
    }
}

// Export for use in other files
window.VerseDisplay = VerseDisplay;
