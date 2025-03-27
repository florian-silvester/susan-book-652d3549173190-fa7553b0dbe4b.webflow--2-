// 1. Move this function to the TOP of your file (before any other code)
function closeDrawerAndNavigate(targetHref) {
  const drawer = document.querySelector('.drawer_wrap.u-vflex-left-bottom');
  
  // Kill any active timeline
  if (window.toggleTimeline && window.toggleTimeline.isActive()) {
    window.toggleTimeline.kill();
  }
  
  // Reset main content position immediately
  gsap.to('.page_main', { duration: 0.2, y: 0, ease: 'power1.out' });
  
  // Create a timeline with all drawer elements fading out simultaneously
  const timeline = gsap.timeline({
    onComplete: () => {
      // Hide the drawer
      drawer.classList.add('is-hidden');
      
      // IMPORTANT: Disable Barba completely before navigation
      if (window.barba) {
        // Destroy barba instance to prevent it from handling the navigation
        window.barba.destroy();
      }
      
      // Navigate directly - this will force a full page reload with no Barba interference
      window.location.href = targetHref;
    }
  });
  
  // Fade out everything quickly
  timeline.to(drawer, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);
  
  return timeline;
}

document.addEventListener('DOMContentLoaded', () => {
  const instrumentsBtn = document.querySelector('#Instruments.navbar13_link');
  const drawer = document.querySelector('.drawer_wrap.u-vflex-left-bottom');
  window.toggleTimeline = null; // Make toggleTimeline global so it can be accessed by closeDrawerAndNavigate

  if (!instrumentsBtn || !drawer) return;

  // Function to open the drawer
  function openDrawer() {
    // Set Header-Text to "Instruments" by default on drawer open
    const headerTextElement = document.getElementById('Header-Text');
    if (headerTextElement) {
      headerTextElement.textContent = "Instruments";
    }
    
    drawer.classList.remove('is-hidden');
    gsap.to('.page_main', { duration: 0.5, y: 50, ease: 'power2.out' });
    toggleTimeline = gsap.timeline();

    // Animate the background fade in first (0.2s)
    const drawerBg = drawer.querySelector('.drawer_bg');
    if (drawerBg) {
      toggleTimeline.fromTo(drawerBg,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
    }

    // Animate the container fading in and moving in from y: 50 (0.15s)
    const drawerContain = drawer.querySelector('.drawer_contain');
    if (drawerContain) {
      toggleTimeline.fromTo(drawerContain,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        "-=0.1"
      );
    }

    // Then animate the drawer items with a fluid staggered motion and overlap
    const drawerItems = drawer.querySelectorAll('.drawer_list > *');
    toggleTimeline.fromTo(drawerItems,
      { opacity: 0, y: 3 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: {
        each: 0.08,
        from: "start",
        ease: "power1.in"
      }}
    );
  }

  // Function to close the drawer
  function closeDrawer(fast = false, clickedItem = null) {
    if (toggleTimeline && toggleTimeline.isActive()) {
      toggleTimeline.kill();
    }
    gsap.to('.page_main', { duration: 0.5, y: 0, ease: 'power2.out' });
    // Use 0 delay if fast is true, otherwise 1 second delay
    const delayTime = fast ? 0 : 1;
    toggleTimeline = gsap.timeline({
      delay: delayTime,
      onComplete: () => {
        drawer.classList.add('is-hidden');
        // Optionally, reset the drawer's opacity for future animations
        drawer.style.opacity = 1;
        // Update Header-Text element from the element with ID "Current"
        const currentElem = document.getElementById('Current');
        const headerElem = document.getElementById('Header-Text');
        if (currentElem && headerElem) {
          headerElem.textContent = currentElem.textContent;
        }
      }
    });

    // Fade out the drawer list items with separate handling for the clicked item.
    const drawerItems = drawer.querySelectorAll('.drawer_list_item');
    let nonClickedItems = [];

    // Separate the clicked item from the others.
    drawerItems.forEach(item => {
      if (clickedItem && item === clickedItem) {
        // We'll handle this one later.
      } else {
        nonClickedItems.push(item);
      }
    });

    // Fade out all non-clicked items immediately at timeline time 0.
    if (nonClickedItems.length) {
      toggleTimeline.to(nonClickedItems, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
    }

    // Delay the fade out of the clicked item so that it remains visible for even a bit longer.
    if (clickedItem) {
      toggleTimeline.to(clickedItem, { opacity: 0, duration: 1.5, ease: 'power2.out' }, 1.5);
    }

    // Then fade out the container (with vertical movement) as before.
    const drawerContain = drawer.querySelector('.drawer_contain');
    if (drawerContain) {
      toggleTimeline.fromTo(drawerContain,
        { opacity: 1, y: 0 },
        { opacity: 0, y: 50, duration: 0.15, ease: 'power2.in' },
        "-=0.05"
      );
    }

    // Finally, fade out the background (.drawer_bg) earlier by using a larger negative offset:
    const drawerBg = drawer.querySelector('.drawer_bg');
    if (drawerBg) {
      toggleTimeline.fromTo(
        drawerBg,
        { opacity: 1 },
        { opacity: 0, duration: 0.35, ease: 'power2.inOut' },
        "-=0.8"  // Adjust this value to start the background fade-out earlier.
      );
    }
  }

  // Toggle drawer on #Instruments click
  instrumentsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (toggleTimeline && toggleTimeline.isActive()) {
      toggleTimeline.kill();
    }
    if (drawer.classList.contains('is-hidden')) {
      openDrawer();
    } else {
      // When instrumentsBtn is clicked and drawer is open, close it fast
      closeDrawer(true);
    }
  });

  // Close the drawer when clicking on .drawer_bg
  const drawerBg = drawer.querySelector('.drawer_bg');
  if (drawerBg) {
    drawerBg.addEventListener('click', (e) => {
      e.preventDefault();
      // Only close if the drawer is currently open
      if (!drawer.classList.contains('is-hidden')) {
        closeDrawer(true);
      }
    });
  }

  // Close the drawer when any .g_clickable_link inside .drawer_wrap is clicked
  const clickableLinks = drawer.querySelectorAll('.g_clickable_link');
  clickableLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Only close if the drawer is currently open
      if (!drawer.classList.contains('is-hidden')) {
        // Identify the clicked drawer item (assumes the link is inside .drawer_list_item)
        const clickedItem = link.closest('.drawer_list_item');
        closeDrawer(true, clickedItem); // Pass clickedItem to delay its fade-out
      }
    });
  });

  const homeBtn = document.querySelector("#Home");
  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      if (!drawer.classList.contains("is-hidden")) {
        e.preventDefault();
        
        // INSTANTLY hide the drawer (no animation)
        drawer.classList.add('is-hidden');
        
        // After a very tiny delay, navigate
        setTimeout(() => {
          window.location.href = homeBtn.getAttribute('href');
        }, 50);
      }
    });
  }
  
  // Removed GSAP hover effect for .drawer_list_item; using CSS hover instead
  // (Original GSAP code removed)

  // At the end of the DOMContentLoaded callback (before it closes), update the navbar title assignment:
  const navbarTitle = document.querySelector('.navbar13_component .navbar_title');
  if (navbarTitle) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navbarTitle.textContent = currentPage;
  }

  // Update Header-Text element based on the element with ID "Current" for initial page load
  const currentElem = document.getElementById('Current');
  const headerElem = document.getElementById('Header-Text');
  if (currentElem && headerElem) {
    headerElem.textContent = currentElem.textContent;
    console.log('Initial page load update, Header-Text set to:', headerElem.textContent);
  }

  // For other nav links, same approach - simple and clean
  const navLinks = document.querySelectorAll('.navbar13_link:not(.w--current):not(#Instruments)');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!drawer.classList.contains('is-hidden')) {
        e.preventDefault();
        
        // INSTANTLY hide the drawer (no animation)
        drawer.classList.add('is-hidden');
        
        // After a very tiny delay, navigate
        setTimeout(() => {
          window.location.href = link.getAttribute('href');
        }, 50);
      }
    });
  });
});

// Barba.js initialization and configuration

// Function to reset Webflow interactions and update the current page data
function resetWebflow(data) {
  // Parse the new HTML to get the updated <html> attributes
  let dom = $(new DOMParser().parseFromString(data.next.html, 'text/html')).find('html');
  // Update the data-wf-page attribute
  $('html').attr('data-wf-page', dom.attr('data-wf-page'));
  
  // Reinitialize Webflow interactions
  if (window.Webflow) {
    window.Webflow.destroy(); // Destroy current Webflow animations
    window.Webflow.ready();   // Prepare Webflow for the new content
    if (window.Webflow.require) {
      const ix2 = window.Webflow.require('ix2');
      if (ix2 && typeof ix2.init === 'function') {
        ix2.init();  // Initialize interactions if available
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

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

/* Function to initialize scroll animations for .g_visual_img, .reference_img, and .slider_visual elements with stagger for groups on the same x axis */
function initScrollAnimations() {
  // Get all targeted elements
  var images = gsap.utils.toArray('.g_visual_img, .reference_img, .slider_visual');
  
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
      stagger: 0.2, // Delay improvements between images in the same group
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

/* Barba.js hooks and initialization */
barba.hooks.after((data) => {
  // Scroll to top and reinitialize Webflow interactions
  $(window).scrollTop(0);
  resetWebflow(data);
  initPageScripts();
  // Reinitialize scroll animations for the new content
  initScrollAnimations();

  // Update navbar title based on the current URL after the last "/"
  const navbarTitle = document.querySelector('.navbar13_component .navbar_title');
  if (navbarTitle) {
    // Use data.next.url from Barba for the new URL
    let newUrl = (data.next.url.href) ? data.next.url.href : data.next.url;
    let urlObj = new URL(newUrl);
    const currentPage = urlObj.pathname.split('/').pop() || 'index.html';
    navbarTitle.textContent = currentPage;
  }
});

barba.hooks.afterEnter(() => {
  // Delay slightly to ensure window.location and content are updated
  setTimeout(() => {
    // Update the navbar title (if needed)
    const navbarTitle = document.querySelector('.navbar13_component .navbar_title');
    if (navbarTitle) {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      navbarTitle.textContent = currentPage;
    }
    // Update Header-Text from the element with ID "Current"
    const currentElem = document.getElementById('Current');
    const headerElem = document.getElementById('Header-Text');
    if (currentElem && headerElem) {
      headerElem.textContent = currentElem.textContent;
      console.log('AfterEnter: Header-Text updated to:', headerElem.textContent);
    }
  }, 100);
});

document.addEventListener('DOMContentLoaded', function() {
  barba.init({
    // Prevent Barba from handling links with the data-barba-prevent attribute
    prevent: ({ el }) => {
      // Skip transitions when our flag is set or for links with data-barba-prevent
      return window.skipBarbaTransition || el.hasAttribute('data-barba-prevent');
    },
    transitions: [{
      name: 'fade-transition',
      // This function runs BEFORE any page transition starts
      // Perfect place to close the drawer!
      leave(data) {
        return new Promise(resolve => {
          const drawer = document.querySelector('.drawer_wrap.u-vflex-left-bottom');
          
          // If drawer is open, close it first, then resolve to continue the transition
          if (drawer && !drawer.classList.contains('is-hidden')) {
            // Quick fade-out of the drawer
            gsap.to(drawer, { 
              opacity: 0, 
              duration: 0.2, 
              onComplete: () => {
                drawer.classList.add('is-hidden');
                resolve(); // Continue with Barba transition
              }
            });
          } else {
            // Drawer not open, continue immediately
            resolve();
          }
        });
      },
      // Then continue with your normal transitions
      async leave({ current }) {
        await gsap.to(current.container, { opacity: 0, y: 50, duration: 0.5, ease: 'power2.out' });
      },
      beforeEnter() {
        window.scrollTo(0, 0);
      },
      enter({ next }) {
        gsap.from(next.container, { opacity: 0, y: 50, duration: 0.5, ease: 'power2.out' });
      }
    }]
  });

  // Initialize scroll-trigger animations on initial page load
  initScrollAnimations();
});

// Add new event delegation code at the end of the file:

document.addEventListener('mouseover', (e) => {
  const hiddenText = e.target.closest('.drawer_hidden_text');
  if (hiddenText) {
    const headerTextElement = document.getElementById('Header-Text');
    if (headerTextElement) {
      headerTextElement.textContent = hiddenText.textContent;
    }
  }
});

/* Bind drawer item hover events to update header text on hover */
function handleDrawerItemHover() {
  const hiddenText = this.querySelector('.drawer_hidden_text');
  if (hiddenText) {
    const headerElement = document.getElementById('Header-Text');
    if (headerElement) {
      headerElement.textContent = hiddenText.textContent;
      console.log('Updated header text with:', hiddenText.textContent);
    } else {
      console.error('Header-Text element not found');
    }
  } else {
    console.warn('No .drawer_hidden_text found in', this);
  }
}

function bindDrawerItemHover() {
  const drawerItems = document.querySelectorAll('.drawer_list_item');
  drawerItems.forEach(item => {
    // Remove old event listener to prevent duplicates
    item.removeEventListener('mouseenter', handleDrawerItemHover);
    // Add mouseenter event listener to update header text on hover
    item.addEventListener('mouseenter', handleDrawerItemHover);
  });
}

// Bind events on initial page load
document.addEventListener('DOMContentLoaded', () => {
  bindDrawerItemHover();
});

// Re-bind events after Barba transitions so new drawer items are set up.
barba.hooks.afterEnter(() => {
  // Delay slightly to ensure new elements are ready
  setTimeout(bindDrawerItemHover, 200);
});

// Ensure GSAP TextPlugin is registered
gsap.registerPlugin(ScrollTrigger, TextPlugin);

function updateHeaderText(item) {
  // Get the text from the hidden text element
  const newText = item.querySelector(".drawer_hidden_text")?.textContent;
  if (newText) {
    // Animate the header text to the new value
    gsap.to("#Header-Text", {duration: 0.3, text: {value: newText}});
    console.log("ScrollTrigger updated Header-Text to:", newText);
  }
}

function initDynamicHeader() {
  // Grab all drawer list items
  const drawerItems = gsap.utils.toArray(".drawer_list_item");
  
  // Create a ScrollTrigger for each item
  drawerItems.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      scroller: ".drawer_list",   // The horizontal scrolling container
      start: "left center",         // Adjust as needed for your layout
      end: "right center",
      onEnter: () => updateHeaderText(item),
      onEnterBack: () => updateHeaderText(item)
    });
  });
}

// Call initDynamicHeader after everything is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Existing initializations...

  // Initialize dynamic header updates via scroll
  initDynamicHeader();
});

// Optionally, if you have Barba transitions, reinitialize after each transition:
barba.hooks.afterEnter(() => {
  // Delay slightly to ensure new elements are ready
  setTimeout(initDynamicHeader, 200);
});

// Function that checks which drawer item is closest to the center of the drawer_list
function updateHeaderOnScroll() {
  const drawerList = document.querySelector('.drawer_list');
  if (!drawerList) return;
  
  // Get the rectangle for the container and compute its horizontal center
  const containerRect = drawerList.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  
  // Get all the drawer items
  const items = document.querySelectorAll('.drawer_list_item');
  let closestItem = null;
  let minDistance = Infinity;
  
  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    // Compute the center of the item
    const itemCenter = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(itemCenter - containerCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }
  });
  
  if (closestItem) {
    const headerElem = document.getElementById('Header-Text');
    const hiddenTextElem = closestItem.querySelector('.drawer_hidden_text');
    if (headerElem && hiddenTextElem) {
      const newText = hiddenTextElem.textContent;
      if (headerElem.textContent !== newText) {
        // Update and optionally animate the header text for a smooth transition
        gsap.to(headerElem, { duration: 0.3, text: { value: newText } });
        console.log("Dynamically updated Header-Text to:", newText);
      }
    }
  }
}

// Create a ScrollTrigger that continuously calls updateHeaderOnScroll
ScrollTrigger.create({
  trigger: ".drawer_list",     // The horizontal scrolling container
  scroller: ".drawer_list",      // (Adjust if your scroller is different)
  start: "left left",            // You may need to tweak these values
  end: "right right",
  scrub: 0.1,                    // This links the update to the scroll progress
  onUpdate: updateHeaderOnScroll
});

