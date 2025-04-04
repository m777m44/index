/**
 * Visual Effects and UI Enhancements
 * Provides advanced visual effects for the GitHub explorer
 */

class VisualEffectsManager {
    constructor() {
        this.effects = {};
        this.animations = {};
        this.particleSystem = null;
        this.glitchInterval = null;
    }

    /**
     * Initialize visual effects
     */
    init() {
        this.setupParticleSystem();
        this.setupGlitchEffects();
        this.setupHoverEffects();
        this.setupScrollEffects();
        this.setupTypingEffect();
        this.setupPulseEffects();
        
        console.log('Visual Effects Manager initialized');
    }

    /**
     * Setup particle system for blood-like particles
     */
    setupParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = Math.random() * 0.5 + 0.2;
                this.color = `rgba(${Math.floor(Math.random() * 100) + 155}, 0, 0, ${Math.random() * 0.5 + 0.3})`;
                this.life = Math.random() * 100 + 50;
                this.fullLife = this.life;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;

                // Fade out as life decreases
                const opacity = (this.life / this.fullLife) * 0.8;
                this.color = this.color.replace(/[\d\.]+\)$/g, `${opacity})`);

                if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (const particle of particles) {
                particle.update();
                particle.draw();
            }
            
            requestAnimationFrame(animate);
        };

        animate();
        
        // Store reference
        this.particleSystem = {
            canvas,
            ctx,
            particles
        };
    }

    /**
     * Setup glitch effects for elements
     */
    setupGlitchEffects() {
        // Add glitch effect CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glitch {
                0% {
                    transform: translate(0);
                }
                20% {
                    transform: translate(-2px, 2px);
                }
                40% {
                    transform: translate(-2px, -2px);
                }
                60% {
                    transform: translate(2px, 2px);
                }
                80% {
                    transform: translate(2px, -2px);
                }
                100% {
                    transform: translate(0);
                }
            }
            
            .glitch-text {
                position: relative;
                animation: glitch 500ms infinite;
                animation-timing-function: steps(2, end);
                animation-play-state: paused;
            }
            
            .glitch-text:hover {
                animation-play-state: running;
            }
            
            .glitch-text::before,
            .glitch-text::after {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.8;
            }
            
            .glitch-text::before {
                color: #ff0000;
                z-index: -1;
                animation: glitch 300ms infinite;
                animation-timing-function: steps(2, end);
                animation-play-state: paused;
                clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
                transform: translate(-2px, -2px);
            }
            
            .glitch-text:hover::before {
                animation-play-state: running;
            }
            
            .glitch-text::after {
                color: #00ffff;
                z-index: -2;
                animation: glitch 300ms infinite;
                animation-timing-function: steps(2, end);
                animation-play-state: paused;
                clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
                transform: translate(2px, 2px);
            }
            
            .glitch-text:hover::after {
                animation-play-state: running;
            }
            
            .glitch-box {
                position: relative;
                overflow: hidden;
            }
            
            .glitch-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(to right, transparent, rgba(255, 0, 0, 0.2), transparent);
                transform: skewX(-25deg);
                animation: glitch-sweep 3s infinite;
                animation-play-state: paused;
            }
            
            .glitch-box:hover::before {
                animation-play-state: running;
            }
            
            @keyframes glitch-sweep {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            
            .crt-effect {
                position: relative;
                overflow: hidden;
            }
            
            .crt-effect::before {
                content: " ";
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
                background-size: 100% 4px;
                z-index: 2;
                pointer-events: none;
                opacity: 0.15;
            }
            
            .crt-effect::after {
                content: " ";
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: rgba(18, 16, 16, 0.1);
                opacity: 0;
                z-index: 2;
                pointer-events: none;
                animation: crt-flicker 0.15s infinite;
                animation-play-state: paused;
            }
            
            .crt-effect:hover::after {
                animation-play-state: running;
            }
            
            @keyframes crt-flicker {
                0% { opacity: 0.27861; }
                5% { opacity: 0.34769; }
                10% { opacity: 0.23604; }
                15% { opacity: 0.90626; }
                20% { opacity: 0.18128; }
                25% { opacity: 0.83891; }
                30% { opacity: 0.65583; }
                35% { opacity: 0.67807; }
                40% { opacity: 0.26559; }
                45% { opacity: 0.84693; }
                50% { opacity: 0.96019; }
                55% { opacity: 0.08594; }
                60% { opacity: 0.20313; }
                65% { opacity: 0.71988; }
                70% { opacity: 0.53455; }
                75% { opacity: 0.37288; }
                80% { opacity: 0.71428; }
                85% { opacity: 0.70419; }
                90% { opacity: 0.7003; }
                95% { opacity: 0.36108; }
                100% { opacity: 0.24387; }
            }
            
            .text-scramble {
                display: inline-block;
            }
            
            .blood-drip {
                position: relative;
            }
            
            .blood-drip::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 10px solid #8B0000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .blood-drip:hover::after {
                opacity: 1;
                animation: drip 2s infinite;
            }
            
            @keyframes drip {
                0% { transform: translateX(-50%) translateY(0); opacity: 1; }
                100% { transform: translateX(-50%) translateY(20px); opacity: 0; }
            }
            
            .neon-text {
                text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000;
                animation: neon-pulse 1.5s infinite alternate;
            }
            
            @keyframes neon-pulse {
                from { text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000; }
                to { text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000; }
            }
            
            .typing-cursor {
                display: inline-block;
                width: 3px;
                height: 1em;
                background-color: #ff0000;
                margin-left: 2px;
                animation: blink 1s infinite;
                vertical-align: middle;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            .pulse-effect {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .shake-effect {
                animation: shake 0.5s ease-in-out;
                animation-play-state: paused;
            }
            
            .shake-effect:hover {
                animation-play-state: running;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .reveal-effect {
                position: relative;
                overflow: hidden;
            }
            
            .reveal-effect::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #8B0000;
                transform: translateX(-100%);
                transition: transform 0.5s ease;
            }
            
            .reveal-effect.revealed::after {
                transform: translateX(0);
                animation: reveal 1s forwards;
            }
            
            @keyframes reveal {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        
        // Apply glitch text effect to headings
        document.querySelectorAll('h1, h2, h3').forEach(heading => {
            if (!heading.classList.contains('glitch') && !heading.classList.contains('glitch-text')) {
                heading.classList.add('glitch-text');
                heading.setAttribute('data-text', heading.textContent);
            }
        });
        
        // Apply CRT effect to containers
        document.querySelectorAll('.response, .modal-content, .trending-section').forEach(container => {
            container.classList.add('crt-effect');
        });
        
        // Apply blood drip effect to buttons
        document.querySelectorAll('button').forEach(button => {
            button.classList.add('blood-drip');
        });
        
        // Apply neon text effect to important elements
        document.querySelectorAll('.project h3, .trending-title, .stat-value').forEach(element => {
            element.classList.add('neon-text');
        });
        
        // Random glitch effect on page
        this.glitchInterval = setInterval(() => {
            if (Math.random() > 0.95) {
                const elements = document.querySelectorAll('.project, button, .trending-item');
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                
                if (randomElement) {
                    randomElement.style.transform = 'translate(-2px, 2px)';
                    setTimeout(() => {
                        randomElement.style.transform = 'translate(2px, -2px)';
                        setTimeout(() => {
                            randomElement.style.transform = '';
                        }, 100);
                    }, 100);
                }
            }
        }, 2000);
    }
    
    /**
     * Setup hover effects for elements
     */
    setupHoverEffects() {
        // Add hover effect to projects
        document.querySelectorAll('.project').forEach(project => {
            project.addEventListener('mouseover', () => {
                // Create blood particles on hover
                this.createBloodParticles(project);
            });
        });
        
        // Add hover effect to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseover', () => {
                button.classList.add('shake-effect');
            });
            
            button.addEventListener('mouseout', () => {
                button.classList.remove('shake-effect');
            });
        });
    }
    
    /**
     * Create blood particles at element position
     */
    createBloodParticles(element) {
        if (!this.particleSystem) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create 5 particles at element position
        for (let i = 0; i < 5; i++) {
            const particle = this.particleSystem.particles[Math.floor(Math.random() * this.particleSystem.particles.length)];
            particle.x = centerX + (Math.random() - 0.5) * rect.width;
            particle.y = centerY + (Math.random() - 0.5) * rect.height;
            particle.speedX = (Math.random() - 0.5) * 2;
            particle.speedY = (Math.random() - 0.5) * 2;
            particle.size = Math.random() * 5 + 2;
            particle.color = `rgba(${Math.floor(Math.random() * 50) + 200}, 0, 0, ${Math.random() * 0.5 + 0.5})`;
            particle.life = Math.random() * 50 + 30;
            particle.fullLife = particle.life;
        }
    }
    
    /**
     * Setup scroll effects
     */
    setupScrollEffects() {
        // Add reveal effect on scroll
        const revealOnScroll = () => {
            const elements = document.querySelectorAll('.project, .trending-item, .stat-box');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('reveal-effect');
                    element.classList.add('revealed');
                    
                    // Remove classes after animation completes
                    setTimeout(() => {
                        element.classList.remove('reveal-effect');
                        element.classList.remove('revealed');
                    }, 1000);
                }
            });
        };
        
        window.addEventListener('scroll', revealOnScroll);
        
        // Trigger once on load
        setTimeout(revealOnScroll, 500);
    }
    
    /**
     * Setup typing effect for elements
     */
    setupTypingEffect() {
        // Add typing effect to search placeholder
        const searchInput = document.getElementById('query');
        if (searchInput) {
            const originalPlaceholder = searchInput.placeholder;
            searchInput.placeholder = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < originalPlaceholder.length) {
                    searchInput.placeholder += originalPlaceholder.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Reset and repeat
                    setTimeout(() => {
                        searchInput.placeholder = '';
                        i = 0;
                        typeWriter();
                    }, 3000);
                }
            };
            
            typeWriter();
        }
        
        // Add typing cursor to headings
        document.querySelectorAll('h1, h2').forEach(heading => {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            heading.appendChild(cursor);
        });
    }
    
    /**
     * Setup pulse effects for elements
     */
    setupPulseEffects() {
        // Add pulse effect to important elements
        document.querySelectorAll('.trending-section, .stats-container').forEach(element => {
            element.classList.add('pulse-effect');
        });
    }
    
    /**
     * Text scramble effect
     */
    applyTextScrambleEffect(element, text) {
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        
        let frame = 0;
        const frameCount = 20;
        let currentText = '';
        
        const update = () => {
            let output = '';
            const progress = frame / frameCount;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                if (i < currentText.length) {
                    output += char;
                } else {
                    const randomChar = chars[Math.floor(Math.random() * chars.length)];
                    output += Math.random() < progress ? char : randomChar;
                }
            }
            
            element.textContent = output;
            
            if (frame < frameCount) {
                frame++;
                requestAnimationFrame(update);
            } else {
                element.textContent = text;
            }
        };
        
        update();
    }
    
    /**
     * Apply blood splatter effect
     */
    applyBloodSplatterEffect(x, y) {
        const splatter = document.createElement('div');
        splatter.className = 'blood-splatter';
        splatter.style.position = 'fixed';
        splatter.style.left = `${x}px`;
        splatter.style.top = `${y}px`;
        splatter.style.width = `${Math.random() * 50 + 20}px`;
        splatter.style.height = `${Math.random() * 50 + 20}px`;
        splatter.style.borderRadius = '50%';
        splatter.style.background = `radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(139,0,0,0.5) 70%, rgba(139,0,0,0) 100%)`;
        splatter.style.transform = `rotate(${Math.random() * 360}deg)`;
        splatter.style.pointerEvents = 'none';
        splatter.style.zIndex = '1000';
        
        document.body.appendChild(splatter);
        
        // Create drips
        for (let i = 0; i < Math.random() * 3 + 1; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip-effect';
            drip.style.position = 'fixed';
            drip.style.left = `${x + (Math.random() - 0.5) * 20}px`;
            drip.style.top = `${y}px`;
            drip.style.width = `${Math.random() * 5 + 2}px`;
            drip.style.height = `${Math.random() * 20 + 10}px`;
            drip.style.background = 'rgba(139,0,0,0.7)';
            drip.style.borderRadius = '0 0 50% 50%';
            drip.style.transform = 'translateY(0)';
            drip.style.animation = `drip ${Math.random() * 2 + 1}s forwards`;
            drip.style.pointerEvents = 'none';
            drip.style.zIndex = '1000';
            
            document.body.appendChild(drip);
            
            // Remove after animation
            setTimeout(() => {
                if (drip.parentNode) {
                    drip.parentNode.removeChild(drip);
                }
            }, 3000);
        }
        
        // Fade out and remove
        setTimeout(() => {
            splatter.style.opacity = '0';
            splatter.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                if (splatter.parentNode) {
                    splatter.parentNode.removeChild(splatter);
                }
            }, 1000);
        }, 2000);
    }
    
    /**
     * Apply glitch effect to element
     */
    applyGlitchEffect(element) {
        element.classList.add('glitch-text');
        element.setAttribute('data-text', element.textContent);
        
        setTimeout(() => {
            element.classList.remove('glitch-text');
        }, 2000);
    }
    
    /**
     * Cleanup effects
     */
    cleanup() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
        }
        
        if (this.particleSystem && this.particleSystem.canvas) {
            document.body.removeChild(this.particleSystem.canvas);
        }
    }
}
