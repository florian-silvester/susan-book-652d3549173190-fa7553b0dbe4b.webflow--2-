document.addEventListener('DOMContentLoaded', () => {
  // Check for required libraries
  if (!window.gsap) {
    console.error('GSAP not loaded');
    return;
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
  
  // Initialize hover animations for instruments list items
  initInstrumentsHoverEffect();
  
  // Check if we're starting on the instruments page
  const isInstrumentsPage = window.location.pathname.includes('instruments') ||
                           document.title.includes('Instruments');
                           
  if (isInstrumentsPage) {
    // Use the same function for consistency
    setTimeout(animateDrawerItems, 100);
  }
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
  const instrumentItems = document.querySelectorAll('.instruments_list_item');
  
  if (instrumentItems.length === 0) return;
  
  console.log(`Found ${instrumentItems.length} instrument list items, setting up hover animations`);
  
  instrumentItems.forEach(item => {
    // Get the text wrapper inside the item
    const textWrap = item.querySelector('.instruments_txt_wrap');
    
    if (!textWrap) return;
    
    // Set initial state - hidden and slightly offset downward (less offset - 5px instead of 10px)
    gsap.set(textWrap, { 
      opacity: 0, 
      y: 5 
    });
    
    // Hover in animation - faster (0.25s instead of 0.3s)
    item.addEventListener('mouseenter', () => {
      gsap.to(textWrap, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power1.out" // Smoother ease
      });
    });
    
    // Hover out animation - faster (0.15s instead of 0.2s)
    item.addEventListener('mouseleave', () => {
      gsap.to(textWrap, {
        opacity: 0,
        y: 5, // Reduced offset on exit too
        duration: 0.15,
        ease: "power1.in" // Smoother ease
      });
    });
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
          y: 10, // Smaller offset for faster appearance
          duration: 0.3, // Faster duration
          ease: 'power1.out'
        });
      },
      beforeEnter({ next }) {
        // Force the drawer items to be hidden before they appear
        const drawerItems = next.container.querySelectorAll('.drawer_list_item');
        if (drawerItems.length) {
          gsap.set(drawerItems, { 
            opacity: 0, 
            y: 20 // Smaller offset for faster movement
          });
          
          // Also set inner elements if needed
          drawerItems.forEach(item => {
            const imgWrap = item.querySelector('.drawer_img_wrap');
            const titleElement = item.querySelector('.drawer_item_info .drawer_title');
            const descElement = item.querySelector('.drawer_item_info .drawer_desc');
            
            if (imgWrap) gsap.set(imgWrap, { opacity: 0, scale: 0.95 }); // Less scaling
            if (titleElement) gsap.set(titleElement, { opacity: 0, y: 10 }); // Smaller offset
            if (descElement) gsap.set(descElement, { opacity: 0, y: 10 }); // Smaller offset
          });
        }
      },
      async enter({ next }) {
        // First, show the container quickly
        await gsap.to(next.container, { 
          opacity: 1,
          y: 0,
          duration: 0.3, // Faster duration
          ease: 'power1.out'
        });
        
        // Then animate drawer items with a faster stagger
        const drawerItems = next.container.querySelectorAll('.drawer_list_item');
        if (drawerItems.length) {
          // Animate containers with faster stagger
          await gsap.to(drawerItems, {
            opacity: 1,
            y: 0,
            duration: 0.4, // Faster
            stagger: 0.06, // Much quicker stagger
            ease: "power2.out"
          });
          
          // Quick animation for inner elements if needed
          const tl = gsap.timeline();
          
          // Image wrappers
          const imgWraps = next.container.querySelectorAll('.drawer_list_item .drawer_img_wrap');
          if (imgWraps.length) {
            tl.to(imgWraps, {
              opacity: 1,
              scale: 1,
              duration: 0.3, // Faster
              stagger: 0.04, // Much quicker stagger
              ease: "power1.out"
            });
          }
          
          // Titles
          const titles = next.container.querySelectorAll('.drawer_list_item .drawer_title');
          if (titles.length) {
            tl.to(titles, {
              opacity: 1,
              y: 0,
              duration: 0.25, // Faster
              stagger: 0.03, // Much quicker stagger
              ease: "power1.out"
            }, "-=0.2");
          }
          
          // Descriptions
          const descs = next.container.querySelectorAll('.drawer_list_item .drawer_desc');
          if (descs.length) {
            tl.to(descs, {
              opacity: 1,
              y: 0,
              duration: 0.25, // Faster
              stagger: 0.03, // Much quicker stagger
              ease: "power1.out" 
            }, "-=0.2");
          }
          
          // Return the timeline so Barba waits for it to complete
          return tl;
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
          ease: 'power2.out'
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
    
    // Re-enable hover effects
    isTransitioning = false;
    
    // Check if we're on instruments page and animate drawer items
    const isInstrumentsPage = window.location.pathname.includes('instruments');
    if (isInstrumentsPage) {
      // Animate drawer items now that page transition is complete
      setTimeout(() => animateDrawerItems(), 100);
      
      // Initialize hover effects for instruments (after page transition)
      setTimeout(() => initInstrumentsHoverEffect(), 200);
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

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger, TextPlugin);

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

