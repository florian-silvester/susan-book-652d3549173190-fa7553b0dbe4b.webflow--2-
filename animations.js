document.addEventListener('DOMContentLoaded', () => {
  // Check for required libraries
  if (!window.gsap) {
    console.error('GSAP not loaded');
    return;
  }
  if (!window.ScrollTrigger) {
    console.error('ScrollTrigger not loaded');
    // return; // Might not be critical for hover, but good practice
  }
  // We don't strictly need TextPlugin for the hover effect,
  // but let's check for it before trying to register
  if (window.TextPlugin) {
     gsap.registerPlugin(ScrollTrigger, TextPlugin);
     console.log('Registered ScrollTrigger and TextPlugin');
  } else {
     gsap.registerPlugin(ScrollTrigger); // Register only ScrollTrigger if TextPlugin is missing
     console.log('Registered ScrollTrigger (TextPlugin not found)');
  }
  
  if (!window.barba) {
    console.error('Barba not loaded');
    return;
  }
  
  console.log('Libraries loaded, initializing...');
  
  // Update navbar title
  updateNavbarTitle();
  
  // Update header text with current container ID
  updateHeaderWithContainerId();
  
  // Initialize Barba.js
  initBarba();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize hover states for instruments list items
  initInstrumentsHoverEffect(); // Just sets initial state
  
  // Check if we're starting on the instruments page
  const isInstrumentsPage = window.location.pathname.includes('instruments') ||
                           document.title.includes('Instruments');
                           
  // TEMPORARILY COMMENT OUT animateDrawerItems CALL
  // if (isInstrumentsPage) {
  //   // Use the same function for consistency
  //   setTimeout(animateDrawerItems, 100); // ERROR: animateDrawerItems is not defined
  // }
});

// Function to update navbar title
function updateNavbarTitle() {
  const navbarTitle = document.querySelector('.navbar13_component .navbar_title');
  if (navbarTitle) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navbarTitle.textContent = currentPage;
  }
}

// Function to update header text with current container ID
function updateHeaderWithContainerId() {
  const headerText = document.querySelector('.header_text');
  const currentContainer = document.querySelector('[data-barba="container"]');
  
  if (headerText && currentContainer) {
    const containerId = currentContainer.id || 'default';
    headerText.textContent = containerId;
    console.log('Header text updated to show container ID:', containerId);
  }
}

// Function to initialize hover effects for instrument list items
function initInstrumentsHoverEffect() {
  console.log('Running initInstrumentsHoverEffect...'); // DEBUG
  const instrumentItems = document.querySelectorAll('.instruments_list_item');
  
  if (instrumentItems.length === 0) {
    console.log('No instrument list items found to initialize.'); // DEBUG
    return;
  }
  
  console.log(`Found ${instrumentItems.length} instrument list items, setting initial states`); // DEBUG
  
  instrumentItems.forEach((item, index) => {
    const textWrap = item.querySelector('.instruments_txt_wrap');
    if (textWrap) {
      // Ensure GSAP exists before using it here
      if (window.gsap) {
         gsap.set(textWrap, { 
           opacity: 0, 
           y: 5 
         });
         console.log(`Set initial state for item ${index}`); // DEBUG
      } else {
         console.error("GSAP not available in initInstrumentsHoverEffect"); // DEBUG
      }
    } else {
      console.log(`Warning: No .instruments_txt_wrap found for item ${index}`); // DEBUG
    }
  });
}

// Function to reset Webflow interactions and update the current page data
function resetWebflow(data) {
  // Parse the new HTML to get the updated <html> attributes
  let dom = $(new DOMParser().parseFromString(data.next.html, 'text/html')).find('html');
  // Update the data-wf-page attribute
  $('html').attr('data-wf-page', dom.attr('data-wf-page'));
  
  // Reinitialize Webflow interactions
  if (window.Webflow) {
    window.Webflow.destroy();
    window.Webflow.ready();
    if (window.Webflow.require) {
      const ix2 = window.Webflow.require('ix2');
      if (ix2 && typeof ix2.init === 'function') {
        ix2.init();
      } else {
        console.error('Webflow IX2 not available for initialization.');
      }
    }
  }

  // Update navigation – remove old w--current classes and set current links
  $('.w--current').removeClass('w--current');
  $('a').each(function () {
    if ($(this).attr('href') === window.location.pathname) {
      $(this).addClass('w--current');
    }
  });
}

// Function to initialize Barba.js
function initBarba() {
  if (!window.barba) return;
  
  barba.init({
    prevent: ({ el }) => {
      return el.hasAttribute('data-barba-prevent');
    },
    transitions: [{
      name: 'instruments-transition',
      // Match only transitions to/from instrument pages
      to: {
        namespace: ['instruments']
      },
      async leave({ current }) {
        // Fast exit animation
        await gsap.to(current.container, { 
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: 'power1.out'
        });
      },
      beforeEnter({ next }) {
        // Force the drawer items to be hidden before they appear
        const drawerItems = next.container.querySelectorAll('.drawer_list_item');
        if (drawerItems.length) {
          gsap.set(drawerItems, { 
            opacity: 0, 
            y: 20
          });
          
          // Also set inner elements if needed
          drawerItems.forEach(item => {
            const imgWrap = item.querySelector('.drawer_img_wrap');
            const titleElement = item.querySelector('.drawer_item_info .drawer_title');
            const descElement = item.querySelector('.drawer_item_info .drawer_desc');
            
            if (imgWrap) gsap.set(imgWrap, { opacity: 0, scale: 0.95 });
            if (titleElement) gsap.set(titleElement, { opacity: 0, y: 10 });
            if (descElement) gsap.set(descElement, { opacity: 0, y: 10 });
          });
        }
      },
      async enter({ next }) {
        // First, show the container quickly
        await gsap.to(next.container, { 
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power1.out',
          onComplete: () => {
            // Refresh ScrollTrigger after animation completes
            if (window.ScrollTrigger) ScrollTrigger.refresh();
          }
        });
        
        // Then animate drawer items with a faster stagger
        const drawerItems = next.container.querySelectorAll('.drawer_list_item');
        if (drawerItems.length) {
          // Animate containers with faster stagger
          await gsap.to(drawerItems, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.out",
            onComplete: () => {
              // Refresh ScrollTrigger again after drawer animations
               if (window.ScrollTrigger) ScrollTrigger.refresh();
            }
          });
          
          // Quick animation for inner elements if needed
          const tl = gsap.timeline({
            onComplete: () => {
              // Refresh ScrollTrigger after timeline completes
               if (window.ScrollTrigger) ScrollTrigger.refresh();
              
              // Re-initialize the hover states after animations complete
              // No need for timeout here as it's an onComplete callback
              initInstrumentsHoverEffect(); 
            }
          });
          
          // Image wrappers
          const imgWraps = next.container.querySelectorAll('.drawer_list_item .drawer_img_wrap');
          if (imgWraps.length) {
            tl.to(imgWraps, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              stagger: 0.04,
              ease: "power1.out"
            });
          }
          
          // Titles
          const titles = next.container.querySelectorAll('.drawer_list_item .drawer_title');
          if (titles.length) {
            tl.to(titles, {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.03,
              ease: "power1.out"
            }, "-=0.2");
          }
          
          // Descriptions
          const descs = next.container.querySelectorAll('.drawer_list_item .drawer_desc');
          if (descs.length) {
            tl.to(descs, {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.03,
              ease: "power1.out" 
            }, "-=0.2");
          }
          
          return tl;
        } else {
           // If no drawerItems, still need to init hover effects
           initInstrumentsHoverEffect();
        }
      },
      after() {
        // Update header text with the new container ID
        updateHeaderWithContainerId();
      }
    },
    {
      // Default transition for all other pages
      name: 'default-transition',
      async leave({ current }) {
        await gsap.to(current.container, { 
          opacity: 0,
          y: 20, 
          duration: 0.4,
          ease: 'power2.out'
        });
      },
      beforeEnter() {
        window.scrollTo(0, 0);
      },
      enter({ next }) {
        gsap.from(next.container, { 
          opacity: 0,
          y: 20, 
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            // Refresh ScrollTrigger after animation completes
             if (window.ScrollTrigger) ScrollTrigger.refresh();
          }
        });
      },
      after() {
        // Update header text with the new container ID
        updateHeaderWithContainerId();
      }
    }]
  });
  
  // Barba after hook
  barba.hooks.after((data) => {  
    console.log('Barba after hook triggered');
    
    // Reset scroll position
    $(window).scrollTop(0);
    
    // Reset Webflow
    if (data) {
      resetWebflow(data);
    }
    
    // Re-enable hover effects (isTransitioning might need definition if used)
    // isTransitioning = false; 
    
    // Check if we're on instruments page
    const isInstrumentsPage = window.location.pathname.includes('instruments');
    if (isInstrumentsPage) {
      // TEMPORARILY COMMENT OUT animateDrawerItems CALL
      // Animate drawer items now that page transition is complete
      // setTimeout(() => animateDrawerItems(), 100); // ERROR: animateDrawerItems is not defined
      
      // Just set initial states, event delegation will handle the rest
      // Use a timeout to ensure DOM is fully ready after transition
      setTimeout(() => {
        console.log('Running initInstrumentsHoverEffect from barba.hooks.after timeout'); // DEBUG
        initInstrumentsHoverEffect();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 150); // Reduced delay slightly
    } else {
      // Only initialize other animations if not on instruments page
      initScrollAnimations();
    }
    
    // Update the header text with current container ID
    updateHeaderWithContainerId();
    
    // Init other functionality
    updateNavbarTitle();
  });
}

// Function to initialize scroll animations for images
function initScrollAnimations() {
  // Get all targeted elements
  var images = gsap.utils.toArray('.g_visual_img, .reference_img, .slider_visual');
  
  if (images.length === 0) return;
  
  // Group images by their left offset (rounded to remove tiny variations)
  var groups = {};
  images.forEach(function(image) {
    let left = Math.round(image.getBoundingClientRect().left);
    if (!groups[left]) {
      groups[left] = [];
    }
    groups[left].push(image);
  });
  
  // Animate each group with a stagger effect
  for (var key in groups) {
    gsap.from(groups[key], {
      opacity: 0,
      duration: 2,
      ease: 'power2.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: groups[key][0],
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  }
  
  // Refresh ScrollTrigger in case new elements were added dynamically
  ScrollTrigger.refresh();
}

// Add this global event delegation at the end of your file
document.addEventListener('mouseover', function(e) {
  // Ensure GSAP exists
  if (!window.gsap) return; 
  
  const instrumentItem = e.target.closest('.instruments_list_item');
  if (instrumentItem) {
    console.log('Event: mouseover detected on instruments_list_item', instrumentItem); // DEBUG
    const textWrap = instrumentItem.querySelector('.instruments_txt_wrap');
    if (textWrap) {
      console.log('Found textWrap for mouseover:', textWrap); // DEBUG
      gsap.killTweensOf(textWrap);
      gsap.to(textWrap, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power1.out",
        overwrite: 'auto' 
      });
    } else {
      console.log('Error: textWrap not found inside hovered item.'); // DEBUG
    }
  }
});

document.addEventListener('mouseout', function(e) {
  // Ensure GSAP exists
  if (!window.gsap) return;

  const instrumentItem = e.target.closest('.instruments_list_item');
  if (instrumentItem) {
    console.log('Event: mouseout detected on instruments_list_item', instrumentItem); // DEBUG
    // Ensure the mouse is actually leaving the item
    if (!e.relatedTarget || !instrumentItem.contains(e.relatedTarget)) {
      const textWrap = instrumentItem.querySelector('.instruments_txt_wrap');
      if (textWrap) {
        console.log('Found textWrap for mouseout:', textWrap); // DEBUG
        gsap.killTweensOf(textWrap);
        gsap.to(textWrap, {
          opacity: 0,
          y: 5,
          duration: 0.15,
          ease: "power1.in",
          overwrite: 'auto' 
        });
      } else {
         console.log('Error: textWrap not found inside item for mouseout.'); // DEBUG
      }
    } else {
       console.log('Mouseout ignored (still inside item).'); // DEBUG
    }
  }
});

