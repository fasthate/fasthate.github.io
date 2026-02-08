/**
 * fasthate - Official Website
 * JavaScript functionality
 */

(function() {
    'use strict';

    // ===== DOM Elements =====
    const elements = {
        header: document.getElementById('header'),
        hamburger: document.getElementById('hamburger'),
        nav: document.getElementById('nav'),
        sections: document.querySelectorAll('.section'),
        navLinks: document.querySelectorAll('.nav-link[data-section]'),
        
        // Watched scroll containers
        seriesScroll: document.getElementById('seriesScroll'),
        moviesScroll: document.getElementById('moviesScroll'),
        
        // Discord & Toast
        discordBtn: document.getElementById('discordBtn'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage')
    };

    // ===== State =====
    const state = {
        isMenuOpen: false,
        isDragging: false
    };

    // ===== Initialize =====
    function init() {
        setupEventListeners();
        setupIntersectionObserver();
        setupSmoothScroll();
        setupDragScroll();
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        // Hamburger menu
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMenu);
        }

        // Close menu when clicking nav links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (state.isMenuOpen) {
                    toggleMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (state.isMenuOpen && 
                elements.nav && !elements.nav.contains(e.target) && 
                elements.hamburger && !elements.hamburger.contains(e.target)) {
                toggleMenu();
            }
        });

        // Discord copy
        if (elements.discordBtn) {
            elements.discordBtn.addEventListener('click', copyDiscord);
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);

        // Header scroll effect
        window.addEventListener('scroll', handleScroll);
    }

    // ===== Drag Scroll for Watched Section (scrollLeft implementation) =====
    function setupDragScroll() {
        const scrollContainers = [elements.seriesScroll, elements.moviesScroll];
        
        scrollContainers.forEach(container => {
            if (!container) return;
            
            let isDown = false;
            let startX;
            let scrollLeft;
            let velX = 0;
            let momentumID;
            let lastPageX;
            
            // Mouse Events
            container.addEventListener('mousedown', (e) => {
                isDown = true;
                container.classList.add('active'); // Adds cursor: grabbing
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
                lastPageX = e.pageX;
                cancelMomentum();
            });
            
            container.addEventListener('mouseleave', () => {
                if (isDown) {
                    isDown = false;
                    container.classList.remove('active');
                    beginMomentum();
                }
            });
            
            container.addEventListener('mouseup', () => {
                isDown = false;
                container.classList.remove('active');
                beginMomentum();
            });
            
            container.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 1.5; // Scroll speed multiplier
                container.scrollLeft = scrollLeft - walk;
                
                // Calculate velocity for momentum
                velX = e.pageX - lastPageX;
                lastPageX = e.pageX;
            });
            
            // Momentum Logic
            function beginMomentum() {
                cancelMomentum();
                if (Math.abs(velX) > 0.5) {
                    momentumLoop();
                }
            }
            
            function cancelMomentum() {
                cancelAnimationFrame(momentumID);
            }
            
            function momentumLoop() {
                container.scrollLeft -= velX * 1.5; // Apply velocity
                velX *= 0.95; // Friction
                
                if (Math.abs(velX) > 0.5) {
                    momentumID = requestAnimationFrame(momentumLoop);
                }
            }
        });
    }

    // ===== Hamburger Menu =====
    function toggleMenu() {
        if (!elements.hamburger || !elements.nav) return;
        
        state.isMenuOpen = !state.isMenuOpen;
        elements.hamburger.classList.toggle('active', state.isMenuOpen);
        elements.nav.classList.toggle('active', state.isMenuOpen);
        elements.hamburger.setAttribute('aria-expanded', state.isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    }

    // ===== Smooth Scroll =====
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== Intersection Observer for Section Animations =====
    function setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Update active nav link
                    const sectionId = entry.target.id;
                    updateActiveNavLink(sectionId);
                }
            });
        }, options);

        elements.sections.forEach(section => {
            observer.observe(section);
        });
    }

    function updateActiveNavLink(sectionId) {
        elements.navLinks.forEach(link => {
            const linkSection = link.dataset.section;
            link.classList.toggle('active', linkSection === sectionId);
        });
    }

    // ===== Discord Copy =====
    async function copyDiscord() {
        const discordUsername = 'fasthate';
        
        try {
            await navigator.clipboard.writeText(discordUsername);
            showToast('Discord скопирован: fasthate');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = discordUsername;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showToast('Discord скопирован: fasthate');
            } catch (err) {
                showToast('Не удалось скопировать');
            }
            
            document.body.removeChild(textArea);
        }
    }

    // ===== Toast Notification =====
    function showToast(message, duration = 3000) {
        if (elements.toastMessage) {
            elements.toastMessage.textContent = message;
            elements.toast.classList.add('active');

            setTimeout(() => {
                elements.toast.classList.remove('active');
            }, duration);
        }
    }

    // ===== Keyboard Navigation =====
    function handleKeyboard(e) {
        // Close menu on Escape
        if (e.key === 'Escape') {
            if (state.isMenuOpen) {
                toggleMenu();
            }
        }
    }

    // ===== Scroll Effects =====
    function handleScroll() {
        const scrollY = window.scrollY;
        
        // Header background opacity
        if (elements.header) {
            if (scrollY > 100) {
                elements.header.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                elements.header.style.background = 'rgba(0, 0, 0, 0.9)';
            }
        }
    }

    // ===== Initialize when DOM is ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
