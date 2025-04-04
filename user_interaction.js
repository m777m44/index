/**
 * Enhanced User Interaction Module
 * Provides advanced user interaction features for the GitHub explorer
 */

class UserInteractionManager {
    constructor() {
        this.keyboardShortcuts = {};
        this.voiceCommands = {};
        this.voiceRecognition = null;
        this.isVoiceEnabled = false;
        this.themeAnimations = {};
        this.notificationQueue = [];
        this.isNotifying = false;
    }

    /**
     * Initialize the interaction manager
     */
    init() {
        this.setupKeyboardShortcuts();
        this.setupThemeAnimations();
        this.setupNotificationSystem();
        
        // Initialize voice if supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceCommands();
        }
        
        console.log('User Interaction Manager initialized');
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Default shortcuts
        this.registerShortcut('/', () => {
            document.getElementById('query').focus();
            return true; // Prevent default
        }, 'Focus search box');
        
        this.registerShortcut('Escape', () => {
            const modal = document.getElementById('project-modal');
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
                return true;
            }
            return false;
        }, 'Close modal');
        
        this.registerShortcut('t', () => {
            document.querySelector('.toggle-theme').click();
            return true;
        }, 'Toggle theme');
        
        this.registerShortcut('l', () => {
            document.querySelector('.toggle-language').click();
            return true;
        }, 'Toggle language');
        
        this.registerShortcut('ArrowRight', () => {
            const nextBtn = document.getElementById('next-page');
            if (!nextBtn.disabled) {
                nextBtn.click();
                return true;
            }
            return false;
        }, 'Next page');
        
        this.registerShortcut('ArrowLeft', () => {
            const prevBtn = document.getElementById('prev-page');
            if (!prevBtn.disabled) {
                prevBtn.click();
                return true;
            }
            return false;
        }, 'Previous page');
        
        // Listen for keyboard events
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    e.target.blur();
                    e.preventDefault();
                }
                return;
            }
            
            const key = e.key;
            if (this.keyboardShortcuts[key]) {
                const prevented = this.keyboardShortcuts[key].action();
                if (prevented) {
                    e.preventDefault();
                }
            }
        });
        
        // Create help modal for keyboard shortcuts
        this.createShortcutsHelpModal();
    }
    
    /**
     * Register a keyboard shortcut
     */
    registerShortcut(key, action, description) {
        this.keyboardShortcuts[key] = {
            action,
            description
        };
    }
    
    /**
     * Create help modal for keyboard shortcuts
     */
    createShortcutsHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'shortcuts-modal';
        modal.className = 'modal';
        
        let shortcutsHtml = '<div class="modal-content"><span class="close">×</span>';
        shortcutsHtml += '<h2>لوحة المفاتيح المختصرة</h2><div class="shortcuts-list">';
        
        for (const key in this.keyboardShortcuts) {
            shortcutsHtml += `<div class="shortcut-item">
                <span class="shortcut-key">${key}</span>
                <span class="shortcut-description">${this.keyboardShortcuts[key].description}</span>
            </div>`;
        }
        
        shortcutsHtml += '</div></div>';
        modal.innerHTML = shortcutsHtml;
        
        document.body.appendChild(modal);
        
        // Register ? shortcut to show help
        this.registerShortcut('?', () => {
            modal.style.display = 'block';
            return true;
        }, 'Show keyboard shortcuts');
        
        // Close button functionality
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    /**
     * Setup voice commands if supported
     */
    setupVoiceCommands() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        this.voiceRecognition = new SpeechRecognition();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.lang = 'ar-SA'; // Default to Arabic
        
        // Register default commands
        this.registerVoiceCommand('بحث', (params) => {
            if (params && params.length > 0) {
                document.getElementById('query').value = params.join(' ');
                document.getElementById('search-button').click();
            }
        }, 'بحث [مصطلح البحث]');
        
        this.registerVoiceCommand('تبديل الوضع', () => {
            document.querySelector('.toggle-theme').click();
        }, 'تبديل الوضع');
        
        this.registerVoiceCommand('تبديل اللغة', () => {
            document.querySelector('.toggle-language').click();
        }, 'تبديل اللغة');
        
        this.registerVoiceCommand('الصفحة التالية', () => {
            const nextBtn = document.getElementById('next-page');
            if (!nextBtn.disabled) nextBtn.click();
        }, 'الصفحة التالية');
        
        this.registerVoiceCommand('الصفحة السابقة', () => {
            const prevBtn = document.getElementById('prev-page');
            if (!prevBtn.disabled) prevBtn.click();
        }, 'الصفحة السابقة');
        
        // Process voice input
        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            console.log('Voice command:', transcript);
            
            let commandExecuted = false;
            
            for (const command in this.voiceCommands) {
                if (transcript.startsWith(command.toLowerCase())) {
                    const params = transcript.substring(command.length).trim().split(' ').filter(p => p);
                    this.voiceCommands[command].action(params);
                    commandExecuted = true;
                    break;
                }
            }
            
            if (!commandExecuted) {
                this.showNotification('لم يتم التعرف على الأمر الصوتي', 'error');
            }
        };
        
        this.voiceRecognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.showNotification('خطأ في التعرف الصوتي: ' + event.error, 'error');
        };
        
        // Create voice command button
        const voiceButton = document.createElement('button');
        voiceButton.id = 'voice-command-btn';
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.title = 'الأوامر الصوتية';
        voiceButton.className = 'voice-command-btn';
        
        voiceButton.addEventListener('click', () => {
            if (this.isVoiceEnabled) {
                this.stopVoiceRecognition();
            } else {
                this.startVoiceRecognition();
            }
        });
        
        document.body.appendChild(voiceButton);
        
        // Create voice commands help modal
        this.createVoiceCommandsHelpModal();
    }
    
    /**
     * Register a voice command
     */
    registerVoiceCommand(command, action, description) {
        this.voiceCommands[command] = {
            action,
            description
        };
    }
    
    /**
     * Start voice recognition
     */
    startVoiceRecognition() {
        if (!this.voiceRecognition) return;
        
        this.voiceRecognition.start();
        this.isVoiceEnabled = true;
        
        const voiceButton = document.getElementById('voice-command-btn');
        if (voiceButton) {
            voiceButton.classList.add('active');
            voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
        
        this.showNotification('تم تفعيل الأوامر الصوتية', 'info');
        
        // Auto stop after 10 seconds if no input
        setTimeout(() => {
            if (this.isVoiceEnabled) {
                this.stopVoiceRecognition();
            }
        }, 10000);
    }
    
    /**
     * Stop voice recognition
     */
    stopVoiceRecognition() {
        if (!this.voiceRecognition) return;
        
        this.voiceRecognition.stop();
        this.isVoiceEnabled = false;
        
        const voiceButton = document.getElementById('voice-command-btn');
        if (voiceButton) {
            voiceButton.classList.remove('active');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }
    
    /**
     * Create voice commands help modal
     */
    createVoiceCommandsHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'voice-commands-modal';
        modal.className = 'modal';
        
        let commandsHtml = '<div class="modal-content"><span class="close">×</span>';
        commandsHtml += '<h2>الأوامر الصوتية</h2><div class="voice-commands-list">';
        
        for (const command in this.voiceCommands) {
            commandsHtml += `<div class="command-item">
                <span class="command-phrase">${command}</span>
                <span class="command-description">${this.voiceCommands[command].description}</span>
            </div>`;
        }
        
        commandsHtml += '</div></div>';
        modal.innerHTML = commandsHtml;
        
        document.body.appendChild(modal);
        
        // Register v shortcut to show voice commands
        this.registerShortcut('v', () => {
            modal.style.display = 'block';
            return true;
        }, 'Show voice commands');
        
        // Close button functionality
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    /**
     * Setup theme animations
     */
    setupThemeAnimations() {
        // Glitch effect on hover for buttons
        this.themeAnimations.glitchEffect = (selector) => {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(el => {
                el.addEventListener('mouseover', () => {
                    el.classList.add('glitch-hover');
                    
                    // Random offset animation
                    const randomOffset = () => {
                        const offset = Math.random() * 5 - 2.5;
                        el.style.transform = `translate(${offset}px, ${offset}px)`;
                        
                        if (el.classList.contains('glitch-hover')) {
                            setTimeout(randomOffset, 100);
                        }
                    };
                    
                    randomOffset();
                });
                
                el.addEventListener('mouseout', () => {
                    el.classList.remove('glitch-hover');
                    el.style.transform = '';
                });
            });
        };
        
        // Apply animations
        setTimeout(() => {
            this.themeAnimations.glitchEffect('button');
        }, 1000);
    }
    
    /**
     * Setup notification system
     */
    setupNotificationSystem() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                width: 300px;
            }
            
            .notification {
                margin-bottom: 10px;
                padding: 15px;
                border-radius: 5px;
                color: white;
                opacity: 0;
                transform: translateX(50px);
                transition: all 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
                border: 1px solid var(--input-border-color);
            }
            
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .notification.info {
                background-color: rgba(0, 0, 0, 0.8);
                border-left: 5px solid #1e88e5;
            }
            
            .notification.success {
                background-color: rgba(0, 0, 0, 0.8);
                border-left: 5px solid #43a047;
            }
            
            .notification.warning {
                background-color: rgba(0, 0, 0, 0.8);
                border-left: 5px solid #fb8c00;
            }
            
            .notification.error {
                background-color: rgba(0, 0, 0, 0.8);
                border-left: 5px solid #e53935;
            }
            
            .notification-close {
                cursor: pointer;
                padding: 0 5px;
            }
            
            .voice-command-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--button-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 100;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
                border: none;
                transition: all 0.3s ease;
            }
            
            .voice-command-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
            }
            
            .voice-command-btn.active {
                background-color: #e53935;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); }
                100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); }
            }
            
            .shortcuts-list, .voice-commands-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 10px;
                margin-top: 20px;
            }
            
            .shortcut-item, .command-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                border: 1px solid var(--input-border-color);
            }
            
            .shortcut-key, .command-phrase {
                background-color: var(--button-color);
                padding: 2px 8px;
                border-radius: 4px;
                font-family: monospace;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        this.notificationQueue.push({ message, type, duration });
        
        if (!this.isNotifying) {
            this.processNotificationQueue();
        }
    }
    
    /**
     * Process notification queue
     */
    processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isNotifying = false;
            return;
        }
        
        this.isNotifying = true;
        const { message, type, duration } = this.notificationQueue.shift();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <span class="notification-close">&times;</span>
        `;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notification);
        });
        
        // Auto close after duration
        setTimeout(() => {
            this.closeNotification(notification);
        }, duration);
    }
    
    /**
     * Close notification
     */
    closeNotification(notification) {
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.processNotificationQueue();
        }, 300);
    }
}
