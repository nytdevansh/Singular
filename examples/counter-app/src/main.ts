import { render, animate, useState, effect, createElement } from 'singular-core';
import { App } from './App';
import { setupStickyLogo } from './stickyComposer';

// Import enhanced animation functions INCLUDING sticky logo functions
import { 
    animateOnHover, 
    animateMove, 
    animateResize, 
    stickToViewport,
    createAdvancedStickyLogo 
} from './animate';

// Import sticky logo manager
import { stickyLogoManager } from '../../../packages/core/src/logosticky';

// Theme Store - Global reactive state for theme management
const themeStore = useState<'light' | 'dark'>(getInitialTheme());

// Helper function to get initial theme
function getInitialTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem('singular-theme');
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    
    return 'dark';
}

// Enhanced Logo Component with Sticky Functionality
// Add this import at the top


// Replace the LogoWithSticky component with this enhanced version:
function LogoWithSticky() {
  return createElement('div', { className: 'logo-container' },
    createElement('img', {
      id: 'main-logo',
      src: 'logo.png',
      alt: 'Singular Framework Logo',
      className: 'logo',
      ref: (el: HTMLElement) => {
        if (el) {
          // Add main logo hover animation
          animateOnHover(el, {
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transform: ['scale(1)', 'scale(1.05) rotate(1deg)'],
            filter: [
              'drop-shadow(0 0 20px rgba(196, 255, 77, 0.3))',
              'drop-shadow(0 0 30px rgba(196, 255, 77, 0.6))'
            ],
            reverseOnLeave: true
          });

          // 🧩 USE THE NEW COMPOSABLE SYSTEM
          const stickyLogo = setupStickyLogo(el, {
            size: '50px',
            position: { top: '15px', left: '20px' },
            threshold: 100,
            fadeThreshold: 50,
            
            // Effects
            hoverEffect: true,
            hoverScale: 1.08,
            parallax: true,
            parallaxFactor: 0.05,
            clickToTop: true,
            clickAnimation: true,
            
            // Theme and styling
            theme: themeStore() === 'dark' ? 'dark' : 'light',
            visualEffects: {
              glow: true,
              shadow: true,
              pulse: false
            },
            
            customStyles: {
              borderRadius: '12px',
              padding: '6px'
            },
            
            // Callbacks
            onShow: () => {
              console.log('🎯 Composed sticky logo is now visible!');
              showNotification('Sticky logo activated!', 'info');
            },
            onHide: () => {
              console.log('👋 Composed sticky logo is now hidden!');
            },
            onCreate: (element) => {
              console.log('🎉 Sticky logo created:', element);
            }
          });

          // Store references for cleanup and theme updates
          (window as any).__composedStickyLogo = stickyLogo;
          
          // Update theme when it changes
          effect(() => {
            const theme = themeStore();
            stickyLogo.updateTheme(theme === 'dark' ? 'dark' : 'light');
          });
        }
      }
    })
  );
}


// Enhanced Theme Switcher Component
function ThemeSwitcher() {
    return createElement('div', { className: 'theme-switcher' },
        createElement('span', {}, 'Theme:'),
        createElement('button', {
            className: 'btn btn-sm theme-btn',
            ref: (el: HTMLElement) => {
                animateOnHover(el, {
                    duration: 200,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: ['scale(1)', 'scale(1.08)'],
                    boxShadow: [
                        '0 4px 16px rgba(196, 255, 77, 0.3)',
                        '0 8px 32px rgba(196, 255, 77, 0.5)'
                    ],
                    reverseOnLeave: true
                });
            },
            onclick: () => {
                const newTheme = themeStore() === 'light' ? 'dark' : 'light';
                themeStore.set(newTheme);
                
                // Update sticky logo theme
                stickyLogoManager.updateTheme(newTheme);
                
                showNotification(`Switched to ${newTheme} theme!`, 'info');
            }
        }, () => themeStore() === 'light' ? '🌙 Dark' : '☀️ Light')
    );
}

// Enhanced Counter Component (keeping all existing functionality)
function CounterComponent() {
    const counter = useState(0);
    
    return createElement('div', { className: 'counter-demo' },
        createElement('div', {
            className: 'counter-display',
            id: 'counter-display',
            ref: (el: HTMLElement) => {
                animateOnHover(el, {
                    duration: 300,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: ['scale(1)', 'scale(1.05)'],
                    textShadow: [
                        '0 0 8px rgba(196, 255, 77, 0.6)',
                        '0 0 16px rgba(196, 255, 77, 0.8)'
                    ],
                    borderColor: [
                        'rgba(196, 255, 77, 0.6)',
                        'rgba(196, 255, 77, 1)'
                    ],
                    reverseOnLeave: true
                });
            }
        }, () => counter().toString()),
        
        createElement('div', { className: 'counter-controls' },
            createElement('button', {
                className: 'btn increment-btn',
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 200,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: ['translateY(0)', 'translateY(-2px)'],
                        boxShadow: [
                            '0 4px 16px rgba(196, 255, 77, 0.3)',
                            '0 8px 24px rgba(196, 255, 77, 0.4)'
                        ],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    const oldValue = counter();
                    counter.set(oldValue + 1);
                    
                    const display = document.getElementById('counter-display');
                    if (display) {
                        animate(display, {
                            transform: ['scale(1)', 'scale(1.15)'],
                            duration: 150,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            onComplete: () => {
                                animate(display, {
                                    transform: ['scale(1.15)', 'scale(1)'],
                                    duration: 150,
                                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                                });
                            }
                        });
                    }
                    
                    showNotification('Counter incremented!', 'success');
                }
            }, '+ Increment'),
            
            createElement('button', {
                className: 'btn decrement-btn',
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 200,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: ['translateY(0)', 'translateY(-2px)'],
                        boxShadow: [
                            '0 4px 16px rgba(196, 255, 77, 0.3)',
                            '0 8px 24px rgba(196, 255, 77, 0.4)'
                        ],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    const oldValue = counter();
                    counter.set(oldValue - 1);
                    
                    const display = document.getElementById('counter-display');
                    if (display) {
                        animate(display, {
                            transform: ['scale(1)', 'scale(0.85)'],
                            duration: 150,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            onComplete: () => {
                                animate(display, {
                                    transform: ['scale(0.85)', 'scale(1)'],
                                    duration: 150,
                                    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                });
                            }
                        });
                    }
                    
                    showNotification('Counter decremented!', 'info');
                }
            }, '- Decrement'),
            
            createElement('button', {
                className: 'btn secondary reset-btn',
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 250,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: ['scale(1)', 'scale(1.03)'],
                        opacity: [0.9, 1],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    counter.set(0);
                    
                    const display = document.getElementById('counter-display');
                    if (display) {
                        animate(display, {
                            transform: ['rotate(0deg)', 'rotate(360deg)'],
                            duration: 400,
                            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        });
                    }
                    
                    showNotification('Counter reset!', 'info');
                }
            }, 'Reset')
        )
    );
}

// Animation Demo Components with ALL Features (keeping existing)
function AnimationDemos() {
    return createElement('div', { className: 'animation-demos' },
        createElement('h3', {}, 'Advanced Animation Demonstrations'),
        
        // Move Demo
        createElement('div', { className: 'demo-section' },
            createElement('h4', {}, 'Move Animation'),
            createElement('div', {
                className: 'move-demo-box',
                id: 'move-demo-box',
                ref: (el: HTMLElement) => {
                    Object.assign(el.style, {
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'rgba(196, 255, 77, 0.8)',
                        borderRadius: '8px',
                        margin: '20px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#1B1B1B',
                        cursor: 'pointer'
                    });
                    el.textContent = 'Move Me!';
                    
                    animateOnHover(el, {
                        duration: 200,
                        transform: ['scale(1)', 'scale(1.1)'],
                        backgroundColor: [
                            'rgba(196, 255, 77, 0.8)',
                            'rgba(196, 255, 77, 1)'
                        ],
                        reverseOnLeave: true
                    });
                }
            }),
            createElement('button', {
                className: 'btn',
                onclick: () => {
                    const box = document.getElementById('move-demo-box');
                    if (box) {
                        animateMove(box, {
                            x: ['0px', '100px'],
                            y: ['0px', '50px'],
                            duration: 800,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        });
                        
                        setTimeout(() => {
                            animateMove(box, {
                                x: ['100px', '0px'],
                                y: ['50px', '0px'],
                                duration: 800,
                                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                            });
                        }, 1000);
                        
                        showNotification('Move animation started!', 'info');
                    }
                }
            }, 'Start Move Animation')
        ),

        // Resize Demo
        createElement('div', { className: 'demo-section' },
            createElement('h4', {}, 'Resize Animation'),
            createElement('div', {
                className: 'resize-demo-box',
                id: 'resize-demo-box',
                ref: (el: HTMLElement) => {
                    Object.assign(el.style, {
                        width: '150px',
                        height: '80px',
                        backgroundColor: 'rgba(196, 255, 77, 0.6)',
                        borderRadius: '8px',
                        margin: '20px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#1B1B1B',
                        cursor: 'pointer'
                    });
                    el.textContent = 'Resize Me!';
                    
                    animateOnHover(el, {
                        duration: 200,
                        transform: ['scale(1)', 'scale(1.05)'],
                        reverseOnLeave: true
                    });
                }
            }),
            createElement('button', {
                className: 'btn',
                onclick: () => {
                    const box = document.getElementById('resize-demo-box');
                    if (box) {
                        animateResize(box, {
                            width: ['150px', '250px'],
                            height: ['80px', '120px'],
                            duration: 600,
                            easing: 'ease-in-out'
                        });
                        
                        setTimeout(() => {
                            animateResize(box, {
                                width: ['250px', '150px'],
                                height: ['120px', '80px'],
                                duration: 600,
                                easing: 'ease-in-out'
                            });
                        }, 800);
                        
                        showNotification('Resize animation started!', 'info');
                    }
                }
            }, 'Start Resize Animation')
        ),

        // Sticky Demo
        createElement('div', { className: 'demo-section' },
            createElement('h4', {}, 'Sticky Viewport Demo'),
            createElement('div', {
                className: 'sticky-demo-nav',
                id: 'sticky-demo-nav',
                ref: (el: HTMLElement) => {
                    Object.assign(el.style, {
                        padding: '15px 30px',
                        backgroundColor: 'rgba(196, 255, 77, 0.9)',
                        color: '#1B1B1B',
                        borderRadius: '8px',
                        margin: '20px 0',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    });
                    el.innerHTML = 'Demo Navigation Bar - Scroll to test sticky behavior';
                }
            }),
            createElement('button', {
                className: 'btn',
                onclick: () => {
                    const nav = document.getElementById('sticky-demo-nav');
                    if (nav) {
                        const stickyControl = stickToViewport(nav, {
                            top: 10,
                            offset: 200,
                            smoothTransition: true,
                            onStick: () => showNotification('Navigation is now sticky!', 'info'),
                            onUnstick: () => showNotification('Navigation unstuck!', 'info')
                        });
                        
                        (window as any).stickyControl = stickyControl;
                        showNotification('Sticky behavior enabled! Scroll to test.', 'success');
                    }
                }
            }, 'Enable Sticky Behavior'),
            
            createElement('button', {
                className: 'btn secondary',
                onclick: () => {
                    if ((window as any).stickyControl) {
                        (window as any).stickyControl.destroy();
                        showNotification('Sticky behavior disabled!', 'info');
                    }
                }
            }, 'Disable Sticky')
        )
    );
}

// Enhanced Notification System
function showNotification(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const notification = createElement('div', {
        className: `notification ${type}`,
        ref: (el: HTMLElement) => {
            Object.assign(el.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                zIndex: '10000',
                maxWidth: '300px',
                transform: 'translateX(100%) scale(0.8)',
                opacity: '0'
            });

            if (type === 'success') {
                el.style.backgroundColor = '#22c55e';
            } else if (type === 'error') {
                el.style.backgroundColor = '#ef4444';
            } else {
                el.style.backgroundColor = '#3b82f6';
            }

            animate(el, {
                opacity: [0, 1],
                transform: ['translateX(100%) scale(0.8)', 'translateX(0) scale(1)'],
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            setTimeout(() => {
                animate(el, {
                    opacity: [1, 0],
                    transform: ['translateX(0) scale(1)', 'translateX(100%) scale(0.8)'],
                    duration: 300,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    onComplete: () => {
                        if (el.parentNode) {
                            el.remove();
                        }
                    }
                });
            }, 3000);
        }
    }, message);
    
    document.body.appendChild(notification);
}

// Theme effect
effect(() => {
    const theme = themeStore();
    document.body.setAttribute('data-theme', theme);
    document.body.className = `${theme}-theme`;
    localStorage.setItem('singular-theme', theme);
    
    // Update sticky logo theme
    stickyLogoManager.updateTheme(theme);
});

// Todo interface (keeping existing)
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

// Enhanced Framework Class with ALL Features
class SingularFramework {
    private state: {
        todos: ReturnType<typeof useState<Todo[]>>;
    };

    constructor() {
        this.state = {
            todos: useState<Todo[]>([])
        };
        this.init();
    }

    private init(): void {
        this.renderComponents();
        this.bindEvents();
        this.setupEntranceAnimations();
        showNotification('Singular Framework with Enhanced Sticky Logo initialized!', 'success');
    }

    private renderComponents(): void {
        // Render logo with sticky functionality
        const logoContainer = document.getElementById('logo-container');
        if (logoContainer) {
            render(LogoWithSticky(), logoContainer);
        }

        // Render theme switcher
        const themeSwitcherContainer = document.getElementById('theme-switcher-container');
        if (themeSwitcherContainer) {
            render(ThemeSwitcher(), themeSwitcherContainer);
        }

        // Render counter
        const counterContainer = document.getElementById('counter-container');
        if (counterContainer) {
            render(CounterComponent(), counterContainer);
        }

        // Render animation demos
        const animationDemoContainer = document.getElementById('animation-demo-container');
        if (animationDemoContainer) {
            render(AnimationDemos(), animationDemoContainer);
        }
    }

    private bindEvents(): void {
        document.getElementById('add-todo')?.addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('todo-input')?.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    private setupEntranceAnimations(): void {
        setTimeout(() => {
            // Staggered entrance animations for components
            const sections = document.querySelectorAll('.demo-section');
            sections.forEach((section, index) => {
                animate(section as HTMLElement, {
                    opacity: [0, 1],
                    transform: ['translateY(30px) scale(0.9)', 'translateY(0) scale(1)'],
                    duration: 600,
                    delay: index * 150,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                });
            });
        }, 100);
    }

    // Todo methods (keeping existing functionality)
    private addTodo(): void {
        const input = document.getElementById('todo-input') as HTMLInputElement;
        if (!input) return;
        
        const text = input.value.trim();
        
        if (text) {
            const currentTodos = this.state.todos();
            const newTodo: Todo = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            this.state.todos.set([...currentTodos, newTodo]);
            input.value = '';
            this.renderTodos();
            showNotification('Todo added successfully!', 'success');
        }
    }

    public toggleTodo(id: number): void {
        const currentTodos = this.state.todos();
        const updatedTodos = currentTodos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        
        this.state.todos.set(updatedTodos);
        this.renderTodos();
        
        const todo = updatedTodos.find(t => t.id === id);
        if (todo) {
            showNotification(todo.completed ? 'Todo completed!' : 'Todo uncompleted!', 'info');
        }
    }

    public deleteTodo(id: number): void {
        const currentTodos = this.state.todos();
        const filteredTodos = currentTodos.filter(t => t.id !== id);
        
        this.state.todos.set(filteredTodos);
        this.renderTodos();
        showNotification('Todo deleted!', 'error');
    }

    private renderTodos(): void {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;
        
        todoList.innerHTML = '';
        const todos = this.state.todos();

        todos.forEach(todo => {
            const todoElement = createElement('li', {
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 250,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: ['translateX(0)', 'translateX(8px)'],
                        borderColor: [
                            'rgba(196, 255, 77, 0.1)',
                            'rgba(196, 255, 77, 0.3)'
                        ],
                        reverseOnLeave: true
                    });
                }
            },
                createElement('span', { className: 'todo-text' }, todo.text),
                createElement('div', { className: 'todo-actions' },
                    createElement('button', {
                        className: 'btn btn-sm secondary',
                        onclick: () => this.toggleTodo(todo.id)
                    }, todo.completed ? 'Undo' : 'Complete'),
                    createElement('button', {
                        className: 'btn btn-sm secondary',
                        onclick: () => this.deleteTodo(todo.id)
                    }, 'Delete')
                )
            );
            
            todoList.appendChild(todoElement);
        });
    }
}

// Initialize the main application with ALL features
const container = document.getElementById('app');
if (container) {
    render(App(), container);
}

// Initialize framework functionality with ALL advanced features
let app: SingularFramework;
document.addEventListener('DOMContentLoaded', () => {
    app = new SingularFramework();
    
    // Make ALL functions globally available
    (window as any).app = app;
    (window as any).themeStore = themeStore;
    (window as any).showNotification = showNotification;
    (window as any).animate = animate;
    (window as any).animateOnHover = animateOnHover;
    (window as any).animateMove = animateMove;
    (window as any).animateResize = animateResize;
    (window as any).stickToViewport = stickToViewport;
    (window as any).createAdvancedStickyLogo = createAdvancedStickyLogo;
    (window as any).stickyLogoManager = stickyLogoManager;
});

// Export ALL enhanced features
export { 
    themeStore, 
    showNotification, 
    SingularFramework,
    animateOnHover,
    animateMove,
    animateResize,
    stickToViewport,
    createAdvancedStickyLogo,
    stickyLogoManager
};
