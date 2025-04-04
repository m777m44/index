/**
 * Matrix-style animated background with blood color theme
 * This script creates a canvas-based Matrix-style animation with customized blood-red color scheme
 */

class MatrixBackground {
    constructor(options = {}) {
        // Default options
        this.options = {
            fontSize: options.fontSize || 14,
            color: options.color || '#8B0000', // Dark blood red
            glowColor: options.glowColor || '#FF0000', // Bright blood red for glow effect
            backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.9)',
            speed: options.speed || 1.5,
            density: options.density || 0.8,
            glitchRate: options.glitchRate || 0.05,
            characters: options.characters || '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
            canvasId: options.canvasId || 'matrixCanvas',
            zIndex: options.zIndex || -1,
            pulseEffect: options.pulseEffect !== undefined ? options.pulseEffect : true,
            bloodDrops: options.bloodDrops !== undefined ? options.bloodDrops : true,
            bloodDropRate: options.bloodDropRate || 0.01
        };

        this.columns = [];
        this.initialized = false;
        this.animationFrameId = null;
        this.bloodDrops = [];
    }

    init() {
        if (this.initialized) return;

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = this.options.canvasId;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = this.options.zIndex;
        this.canvas.style.pointerEvents = 'none'; // Allow clicking through the canvas
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Initialize columns
        this.initColumns();

        // Add resize event listener
        window.addEventListener('resize', () => this.resizeCanvas());

        this.initialized = true;
        this.lastTime = performance.now();
        this.pulsePhase = 0;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initColumns();
    }

    initColumns() {
        this.columns = [];
        const columnCount = Math.floor(this.canvas.width / this.options.fontSize);
        
        for (let i = 0; i < columnCount; i++) {
            this.columns.push({
                x: i * this.options.fontSize,
                y: Math.random() * -1000, // Start above the screen at random positions
                speed: (Math.random() * 0.5 + 0.5) * this.options.speed,
                chars: [],
                lastUpdate: 0,
                updateInterval: Math.random() * 50 + 30
            });
        }
    }

    createBloodDrop() {
        if (Math.random() > this.options.bloodDropRate) return;
        
        this.bloodDrops.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    updateBloodDrops(deltaTime) {
        for (let i = this.bloodDrops.length - 1; i >= 0; i--) {
            const drop = this.bloodDrops[i];
            drop.y += drop.speed * deltaTime * 0.05;
            
            // Remove drops that have fallen off the screen
            if (drop.y > this.canvas.height) {
                this.bloodDrops.splice(i, 1);
            }
        }
    }

    drawBloodDrops() {
        this.ctx.save();
        
        for (const drop of this.bloodDrops) {
            const gradient = this.ctx.createRadialGradient(
                drop.x, drop.y, 0,
                drop.x, drop.y, drop.size
            );
            
            gradient.addColorStop(0, `rgba(255, 0, 0, ${drop.opacity})`);
            gradient.addColorStop(1, 'rgba(128, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    draw(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas with semi-transparent background for trail effect
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update pulse effect
        if (this.options.pulseEffect) {
            this.pulsePhase += deltaTime * 0.001;
            if (this.pulsePhase > Math.PI * 2) {
                this.pulsePhase -= Math.PI * 2;
            }
        }

        // Create blood drops
        if (this.options.bloodDrops) {
            this.createBloodDrop();
            this.updateBloodDrops(deltaTime);
            this.drawBloodDrops();
        }

        // Set font
        this.ctx.font = `${this.options.fontSize}px monospace`;
        
        // Draw each column
        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i];
            
            // Update column position
            column.y += column.speed * deltaTime * 0.05;
            
            // Reset column if it's gone too far down
            if (column.y > this.canvas.height + 500) {
                column.y = Math.random() * -1000;
                column.speed = (Math.random() * 0.5 + 0.5) * this.options.speed;
            }
            
            // Determine how many characters to draw in this column
            const charCount = Math.floor((this.canvas.height - column.y) / this.options.fontSize) + 1;
            
            // Ensure the chars array has enough characters
            while (column.chars.length < charCount) {
                column.chars.push(this.getRandomChar());
            }
            
            // Update characters occasionally
            if (timestamp - column.lastUpdate > column.updateInterval) {
                // Randomly change some characters
                for (let j = 0; j < column.chars.length; j++) {
                    if (Math.random() < this.options.glitchRate) {
                        column.chars[j] = this.getRandomChar();
                    }
                }
                column.lastUpdate = timestamp;
            }
            
            // Draw characters in the column
            for (let j = 0; j < charCount && j < column.chars.length; j++) {
                const y = column.y + j * this.options.fontSize;
                
                // Skip if character is above the screen
                if (y < 0) continue;
                
                // Calculate opacity based on position (fade out towards the bottom)
                const normalizedPos = j / charCount;
                let opacity = 1 - normalizedPos;
                
                // Add pulse effect
                if (this.options.pulseEffect) {
                    const pulse = (Math.sin(this.pulsePhase + i * 0.1) + 1) * 0.2;
                    opacity = Math.min(1, opacity + pulse);
                }
                
                // First character is brightest (head of the column)
                if (j === 0) {
                    this.ctx.fillStyle = this.options.glowColor;
                    this.ctx.shadowColor = this.options.glowColor;
                    this.ctx.shadowBlur = 10;
                } else {
                    this.ctx.fillStyle = `rgba(139, 0, 0, ${opacity})`;
                    this.ctx.shadowBlur = 0;
                }
                
                this.ctx.fillText(column.chars[j], column.x, y);
            }
        }
        
        this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
    }

    getRandomChar() {
        return this.options.characters.charAt(Math.floor(Math.random() * this.options.characters.length));
    }

    start() {
        if (!this.initialized) {
            this.init();
        }
        
        if (!this.animationFrameId) {
            this.lastTime = performance.now();
            this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.initialized = false;
    }
}
