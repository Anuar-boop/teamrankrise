/* ==========================================================================
   RankRise SEO — Premium Interactions v2
   GSAP scroll reveals, horizontal scroll, hero entrance, counters,
   mobile menu, FAQ accordion, form handling, UTM tracking
   ========================================================================== */

(function () {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
        gsap.registerPlugin(ScrollTrigger);
        initAnimations();
    } else {
        document.querySelectorAll('.reveal, .bento-cell, .timeline-step, .blog-card, .problem-headline, .problem-text, .problem-list li').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    function initAnimations() {
        // Hero entrance timeline
        var heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from('.hero-label', { y: 20, opacity: 0, duration: 0.5 }, 0.1)
              .from('.hero-content h1 .line', { y: 60, opacity: 0, duration: 0.9, stagger: 0.15 }, 0.2)
              .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, 0.8)
              .from('.hero-actions', { y: 20, opacity: 0, duration: 0.6 }, 1.0)
              .from('.hero-card', { x: 80, opacity: 0, rotateY: 6, duration: 1.2, ease: 'power2.out' }, 0.4)
              .from('.rank-item', { x: 30, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, 1.0)
              .from('.chart-mini .bar', { scaleY: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', transformOrigin: 'bottom' }, 1.2);
        }

        // Scroll-triggered reveals
        gsap.utils.toArray('.reveal').forEach(function (el) {
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

        // Staggered bento cells
        var bentoGrid = document.querySelector('.bento-grid');
        if (bentoGrid) {
            gsap.fromTo('.bento-cell',
                { y: 40, opacity: 0 },
                {
                    scrollTrigger: { trigger: bentoGrid, start: 'top 80%' },
                    y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out'
                }
            );
        }

        // Staggered timeline steps
        var timeline = document.querySelector('.timeline');
        if (timeline) {
            gsap.fromTo('.timeline-step',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: { trigger: timeline, start: 'top 80%' },
                    y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out'
                }
            );
        }

        // Problem section — editorial text reveals
        var problemContent = document.querySelector('.problem-content');
        if (problemContent) {
            gsap.fromTo('.problem-headline',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: { trigger: problemContent, start: 'top 82%' },
                    y: 0, opacity: 1, duration: 0.8, ease: 'power2.out'
                }
            );
            gsap.fromTo('.problem-text',
                { y: 25, opacity: 0 },
                {
                    scrollTrigger: { trigger: problemContent, start: 'top 72%' },
                    y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out'
                }
            );
            gsap.fromTo('.problem-list li',
                { x: -20, opacity: 0 },
                {
                    scrollTrigger: { trigger: '.problem-list', start: 'top 85%' },
                    x: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out'
                }
            );
        }

        // Blog cards stagger
        var blogGrid = document.querySelector('.blog-grid');
        if (blogGrid) {
            gsap.fromTo('.blog-card',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: { trigger: blogGrid, start: 'top 82%' },
                    y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out'
                }
            );
        }

        // --- Horizontal Scroll Pin (Results Section) ---
        var hscrollSection = document.getElementById('results-section');
        var hscrollTrack = document.getElementById('hscrollTrack');

        if (hscrollSection && hscrollTrack && window.innerWidth > 768) {
            var cards = hscrollTrack.querySelectorAll('.case-card');
            var endLink = hscrollTrack.querySelector('.hscroll-end');
            var gap = 32;
            var trackWidth = hscrollTrack.scrollWidth;
            var totalScroll = trackWidth - window.innerWidth;

            var hscrollTween = gsap.to(hscrollTrack, {
                x: function () { return -totalScroll; },
                ease: 'none',
                scrollTrigger: {
                    trigger: hscrollSection,
                    start: 'top top',
                    end: function () { return '+=' + totalScroll; },
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // Animate case bars when they enter viewport during scroll
            cards.forEach(function (card) {
                var bars = card.querySelectorAll('.case-bar');
                gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom' });

                ScrollTrigger.create({
                    trigger: card,
                    containerAnimation: hscrollTween,
                    start: 'left 80%',
                    onEnter: function () {
                        gsap.to(bars, { scaleY: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
                    },
                    once: true
                });
            });
        }

        // Counter animation for metric values (used in case cards, hero stats)
        gsap.utils.toArray('[data-count]').forEach(function (el) {
            var target = parseFloat(el.dataset.count);
            var suffix = el.dataset.suffix || '';
            var isDecimal = el.dataset.decimal === 'true';
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
