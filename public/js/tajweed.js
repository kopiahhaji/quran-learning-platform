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
                    // ... more words
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
        const details = this.wordDetails;
        
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

// Initialize all functionality when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    let completedSections = JSON.parse(localStorage.getItem('tajwidProgress') || '[]');
    updateProgress();

    // Handle expandable sections
    document.querySelectorAll('.expandable').forEach(section => {
        section.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // Madd visualization
    const maddControls = document.querySelectorAll('.count-btn');
    const maddWave = document.querySelector('.madd-wave');
    const durationMarker = document.querySelector('.duration-marker');

    maddControls.forEach(btn => {
        btn.addEventListener('click', function() {
            const counts = this.dataset.counts;
            maddWave.style.width = `${counts * 25}%`;
            durationMarker.textContent = `${counts} counts`;
            maddControls.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Audio playback
    document.querySelectorAll('.play-audio').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent expandable section from toggling
            const audioId = this.dataset.audio;
            playAudio(audioId);
        });
    });

    // Practice area functionality
    const verseDisplay = document.querySelector('.verse-display');
    const ruleIdentifier = document.querySelector('.rule-identifier');
    let currentVerseIndex = 0;

    if (verseDisplay) {
        const verses = [
            {
                arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
                rules: ['izhar', 'ghunnah', 'idgham']
            },
            {
                arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                translation: 'All praise is due to Allah, Lord of the worlds',
                rules: ['qalqalah', 'madd', 'idgham']
            }
            // Add more verses here
        ];

        function updateVerse() {
            const verse = verses[currentVerseIndex];
            verseDisplay.querySelector('.arabic-text').textContent = verse.arabic;
            verseDisplay.querySelector('.translation').textContent = verse.translation;
        }

        document.querySelector('.prev-verse')?.addEventListener('click', () => {
            if (currentVerseIndex > 0) {
                currentVerseIndex--;
                updateVerse();
            }
        });

        document.querySelector('.next-verse')?.addEventListener('click', () => {
            if (currentVerseIndex < verses.length - 1) {
                currentVerseIndex++;
                updateVerse();
            }
        });

        // Click handling for rule identification
        verseDisplay.querySelector('.arabic-text').addEventListener('click', function(e) {
            const word = window.getSelection().toString();
            if (word) {
                identifyRule(word);
            }
        });
    }

    // Practice buttons functionality
    document.querySelectorAll('.practice-button button').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.tajwid-section');
            startPractice(section.dataset.section);
        });
    });

    // Real-Time Practice Studio Functionality
    function initializePracticeStudio() {
        const practiceStudio = document.querySelector('.practice-studio');
        if (!practiceStudio) return;

        // Mode switching
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePracticeMode(btn.dataset.mode);
            });
        });

        // Verse loading
        const surahSelect = document.getElementById('surah-select');
        const loadVerseBtn = document.querySelector('.load-verse');
        
        loadVerseBtn?.addEventListener('click', () => {
            const surahId = surahSelect.value;
            loadVerse(surahId);
        });

        // Tool buttons functionality
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                handleToolAction(btn.dataset.tool);
            });
        });

        // Practice controls
        const startBtn = document.getElementById('start-practice');
        const stopBtn = document.getElementById('stop-practice');
        const replayBtn = document.getElementById('replay');

        startBtn?.addEventListener('click', startPracticeSession);
        stopBtn?.addEventListener('click', stopPracticeSession);
        replayBtn?.addEventListener('click', replayLastRecitation);
    }

    function updatePracticeMode(mode) {
        const workspace = document.querySelector('.practice-workspace');
        workspace.dataset.mode = mode;
        
        // Update UI based on mode
        const feedbackPanel = document.querySelector('.feedback-panel');
        switch (mode) {
            case 'pronunciation':
                feedbackPanel.innerHTML = `
                    <h4>Pronunciation Feedback</h4>
                    <div class="feedback-content">
                        <div class="pronunciation-guide"></div>
                    </div>
                `;
                break;
            case 'rules':
                feedbackPanel.innerHTML = `
                    <h4>Rule Recognition</h4>
                    <div class="feedback-content">
                        <div class="rules-found"></div>
                    </div>
                `;
                break;
            case 'recitation':
                feedbackPanel.innerHTML = `
                    <h4>Recitation Feedback</h4>
                    <div class="feedback-content">
                        <div class="recitation-analysis"></div>
                    </div>
                `;
                break;
        }
    }

    async function loadVerse(surahId) {
        // This would typically fetch from an API
        const verses = {
            1: {
                arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                transliteration: 'Bismillāhi r-raḥmāni r-raḥīm'
            },
            112: {
                arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
                transliteration: 'Qul huwa llāhu aḥad'
            }
        };

        const verse = verses[surahId] || verses[1];
        document.getElementById('practice-text').textContent = verse.arabic;
        document.querySelector('.transliteration').textContent = verse.transliteration;
    }

    function handleToolAction(tool) {
        switch (tool) {
            case 'highlight':
                highlightRules();
                break;
            case 'slow':
                playSlowRecitation();
                break;
            case 'record':
                toggleRecording();
                break;
        }
    }

    function highlightRules() {
        const text = document.getElementById('practice-text');
        // Implementation for rule highlighting
        console.log('Highlighting rules...');
    }

    function playSlowRecitation() {
        // Implementation for slow recitation playback
        console.log('Playing slow recitation...');
    }

    let isRecording = false;
    function toggleRecording() {
        isRecording = !isRecording;
        const recordBtn = document.querySelector('[data-tool="record"]');
        recordBtn.textContent = isRecording ? 'Stop Recording' : 'Record';
        // Implementation for recording functionality
    }

    function startPracticeSession() {
        console.log('Starting practice session...');
        // Implementation for starting practice
    }

    function stopPracticeSession() {
        console.log('Stopping practice session...');
        // Implementation for stopping practice
    }

    function replayLastRecitation() {
        console.log('Replaying last recitation...');
        // Implementation for replay functionality
    }

    // Pronunciation Guide Functionality
    function initializePronunciationGuide() {
        const letterCards = document.querySelectorAll('.letter-card');
        letterCards.forEach(card => {
            card.addEventListener('click', () => {
                showLetterDetails(card.dataset.letter);
            });
        });
    }

    function showLetterDetails(letter) {
        // Implementation for showing detailed letter information
        console.log(`Showing details for letter: ${letter}`);
    }

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
                        // ... more words
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
            this.arabicText.textContent = this.currentVerse.arabic;
            this.fullTranslation.textContent = this.currentVerse.translation;
        }

        updateTajweedHighlighting() {
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
            const word = this.currentVerse.words[index];
            const details = this.wordDetails;
            
            // Highlight the clicked word
            this.container.querySelectorAll('.arabic-word').forEach(w => 
                w.classList.remove('word-focus'));
            this.container.querySelector(`[data-word-index="${index}"]`)
                .classList.add('word-focus');

            // Update translations
            this.wordTranslation.textContent = word.translation;
            this.transliteration.textContent = word.transliteration;
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

    // Initialize all new functionality
    initializePracticeStudio();
    initializePronunciationGuide();

    const verseDisplay = new VerseDisplay();
    
    // Load initial verse
    const surahSelect = document.getElementById('surah-select');
    document.querySelector('.load-verse')?.addEventListener('click', () => {
        verseDisplay.loadVerse(surahSelect.value, 1);
    });
});