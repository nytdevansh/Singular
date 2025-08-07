import { render, animate, useState, effect, createElement } from 'singular-core';
import { animateOnHover } from 'singular-core/animate';
import { App } from './App';
console.log("🔁 Singular v1.0.0-alpha with animations loaded");
// Theme Store - Global reactive state for theme management
const themeStore = useState<'light' | 'dark'>(getInitialTheme());

// Helper function to get initial theme
function getInitialTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem('singular-theme');
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    
    return 'dark'; // Default to dark theme
}

// Enhanced Theme Switcher Component with Hover Animation
function ThemeSwitcher() {
    return createElement('div', { className: 'theme-switcher' },
        createElement('span', {}, 'Theme:'),
        createElement('button', {
            className: 'btn btn-sm theme-btn',
            ref: (el: HTMLElement) => {
                // Add hover animation to theme button
                animateOnHover(el, {
                    duration: 200,
                    easing: 'easeOutCubic',
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
                showNotification(`Switched to ${newTheme} theme!`, 'info');
            }
        }, () => themeStore() === 'light' ? '🌙 Dark' : '☀️ Light')
    );
}

// Enhanced Counter Component with Hover Animations
function CounterComponent() {
    const counter = useState(0);
    
    return createElement('div', { className: 'counter-demo' },
        createElement('div', {
            className: 'counter-display',
            ref: (el: HTMLElement) => {
                // Animate counter display on hover
                animateOnHover(el, {
                    duration: 300,
                    easing: 'easeOutCubic',
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
                        easing: 'easeOutCubic',
                        transform: ['translateY(0)', 'translateY(-2px)'],
                        boxShadow: [
                            '0 4px 16px rgba(196, 255, 77, 0.3)',
                            '0 8px 24px rgba(196, 255, 77, 0.4)'
                        ],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    counter.set(counter() + 1);
                    showNotification('Counter incremented!', 'info');
                }
            }, '+ Increment'),
            
            createElement('button', {
                className: 'btn decrement-btn',
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 200,
                        easing: 'easeOutCubic',
                        transform: ['translateY(0)', 'translateY(-2px)'],
                        boxShadow: [
                            '0 4px 16px rgba(196, 255, 77, 0.3)',
                            '0 8px 24px rgba(196, 255, 77, 0.4)'
                        ],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    counter.set(counter() - 1);
                    showNotification('Counter decremented!', 'info');
                }
            }, '- Decrement'),
            
            createElement('button', {
                className: 'btn secondary reset-btn',
                ref: (el: HTMLElement) => {
                    animateOnHover(el, {
                        duration: 250,
                        easing: 'easeOutCubic',
                        transform: ['scale(1)', 'scale(1.03)'],
                        opacity: [0.9, 1],
                        reverseOnLeave: true
                    });
                },
                onclick: () => {
                    counter.set(0);
                    showNotification('Counter reset!', 'info');
                }
            }, 'Reset')
        )
    );
}

// Enhanced Feature Card Component
function FeatureCard(title: string, description: string, icon: string) {
    return createElement('div', {
        className: 'feature-card',
        ref: (el: HTMLElement) => {
            // Advanced hover animation for feature cards
            animateOnHover(el, {
                duration: 400,
                easing: 'easeOutCubic',
                transform: ['translateY(0) scale(1)', 'translateY(-12px) scale(1.02)'],
                boxShadow: [
                    '0 8px 32px rgba(0, 0, 0, 0.2)',
                    '0 20px 60px rgba(196, 255, 77, 0.15)'
                ],
                borderColor: [
                    'rgba(196, 255, 77, 0.15)',
                    'rgba(196, 255, 77, 0.4)'
                ],
                reverseOnLeave: true
            });
        }
    },
        createElement('h3', {}, `${icon} ${title}`),
        createElement('p', {}, description)
    );
}

// Notification System
function showNotification(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const notification = createElement('div', {
        className: `notification ${type}`,
        ref: (el: HTMLElement) => {
            // Animate notification entrance
            animate(el, {
                opacity: [0, 1],
                transform: ['translateX(100%) scale(0.8)', 'translateX(0) scale(1)'],
                duration: 400,
                easing: 'easeOutCubic'
            });
            
            // Auto-remove with exit animation
            setTimeout(() => {
                animate(el, {
                    opacity: [1, 0],
                    transform: ['translateX(0) scale(1)', 'translateX(100%) scale(0.8)'],
                    duration: 300,
                    easing: 'easeInCubic'
                }).then(() => {
                    if (el.parentNode) {
                        el.remove();
                    }
                });
            }, 3000);
        }
    }, message);
    
    document.body.appendChild(notification);
}

// Theme effect - applies theme changes to DOM
effect(() => {
    const theme = themeStore();
    document.body.setAttribute('data-theme', theme);
    document.body.className = `${theme}-theme`;
    localStorage.setItem('singular-theme', theme);
});

// Enhanced Framework Class with animateOnHover
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
        showNotification('Singular Framework initialized!', 'success');
    }

    private renderComponents(): void {
        // Render theme switcher
        const themeSwitcherContainer = document.getElementById('theme-switcher-container');
        if (themeSwitcherContainer) {
            themeSwitcherContainer.appendChild(ThemeSwitcher());
        }

        // Render counter
        const counterContainer = document.getElementById('counter-container');
        if (counterContainer) {
            counterContainer.appendChild(CounterComponent());
        }

        // Render feature cards with hover animations
        const featuresContainer = document.getElementById('features-container');
        if (featuresContainer) {
            const features = [
                { title: 'Lightning Fast', icon: '⚡', desc: 'Built with performance in mind using modern web standards' },
                { title: 'Modern Design', icon: '🎨', desc: 'Beautiful, responsive components with smooth animations' },
                { title: 'Developer Friendly', icon: '🔧', desc: 'Simple API with TypeScript support and great DX' }
            ];
            
            features.forEach(feature => {
                featuresContainer.appendChild(
                    FeatureCard(feature.title, feature.desc, feature.icon)
                );
            });
        }
    }

    private bindEvents(): void {
        // Todo functionality
        document.getElementById('add-todo')?.addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('todo-input')?.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

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
                    // Add hover animation to todo items
                    animateOnHover(el, {
                        duration: 250,
                        easing: 'easeOutCubic',
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
                        ref: (el: HTMLElement) => {
                            animateOnHover(el, {
                                duration: 150,
                                easing: 'easeOutCubic',
                                transform: ['scale(1)', 'scale(1.05)'],
                                reverseOnLeave: true
                            });
                        },
                        onclick: () => this.toggleTodo(todo.id)
                    }, todo.completed ? 'Undo' : 'Complete'),
                    createElement('button', {
                        className: 'btn btn-sm secondary',
                        ref: (el: HTMLElement) => {
                            animateOnHover(el, {
                                duration: 150,
                                easing: 'easeOutCubic',
                                transform: ['scale(1)', 'scale(1.05)'],
                                reverseOnLeave: true
                            });
                        },
                        onclick: () => this.deleteTodo(todo.id)
                    }, 'Delete')
                )
            );
            
            todoList.appendChild(todoElement);
        });
    }
}

// Todo interface for TypeScript
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

// Initialize the main application
const container = document.getElementById('app');
if (container) {
    render(App(), container);
}

// Initialize framework functionality
let app: SingularFramework;
document.addEventListener('DOMContentLoaded', () => {
    app = new SingularFramework();
    
    // Make functions globally available
    (window as any).app = app;
    (window as any).themeStore = themeStore;
    (window as any).showNotification = showNotification;
});

// Enhanced entrance animations with staggered effect
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Animate feature cards entrance
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            animate(card as HTMLElement, {
                opacity: [0, 1],
                transform: ['translateY(30px) scale(0.9)', 'translateY(0) scale(1)'],
                duration: 600,
                delay: index * 150,
                easing: 'easeOutCubic'
            });
        });

        // Animate demo sections entrance
        const demoSections = document.querySelectorAll('.demo-section');
        demoSections.forEach((section, index) => {
            animate(section as HTMLElement, {
                opacity: [0, 1],
                transform: ['scale(0.95) translateY(20px)', 'scale(1) translateY(0)'],
                duration: 800,
                delay: 300 + index * 200,
                easing: 'easeOutCubic'
            });
        });
    }, 100);
});

// Export for module usage
export { themeStore, showNotification, SingularFramework };
