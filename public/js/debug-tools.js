// Debug Tools for Quran Learning Platform
class DebugTools {
    constructor() {
        this.debugMode = false;
        this.debugAnimations = false;
        this.debugLayout = false;
        this.performanceMode = false;
        this.init();
    }

    init() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + D: Toggle Debug Mode
            if (e.altKey && e.key === 'd') {
                this.toggleDebugMode();
            }
            // Alt + A: Toggle Animation Debug
            if (e.altKey && e.key === 'a') {
                this.toggleAnimationDebug();
            }
            // Alt + L: Toggle Layout Debug
            if (e.altKey && e.key === 'l') {
                this.toggleLayoutDebug();
            }
            // Alt + P: Toggle Performance Mode
            if (e.altKey && e.key === 'p') {
                this.togglePerformanceMode();
            }
        });

        // Create debug panel
        this.createDebugPanel();
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-panel-header">
                <h3>Debug Tools</h3>
                <button class="debug-panel-toggle">_</button>
            </div>
            <div class="debug-panel-content">
                <label>
                    <input type="checkbox" id="debug-mode-toggle"> Debug Mode
                </label>
                <label>
                    <input type="checkbox" id="debug-animations-toggle"> Animation Debug
                </label>
                <label>
                    <input type="checkbox" id="debug-layout-toggle"> Layout Grid
                </label>
                <label>
                    <input type="checkbox" id="performance-mode-toggle"> Performance Mode
                </label>
                <div class="performance-metrics">
                    <p>FPS: <span id="fps-counter">0</span></p>
                    <p>Layout shifts: <span id="layout-shifts">0</span></p>
                </div>
            </div>
        `;

        // Add styles for the debug panel
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 8px;
                padding: 15px;
                font-family: monospace;
                z-index: 9999;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease;
            }
            .debug-panel.minimized {
                transform: translateY(calc(100% - 40px));
            }
            .debug-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .debug-panel-header h3 {
                margin: 0;
                font-size: 14px;
            }
            .debug-panel label {
                display: block;
                margin: 8px 0;
            }
            .performance-metrics {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            .performance-metrics p {
                margin: 5px 0;
                font-size: 12px;
            }
            .debug-panel-toggle {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(panel);

        // Initialize controls
        this.initializeControls();
        this.initializePerformanceMetrics();
    }

    initializeControls() {
        // Debug Mode Toggle
        const debugModeToggle = document.getElementById('debug-mode-toggle');
        debugModeToggle.addEventListener('change', () => this.toggleDebugMode());

        // Animation Debug Toggle
        const debugAnimationsToggle = document.getElementById('debug-animations-toggle');
        debugAnimationsToggle.addEventListener('change', () => this.toggleAnimationDebug());

        // Layout Debug Toggle
        const debugLayoutToggle = document.getElementById('debug-layout-toggle');
        debugLayoutToggle.addEventListener('change', () => this.toggleLayoutDebug());

        // Performance Mode Toggle
        const performanceModeToggle = document.getElementById('performance-mode-toggle');
        performanceModeToggle.addEventListener('change', () => this.togglePerformanceMode());

        // Panel Toggle
        const panelToggle = document.querySelector('.debug-panel-toggle');
        panelToggle.addEventListener('click', () => {
            const panel = document.querySelector('.debug-panel');
            panel.classList.toggle('minimized');
            panelToggle.textContent = panel.classList.contains('minimized') ? '□' : '_';
        });
    }

    initializePerformanceMetrics() {
        let frameCount = 0;
        let lastTime = performance.now();
        const fpsCounter = document.getElementById('fps-counter');
        const layoutShiftsCounter = document.getElementById('layout-shifts');
        let layoutShifts = 0;

        // FPS Counter
        const updateFPS = () => {
            const now = performance.now();
            const delta = now - lastTime;
            frameCount++;

            if (delta >= 1000) {
                const fps = Math.round((frameCount * 1000) / delta);
                fpsCounter.textContent = fps;
                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(updateFPS);
        };
        
        // Layout Shifts Observer
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    layoutShifts++;
                    layoutShiftsCounter.textContent = layoutShifts;
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        }

        updateFPS();
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        document.body.classList.toggle('debug-mode');
        document.getElementById('debug-mode-toggle').checked = this.debugMode;
    }

    toggleAnimationDebug() {
        this.debugAnimations = !this.debugAnimations;
        document.body.classList.toggle('debug-animations');
        document.getElementById('debug-animations-toggle').checked = this.debugAnimations;
    }

    toggleLayoutDebug() {
        this.debugLayout = !this.debugLayout;
        document.body.classList.toggle('debug-layout');
        document.getElementById('debug-layout-toggle').checked = this.debugLayout;
    }

    togglePerformanceMode() {
        this.performanceMode = !this.performanceMode;
        if (this.performanceMode) {
            // Disable non-essential animations
            document.body.classList.add('performance-mode');
            // Reduce particle effects
            document.documentElement.style.setProperty('--particle-count', '50%');
        } else {
            document.body.classList.remove('performance-mode');
            document.documentElement.style.removeProperty('--particle-count');
        }
        document.getElementById('performance-mode-toggle').checked = this.performanceMode;
    }
}

// Initialize debug tools when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.debugTools = new DebugTools();
});
