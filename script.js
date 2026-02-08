/**
 * fasthate - Official Website
 * JavaScript functionality
 */

(function() {
    'use strict';

    // ===== DOM Elements =====
    const elements = {
        preloader: document.getElementById('preloader'),
        progressBar: document.getElementById('progressBar'),
        header: document.getElementById('header'),
        hamburger: document.getElementById('hamburger'),
        nav: document.getElementById('nav'),
        sections: document.querySelectorAll('.section'),
        navLinks: document.querySelectorAll('.nav-link[data-section]'),
        scrollTop: document.getElementById('scrollTop'),
        
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
        setupPreloader();
        setupEventListeners();
        setupIntersectionObserver();
        setupSmoothScroll();
        setupProgressBar();
        setupScrollToTop();
    }

    // ===== Preloader =====
    function setupPreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.preloader) {
                    elements.preloader.classList.add('hidden');
                }
            }, 500);
        });
    }

    // ===== Progress Bar =====
    function setupProgressBar() {
        window.addEventListener('scroll', () => {
            if (elements.progressBar) {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                elements.progressBar.style.width = scrollPercent + '%';
            }
        });
    }

    // ===== Scroll to Top Button =====
    function setupScrollToTop() {
        window.addEventListener('scroll', () => {
            if (elements.scrollTop) {
                if (window.scrollY > 500) {
                    elements.scrollTop.classList.add('visible');
                } else {
                    elements.scrollTop.classList.remove('visible');
                }
            }
        });

        if (elements.scrollTop) {
            elements.scrollTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // ===== Filter Buttons =====
    function setupFilter() {
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show/hide categories
                elements.watchedCategories.forEach(category => {
                    const categoryType = category.dataset.category;
                    
                    if (filter === 'all') {
                        category.classList.remove('hidden');
                    } else if (categoryType === filter) {
                        category.classList.remove('hidden');
                    } else {
                        category.classList.add('hidden');
                    }
                });
            });
        });
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

    // ===== Hamburger Menu =====
    function toggleMenu() {
        if (!elements.hamburger || !elements.nav) return;
        
        state.isMenuOpen = !state.isMenuOpen;
        elements.hamburger.classList.toggle('active', state.isMenuOpen);
        elements.nav.classList.toggle('active', state.isMenuOpen);
        elements.hamburger.setAttribute('aria-expanded', state.isMenuOpen);
        
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
        if (elements.toast && elements.toastMessage) {
            elements.toastMessage.textContent = message;
            elements.toast.classList.add('active');

            setTimeout(() => {
                elements.toast.classList.remove('active');
            }, duration);
        }
    }

    // ===== Keyboard Navigation =====
    function handleKeyboard(e) {
        if (e.key === 'Escape') {
            if (state.isMenuOpen) {
                toggleMenu();
            }
        }
    }

    // ===== Scroll Effects =====
    function handleScroll() {
        const scrollY = window.scrollY;
        
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
