/**
 * fasthate - Personal Website Script
 * Pure vanilla JavaScript functionality
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        pageLoader: document.getElementById('pageLoader'),
        hamburger: document.getElementById('hamburger'),
        nav: document.getElementById('nav'),
        discordCopy: document.getElementById('discordCopy'),
        toast: document.getElementById('toast'),
        sections: document.querySelectorAll('.section'),
        navLinks: document.querySelectorAll('.nav-link[href^="#"]')
    };

    // ========================================
    // Initialize
    // ========================================
    function init() {
        hideLoader();
        setupEventListeners();
        setupIntersectionObserver();
        setupSmoothScroll();
        animateMainContent();
    }

    // ========================================
    // Page Loader
    // ========================================
    function hideLoader() {
        // Wait for animations to complete
        setTimeout(() => {
            if (elements.pageLoader) {
                elements.pageLoader.classList.add('hidden');
            }
        }, 1800);
    }

    // ========================================
    // Animate Main Content
    // ========================================
    function animateMainContent() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        // Animate scroll indicator after loader
        setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.classList.add('animated');
            }
        }, 2500);
    }

    // ========================================
    // Setup Event Listeners
    // ========================================
    function setupEventListeners() {
        // Hamburger Menu
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu when clicking nav links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.nav && elements.nav.classList.contains('active')) {
                if (!elements.nav.contains(e.target) && !elements.hamburger.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });

        // Discord Copy
        if (elements.discordCopy) {
            elements.discordCopy.addEventListener('click', copyDiscord);
        }

        // Keyboard navigation for hamburger
        if (elements.hamburger) {
            elements.hamburger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMobileMenu();
                }
            });
        }
    }

    // ========================================
    // Mobile Menu Functions
    // ========================================
    function toggleMobileMenu() {
        elements.hamburger.classList.toggle('active');
        elements.nav.classList.toggle('active');
        
        const isExpanded = elements.hamburger.classList.contains('active');
        elements.hamburger.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    function closeMobileMenu() {
        elements.hamburger.classList.remove('active');
        elements.nav.classList.remove('active');
        elements.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // ========================================
    // Copy Discord Username
    // ========================================
    function copyDiscord() {
        const username = 'fasthate';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(username)
                .then(() => showToast('Скопировано: ' + username))
                .catch(() => fallbackCopy(username));
        } else {
            fallbackCopy(username);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('Скопировано: ' + text);
        } catch (err) {
            showToast('Не удалось скопировать');
        }
        
        document.body.removeChild(textarea);
    }

    // ========================================
    // Toast Notification
    // ========================================
    function showToast(message, duration = 3000) {
        if (!elements.toast) return;
        
        elements.toast.textContent = message;
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, duration);
    }

    // ========================================
    // Intersection Observer for Animations
    // ========================================
    function setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Once visible, stop observing
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Only observe About section (main section uses CSS animations)
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            observer.observe(aboutSection);
        }
    }

    // ========================================
    // Smooth Scroll for Navigation
    // ========================================
    function setupSmoothScroll() {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
                        const targetPosition = target.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL without jumping
                        history.pushState(null, null, href);
                    }
                }
            });
        });

        // Logo click scrolls to main
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // ========================================
    // Handle Active Navigation State
    // ========================================
    const aboutSection = document.getElementById('about');
    const aboutNavLink = document.querySelector('.nav-link[data-section="about"]');
    
    function updateActiveNav() {
        if (!aboutSection || !aboutNavLink) return;
        
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const sectionTop = aboutSection.offsetTop;
        const sectionHeight = aboutSection.offsetHeight;
        const headerHeight = 70;
        
        // Check if we're in the About section
        const isInAboutSection = scrollPosition + headerHeight >= sectionTop - 100 && 
                                  scrollPosition < sectionTop + sectionHeight - 100;
        
        if (isInAboutSection) {
            if (!aboutNavLink.classList.contains('active')) {
                aboutNavLink.classList.add('active');
            }
        } else {
            if (aboutNavLink.classList.contains('active')) {
                aboutNavLink.classList.remove('active');
            }
        }
    }

    // Throttle scroll event
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(updateActiveNav);
    });
    
    // Handle click on About link
    if (aboutNavLink) {
        aboutNavLink.addEventListener('click', () => {
            // Add active class immediately on click
            aboutNavLink.classList.add('active');
        });
    }

    // ========================================
    // Initialize on DOM Ready
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
