// src/script.js - Complete Singular Framework Counter App

// Import from your organized Singular framework
import { 
  render, 
  animate, 
  useState, 
  effect, 
  createElement,
  animateOnHover,
  animateMove,
  animateResize,
  animateSequence,
  animateLoop,
  fadeIn,
  fadeOut,
  slideIn,
  bounce,
  stickToViewport
} from 'singular-core';

// Import sticky logo manager
import { stickyLogoManager } from 'singular-core';

// ===== GLOBAL STATE DECLARATIONS =====
const [getTheme, setTheme] = useState(getInitialTheme());
const [getCount, setCount] = useState(0);
const [getTodos, setTodos] = useState([]);
const [getInputValue, setInputValue] = useState('');

// ===== UTILITY FUNCTIONS =====
function getInitialTheme() {
  const saved = localStorage.getItem('singular-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 3000) {
  const notification = createElement('div', {
    className: `notification ${type}`,
    style: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      zIndex: '10000',
      transform: 'translateX(100%) scale(0.8)',
      opacity: '0',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: type === 'success' ? 'linear-gradient(135deg, #C4FF4D 0%, #a7e633 100%)' :
                 type === 'error' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' :
                 type === 'info' ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' :
                 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      color: type === 'success' || type === 'warning' ? '#1B1B1B' : '#ffffff',
      boxShadow: `0 0 20px ${
        type === 'success' ? 'rgba(196, 255, 77, 0.4)' :
        type === 'error' ? 'rgba(255, 107, 107, 0.4)' :
        type === 'info' ? 'rgba(116, 185, 255, 0.4)' :
        'rgba(253, 203, 110, 0.4)'
      }`
    }
  }, message);

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    animate(notification, {
      transform: ['translateX(100%) scale(0.8)', 'translateX(0) scale(1)'],
      opacity: ['0', '1'],
      duration: 400,
      easing: 'easeOutCubic'
    });
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    animate(notification, {
      transform: ['translateX(0) scale(1)', 'translateX(100%) scale(0.8)'],
      opacity: ['1', '0'],
      duration: 300,
      easing: 'easeInCubic',
      onComplete: () => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }
    });
  }, duration);
}

// ===== COMPONENT DEFINITIONS =====

// Enhanced Logo Component with Sticky Functionality
function LogoWithSticky() {
  return createElement('div', { className: 'logo-container' },
    createElement('img', {
      id: 'main-logo',
      src: 'logo.png',
      alt: 'Singular Framework Logo',
      className: 'logo',
      ref: (el) => {
        if (!el) return;

        // Main logo hover animation
        animateOnHover(el, {
          duration: 400,
          easing: 'easeOutCubic',
          transform: ['scale(1)', 'scale(1.05) rotate(1deg)'],
          reverseOnLeave: true
        });

        // Initialize sticky logo with delay to ensure DOM is ready
        setTimeout(() => {
          const logoEl = document.getElementById('main-logo');
          if (logoEl) {
            const stickyInstance = stickyLogoManager.initializeStickyLogo('#main-logo', {
              floatingSize: '50px',
              position: { top: '15px', left: '20px' },
              scrollThreshold: 100,
              hoverAnimation: true,
              styles: {
                borderRadius: '12px',
                border: '2px solid rgba(196, 255, 77, 0.2)',
                background: 'rgba(27, 27, 27, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '6px'
              },
              onShow: () => showNotification('Sticky logo activated!', 'info'),
              onHide: () => console.log('Sticky logo hidden')
            });

            // Update theme when it changes
            effect(() => {
              const theme = getTheme();
              stickyLogoManager.updateTheme(theme);
              document.body.setAttribute('data-theme', theme);
              document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
              localStorage.setItem('singular-theme', theme);
            });
          } else {
            console.warn('Logo element not found for sticky functionality');
          }
        }, 100);
      }
    })
  );
}

// Enhanced Theme Switcher
function ThemeSwitcher() {
  return createElement('div', { className: 'theme-switcher' },
    createElement('span', {}, 'Theme:'),
    createElement('button', {
      className: 'btn btn-sm',
      ref: (el) => {
        if (el) {
          animateOnHover(el, {
            duration: 200,
            easing: 'easeOutCubic',
            transform: ['scale(1)', 'scale(1.08)'],
            reverseOnLeave: true
          });
        }
      },
      onclick: () => {
        const newTheme = getTheme() === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        showNotification(`Switched to ${newTheme} theme!`, 'success');
      }
    }, () => getTheme() === 'light' ? '🌙 Dark' : '☀️ Light')
  );
}

// Enhanced Counter Component
function CounterComponent() {
  return createElement('div', { className: 'counter-demo' },
    // Counter Display
    createElement('div', {
      className: 'counter-display',
      id: 'counter-display',
      ref: (el) => {
        if (el) {
          animateOnHover(el, {
            duration: 300,
            easing: 'easeOutCubic',
            transform: ['scale(1)', 'scale(1.05)'],
            reverseOnLeave: true
          });
        }
      }
    }, () => getCount().toString()),
    
    // Counter Controls
    createElement('div', { className: 'counter-controls' },
      createElement('button', {
        className: 'btn increment-btn',
        ref: (el) => {
          if (el) {
            animateOnHover(el, {
              duration: 200,
              easing: 'easeOutCubic',
              transform: ['translateY(0)', 'translateY(-2px)'],
              reverseOnLeave: true
            });
          }
        },
        onclick: () => {
          const newValue = getCount() + 1;
          setCount(newValue);
          
          // Animate counter display
          const display = document.getElementById('counter-display');
          if (display) {
            animateSequence(display, [
              {
                transform: ['scale(1)', 'scale(1.2)'],
                duration: 150,
                easing: 'easeOutCubic'
              },
              {
                transform: ['scale(1.2)', 'scale(1)'],
                duration: 150,
                easing: 'easeInCubic'
              }
            ]);
          }
          
          showNotification('Counter incremented!', 'success');
        }
      }, '+ Increment'),
      
      createElement('button', {
        className: 'btn decrement-btn', 
        ref: (el) => {
          if (el) {
            animateOnHover(el, {
              duration: 200,
              easing: 'easeOutCubic',
              transform: ['translateY(0)', 'translateY(-2px)'],
              reverseOnLeave: true
            });
          }
        },
        onclick: () => {
          const newValue = getCount() - 1;
          setCount(newValue);
          
          const display = document.getElementById('counter-display');
          if (display) {
            animateSequence(display, [
              {
                transform: ['scale(1)', 'scale(0.8)'],
                duration: 150,
                easing: 'easeOutCubic'
              },
              {
                transform: ['scale(0.8)', 'scale(1)'],
                duration: 150,
                easing: 'easeOutBack'
              }
            ]);
          }
          
          showNotification('Counter decremented!', 'info');
        }
      }, '- Decrement'),
      
      createElement('button', {
        className: 'btn secondary reset-btn',
        ref: (el) => {
          if (el) {
            animateOnHover(el, {
              duration: 250,
              easing: 'easeOutCubic',
              transform: ['scale(1)', 'scale(1.03)'],
              reverseOnLeave: true
            });
          }
        },
        onclick: () => {
          setCount(0);
          
          const display = document.getElementById('counter-display');
          if (display) {
            animate(display, {
              transform: ['rotate(0deg)', 'rotate(360deg)'],
              duration: 500,
              easing: 'easeInOutCubic'
            });
          }
          
          showNotification('Counter reset!', 'warning');
        }
      }, 'Reset'),
      
      createElement('button', {
        className: 'btn secondary',
        onclick: () => {
          const display = document.getElementById('counter-display');
          if (display) {
            bounce(display, 15, 800);
            showNotification('Counter animated!', 'info');
          }
        }
      }, 'Animate Counter')
    )
  );
}

// Enhanced Animation Demos
function AnimationDemos() {
  return createElement('div', { className: 'animation-demos' },
    // Loop Demo
    createElement('div', {
      className: 'demo-box',
      id: 'loop-demo',
      ref: (el) => {
        if (el) {
          el.textContent = 'Loop Animation';
          
          // Start continuous loop animation
          animateLoop(el, {
            transform: ['scale(1)', 'scale(1.1)'],
            duration: 1000,
            easing: 'easeInOutQuad',
            iterations: Infinity,
            direction: 'alternate'
          });
        }
      }
    }),
    
    // Click Demo
    createElement('div', {
      className: 'demo-box',
      id: 'click-demo',
      ref: (el) => {
        if (el) {
          el.textContent = 'Click Me!';
          
          animateOnHover(el, {
            duration: 200,
            transform: ['scale(1)', 'scale(1.05)'],
            reverseOnLeave: true
          });
          
          el.onclick = () => {
            animateSequence(el, [
              {
                transform: ['rotate(0deg)', 'rotate(180deg)'],
                backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.3)'],
                duration: 300,
                easing: 'easeOutCubic'
              },
              {
                transform: ['rotate(180deg)', 'rotate(360deg)'],
                backgroundColor: ['rgba(196, 255, 77, 0.3)', 'rgba(42, 42, 42, 0.8)'],
                duration: 300,
                easing: 'easeInCubic'
              }
            ]);
            
            showNotification('Click animation triggered!', 'success');
          };
        }
      }
    }),
    
    // Sequence Demo
    createElement('div', {
      className: 'demo-box',
      id: 'sequence-demo',
      ref: (el) => {
        if (el) {
          el.textContent = 'Sequence Demo';
          
          // Auto-start sequence animation
          setTimeout(() => {
            animateSequence(el, [
              {
                transform: ['translateX(0)', 'translateX(50px)'],
                duration: 500,
                easing: 'easeOutCubic'
              },
              {
                transform: ['translateX(50px)', 'translateX(0)'],
                backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.2)'],
                duration: 500,
                easing: 'easeInCubic'
              },
              {
                backgroundColor: ['rgba(196, 255, 77, 0.2)', 'rgba(42, 42, 42, 0.8)'],
                duration: 300,
                easing: 'linear'
              }
            ]);
          }, 1000);
        }
      }
    })
  );
}

// Enhanced Todo Component
function TodoComponent() {
  const addTodo = () => {
    const text = getInputValue().trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };

    setTodos([...getTodos(), newTodo]);
    setInputValue('');
    showNotification('Todo added successfully!', 'success');
  };

  const toggleTodo = (id) => {
    setTodos(getTodos().map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(getTodos().filter(todo => todo.id !== id));
    showNotification('Todo removed!', 'info');
  };

  return createElement('div', { className: 'todo-demo' },
    createElement('div', { className: 'todo-input-container' },
      createElement('input', {
        type: 'text',
        className: 'todo-input',
        placeholder: 'Enter a new task...',
        value: () => getInputValue(),
        oninput: (e) => setInputValue(e.target.value),
        onkeypress: (e) => {
          if (e.key === 'Enter') addTodo();
        }
      }),
      createElement('button', {
        className: 'btn',
        onclick: addTodo
      }, 'Add Todo'),
      createElement('button', {
        className: 'btn secondary',
        onclick: () => {
          const todoItems = document.querySelectorAll('.todo-item');
          todoItems.forEach((item, index) => {
            setTimeout(() => {
              bounce(item, 10, 400);
            }, index * 100);
          });
          showNotification('All todos animated!', 'info');
        }
      }, 'Animate All')
    ),
    
    createElement('ul', { className: 'todo-list' },
      () => {
        const todos = getTodos();
        return todos.length === 0
          ? [createElement('li', { className: 'todo-empty' }, 'No todos yet. Add one above!')]
          : todos.map(todo =>
              createElement('li', {
                key: todo.id,
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                ref: (el) => {
                  if (el && !el.dataset.animated) {
                    el.dataset.animated = 'true';
                    slideIn(el, 'down', 300);
                  }
                }
              },
                createElement('span', {
                  className: 'todo-text',
                  onclick: () => toggleTodo(todo.id)
                }, todo.text),
                createElement('div', { className: 'todo-actions' },
                  createElement('button', {
                    className: 'btn btn-sm secondary',
                    onclick: () => toggleTodo(todo.id)
                  }, todo.completed ? 'Undo' : 'Done'),
                  createElement('button', {
                    className: 'btn btn-sm',
                    onclick: () => {
                      const item = el.closest('.todo-item');
                      if (item) {
                        fadeOut(item, 300);
                        setTimeout(() => removeTodo(todo.id), 300);
                      }
                    }
                  }, 'Remove')
                )
              )
            );
      }
    )
  );
}

// Status Bar Component
function StatusBar() {
  return createElement('div', {
    className: 'status-bar',
    id: 'status'
  }, () => `Counter: ${getCount()} | Todos: ${getTodos().length} | Theme: ${getTheme()} | Animations: Active`);
}

// Feature Cards Component
function FeatureCards() {
  const features = [
    {
      title: '⚡ Lightning Fast',
      description: 'Built with performance in mind using modern web standards with advanced animations'
    },
    {
      title: '🎨 Modern Design',
      description: 'Beautiful, responsive components with smooth animations and effects'
    },
    {
      title: '🔧 Developer Friendly',
      description: 'Simple API with TypeScript support and comprehensive animation system'
    }
  ];

  return createElement('div', { className: 'features' },
    ...features.map(feature =>
      createElement('div', {
        className: 'feature-card',
        ref: (el) => {
          if (el) {
            animateOnHover(el, {
              duration: 300,
              transform: ['translateY(0)', 'translateY(-5px)'],
              reverseOnLeave: true
            });
          }
        }
      },
        createElement('h3', {}, feature.title),
        createElement('p', {}, feature.description)
      )
    )
  );
}

// Animation Controls Component
function AnimationControls() {
  return createElement('div', { className: 'animation-controls' },
    createElement('button', {
      className: 'btn',
      onclick: () => {
        const loopDemo = document.getElementById('loop-demo');
        if (loopDemo) {
          animateLoop(loopDemo, {
            transform: ['rotate(0deg)', 'rotate(360deg)'],
            duration: 1000,
            iterations: 3,
            easing: 'linear'
          });
          showNotification('Loop demo started!', 'info');
        }
      }
    }, 'Start Loop Demo'),
    
    createElement('button', {
      className: 'btn secondary',
      onclick: () => {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            animate(card, {
              transform: ['translateY(0)', 'translateY(-10px)'],
              duration: 300,
              easing: 'easeOutCubic',
              onComplete: () => {
                animate(card, {
                  transform: ['translateY(-10px)', 'translateY(0)'],
                  duration: 300,
                  easing: 'easeInCubic'
                });
              }
            });
          }, index * 100);
        });
        showNotification('Cards animated!', 'success');
      }
    }, 'Stagger Cards'),
    
    createElement('button', {
      className: 'btn secondary',
      onclick: () => {
        const demoBoxes = document.querySelectorAll('.demo-box');
        demoBoxes.forEach((box, index) => {
          setTimeout(() => {
            animateSequence(box, [
              {
                transform: ['scale(1)', 'scale(1.2)'],
                duration: 200,
                easing: 'easeOutCubic'
              },
              {
                transform: ['scale(1.2)', 'scale(1)'],
                backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.3)'],
                duration: 300,
                easing: 'easeInCubic'
              },
              {
                backgroundColor: ['rgba(196, 255, 77, 0.3)', 'rgba(42, 42, 42, 0.8)'],
                duration: 200,
                easing: 'linear'
              }
            ]);
          }, index * 150);
        });
        showNotification('Sequence demo started!', 'info');
      }
    }, 'Chain Animation'),
    
    createElement('button', {
      className: 'btn secondary',
      onclick: () => {
        const timeline = createTimeline()
          .add(document.getElementById('counter-display'), {
            transform: ['scale(1)', 'scale(1.3)'],
            duration: 400,
            easing: 'easeOutCubic'
          }, 0)
          .add(document.getElementById('counter-display'), {
            transform: ['scale(1.3)', 'scale(1)'],
            duration: 400,
            easing: 'easeInCubic'
          }, 500)
          .add(document.querySelectorAll('.demo-box')[0], {
            transform: ['rotate(0deg)', 'rotate(360deg)'],
            duration: 600,
            easing: 'linear'
          }, 200);
        
        timeline.play();
        showNotification('Timeline animation started!', 'info');
      }
    }, 'Timeline Demo')
  );
}

// Main App Component
function App() {
  return createElement('div', { className: 'app' },
    // Spacer
    createElement('div', { style: { height: '10vh' } }),
    
    // Logo with sticky functionality
    LogoWithSticky(),
    
    // Header
    createElement('header', { className: 'header' },
      createElement('h1', {}, 'Singular Framework'),
      createElement('p', {}, 'Advanced Animation System with Loops, Sequences, and Interactions'),
      ThemeSwitcher()
    ),
    
    // Animation Controls
    AnimationControls(),
    
    // Spacer
    createElement('div', { style: { height: '15vh' } }),
    
    // Features Grid
    FeatureCards(),
    
    // Spacer
    createElement('div', { style: { height: '20vh' } }),
    
    // Counter Demo Section
    createElement('section', { className: 'demo-section' },
      createElement('h2', {}, 'Interactive Counter with Advanced Animations'),
      createElement('p', {}, 'Experience looping, click-triggered, and chained animations'),
      CounterComponent(),
      StatusBar(),
      AnimationDemos()
    ),
    
    // Spacer
    createElement('div', { style: { height: '20vh' } }),
    
    // Todo Demo Section
    createElement('section', { className: 'demo-section' },
      createElement('h2', {}, 'Todo Application with Animation Effects'),
      createElement('p', {}, 'Todos animate in with staggered effects and smooth interactions'),
      TodoComponent()
    ),
    
    // Bottom spacer
    createElement('div', { style: { height: '10vh' } })
  );
}

// ===== APPLICATION INITIALIZATION =====
function initApp() {
  console.log('🚀 Singular Framework initializing...');
  
  const container = document.querySelector('.app');
  console.log('🎯 Container found:', !!container);
  
  if (container) {
    // Clear container
    container.innerHTML = '';
    
    // Initialize theme
    const theme = getTheme();
    document.body.setAttribute('data-theme', theme);
    document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    
    // Render the app
    render(App(), container);
    
    console.log('✅ Singular Framework app rendered successfully');
    showNotification('Singular Framework loaded successfully!', 'success');
  } else {
    console.error('❌ Container .app not found!');
    document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">Error: App container not found!</h1>';
  }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging and external access
window.SingularApp = {
  // State getters/setters
  getTheme,
  setTheme,
  getCount,
  setCount,
  getTodos,
  setTodos,
  
  // Utilities
  showNotification,
  stickyLogoManager,
  
  // Reinitialize function
  reinit: initApp
};

console.log('🎯 Script loaded, waiting for DOM...');
