// Advanced Animation System Implementation
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
                    } else if (prop === 'backgroundColor' || prop === 'borderColor') {
                        element.style[prop] = props[prop][1];
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

    interpolateTransform(transformArray, progress) {
        const [from, to] = transformArray;
        
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

// Enhanced Framework with Advanced Animations
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
        this.setupLogoSliding();
        this.showNotification('Advanced Animation System initialized!', 'success');
    }

    applyInitialTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
        document.body.className = `${this.state.theme}-theme`;
        
        // Apply theme to all existing elements
        this.updateThemeColors();
    }

    // FIXED: Theme color updates
    updateThemeColors() {
        const isDark = this.state.theme === 'dark';
        
        // Update body background
        document.body.style.background = isDark 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1B1B1B 50%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)';
            
        // Update text colors
        document.body.style.color = isDark ? '#F4F4F4' : '#1B1B1B';
    }

    setupLogoSliding() {
        const logo = document.querySelector('.logo');
        const logoContainer = document.querySelector('.logo-container');
        
        if (!logo || !logoContainer) {
            console.error('Logo or logo container not found');
            return;
        }

        const floatingLogo = logo.cloneNode(true);
        floatingLogo.id = 'floating-logo';
        
        // FIXED: Proper positioning styles
        Object.assign(floatingLogo.style, {
            position: 'fixed',
            top: '15px',
            left: '20px',
            width: '50px',
            height: 'auto',
            zIndex: '1000',
            opacity: '0',
            transform: 'scale(0.8) translateX(-100px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(196, 255, 77, 0.3)',
            border: '2px solid rgba(196, 255, 77, 0.2)',
            background: 'rgba(27, 27, 27, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '4px',
            cursor: 'pointer'
        });
        
        document.body.appendChild(floatingLogo);

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const logoRect = logoContainer.getBoundingClientRect();
            const isLogoOutOfView = logoRect.bottom < 0;

            if (isLogoOutOfView && scrollY > 100) {
                floatingLogo.style.opacity = '1';
                floatingLogo.style.transform = 'scale(1) translateX(0)';
            } else {
                floatingLogo.style.opacity = '0';
                floatingLogo.style.transform = 'scale(0.8) translateX(-100px)';
            }

            const parallaxOffset = scrollY * 0.2;
            logo.style.transform = `translateY(${parallaxOffset}px) scale(${Math.max(0.9, 1 - scrollY * 0.0003)})`;
        };

        let ticking = false;
        const throttledScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        this.logoScrollHandler = throttledScrollHandler;

        floatingLogo.addEventListener('click', () => {
            floatingLogo.style.transform = 'scale(1.1) translateX(0)';
            setTimeout(() => {
                floatingLogo.style.transform = 'scale(1) translateX(0)';
            }, 200);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        floatingLogo.addEventListener('mouseenter', () => {
            floatingLogo.style.transform = 'scale(1.05) translateX(0)';
            floatingLogo.style.boxShadow = '0 6px 30px rgba(196, 255, 77, 0.5)';
        });

        floatingLogo.addEventListener('mouseleave', () => {
            floatingLogo.style.transform = 'scale(1) translateX(0)';
            floatingLogo.style.boxShadow = '0 4px 20px rgba(196, 255, 77, 0.3)';
        });

        console.log('Logo sliding functionality initialized successfully!');
    }

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

    bindEvents() {
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

        document.getElementById('demo-timeline')?.addEventListener('click', () => {
            this.startTimelineDemo();
        });

        document.getElementById('add-todo')?.addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('animate-todos')?.addEventListener('click', () => {
            this.animateAllTodos();
        });

        document.getElementById('todo-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
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
        const sequenceDemo = document.getElementById('sequence-demo');
        if (sequenceDemo) {
            this.animator.animateSequence(sequenceDemo, [
                {
                    transform: ['translateX(0px)', 'translateX(40px)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                },
                {
                    transform: ['translateX(40px)', 'translateX(0px)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                },
                {
                    transform: ['scale(1)', 'scale(1.15)'],
                    duration: 250,
                    easing: 'easeOutBack'
                },
                {
                    transform: ['scale(1.15)', 'scale(1)'],
                    duration: 250,
                    easing: 'easeOutCubic'
                }
            ]);
        }
        this.showNotification('Sequence animation started!', 'info');
    }

    startStaggerDemo() {
        const cards = document.querySelectorAll('[data-animation-target]');
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

    startTimelineDemo() {
        const header = document.querySelector('.header h1');
        const subtitle = document.querySelector('.header p');
        
        if (header && subtitle) {
            this.animator.animate(header, {
                transform: ['scale(1)', 'scale(1.05)'],
                duration: 400,
                easing: 'easeOutCubic',
                onComplete: () => {
                    this.animator.animate(subtitle, {
                        opacity: ['1', '0.6'],
                        duration: 200,
                        easing: 'easeOutCubic',
                        onComplete: () => {
                            this.animator.animate(subtitle, {
                                opacity: ['0.6', '1'],
                                duration: 200,
                                easing: 'easeOutCubic'
                            });
                            this.animator.animate(header, {
                                transform: ['scale(1.05)', 'scale(1)'],
                                duration: 400,
                                easing: 'easeOutCubic'
                            });
                        }
                    });
                }
            });
        }
        this.showNotification('Timeline animation started!', 'info');
    }

    animateAllTodos() {
        const todoItems = document.querySelectorAll('.todo-item');
        if (todoItems.length > 0) {
            this.animator.animateStagger(Array.from(todoItems), {
                transform: ['scale(1)', 'scale(1.03)'],
                duration: 300,
                easing: 'easeOutCubic'
            }, 80);
            
            setTimeout(() => {
                this.animator.animateStagger(Array.from(todoItems), {
                    transform: ['scale(1.03)', 'scale(1)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                }, 50);
            }, 600);
        }
    }

    renderThemeSwitcher() {
        const container = document.getElementById('theme-switcher-container');
        if (!container) return;

        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        
        const label = document.createElement('span');
        label.textContent = 'Theme:';
        
        const button = document.createElement('button');
        button.className = 'btn btn-sm theme-btn';
        this.updateThemeButton(button);
        
        button.addEventListener('click', () => {
            this.toggleTheme();
            this.updateThemeButton(button);
        });

        const animation = this.animator.animateOnHover(button, {
            duration: 200,
            transform: ['scale(1)', 'scale(1.05)'],
            reverseOnLeave: true
        });
        
        this.animations.push(animation);
        
        themeSwitcher.appendChild(label);
        themeSwitcher.appendChild(button);
        container.appendChild(themeSwitcher);
    }

    updateThemeButton(button) {
        button.textContent = this.state.theme === 'light' ? '🌙 Dark' : '☀️ Light';
    }

    // FIXED: Theme toggle functionality
    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.state.theme = newTheme;
        
        // Apply theme changes
        document.body.setAttribute('data-theme', newTheme);
        document.body.className = `${newTheme}-theme`;
        localStorage.setItem('singular-theme', newTheme);
        
        // Update theme colors immediately
        this.updateThemeColors();
        
        this.updateCounter();
        this.showNotification(`Switched to ${newTheme} theme!`, 'info');
        this.animateThemeChange();
    }

    animateThemeChange() {
        const elements = document.querySelectorAll('.feature-card, .demo-section, .header');
        this.animator.animateStagger(Array.from(elements), {
            transform: ['scale(1)', 'scale(0.98)'],
            duration: 200,
            easing: 'easeOutCubic'
        }, 30);
        
        setTimeout(() => {
            this.animator.animateStagger(Array.from(elements), {
                transform: ['scale(0.98)', 'scale(1)'],
                duration: 200,
                easing: 'easeOutCubic'
            }, 30);
        }, 300);
    }

    updateCounter() {
        const counterElement = document.getElementById('counter');
        const statusElement = document.getElementById('status');
        
        if (counterElement) counterElement.textContent = this.state.counter;
        if (statusElement) {
            statusElement.textContent = `Counter: ${this.state.counter} | Todos: ${this.state.todos.length} | Theme: ${this.state.theme} | Animations: Active`;
        }
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        if (!input) return;
        
        const text = input.value.trim();
        
        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            this.state.todos.push(todo);
            input.value = '';
            this.renderTodos();
            this.updateCounter();
            this.showNotification('Todo added with animation!', 'success');
        }
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
        const todoElement = document.querySelector(`[data-todo-id="${id}"]`);
        if (todoElement) {
            this.animator.animate(todoElement, {
                opacity: ['1', '0'],
                transform: ['scale(1)', 'scale(0.9)'],
                duration: 300,
                easing: 'easeOutCubic',
                onComplete: () => {
                    this.state.todos = this.state.todos.filter(t => t.id !== id);
                    this.renderTodos();
                    this.updateCounter();
                    this.showNotification('Todo deleted!', 'error');
                }
            });
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;
        
        todoList.innerHTML = '';

        if (this.state.todos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'todo-empty';
            emptyMessage.textContent = 'No todos yet. Add one above!';
            todoList.appendChild(emptyMessage);
            return;
        }

        this.state.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-todo-id', todo.id);
            
            li.innerHTML = `
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="btn btn-sm secondary" onclick="app.toggleTodo(${todo.id})">
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn btn-sm secondary" onclick="app.deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            
            todoList.appendChild(li);

            this.animator.animate(li, {
                opacity: ['0', '1'],
                transform: ['translateY(10px) scale(0.98)', 'translateY(0px) scale(1)'],
                duration: 400,
                delay: index * 50,
                easing: 'easeOutCubic'
            });

            this.animator.animateOnHover(li, {
                duration: 250,
                transform: ['translateX(0px)', 'translateX(6px)'],
                reverseOnLeave: true
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        this.animator.animate(notification, {
            opacity: ['0', '1'],
            transform: ['translateX(100%) scale(0.9)', 'translateX(0) scale(1)'],
            duration: 400,
            easing: 'easeOutCubic'
        });
        
        setTimeout(() => {
            this.animator.animate(notification, {
                opacity: ['1', '0'],
                transform: ['translateX(0) scale(1)', 'translateX(100%) scale(0.9)'],
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
        this.animations.forEach(animation => animation.destroy());
        this.activeLoops.forEach(loop => loop.stop());
        this.animator.stopAll();
        if (this.logoScrollHandler) {
            window.removeEventListener('scroll', this.logoScrollHandler);
        }
    }
}

// Initialize the framework when page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SingularFramework();
    window.app = app;
});
