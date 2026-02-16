/* ==========================================================================
   RankRise SEO — Site JavaScript
   Mobile menu, scroll effects, FAQ accordion, form handling, UTM tracking
   ========================================================================== */

(function () {
    'use strict';

    // --- Mobile Navigation ---
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
        });

        // Close menu when clicking a link
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                toggle.classList.remove('open');
                menu.classList.remove('open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                toggle.classList.remove('open');
                menu.classList.remove('open');
            }
        });
    }

    // --- Navbar Scroll Shadow ---
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

    // --- Scroll Animations (IntersectionObserver) ---
    var fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        fadeEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show everything immediately
        fadeEls.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // --- FAQ Accordion ---
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                var isOpen = item.classList.contains('open');
                // Close all others
                faqItems.forEach(function (other) {
                    other.classList.remove('open');
                });
                // Toggle clicked
                if (!isOpen) {
                    item.classList.add('open');
                }
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

            var data = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            })
            .then(function (response) {
                if (response.ok) {
                    form.style.display = 'none';
                    if (successMsg) successMsg.style.display = 'block';
                } else {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    // Show inline error
                    var errEl = document.createElement('p');
                    errEl.style.color = '#e53e3e';
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

    // --- Animate Stats on Scroll ---
    var statValues = document.querySelectorAll('.stat-value');
    if (statValues.length > 0 && 'IntersectionObserver' in window) {
        var statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        statValues.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            statsObserver.observe(el);
        });
    }

})();
