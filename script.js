/* ==========================================================================
   RankRise SEO — Premium Interactions
   GSAP animations, mobile menu, FAQ accordion, form handling, UTM tracking
   ========================================================================== */

(function () {
    'use strict';

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initAnimations();
    } else {
        // Fallback: show everything immediately
        document.querySelectorAll('.fade-up').forEach(function (el) {
            el.classList.add('visible');
        });
        document.querySelectorAll('.stagger-children').forEach(function (el) {
            Array.from(el.children).forEach(function (child) {
                child.style.opacity = '1';
                child.style.transform = 'none';
            });
        });
    }

    function initAnimations() {
        // Hero entrance timeline
        var heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            heroTl
                .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 }, 0.2)
                .from('.hero-title .line, .hero h1 .highlight, .hero h1', {
                    y: 50, opacity: 0, duration: 0.9, stagger: 0.12
                }, 0.3)
                .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, 0.7)
                .from('.hero-actions, .hero .btn-group', { y: 20, opacity: 0, duration: 0.6 }, 0.9)
                .from('.hero-card', {
                    x: 60, opacity: 0, rotateY: 5, duration: 1.1, ease: 'power2.out'
                }, 0.5)
                .from('.hero-stats .hero-stat', {
                    y: 15, opacity: 0, stagger: 0.08, duration: 0.5
                }, 1.0);
        }

        // Scroll-triggered fade-ups
        gsap.utils.toArray('.fade-up').forEach(function (el) {
            gsap.fromTo(el,
                { y: 40, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    },
                    y: 0, opacity: 1, duration: 0.8, ease: 'power2.out'
                }
            );
        });

        // Stagger children (card grids, pain grid, steps)
        gsap.utils.toArray('.stagger-children').forEach(function (container) {
            var children = container.children;
            gsap.set(children, { opacity: 0, y: 30 });
            gsap.to(children, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 82%'
                },
                y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out'
            });
        });

        // Counter animation
        gsap.utils.toArray('[data-count]').forEach(function (el) {
            var target = parseFloat(el.dataset.count);
            var suffix = el.dataset.suffix || '';
            var isDecimal = el.dataset.decimal === 'true';

            // Determine if element is in the hero (animate on load) or in a section (scroll-triggered)
            var isHero = el.closest('.hero') !== null;

            function animateCounter() {
                var obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power1.out',
                    onUpdate: function () {
                        el.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix;
                    }
                });
            }

            if (isHero) {
                gsap.delayedCall(1.2, animateCounter);
            } else {
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 85%',
                    onEnter: animateCounter,
                    once: true
                });
            }
        });

        // Parallax hero glows
        gsap.utils.toArray('.hero-glow').forEach(function (glow, i) {
            gsap.to(glow, {
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -60 * (i + 1),
                ease: 'none'
            });
        });

        // Parallax hero grid
        var heroGrid = document.querySelector('.hero-grid');
        if (heroGrid) {
            gsap.to(heroGrid, {
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -40,
                opacity: 0,
                ease: 'none'
            });
        }

        // Page header entrance for inner pages
        var pageHeader = document.querySelector('.page-header');
        if (pageHeader && !heroContent) {
            gsap.from(pageHeader.querySelectorAll('h1, p, .breadcrumb'), {
                y: 20, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: 'power2.out'
            });
        }

        // Article header entrance
        var articleHeader = document.querySelector('.article-header');
        if (articleHeader) {
            gsap.from(articleHeader.querySelectorAll('.tag, h1, .article-meta'), {
                y: 20, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: 'power2.out'
            });
        }
    }

    // --- Mobile Navigation ---
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                toggle.classList.remove('open');
                menu.classList.remove('open');
            });
        });

        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                toggle.classList.remove('open');
                menu.classList.remove('open');
            }
        });
    }

    // --- Navbar Scroll ---
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // --- FAQ Accordion ---
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                var isOpen = item.classList.contains('open');
                faqItems.forEach(function (other) { other.classList.remove('open'); });
                if (!isOpen) item.classList.add('open');
            });
        }
    });

    // --- Contact Form Handling ---
    var form = document.getElementById('contactForm');
    var successMsg = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            var originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            })
            .then(function (response) {
                if (response.ok) {
                    form.style.display = 'none';
                    if (successMsg) successMsg.style.display = 'block';
                } else {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    var errEl = document.createElement('p');
                    errEl.style.color = '#ef4444';
                    errEl.style.marginTop = '0.75rem';
                    errEl.textContent = 'Something went wrong. Please email us directly at alex@teamrankrise.com';
                    form.appendChild(errEl);
                }
            })
            .catch(function () {
                btn.textContent = originalText;
                btn.disabled = false;
            });
        });
    }

    // --- UTM Parameter Capture ---
    function getParam(name) {
        var url = new URL(window.location.href);
        return url.searchParams.get(name) || '';
    }

    var utmSource = document.getElementById('utm_source');
    var utmMedium = document.getElementById('utm_medium');
    var utmCampaign = document.getElementById('utm_campaign');

    if (utmSource) utmSource.value = getParam('utm_source');
    if (utmMedium) utmMedium.value = getParam('utm_medium');
    if (utmCampaign) utmCampaign.value = getParam('utm_campaign');

})();
