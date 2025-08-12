// src/main.ts - Complete Fixed Singular Framework

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

// ===== APPLICATION STATE =====
const [getTheme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
const [getCount, setCount] = useState(0);
const [getTodos, setTodos] = useState<Todo[]>([]);
const [getInputValue, setInputValue] = useState('');
const [getStickyEnabled, setStickyEnabled] = useState(false);

// ===== TYPES =====
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Global variables for animation controls
let loopAnimationControl: any = null;
let stickyLogoControl: any = null;
let currentStickyElement: any = null;

// ===== UTILITY FUNCTIONS =====
function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('singular-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function showNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration = 3000) {
  const notification = createElement('div', {
    className: `notification ${type}`,
    style: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      zIndex: '10000',
      transform: 'translateX(100%) scale(0.8)',
      opacity: '0',
      background: type === 'success' ? 'linear-gradient(135deg, #C4FF4D 0%, #a7e633 100%)' :
                 type === 'error' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' :
                 type === 'info' ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' :
                 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      color: type === 'success' || type === 'warning' ? '#1B1B1B' : '#ffffff'
    }
  }, message);

  document.body.appendChild(notification);
  fadeIn(notification, 400);
  
  setTimeout(() => {
    fadeOut(notification, 300);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// ===== STICKY LOGO FUNCTIONALITY =====
function createStickyLogo() {
  const mainLogo = document.getElementById('main-logo');
  if (!mainLogo || stickyLogoControl) return;

  const floatingLogo = createElement('img', {
    id: 'floating-logo',
    src: 'logo.png',
    alt: 'Singular Framework',
    style: {
      position: 'fixed',
      top: '15px',
      left: '20px',
      width: '50px',
      height: 'auto',
      zIndex: '1000',
      opacity: '0',
      transform: 'scale(0.5) translateX(-100px)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(196, 255, 77, 0.3)',
      cursor: 'pointer',
      border: '2px solid rgba(196, 255, 77, 0.2)',
      background: 'rgba(27, 27, 27, 0.9)',
      backdropFilter: 'blur(10px)',
      padding: '6px',
      pointerEvents: 'auto'
    },
    onclick: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      animate(floatingLogo, {
        transform: ['scale(1)', 'scale(1.2)'],
        duration: 150,
        easing: 'easeOutCubic',
        onComplete: () => {
          animate(floatingLogo, {
            transform: ['scale(1.2)', 'scale(1)'],
            duration: 150,
            easing: 'easeInCubic'
          });
        }
      });
      
      showNotification('Scrolled to top!', 'info');
    },
    ref: (el: HTMLElement) => {
      if (el) {
        animateOnHover(el, {
          duration: 200,
          transform: ['scale(1)', 'scale(1.08)'],
          reverseOnLeave: true
        });
      }
    }
  });

  document.body.appendChild(floatingLogo);

  let lastScrollY = window.scrollY;
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100 && !getStickyEnabled()) {
      setStickyEnabled(true);
      floatingLogo.style.opacity = '1';
      floatingLogo.style.transform = 'scale(1) translateX(0)';
      floatingLogo.classList.add('show');
    } else if (currentScrollY <= 100 && getStickyEnabled()) {
      setStickyEnabled(false);
      floatingLogo.style.opacity = '0';
      floatingLogo.style.transform = 'scale(0.5) translateX(-100px)';
      floatingLogo.classList.remove('show');
    }
    
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return {
    destroy: () => {
      window.removeEventListener('scroll', handleScroll);
      if (document.body.contains(floatingLogo)) {
        document.body.removeChild(floatingLogo);
      }
      stickyLogoControl = null;
    }
  };
}

function toggleStickyLogo() {
  if (stickyLogoControl) {
    stickyLogoControl.destroy();
    stickyLogoControl = null;
    setStickyEnabled(false);
    showNotification('Sticky logo disabled!', 'info');
  } else {
    stickyLogoControl = createStickyLogo();
    showNotification('Sticky logo enabled! Scroll to test.', 'success');
  }
}

// ===== COMPONENTS =====

function LogoComponent() {
  return createElement('div', { className: 'logo-container' },
    createElement('img', {
      id: 'main-logo',
      src: 'logo.png',
      alt: 'Singular Framework Logo',
      className: 'logo',
      ref: (el: HTMLElement) => {
        if (el) {
          slideIn(el, 'down', 600);
          animateOnHover(el, {
            duration: 400,
            easing: 'easeOutCubic',
            transform: ['scale(1)', 'scale(1.05)'],
            filter: [
              'drop-shadow(0 0 15px rgba(196, 255, 77, 0.3))',
              'drop-shadow(0 0 25px rgba(196, 255, 77, 0.5))'
            ],
            reverseOnLeave: true
          });
        }
      }
    })
  );
}

function ThemeSwitcher() {
  return createElement('div', { className: 'theme-switcher' },
    createElement('span', {}, 'Theme:'),
    createElement('button', {
      className: 'btn btn-sm',
      ref: (el: HTMLElement) => {
        if (el) {
          animateOnHover(el, {
            duration: 200,
            easing: 'easeOutCubic',
            transform: ['scale(1)', 'scale(1.05)'],
            reverseOnLeave: true
          });
        }
      },
      onclick: () => {
        const newTheme = getTheme() === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        const floatingLogo = document.getElementById('floating-logo');
        if (floatingLogo) {
          floatingLogo.style.background = newTheme === 'light' ? 
            'rgba(255, 255, 255, 0.9)' : 'rgba(27, 27, 27, 0.9)';
          floatingLogo.style.borderColor = newTheme === 'light' ? 
            'rgba(26, 26, 26, 0.2)' : 'rgba(196, 255, 77, 0.2)';
        }
        
        showNotification(`Switched to ${newTheme} theme!`, 'success');
      }
    }, () => getTheme() === 'light' ? '🌙 Dark' : '☀️ Light')
  );
}

function AnimationUtilitiesDemo() {
  return createElement('section', { className: 'animation-utilities-section' },
    createElement('h3', {}, 'Animation Utilities Demo'),
    createElement('p', {}, 'Fade, Slide, and Transform animations'),
    
    createElement('div', { className: 'animation-utilities' },
      createElement('button', {
        className: 'btn fade',
        onclick: () => {
          const target = document.getElementById('fade-target');
          if (target) {
            fadeIn(target, 600);
            showNotification('Fade In animation triggered!', 'info');
          }
        }
      }, 'Fade In'),
      
      createElement('button', {
        className: 'btn fade',
        onclick: () => {
          const target = document.getElementById('fade-target');
          if (target) {
            fadeOut(target, 600);
            setTimeout(() => target.style.opacity = '1', 700);
            showNotification('Fade Out animation triggered!', 'info');
          }
        }
      }, 'Fade Out'),
      
      createElement('button', {
        className: 'btn slide',
        onclick: () => {
          const target = document.getElementById('slide-target');
          if (target) {
            slideIn(target, 'up', 500);
            showNotification('Slide In ↑ triggered!', 'info');
          }
        }
      }, 'Slide In ↑'),
      
      createElement('button', {
        className: 'btn slide',
        onclick: () => {
          const target = document.getElementById('slide-target');
          if (target) {
            slideIn(target, 'down', 500);
            showNotification('Slide In ↓ triggered!', 'info');
          }
        }
      }, 'Slide In ↓'),
      
      createElement('button', {
        className: 'btn slide',
        onclick: () => {
          const target = document.getElementById('slide-target');
          if (target) {
            slideIn(target, 'left', 500);
            showNotification('Slide In ← triggered!', 'info');
          }
        }
      }, 'Slide In ←'),
      
      createElement('button', {
        className: 'btn slide',
        onclick: () => {
          const target = document.getElementById('slide-target');
          if (target) {
            slideIn(target, 'right', 500);
            showNotification('Slide In → triggered!', 'info');
          }
        }
      }, 'Slide In →')
    ),
    
    createElement('div', { className: 'animation-targets' },
      createElement('div', {
        className: 'demo-target',
        id: 'fade-target'
      }, 'Fade Target'),
      
      createElement('div', {
        className: 'demo-target',
        id: 'slide-target'
      }, 'Slide Target')
    )
  );
}

function AdvancedAnimationsDemo() {
  return createElement('section', { className: 'advanced-animations-section' },
    createElement('h3', {}, 'Advanced Animation Demos'),
    createElement('p', {}, 'Loop, Bounce, Resize, Move, and Sticky animations'),
    
    createElement('div', { className: 'advanced-animation-grid' },
      createElement('div', { className: 'animation-demo-card' },
        createElement('h4', {}, '🔄 Loop Animation'),
        createElement('div', {
          className: 'demo-target loop-target',
          id: 'loop-animation-target',
          ref: (el: HTMLElement) => {
            if (el) {
              el.textContent = 'Looping...';
              loopAnimationControl = animateLoop(el, {
                transform: ['scale(1)', 'scale(1.2)'],
                backgroundColor: ['rgba(116, 185, 255, 0.3)', 'rgba(116, 185, 255, 0.7)'],
                duration: 1000,
                iterations: Infinity,
                direction: 'alternate',
                easing: 'easeInOutQuad'
              });
            }
          }
        }),
        createElement('div', { className: 'demo-controls' },
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('loop-animation-target');
              if (target) {
                if (loopAnimationControl) {
                  loopAnimationControl.stop();
                }
                loopAnimationControl = animateLoop(target, {
                  transform: ['rotate(0deg)', 'rotate(360deg)'],
                  duration: 2000,
                  iterations: 3,
                  easing: 'linear'
                });
                showNotification('Loop animation restarted!', 'info');
              }
            }
          }, 'Restart Loop'),
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              if (loopAnimationControl) {
                loopAnimationControl.stop();
                showNotification('Loop animation stopped!', 'warning');
              }
            }
          }, 'Stop Loop')
        )
      ),
      
      createElement('div', { className: 'animation-demo-card' },
        createElement('h4', {}, '⬆️ Bounce Animation'),
        createElement('div', {
          className: 'demo-target bounce-target',
          id: 'bounce-animation-target',
          ref: (el: HTMLElement) => {
            if (el) {
              el.textContent = 'Click to Bounce!';
              el.onclick = () => {
                bounce(el, 15, 600);
                showNotification('Bounce triggered by click!', 'success');
              };
            }
          }
        }),
        createElement('div', { className: 'demo-controls' },
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('bounce-animation-target');
              if (target) {
                bounce(target, 20, 800);
                showNotification('Bounce animation triggered!', 'success');
              }
            }
          }, 'Bounce'),
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('bounce-animation-target');
              if (target) {
                bounce(target, 35, 1200);
                showNotification('Big bounce animation!', 'success');
              }
            }
          }, 'Big Bounce')
        )
      ),
      
      createElement('div', { className: 'animation-demo-card' },
        createElement('h4', {}, '↔️ Resize Animation'),
        createElement('div', {
          className: 'demo-target resize-target',
          id: 'resize-animation-target',
          ref: (el: HTMLElement) => {
            if (el) {
              el.textContent = 'Resize Me!';
              el.style.width = '120px';
              el.style.height = '60px';
            }
          }
        }),
        createElement('div', { className: 'demo-controls' },
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('resize-animation-target');
              if (target) {
                animateResize(target, {
                  width: ['120px', '200px'],
                  height: ['60px', '100px'],
                  duration: 600,
                  easing: 'easeInOutCubic'
                });
                showNotification('Resize grow animation!', 'info');
              }
            }
          }, 'Grow'),
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('resize-animation-target');
              if (target) {
                animateResize(target, {
                  width: ['200px', '120px'],
                  height: ['100px', '60px'],
                  duration: 600,
                  easing: 'easeInOutCubic'
                });
                showNotification('Resize shrink animation!', 'info');
              }
            }
          }, 'Shrink')
        )
      ),
      
      createElement('div', { className: 'animation-demo-card' },
        createElement('h4', {}, '🏃 Move Animation'),
        createElement('div', {
          className: 'demo-target move-target',
          id: 'move-animation-target',
          ref: (el: HTMLElement) => {
            if (el) {
              el.textContent = 'Move Me!';
            }
          }
        }),
        createElement('div', { className: 'demo-controls' },
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('move-animation-target');
              if (target) {
                animateSequence(target, [
                  { transform: ['translate(0, 0)', 'translate(30px, -20px)'], duration: 300, easing: 'easeOutCubic' },
                  { transform: ['translate(30px, -20px)', 'translate(0, -40px)'], duration: 300, easing: 'easeInOutCubic' },
                  { transform: ['translate(0, -40px)', 'translate(-30px, -20px)'], duration: 300, easing: 'easeInOutCubic' },
                  { transform: ['translate(-30px, -20px)', 'translate(0, 0)'], duration: 300, easing: 'easeInCubic' }
                ]);
                showNotification('Circle move animation!', 'info');
              }
            }
          }, 'Circle'),
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('move-animation-target');
              if (target) {
                const randomX = Math.random() * 60 - 30;
                const randomY = Math.random() * 60 - 30;
                animateMove(target, {
                  x: ['0px', `${randomX}px`],
                  y: ['0px', `${randomY}px`],
                  duration: 800,
                  easing: 'easeOutBack'
                });
                setTimeout(() => {
                  animateMove(target, {
                    x: [`${randomX}px`, '0px'],
                    y: [`${randomY}px`, '0px'],
                    duration: 800,
                    easing: 'easeInBack'
                  });
                }, 900);
                showNotification('Random move animation!', 'info');
              }
            }
          }, 'Random')
        )
      ),
      
      createElement('div', { className: 'animation-demo-card' },
        createElement('h4', {}, '📌 Sticky Demo'),
        createElement('div', {
          className: 'demo-target sticky-demo-element',
          id: 'sticky-demo-element',
          ref: (el: HTMLElement) => {
            if (el) {
              el.textContent = 'Sticky Element';
            }
          }
        }),
        createElement('div', { className: 'demo-controls' },
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              const target = document.getElementById('sticky-demo-element');
              if (target && !currentStickyElement) {
                currentStickyElement = stickToViewport(target, {
                  top: 100,
                  offset: 50,
                  smoothTransition: true,
                  onStick: () => showNotification('Element is now sticky!', 'info'),
                  onUnstick: () => showNotification('Element unstuck!', 'info')
                });
                showNotification('Sticky behavior enabled!', 'success');
              }
            }
          }, 'Make Sticky'),
          createElement('button', {
            className: 'btn-sm secondary',
            onclick: () => {
              if (currentStickyElement) {
                currentStickyElement.destroy();
                currentStickyElement = null;
                showNotification('Sticky behavior removed!', 'warning');
              }
            }
          }, 'Remove Sticky')
        )
      )
    )
  );
}

function CounterComponent() {
  return createElement('div', { className: 'counter-demo' },
    createElement('div', {
      className: 'counter-display',
      id: 'counter-display',
      ref: (el: HTMLElement) => {
        if (el) {
          slideIn(el, 'up', 400);
          animateOnHover(el, {
            duration: 300,
            easing: 'easeOutCubic',
            transform: ['scale(1)', 'scale(1.05)'],
            reverseOnLeave: true
          });
        }
      }
    }, () => getCount().toString()),
    
    createElement('div', { className: 'counter-controls' },
      createElement('button', {
        className: 'btn increment-btn',
        onclick: () => {
          setCount(getCount() + 1);
          
          const display = document.getElementById('counter-display');
          if (display) {
            animateSequence(display, [
              { transform: ['scale(1)', 'scale(1.2)'], duration: 150, easing: 'easeOutCubic' },
              { transform: ['scale(1.2)', 'scale(1)'], duration: 150, easing: 'easeInCubic' }
            ]);
          }
          
          showNotification('Counter incremented!', 'success');
        }
      }, '+ Increment'),
      
      createElement('button', {
        className: 'btn decrement-btn',
        onclick: () => {
          setCount(getCount() - 1);
          
          const display = document.getElementById('counter-display');
          if (display) {
            animateSequence(display, [
              { transform: ['scale(1)', 'scale(0.8)'], duration: 150, easing: 'easeOutCubic' },
              { transform: ['scale(0.8)', 'scale(1)'], duration: 150, easing: 'easeOutBack' }
            ]);
          }
          
          showNotification('Counter decremented!', 'info');
        }
      }, '- Decrement'),
      
      createElement('button', {
        className: 'btn secondary reset-btn',
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
            bounce(display, 25, 1000);
            showNotification('Counter bounced!', 'info');
          }
        }
      }, 'Bounce Counter')
    )
  );
}

function AnimationDemos() {
  return createElement('div', { className: 'animation-demos' },
    createElement('div', {
      className: 'demo-box interactive-demo',
      id: 'loop-demo',
      ref: (el: HTMLElement) => {
        if (el) {
          el.textContent = 'Loop Animation';
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
    
    createElement('div', {
      className: 'demo-box interactive-demo',
      id: 'click-demo',
      ref: (el: HTMLElement) => {
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
                transform: ['rotate(0deg)', 'rotate(360deg)'],
                backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.3)'],
                duration: 600,
                easing: 'easeInOutCubic'
              },
              {
                backgroundColor: ['rgba(196, 255, 77, 0.3)', 'rgba(42, 42, 42, 0.8)'],
                duration: 300,
                easing: 'linear'
              }
            ]);
            showNotification('Click animation triggered!', 'success');
          };
        }
      }
    }),
    
    createElement('div', {
      className: 'demo-box interactive-demo',
      id: 'sequence-demo',
      ref: (el: HTMLElement) => {
        if (el) {
          el.textContent = 'Sequence Demo';
          
          setTimeout(() => {
            animateSequence(el, [
              { transform: ['translateX(0)', 'translateX(30px)'], duration: 400, easing: 'easeOutCubic' },
              { transform: ['translateX(30px)', 'translateX(0)'], backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.2)'], duration: 400, easing: 'easeInCubic' },
              { backgroundColor: ['rgba(196, 255, 77, 0.2)', 'rgba(42, 42, 42, 0.8)'], duration: 200, easing: 'linear' }
            ]);
          }, 1000);
        }
      }
    }),
    
    createElement('div', {
      className: 'demo-box interactive-demo',
      id: 'move-demo',
      ref: (el: HTMLElement) => {
        if (el) {
          el.textContent = 'Move Demo';
          
          el.onclick = () => {
            animateMove(el, {
              x: ['0px', '50px'],
              duration: 400,
              easing: 'easeOutCubic'
            });
            
            setTimeout(() => {
              animateMove(el, {
                x: ['50px', '0px'],
                duration: 400,
                easing: 'easeInCubic'
              });
            }, 500);
            
            showNotification('Move animation started!', 'info');
          };
        }
      }
    })
  );
}

// ✅ FIXED TodoComponent - Resolved 'el' scope issue
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

  const toggleTodo = (id: number) => {
    setTodos(getTodos().map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: number) => {
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
        oninput: (e: Event) => setInputValue((e.target as HTMLInputElement).value),
        onkeypress: (e: KeyboardEvent) => {
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
              bounce(item as HTMLElement, 15, 600);
            }, index * 100);
          });
          showNotification('All todos bounced!', 'info');
        }
      }, 'Bounce All')
    ),
    
    createElement('ul', { className: 'todo-list' },
      () => {
        const todos = getTodos();
        return todos.length === 0
          ? [createElement('li', { className: 'todo-empty' }, 'No todos yet. Add one above!')]
          : todos.map(todo => {
              // ✅ FIXED: Store element reference outside to avoid scope issues
              let todoItemElement: HTMLElement | null = null;
              
              return createElement('li', {
                key: todo.id,
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                ref: (el: HTMLElement) => {
                  todoItemElement = el; // ✅ Store reference
                  if (el && !el.dataset.animated) {
                    el.dataset.animated = 'true';
                    slideIn(el, 'right', 300);
                  }
                }
              },
                createElement('span', {
                  className: 'todo-text',
                  onclick: () => toggleTodo(todo.id)
                }, todo.text),
                createElement('div', { className: 'todo-actions' },
                  createElement('button', {
                    className: 'btn-sm secondary',
                    onclick: () => toggleTodo(todo.id)
                  }, todo.completed ? 'Undo' : 'Done'),
                  createElement('button', {
                    className: 'btn-sm secondary',
                    onclick: () => {
                      // ✅ FIXED: Use stored reference instead of undefined 'el'
                      if (todoItemElement) {
                        fadeOut(todoItemElement, 300);
                        setTimeout(() => removeTodo(todo.id), 300);
                      }
                    }
                  }, 'Remove')
                )
              );
            });
      }
    )
  );
}

function StatusBar() {
  return createElement('div', {
    className: 'status-bar'
  }, () => `Counter: ${getCount()} | Todos: ${getTodos().length} | Theme: ${getTheme()} | Animations: Active | Sticky: ${getStickyEnabled() ? 'Active' : 'Ready'}`);
}

function FeatureCards() {
  const features = [
    {
      title: '⚡ Lightning Fast',
      description: 'Built with performance in mind using modern web standards with advanced animations and sticky elements'
    },
    {
      title: '🎨 Modern Design',
      description: 'Beautiful, responsive components with smooth animations, transitions, and interactive sticky behavior'
    },
    {
      title: '🔧 Developer Friendly',
      description: 'Simple API with TypeScript support, comprehensive animation system, and advanced sticky positioning'
    },
    {
      title: '🎯 Complete Animations',
      description: 'Includes fadeIn/Out, slideIn, bounce, resize, move, loop, sequence, timeline, and sticky animations'
    }
  ];

  return createElement('div', { className: 'features' },
    ...features.map((feature, index) =>
      createElement('div', {
        className: 'feature-card',
        ref: (el: HTMLElement) => {
          if (el) {
            setTimeout(() => {
              slideIn(el, 'up', 500);
            }, index * 100);
            
            animateOnHover(el, {
              duration: 300,
              transform: ['translateY(0)', 'translateY(-8px)'],
              boxShadow: [
                '0 10px 40px rgba(0, 0, 0, 0.3)',
                '0 20px 60px rgba(0, 0, 0, 0.4)'
              ],
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

function AnimationControls() {
  return createElement('div', { className: 'animation-controls' },
    createElement('button', {
      className: 'btn',
      onclick: () => {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            animate(card as HTMLElement, {
              transform: ['translateY(0)', 'translateY(-15px)'],
              duration: 400,
              easing: 'easeOutCubic',
              onComplete: () => {
                animate(card as HTMLElement, {
                  transform: ['translateY(-15px)', 'translateY(0)'],
                  duration: 400,
                  easing: 'easeInCubic'
                });
              }
            });
          }, index * 150);
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
            animateSequence(box as HTMLElement, [
              { transform: ['scale(1)', 'scale(1.3)'], duration: 200, easing: 'easeOutCubic' },
              { transform: ['scale(1.3)', 'scale(1)'], backgroundColor: ['rgba(42, 42, 42, 0.8)', 'rgba(196, 255, 77, 0.3)'], duration: 300, easing: 'easeInCubic' },
              { backgroundColor: ['rgba(196, 255, 77, 0.3)', 'rgba(42, 42, 42, 0.8)'], duration: 200, easing: 'linear' }
            ]);
          }, index * 150);
        });
        showNotification('Sequence demo started!', 'info');
      }
    }, 'Chain Animation'),
    
    createElement('button', {
      className: 'btn secondary',
      onclick: toggleStickyLogo
    }, () => getStickyEnabled() ? 'Disable Sticky Logo' : 'Enable Sticky Logo'),
    
    createElement('button', {
      className: 'btn secondary',
      onclick: () => {
        const allAnimatedElements = document.querySelectorAll('.demo-target, .demo-box, .feature-card');
        allAnimatedElements.forEach((element, index) => {
          setTimeout(() => {
            bounce(element as HTMLElement, 10 + (index % 3) * 5, 600);
          }, index * 50);
        });
        showNotification('Global bounce animation!', 'success');
      }
    }, 'Bounce All')
  );
}

function App() {
  return createElement('div', { className: 'app' },
    createElement('div', { style: { height: '10vh' } }),
    
    LogoComponent(),
    
    createElement('header', { className: 'header' },
      createElement('h1', {}, 'Singular Framework'),
      createElement('p', {}, 'Complete Animation System with Loops, Sequences, Sticky Elements, and All Interactions'),
      ThemeSwitcher()
    ),
    
    AnimationControls(),
    
    AnimationUtilitiesDemo(),
    
    AdvancedAnimationsDemo(),
    
    createElement('div', { style: { height: '15vh' } }),
    
    FeatureCards(),
    
    createElement('div', { style: { height: '20vh' } }),
    
    createElement('section', { className: 'demo-section' },
      createElement('h2', {}, 'Interactive Counter with Complete Animations'),
      createElement('p', {}, 'Experience all animation types: looping, bouncing, resizing, moving, and sticky behavior'),
      CounterComponent(),
      StatusBar(),
      AnimationDemos()
    ),
    
    createElement('div', { style: { height: '20vh' } }),
    
    createElement('section', { className: 'demo-section' },
      createElement('h2', {}, 'Todo Application with Complete Animation Effects'),
      createElement('p', {}, 'Todos animate in with staggered effects, smooth interactions, and can be made sticky'),
      TodoComponent()
    ),
    
    createElement('div', {
      style: {
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.3) 0%, rgba(27, 27, 27, 0.5) 100%)',
        margin: '40px 0',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      createElement('div', { style: { textAlign: 'center', color: '#888' } },
        createElement('h3', { style: { color: '#C4FF4D', fontFamily: 'Orbitron, monospace' } }, 'Scroll Test Area'),
        createElement('p', {}, 'Scroll up and down to see the sticky logo in action!'),
        createElement('p', {}, 'This area provides enough scroll distance to test sticky behavior.')
      )
    ),
    
    createElement('div', { style: { height: '10vh' } })
  );
}

function initApp() {
  console.log('🚀 Complete Singular Framework initializing...');
  
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    fadeOut(loadingScreen, 500);
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
  
  const container = document.querySelector('.app') as HTMLElement;
  
  if (container) {
    container.innerHTML = '';
    
    effect(() => {
      const theme = getTheme();
      document.body.setAttribute('data-theme', theme);
      document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
      localStorage.setItem('singular-theme', theme);
    });
    
    render(App(), container);
    
    setTimeout(() => {
      stickyLogoControl = createStickyLogo();
    }, 1000);
    
    console.log('✅ Complete Singular Framework app rendered successfully');
    showNotification('Complete Singular Framework loaded with all features!', 'success');
  } else {
    console.error('❌ Container .app not found!');
  }
}

document.addEventListener('DOMContentLoaded', initApp);

(window as any).SingularApp = {
  getTheme,
  setTheme,
  getCount,
  setCount,
  getTodos,
  setTodos,
  getStickyEnabled,
  setStickyEnabled,
  showNotification,
  toggleStickyLogo,
  loopAnimationControl,
  stickyLogoControl,
  reinit: initApp
};

console.log('🎯 Complete Enhanced Singular Framework loaded with ALL features - FIXED');
