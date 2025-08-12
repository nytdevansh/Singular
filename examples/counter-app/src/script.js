// Advanced Animation System Implementation (COMPLETE VERSION)
class SingularAnimationEngine {
    constructor() {
        this.easings = {
            linear: t => t,
            easeOutCubic: t => 1 - Math.pow(1 - t, 3),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
            easeOutQuart: t => 1 - Math.pow(1 - t, 4),
            easeInCubic: t => t * t * t,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
        };
        this.activeAnimations = new Set();
        this.loopAnimations = new Map();
        this.observers = [];
    }

    animate(element, { duration, easing = 'linear', delay = 0, onComplete, ...props }) {
        return new Promise((resolve) => {
            const start = performance.now() + delay;
            const ease = this.easings[easing];
            const initialStyles = {};
            const finalStyles = {};
            const units = {};

            for (const prop in props) {
                const [from, to] = Array.isArray(props[prop]) ? props[prop] : [props[prop], props[prop]];
                initialStyles[prop] = this.parseValue(from);
                finalStyles[prop] = this.parseValue(to);
                units[prop] = this.getUnit(from);
            }

            const animationId = Math.random().toString(36).substr(2, 9);
            this.activeAnimations.add(animationId);

            const frame = (now) => {
                if (!this.activeAnimations.has(animationId)) {
                    resolve();
                    return;
                }

                if (now < start) {
                    requestAnimationFrame(frame);
                    return;
                }

                const t = Math.min((now - start) / duration, 1);
                const eased = ease(t);

                for (const prop in props) {
                    const from = initialStyles[prop];
                    const to = finalStyles[prop];
                    const value = from + (to - from) * eased;
                    
                    if (prop === 'transform') {
                        element.style[prop] = this.interpolateTransform(props[prop], eased);
                    } else if (prop === 'backgroundColor' || prop === 'borderColor' || prop === 'boxShadow') {
                        element.style[prop] = this.interpolateProperty(props[prop], eased);
                    } else {
                        element.style[prop] = value + units[prop];
                    }
                }

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    this.activeAnimations.delete(animationId);
                    onComplete?.();
                    resolve();
                }
            };

            requestAnimationFrame(frame);
        });
    }

    interpolateProperty(propArray, progress) {
        const [from, to] = propArray;
        
        if (progress <= 0) return from;
        if (progress >= 1) return to;
        
        return progress > 0.5 ? to : from;
    }

    interpolateTransform(transformArray, progress) {
        const [from, to] = transformArray;
        
        if (from.includes(' ') || to.includes(' ')) {
            const fromTransforms = this.parseTransform(from);
            const toTransforms = this.parseTransform(to);
            const result = [];
            
            const allKeys = new Set([...Object.keys(fromTransforms), ...Object.keys(toTransforms)]);
            
            allKeys.forEach(key => {
                const fromValue = parseFloat(fromTransforms[key] || (key === 'scale' ? '1' : '0'));
                const toValue = parseFloat(toTransforms[key] || (key === 'scale' ? '1' : '0'));
                const currentValue = fromValue + (toValue - fromValue) * progress;
                
                if (key === 'translateX' || key === 'translateY') {
                    result.push(`${key}(${currentValue}px)`);
                } else if (key === 'scale' || key === 'scaleX' || key === 'scaleY') {
                    result.push(`${key}(${currentValue})`);
                } else if (key === 'rotate') {
                    result.push(`${key}(${currentValue}deg)`);
                }
            });
            
            return result.join(' ');
        }
        
        if (from.includes('scale') && to.includes('scale')) {
            const fromValue = parseFloat(from.match(/scale\(([^)]+)\)/)?.[1] || '1');
            const toValue = parseFloat(to.match(/scale\(([^)]+)\)/)?.[1] || '1');
            const currentValue = fromValue + (toValue - fromValue) * progress;
            return `scale(${currentValue})`;
        }
        
        if (from.includes('translateY') && to.includes('translateY')) {
            const fromValue = parseFloat(from.match(/translateY\(([^)]+)px\)/)?.[1] || '0');
            const toValue = parseFloat(to.match(/translateY\(([^)]+)px\)/)?.[1] || '0');
            const currentValue = fromValue + (toValue - fromValue) * progress;
            return `translateY(${currentValue}px)`;
        }
        
        if (from.includes('translateX') && to.includes('translateX')) {
            const fromValue = parseFloat(from.match(/translateX\(([^)]+)px\)/)?.[1] || '0');
            const toValue = parseFloat(to.match(/translateX\(([^)]+)px\)/)?.[1] || '0');
            const currentValue = fromValue + (toValue - fromValue) * progress;
            return `translateX(${currentValue}px)`;
        }
        
        if (from.includes('rotate') && to.includes('rotate')) {
            const fromValue = parseFloat(from.match(/rotate\(([^)]+)deg\)/)?.[1] || '0');
            const toValue = parseFloat(to.match(/rotate\(([^)]+)deg\)/)?.[1] || '0');
            const currentValue = fromValue + (toValue - fromValue) * progress;
            return `rotate(${currentValue}deg)`;
        }
        
        return to;
    }

    parseTransform(transformString) {
        const transforms = {};
        const regex = /(\w+)\(([^)]+)\)/g;
        let match;

        while ((match = regex.exec(transformString)) !== null) {
            transforms[match[1]] = match[2];
        }

        return transforms;
    }

    animateLoop(element, options, interval = 0) {
        const loopId = Math.random().toString(36).substr(2, 9);
        let isActive = true;
        
        const loop = async () => {
            if (!isActive) return;
            await this.animate(element, options);
            if (isActive) {
                if (interval > 0) {
                    setTimeout(() => loop(), interval);
                } else {
                    loop();
                }
            }
        };

        this.loopAnimations.set(loopId, () => { isActive = false; });
        loop();

        return {
            stop: () => { 
                isActive = false; 
                this.loopAnimations.delete(loopId);
            },
            id: loopId
        };
    }

    animateOnClick(element, options) {
        const handler = () => {
            this.animate(element, options);
        };
        
        element.addEventListener('click', handler);
        
        return {
            destroy: () => element.removeEventListener('click', handler)
        };
    }

    async animateSequence(element, sequence) {
        for (let i = 0; i < sequence.length; i++) {
            await this.animate(element, sequence[i]);
        }
    }

    animateStagger(elements, options, staggerDelay = 100) {
        elements.forEach((element, index) => {
            const delayedOptions = {
                ...options,
                delay: (options.delay || 0) + (index * staggerDelay)
            };
            this.animate(element, delayedOptions);
        });
    }

    animateOnScroll(element, options) {
        const { once = true, threshold = 0.1 } = options;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                this.animate(element, options);
                if (once) observer.unobserve(element);
            }
        }, { threshold });

        observer.observe(element);
        this.observers.push(observer);

        return {
            destroy: () => observer.disconnect()
        };
    }

    animateOnHover(element, options) {
        const { reverseOnLeave = true, duration, easing = 'linear', ...props } = options;
        const reverse = {};

        for (const key in props) {
            if (Array.isArray(props[key])) {
                const [from, to] = props[key];
                reverse[key] = [to, from];
            }
        }

        reverse.duration = duration;
        reverse.easing = easing;

        const handleMouseEnter = () => {
            this.animate(element, { duration, easing, ...props });
        };

        const handleMouseLeave = () => {
            if (reverseOnLeave) {
                this.animate(element, reverse);
            }
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);

        return {
            destroy: () => {
                element.removeEventListener("mouseenter", handleMouseEnter);
                element.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }

    fadeIn(element, duration = 300) {
        return this.animate(element, {
            opacity: ['0', '1'],
            duration,
            easing: 'easeOutCubic'
        });
    }

    fadeOut(element, duration = 300) {
        return this.animate(element, {
            opacity: ['1', '0'],
            duration,
            easing: 'easeOutCubic'
        });
    }

    bounce(element, intensity = 10, duration = 600) {
        return this.animateSequence(element, [
            {
                transform: [`translateY(0px)`, `translateY(-${intensity}px)`],
                duration: duration / 4,
                easing: 'easeOutQuart'
            },
            {
                transform: [`translateY(-${intensity}px)`, 'translateY(0px)'],
                duration: duration / 4,
                easing: 'easeInCubic'
            },
            {
                transform: ['translateY(0px)', `translateY(-${intensity/2}px)`],
                duration: duration / 4,
                easing: 'easeOutQuart'
            },
            {
                transform: [`translateY(-${intensity/2}px)`, 'translateY(0px)'],
                duration: duration / 4,
                easing: 'easeInCubic'
            }
        ]);
    }

    parseValue(value) {
        if (typeof value === 'string') {
            return parseFloat(value) || 0;
        }
        return value;
    }

    getUnit(value) {
        if (typeof value === 'string') {
            const unit = value.replace(/[0-9.-]/g, '');
            return unit || '';
        }
        return '';
    }

    stopAll() {
        this.activeAnimations.clear();
        this.loopAnimations.forEach(stop => stop());
        this.loopAnimations.clear();
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Enhanced Framework with Advanced Animations (KEEPING ALL PREVIOUS FEATURES)
class SingularFramework {
    constructor() {
        this.animator = new SingularAnimationEngine();
        this.state = {
            counter: 0,
            todos: [],
            theme: this.getInitialTheme()
        };
        this.animations = [];
        this.activeLoops = [];
        this.init();
    }

    getInitialTheme() {
        const saved = localStorage.getItem('singular-theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        
        return 'dark';
    }

    init() {
        this.applyInitialTheme();
        this.updateCounter();
        this.renderTodos();
        this.bindEvents();
        this.renderThemeSwitcher();
        this.setupAnimations();
        this.setupLogoSliding(); // ENHANCED LOGO FEATURES
        this.showNotification('Complete Advanced Animation System initialized!', 'success');
    }

    applyInitialTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
        document.body.className = `${this.state.theme}-theme`;
        this.updateThemeColors();
    }

    updateThemeColors() {
        const isDark = this.state.theme === 'dark';
        
        document.body.style.background = isDark 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1B1B1B 50%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)';
            
        document.body.style.color = isDark ? '#F4F4F4' : '#1B1B1B';
    }

    // ENHANCED LOGO SLIDING WITH ALL ADVANCED FEATURES
    // Replace your existing setupLogoSliding method with this:
setupLogoSliding() {
    const logo = document.querySelector('.logo');
    const logoContainer = document.querySelector('.logo-container');
    
    if (!logo || !logoContainer) {
        console.warn('Logo or logo container not found');
        return;
    }

    // Add enhanced hover to main logo using existing animator
    this.animator.animateOnHover(logo, {
        duration: 400,
        easing: 'easeOutCubic',
        transform: ['scale(1)', 'scale(1.05) rotate(1deg)'],
        filter: [
            'drop-shadow(0 0 20px rgba(196, 255, 77, 0.3))',
            'drop-shadow(0 0 30px rgba(196, 255, 77, 0.6))'
        ],
        reverseOnLeave: true
    });

    // 🧩 USE THE NEW COMPOSABLE SYSTEM
    this.stickyLogo = setupStickyLogo(logo, this.animator, {
        size: '50px',
        position: { top: '15px', left: '20px' },
        threshold: 100,
        fadeThreshold: 0,
        
        // Effects
        hoverEffect: true,
        hoverScale: 1.08,
        parallax: true,
        parallaxFactor: 0.15,
        clickToTop: true,
        clickAnimation: true,
        
        // Theme
        theme: this.state.theme,
        
        // Custom styles
        customStyles: {
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
        },
        
        // Callbacks
        onShow: () => {
            console.log('🎯 Modular sticky logo is now visible!');
        },
        onHide: () => {
            console.log('👋 Modular sticky logo is now hidden!');
        },
        onCreate: (element) => {
            console.log('🎉 Modular sticky logo created:', element);
        }
    });
}


    // KEEPING ALL EXISTING ANIMATION SETUP METHODS
    setupAnimations() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupDemoAnimations();
    }

    setupScrollAnimations() {
        const header = document.querySelector('.header');
        if (header) {
            this.animator.animateOnScroll(header, {
                duration: 800,
                opacity: ['0', '1'],
                transform: ['translateY(-30px) scale(0.95)', 'translateY(0px) scale(1)'],
                once: true,
                threshold: 0.1
            });
        }

        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            this.animator.animateOnScroll(card, {
                duration: 600,
                delay: index * 100,
                opacity: ['0', '1'],
                transform: ['translateY(30px) scale(0.95)', 'translateY(0px) scale(1)'],
                once: true,
                threshold: 0.1
            });
        });

        const demoSections = document.querySelectorAll('.demo-section');
        demoSections.forEach((section, index) => {
            this.animator.animateOnScroll(section, {
                duration: 700,
                delay: index * 150,
                opacity: ['0', '1'],
                transform: ['translateY(20px) scale(0.98)', 'translateY(0px) scale(1)'],
                once: true,
                threshold: 0.1
            });
        });
    }

    setupHoverAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            const animation = this.animator.animateOnHover(card, {
                duration: 300,
                transform: ['scale(1)', 'scale(1.02) translateY(-4px)'],
                reverseOnLeave: true
            });
            this.animations.push(animation);
        });

        const counterDisplay = document.getElementById('counter');
        if (counterDisplay) {
            const animation = this.animator.animateOnHover(counterDisplay, {
                duration: 250,
                transform: ['scale(1)', 'scale(1.05)'],
                reverseOnLeave: true
            });
            this.animations.push(animation);
        }

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            const animation = this.animator.animateOnHover(btn, {
                duration: 200,
                transform: ['scale(1)', 'scale(1.03) translateY(-2px)'],
                reverseOnLeave: true
            });
            this.animations.push(animation);
        });
    }

    setupDemoAnimations() {
        const loopDemo = document.getElementById('loop-demo');
        if (loopDemo) {
            const loop = this.animator.animateLoop(loopDemo, {
                transform: ['rotate(0deg)', 'rotate(360deg)'],
                duration: 4000,
                easing: 'linear'
            });
            this.activeLoops.push(loop);
        }

        const clickDemo = document.getElementById('click-demo');
        if (clickDemo) {
            this.animator.animateOnClick(clickDemo, {
                transform: ['scale(1)', 'scale(1.15)'],
                duration: 200,
                easing: 'easeOutBack',
                onComplete: () => {
                    this.animator.animate(clickDemo, {
                        transform: ['scale(1.15)', 'scale(1)'],
                        duration: 200,
                        easing: 'easeOutCubic'
                    });
                }
            });
        }
    }

    // KEEPING ALL EXISTING EVENT BINDING
    bindEvents() {
        // Counter events
        document.getElementById('increment')?.addEventListener('click', () => {
            this.state.counter++;
            this.updateCounter();
            this.animateCounterChange('increment');
            this.showNotification('Counter incremented!', 'info');
        });

        document.getElementById('decrement')?.addEventListener('click', () => {
            this.state.counter--;
            this.updateCounter();
            this.animateCounterChange('decrement');
            this.showNotification('Counter decremented!', 'info');
        });

        document.getElementById('reset')?.addEventListener('click', () => {
            this.state.counter = 0;
            this.updateCounter();
            this.animateCounterReset();
            this.showNotification('Counter reset!', 'info');
        });

        // Animation demo events
        document.getElementById('animate-counter')?.addEventListener('click', () => {
            this.animator.bounce(document.getElementById('counter'), 15, 800);
        });

        document.getElementById('demo-loop')?.addEventListener('click', () => {
            this.startLoopDemo();
        });

        document.getElementById('demo-sequence')?.addEventListener('click', () => {
            this.startSequenceDemo();
        });

        document.getElementById('demo-stagger')?.addEventListener('click', () => {
            this.startStaggerDemo();
        });

        // Todo events
        document.getElementById('add-todo')?.addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('todo-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    // KEEPING ALL EXISTING METHODS
    updateCounter() {
        const counterElement = document.getElementById('counter');
        if (counterElement) {
            counterElement.textContent = this.state.counter;
        }
    }

    animateCounterChange(type) {
        const counterDisplay = document.getElementById('counter');
        if (counterDisplay) {
            if (type === 'increment') {
                this.animator.animate(counterDisplay, {
                    transform: ['scale(1)', 'scale(1.15)'],
                    duration: 200,
                    easing: 'easeOutCubic',
                    onComplete: () => {
                        this.animator.animate(counterDisplay, {
                            transform: ['scale(1.15)', 'scale(1)'],
                            duration: 200,
                            easing: 'easeOutCubic'
                        });
                    }
                });
            } else if (type === 'decrement') {
                this.animator.animate(counterDisplay, {
                    transform: ['scale(1)', 'scale(0.85)'],
                    duration: 200,
                    easing: 'easeOutCubic',
                    onComplete: () => {
                        this.animator.animate(counterDisplay, {
                            transform: ['scale(0.85)', 'scale(1)'],
                            duration: 200,
                            easing: 'easeOutBack'
                        });
                    }
                });
            }
        }
    }

    animateCounterReset() {
        const counterDisplay = document.getElementById('counter');
        if (counterDisplay) {
            this.animator.animateSequence(counterDisplay, [
                {
                    transform: ['rotate(0deg)', 'rotate(360deg)'],
                    duration: 400,
                    easing: 'easeInOutCubic'
                },
                {
                    transform: ['scale(1)', 'scale(1.2)'],
                    duration: 200,
                    easing: 'easeOutBack'
                },
                {
                    transform: ['scale(1.2)', 'scale(1)'],
                    duration: 200,
                    easing: 'easeOutCubic'
                }
            ]);
        }
    }

    startLoopDemo() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            const loop = this.animator.animateLoop(card, {
                transform: ['translateY(0px)', 'translateY(-8px)'],
                duration: 1200,
                easing: 'easeInOutQuad'
            }, 600);
            
            setTimeout(() => loop.stop(), 6000);
        });
        this.showNotification('Loop animation started!', 'info');
    }

    startSequenceDemo() {
        const header = document.querySelector('.header h1');
        if (header) {
            this.animator.animateSequence(header, [
                {
                    transform: ['scale(1)', 'scale(1.05)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                },
                {
                    transform: ['scale(1.05)', 'scale(1)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                },
                {
                    transform: ['translateY(0px)', 'translateY(-10px)'],
                    duration: 250,
                    easing: 'easeOutBack'
                },
                {
                    transform: ['translateY(-10px)', 'translateY(0px)'],
                    duration: 250,
                    easing: 'easeOutCubic'
                }
            ]);
        }
        this.showNotification('Sequence animation started!', 'info');
    }

    startStaggerDemo() {
        const cards = document.querySelectorAll('.feature-card');
        this.animator.animateStagger(Array.from(cards), {
            transform: ['scale(1)', 'scale(1.08)'],
            duration: 400,
            easing: 'easeOutCubic'
        }, 150);
        
        setTimeout(() => {
            this.animator.animateStagger(Array.from(cards), {
                transform: ['scale(1.08)', 'scale(1)'],
                duration: 400,
                easing: 'easeOutCubic'
            }, 100);
        }, 1200);
        
        this.showNotification('Stagger animation started!', 'info');
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        if (!input || !input.value.trim()) return;

        const todo = {
            id: Date.now(),
            text: input.value.trim(),
            completed: false
        };

        this.state.todos.push(todo);
        input.value = '';
        this.renderTodos();
        this.showNotification('Todo added!', 'success');
    }

    toggleTodo(id) {
        const todo = this.state.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
            this.showNotification(todo.completed ? 'Todo completed!' : 'Todo uncompleted!', 'info');
        }
    }

    deleteTodo(id) {
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.renderTodos();
        this.showNotification('Todo deleted!', 'error');
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;

        todoList.innerHTML = '';
        
        this.state.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <div class="todo-actions">
                    <button class="btn btn-sm secondary" onclick="app.toggleTodo(${todo.id})">
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn btn-sm secondary" onclick="app.deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            
            this.animator.animateOnHover(li, {
                duration: 250,
                transform: ['translateX(0px)', 'translateX(8px)'],
                reverseOnLeave: true
            });
            
            todoList.appendChild(li);
        });
    }

    renderThemeSwitcher() {
        const themeSwitcherContainer = document.getElementById('theme-switcher');
        if (themeSwitcherContainer) {
            themeSwitcherContainer.innerHTML = `
                <span>Theme:</span>
                <button class="btn btn-sm theme-btn" onclick="app.toggleTheme()">
                    ${this.state.theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
            `;
            
            const themeBtn = themeSwitcherContainer.querySelector('.theme-btn');
            if (themeBtn) {
                this.animator.animateOnHover(themeBtn, {
                    duration: 200,
                    transform: ['scale(1)', 'scale(1.08)'],
                    reverseOnLeave: true
                });
            }
        }
    }

    toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('singular-theme', this.state.theme);
    this.applyInitialTheme();
    this.renderThemeSwitcher();
    this.showNotification(`Switched to ${this.state.theme} theme!`, 'info');
    
    // Update modular sticky logo theme
    if (this.stickyLogo) {
        this.stickyLogo.updateTheme(this.state.theme);
    }
}


    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%) scale(0.8)',
            opacity: '0'
        });

        if (type === 'success') {
            notification.style.backgroundColor = '#22c55e';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);

        this.animator.animate(notification, {
            opacity: ['0', '1'],
            transform: ['translateX(100%) scale(0.8)', 'translateX(0px) scale(1)'],
            duration: 400,
            easing: 'easeOutCubic'
        });

        setTimeout(() => {
            this.animator.animate(notification, {
                opacity: ['1', '0'],
                transform: ['translateX(0px) scale(1)', 'translateX(100%) scale(0.8)'],
                duration: 300,
                easing: 'easeInCubic',
                onComplete: () => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }
            });
        }, 3000);
    }

    destroy() {
        this.animator.stopAll();
        this.animations.forEach(animation => animation.destroy());
        this.activeLoops.forEach(loop => loop.stop());
        
        if (this.logoScrollHandler) {
            window.removeEventListener('scroll', this.logoScrollHandler);
        }
    }
}

// Demo Functions that integrate with SingularFramework (KEEPING ALL PREVIOUS)
class AnimationDemos {
    constructor() {
        this.isInitialized = false;
        this.singularApp = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.singularApp = window.app;
                this.bindEvents();
                this.updateStatus();
                this.startStatusUpdater();
                this.isInitialized = true;
            }, 100);
        });
    }

    bindEvents() {
        window.testStaggerAnimation = () => this.testStaggerAnimation();
        window.testSequenceAnimation = () => this.testSequenceAnimation();
        window.testParallelAnimation = () => this.testParallelAnimation();
        window.resetAllAnimations = () => this.resetAllAnimations();
        window.testColorAnimation = () => this.testColorAnimation();
        window.testBounceAnimation = () => this.testBounceAnimation();
        window.debugAnimationSystem = () => this.debugAnimationSystem();
    }

    testStaggerAnimation() {
        if (this.singularApp) {
            this.singularApp.startStaggerDemo();
        } else {
            this.fallbackStaggerAnimation();
        }
    }

    testSequenceAnimation() {
        if (this.singularApp) {
            this.singularApp.startSequenceDemo();
        } else {
            this.fallbackSequenceAnimation();
        }
    }

    testParallelAnimation() {
        const demoSections = document.querySelectorAll('.demo-section');
        if (demoSections.length === 0) {
            this.showNotification('No demo sections found!', 'error');
            return;
        }

        demoSections.forEach((section, index) => {
            setTimeout(() => {
                if (this.singularApp && this.singularApp.animator) {
                    this.singularApp.animator.animate(section, {
                        transform: ['scale(1)', 'scale(1.02)'],
                        opacity: ['1', '0.9'],
                        duration: 400,
                        easing: 'easeInOutCubic',
                        onComplete: () => {
                            this.singularApp.animator.animate(section, {
                                transform: ['scale(1.02)', 'scale(1)'],
                                opacity: ['0.9', '1'],
                                duration: 400,
                                easing: 'easeInOutCubic'
                            });
                        }
                    });
                } else {
                    this.cssAnimate(section, {
                        transform: ['scale(1)', 'scale(1.02)'],
                        duration: 400
                    });
                }
            }, index * 100);
        });
        
        this.showNotification('Parallel animations started!', 'info');
    }

    testColorAnimation() {
        const cards = document.querySelectorAll('.feature-card');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                const originalBg = card.style.backgroundColor;
                card.style.transition = 'background-color 0.5s ease';
                card.style.backgroundColor = colors[index % colors.length];
                
                setTimeout(() => {
                    card.style.backgroundColor = originalBg;
                }, 1000);
            }, index * 200);
        });
        
        this.showNotification('Color animation started!', 'info');
    }

    testBounceAnimation() {
        const header = document.querySelector('.header h1');
        if (!header) return;

        if (this.singularApp && this.singularApp.animator) {
            this.singularApp.animator.bounce(header, 20, 800);
        } else {
            this.fallbackBounceAnimation(header);
        }
        
        this.showNotification('Bounce animation started!', 'info');
    }

    resetAllAnimations() {
        const elements = document.querySelectorAll('.feature-card, .demo-section, .header h1, .counter-display');
        let resetCount = 0;

        elements.forEach(el => {
            if (el) {
                el.style.transform = '';
                el.style.opacity = '';
                el.style.scale = '';
                el.style.transition = 'none';
                
                el.offsetHeight;
                
                setTimeout(() => {
                    el.style.transition = '';
                }, 10);
                
                resetCount++;
            }
        });
        
        this.showNotification(`Reset ${resetCount} elements!`, 'success');
    }

    fallbackStaggerAnimation() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                this.cssAnimate(card, {
                    transform: ['scale(1)', 'scale(1.1)'],
                    duration: 300,
                    onComplete: () => {
                        this.cssAnimate(card, {
                            transform: ['scale(1.1)', 'scale(1)'],
                            duration: 300
                        });
                    }
                });
            }, index * 150);
        });
        this.showNotification('Stagger animation started (fallback)!', 'info');
    }

    fallbackSequenceAnimation() {
        const header = document.querySelector('.header h1');
        if (header) {
            this.cssAnimate(header, {
                transform: ['scale(1)', 'scale(1.05)'],
                duration: 300,
                onComplete: () => {
                    this.cssAnimate(header, {
                        transform: ['scale(1.05)', 'scale(1)'],
                        duration: 300
                    });
                }
            });
        }
        this.showNotification('Sequence animation started (fallback)!', 'info');
    }

    fallbackBounceAnimation(element) {
        let bounceCount = 0;
        const maxBounces = 3;
        
        const bounce = () => {
            if (bounceCount >= maxBounces) return;
            
            this.cssAnimate(element, {
                transform: ['translateY(0)', 'translateY(-20px)'],
                duration: 200,
                onComplete: () => {
                    this.cssAnimate(element, {
                        transform: ['translateY(-20px)', 'translateY(0)'],
                        duration: 200,
                        onComplete: () => {
                            bounceCount++;
                            if (bounceCount < maxBounces) {
                                setTimeout(bounce, 100);
                            }
                        }
                    });
                }
            });
        };
        
        bounce();
    }

    cssAnimate(element, { transform, opacity, duration = 300, onComplete }) {
        const [fromValue, toValue] = Array.isArray(transform) ? transform : [transform, transform];
        const [fromOpacity, toOpacity] = Array.isArray(opacity) ? opacity : [opacity, opacity];
        
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        if (transform) element.style.transform = toValue;
        if (opacity) element.style.opacity = toOpacity;
        
        if (onComplete) {
            setTimeout(onComplete, duration);
        }
    }

    showNotification(message, type = 'info') {
        if (this.singularApp && this.singularApp.showNotification) {
            this.singularApp.showNotification(message, type);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `demo-notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10001',
            maxWidth: '300px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out'
        });

        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    updateStatus() {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        const theme = document.body.getAttribute('data-theme') || 'dark';
        const todoCount = document.querySelectorAll('.todo-item').length;
        const featureCards = document.querySelectorAll('.feature-card').length;
        
        statusEl.textContent = `Framework: ${this.isInitialized ? 'Ready' : 'Loading'} | Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} | Todos: ${todoCount} | Features: ${featureCards} | Animations: Active`;
    }

    startStatusUpdater() {
        setInterval(() => {
            this.updateStatus();
        }, 2000);
    }

    debugAnimationSystem() {
        console.log('Animation System Debug:', {
            hasSingularApp: !!this.singularApp,
            hasAnimator: !!(this.singularApp && this.singularApp.animator),
            isInitialized: this.isInitialized,
            featureCards: document.querySelectorAll('.feature-card').length,
            demoSections: document.querySelectorAll('.demo-section').length,
            singularFrameworkState: this.singularApp ? this.singularApp.state : null
        });
        
        this.showNotification('Debug info logged to console', 'info');
    }
}

// Initialize both systems with ALL features preserved
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SingularFramework();
    window.animationDemos = new AnimationDemos();
    
    console.log('Complete Animation System with ALL features loaded successfully!');
});
