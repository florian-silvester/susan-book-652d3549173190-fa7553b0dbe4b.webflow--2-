document.addEventListener('DOMContentLoaded', () => {
  // Update navbar title
  updateNavbarTitle();
  
  // Update header text from Current element
  updateHeaderTextFromCurrent();
  
  // Initialize dynamic header functionality
  initDynamicHeader();
  
  // Initialize horizontal scroll listener
  initHeaderOnScroll();
  
  // Initialize Barba.js
  initBarba();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Add horizontal scroll initialization
  initSmoothHorizontalScroll();
});

// Function to update navbar title
function updateNavbarTitle() {
  const navbarTitle = document.querySelector('.navbar13_component .navbar_title');
  if (navbarTitle) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navbarTitle.textContent = currentPage;
  }
}

// Function to update header text from Current element
function updateHeaderTextFromCurrent() {
  const currentElem = document.getElementById('Current');
  const headerElem = document.getElementById('Header-Text');
  if (currentElem && headerElem) {
    headerElem.textContent = currentElem.textContent;
    console.log('Header-Text updated to:', headerElem.textContent);
  }
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
      name: 'simple-transition',
      async leave({ current }) {
        // Normal leave animation for all links (no special flag check)
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
        // Just fade in the container - we'll handle drawer items separately
        gsap.from(next.container, { 
          opacity: 0,
          y: 20, 
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }]
  });
  
  // This is the key part - handle drawer items in the after hook
  barba.hooks.after((data) => {  // Make sure we're passing the data parameter
    // First reset everything 
    $(window).scrollTop(0);
    
    // Now look for drawer items AFTER the page has been fully transitioned
    const drawerItems = document.querySelectorAll('.drawer_list_item');
    
    if (drawerItems.length > 0) {
      console.log(`Animating ${drawerItems.length} drawer items with stagger`);
      
      // Force them to be invisible first
      gsap.set(drawerItems, { opacity: 0, y: 30 });
      
      // Then animate with a very obvious stagger
      gsap.to(drawerItems, {
        opacity: 1,
        y: 0,
        duration: 0.8, // Longer duration
        delay: 0.1, // Short delay after page transition
        ease: 'power2.out',
        stagger: {
          amount: 0.7, // Use amount instead of each for more obvious stagger
          from: "start"
        },
        onStart: () => console.log('Drawer stagger animation started'),
        onComplete: () => {
          console.log('Drawer stagger animation completed');
          // Re-initialize drawer hover effects after animation
          bindDrawerItemHover();
        }
      });
    }
    
    // Make sure to pass data to resetWebflow
    if (data) {
      resetWebflow(data);
    }
    
    initScrollAnimations();
    updateNavbarTitle();
    
    // Ensure header interactions are reinitialized
    updateHeaderTextFromCurrent();
    initDynamicHeader();
    initHeaderOnScroll();
    
    // Add this line to initialize horizontal scrolling after navigation
    initSmoothHorizontalScroll();
  });
  
  // Remove the afterEnter hook as we're doing everything in after hook
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

// Event delegation for hover effects on drawer items
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
    }
  }
}

function bindDrawerItemHover() {
  const drawerItems = document.querySelectorAll('.drawer_list_item');
  console.log(`Binding hover events to ${drawerItems.length} drawer items`);
  
  if (drawerItems.length === 0) return;
  
  drawerItems.forEach(item => {
    // Clean up existing listeners
    item.removeEventListener('mouseenter', handleDrawerItemHover);
    // Add fresh listener
    item.addEventListener('mouseenter', handleDrawerItemHover);
    console.log('Added hover listener to drawer item:', item);
  });
}

// Function to update header text based on ScrollTrigger
function updateHeaderText(item) {
  const newText = item.querySelector(".drawer_hidden_text")?.textContent;
  if (newText) {
    gsap.to("#Header-Text", {duration: 0.3, text: {value: newText}});
  }
}

function initDynamicHeader() {
  // Bind hover events
  bindDrawerItemHover();
  
  // Grab all drawer list items
  const drawerItems = gsap.utils.toArray(".drawer_list_item");
  
  // Create a ScrollTrigger for each item
  drawerItems.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      scroller: ".drawer_list",
      start: "left center",
      end: "right center",
      onEnter: () => updateHeaderText(item),
      onEnterBack: () => updateHeaderText(item)
    });
  });
}

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
        gsap.to(headerElem, { duration: 0.3, text: { value: newText } });
      }
    }
  }
}

// Function to initialize horizontal scroll header update
function initHeaderOnScroll() {
  const drawerList = document.querySelector('.drawer_list');
  if (!drawerList) return;
  
  // Create a ScrollTrigger that continuously calls updateHeaderOnScroll
  ScrollTrigger.create({
    trigger: ".drawer_list",
    scroller: ".drawer_list",
    start: "left left",
    end: "right right",
    scrub: 0.1,
    onUpdate: updateHeaderOnScroll
  });
}

// Add this function to implement smooth horizontal scrolling for the drawer
function initSmoothHorizontalScroll() {
  const drawerListWrap = document.querySelector('.drawer_list_wrap');
  
  if (!drawerListWrap) return;
  
  // Make sure the container has the right CSS properties
  gsap.set(drawerListWrap, {
    overflowX: 'auto',
    overflowY: 'hidden',
    webkitOverflowScrolling: 'touch' // For momentum scrolling on iOS
  });
  
  // Add mousewheel support for horizontal scrolling
  drawerListWrap.addEventListener('wheel', (e) => {
    // Prevent vertical page scrolling when hovering the drawer
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && e.deltaY !== 0) {
      e.preventDefault();
      // Scroll horizontally instead of vertically
      drawerListWrap.scrollLeft += e.deltaY;
    }
  }, { passive: false });
  
  // Add scroll arrows/indicators
  addScrollIndicators(drawerListWrap);
  
  console.log('Horizontal scroll initialized for drawer_list_wrap');
}

// Add visual indicators that the content is scrollable
function addScrollIndicators(scrollContainer) {
  // Create container for the indicators
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'scroll-indicators';
  indicatorsContainer.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
  `;
  
  // Create left arrow
  const leftArrow = document.createElement('button');
  leftArrow.innerHTML = '←';
  leftArrow.className = 'scroll-arrow left-arrow';
  leftArrow.style.cssText = `
    background: rgba(0,0,0,0.3);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.3s;
  `;
  
  // Create right arrow
  const rightArrow = document.createElement('button');
  rightArrow.innerHTML = '→';
  rightArrow.className = 'scroll-arrow right-arrow';
  rightArrow.style.cssText = leftArrow.style.cssText;
  
  // Add event listeners to scroll left/right
  leftArrow.addEventListener('click', () => {
    gsap.to(scrollContainer, {
      scrollLeft: '-=300', 
      duration: 0.5,
      ease: 'power2.out'
    });
  });
  
  rightArrow.addEventListener('click', () => {
    gsap.to(scrollContainer, {
      scrollLeft: '+=300',
      duration: 0.5,
      ease: 'power2.out'
    });
  });
  
  // Update arrow visibility based on scroll position
  function updateArrowVisibility() {
    leftArrow.style.opacity = scrollContainer.scrollLeft > 20 ? '0.7' : '0.3';
    rightArrow.style.opacity = 
      scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth - 20) 
        ? '0.7' : '0.3';
  }
  
  // Listen for scroll events to update arrow visibility
  scrollContainer.addEventListener('scroll', updateArrowVisibility);
  window.addEventListener('resize', updateArrowVisibility);
  
  // Add arrows to the indicators container
  indicatorsContainer.appendChild(leftArrow);
  indicatorsContainer.appendChild(rightArrow);
  
  // Add indicators to the parent of the scroll container
  scrollContainer.parentNode.style.position = 'relative';
  scrollContainer.parentNode.appendChild(indicatorsContainer);
  
  // Initial visibility update
  updateArrowVisibility();
}

