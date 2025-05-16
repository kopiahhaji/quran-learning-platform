// AMOLED theme visual effects
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Handle glow effect on mouse move
    menuItems.forEach(item => {
        const glowEffect = item.querySelector('.glow-effect');
        if (!glowEffect) return;

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            glowEffect.style.left = `${x - 75}px`;
            glowEffect.style.top = `${y - 75}px`;
            glowEffect.style.opacity = '0.8';
        });

        item.addEventListener('mouseleave', () => {
            glowEffect.style.opacity = '0.5';
        });
    });

    // Create floating background particles
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'background-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 3}px;
            height: ${Math.random() * 3}px;
            background: rgba(0, 184, 148, ${Math.random() * 0.3});
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            pointer-events: none;
            border-radius: 50%;
            z-index: -1;
            animation: floatParticle ${10 + Math.random() * 20}s linear infinite;
        `;
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 30000);
    };

    // Add floating particle animation
    const addParticleAnimation = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                20% {
                    opacity: 1;
                }
                80% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Initialize particle system
    addParticleAnimation();
    setInterval(createParticle, 2000);

    // Add subtle parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        document.querySelector('.background-glow').style.transform = 
            `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
    });
});
