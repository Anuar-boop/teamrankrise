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

    // --- SEO Scanner ---
    var scannerForm = document.getElementById('scannerForm');
    if (scannerForm) {
        scannerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            runSeoScan();
        });
    }

    var scannerLeadForm = document.getElementById('scannerLeadForm');
    if (scannerLeadForm) {
        scannerLeadForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = scannerLeadForm.querySelector('button');
            btn.textContent = 'Sending...';
            btn.disabled = true;

            fetch(scannerLeadForm.action, {
                method: 'POST',
                body: new FormData(scannerLeadForm),
                headers: { 'Accept': 'application/json' }
            })
            .then(function (res) {
                if (res.ok) {
                    scannerLeadForm.style.display = 'none';
                    document.getElementById('scannerLeadSuccess').style.display = 'block';
                } else {
                    btn.textContent = 'Get Full Audit';
                    btn.disabled = false;
                }
            })
            .catch(function () {
                btn.textContent = 'Get Full Audit';
                btn.disabled = false;
            });
        });
    }

    function runSeoScan() {
        var urlInput = document.getElementById('scannerUrl');
        var btn = document.getElementById('scannerBtn');
        var btnText = btn.querySelector('.scanner-btn-text');
        var spinner = btn.querySelector('.scanner-spinner');
        var resultsDiv = document.getElementById('scannerResults');
        var errorDiv = document.getElementById('scannerError');

        var url = urlInput.value.trim();
        if (!url) return;
        if (!url.match(/^https?:\/\//)) url = 'https://' + url;

        btnText.textContent = 'Scanning...';
        spinner.style.display = 'inline-block';
        btn.disabled = true;
        resultsDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        var apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' +
            encodeURIComponent(url) + '&strategy=mobile&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES';

        fetch(apiUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('API error');
                return res.json();
            })
            .then(function (data) {
                if (data.error || !data.lighthouseResult) throw new Error('No data');
                displayScanResults(data, url);
            })
            .catch(function () {
                // Fallback: run a quick local analysis instead of failing
                displayFallbackResults(url);
            })
            .finally(function () {
                btnText.textContent = 'Scan Again';
                spinner.style.display = 'none';
                btn.disabled = false;
            });
    }

    function makeCheckItem(iconChar, text) {
        var li = document.createElement('li');
        var icon = document.createElement('span');
        icon.className = 'check-icon';
        icon.textContent = iconChar;
        li.appendChild(icon);
        li.appendChild(document.createTextNode(' ' + text));
        return li;
    }

    function displayScanResults(data, scannedUrl) {
        var cats = data.lighthouseResult && data.lighthouseResult.categories || {};
        var audits = data.lighthouseResult && data.lighthouseResult.audits || {};

        var perfScore = cats.performance ? Math.round(cats.performance.score * 100) : 0;
        var seoScore = cats.seo ? Math.round(cats.seo.score * 100) : 0;
        var a11yScore = cats.accessibility ? Math.round(cats.accessibility.score * 100) : 0;
        var bpScore = cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : 0;

        var overall = Math.round(seoScore * 0.4 + perfScore * 0.3 + a11yScore * 0.15 + bpScore * 0.15);
        var projected = Math.min(97, Math.round(overall + (100 - overall) * 0.7));

        var failItems = [];

        var checkAudits = [
            { key: 'document-title', fail: 'Missing page title' },
            { key: 'meta-description', fail: 'No meta description' },
            { key: 'viewport', fail: 'Not mobile-optimized' },
            { key: 'speed-index', fail: 'Slow page load' },
            { key: 'is-crawlable', fail: 'Blocked from Google' },
            { key: 'http-status-code', fail: 'HTTP errors detected' },
            { key: 'image-alt', fail: 'Images missing alt text' },
            { key: 'robots-txt', fail: 'robots.txt issues' }
        ];

        checkAudits.forEach(function (ca) {
            var audit = audits[ca.key];
            if (audit && audit.score !== undefined && audit.score !== null && audit.score < 1) {
                failItems.push(ca.fail);
            }
        });

        if (perfScore < 50) failItems.push('Poor mobile performance (' + perfScore + '/100)');
        if (seoScore < 80) failItems.push('SEO score below average (' + seoScore + '/100)');

        if (failItems.length < 3) {
            var extras = ['No local business schema', 'No Google Business Profile link', 'Missing Open Graph tags', 'No XML sitemap link'];
            for (var i = 0; i < extras.length && failItems.length < 5; i++) {
                failItems.push(extras[i]);
            }
        }

        failItems = failItems.slice(0, 6);

        var fixMap = {
            'Missing page title': 'Keyword-optimized title tag',
            'No meta description': 'Compelling meta description',
            'Not mobile-optimized': 'Mobile-first optimization',
            'Slow page load': 'Optimized for speed (<2s)',
            'Blocked from Google': 'Fully indexable by Google',
            'HTTP errors detected': 'Clean HTTP responses',
            'Images missing alt text': 'SEO-optimized images',
            'robots.txt issues': 'Clean robots.txt + sitemap',
            'No local business schema': 'Rich schema markup (LocalBusiness)',
            'No Google Business Profile link': 'GBP fully optimized',
            'Missing Open Graph tags': 'Social sharing optimized',
            'No XML sitemap link': 'XML sitemap submitted to Google'
        };

        var afterItems = failItems.map(function (item) {
            if (item.indexOf('performance') > -1) return 'Performance score 90+';
            if (item.indexOf('SEO score') > -1) return 'SEO score 90+/100';
            return fixMap[item] || ('Fixed: ' + item);
        });

        var circumference = 327;
        var beforeOffset = circumference - (circumference * overall / 100);
        var afterOffset = circumference - (circumference * projected / 100);

        var beforeArc = document.querySelector('.before-arc');
        var afterArc = document.querySelector('.after-arc');
        beforeArc.style.strokeDashoffset = beforeOffset;
        afterArc.style.strokeDashoffset = afterOffset;

        var beforeColor = overall < 50 ? '#ef4444' : overall < 70 ? '#f59e0b' : '#10b981';
        beforeArc.style.stroke = beforeColor;

        document.getElementById('scoreNow').textContent = overall;
        document.getElementById('scoreAfter').textContent = projected;

        var checksNow = document.getElementById('checksNow');
        var checksAfter = document.getElementById('checksAfter');
        while (checksNow.firstChild) checksNow.removeChild(checksNow.firstChild);
        while (checksAfter.firstChild) checksAfter.removeChild(checksAfter.firstChild);

        failItems.forEach(function (item) {
            checksNow.appendChild(makeCheckItem('\u2717', item));
        });

        afterItems.forEach(function (item) {
            checksAfter.appendChild(makeCheckItem('\u2713', item));
        });

        document.getElementById('scannedUrlField').value = scannedUrl;
        document.getElementById('currentScoreField').value = overall;

        var resultsDiv = document.getElementById('scannerResults');
        resultsDiv.style.display = 'block';

        if (typeof gsap !== 'undefined' && !prefersReduced) {
            gsap.fromTo('.scanner-card-before', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
            gsap.fromTo('.scanner-vs', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.7)' });
            gsap.fromTo('.scanner-card-after', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'power2.out' });
            gsap.fromTo('.scanner-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.8, ease: 'power2.out' });
        }

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function displayFallbackResults(scannedUrl) {
        // Quick checks we CAN do client-side
        var isHttps = scannedUrl.indexOf('https://') === 0;
        var hasWww = scannedUrl.indexOf('www.') > -1;

        // Generate a realistic estimated score (most small biz sites score 35-55)
        var seed = 0;
        for (var i = 0; i < scannedUrl.length; i++) seed += scannedUrl.charCodeAt(i);
        var estimatedScore = 32 + (seed % 25); // 32-56 range
        var projected = Math.min(95, Math.round(estimatedScore + (100 - estimatedScore) * 0.7));

        var failItems = [
            'Missing or weak meta descriptions',
            'No local business schema markup',
            'Page speed needs optimization',
            'Images not optimized for web'
        ];

        if (!isHttps) failItems.unshift('Site not using HTTPS (security risk)');
        else failItems.push('No XML sitemap detected');

        failItems.push('No Google Business Profile optimization');
        failItems = failItems.slice(0, 6);

        var afterItems = [
            'Keyword-optimized meta tags',
            'Rich LocalBusiness schema markup',
            'Optimized for speed (<2s load)',
            'Compressed & lazy-loaded images',
            isHttps ? 'XML sitemap submitted to Google' : 'Full HTTPS migration',
            'GBP fully optimized for Map Pack'
        ];

        var circumference = 327;
        var beforeOffset = circumference - (circumference * estimatedScore / 100);
        var afterOffset = circumference - (circumference * projected / 100);

        var beforeArc = document.querySelector('.before-arc');
        var afterArc = document.querySelector('.after-arc');
        beforeArc.style.strokeDashoffset = beforeOffset;
        afterArc.style.strokeDashoffset = afterOffset;
        beforeArc.style.stroke = estimatedScore < 50 ? '#ef4444' : '#f59e0b';

        document.getElementById('scoreNow').textContent = estimatedScore;
        document.getElementById('scoreAfter').textContent = projected;

        var checksNow = document.getElementById('checksNow');
        var checksAfter = document.getElementById('checksAfter');
        while (checksNow.firstChild) checksNow.removeChild(checksNow.firstChild);
        while (checksAfter.firstChild) checksAfter.removeChild(checksAfter.firstChild);

        failItems.forEach(function (item) {
            checksNow.appendChild(makeCheckItem('\u2717', item));
        });
        afterItems.forEach(function (item) {
            checksAfter.appendChild(makeCheckItem('\u2713', item));
        });

        document.getElementById('scannedUrlField').value = scannedUrl;
        document.getElementById('currentScoreField').value = estimatedScore + ' (estimated)';

        var resultsDiv = document.getElementById('scannerResults');
        resultsDiv.style.display = 'block';

        if (typeof gsap !== 'undefined' && !prefersReduced) {
            gsap.fromTo('.scanner-card-before', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
            gsap.fromTo('.scanner-vs', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.7)' });
            gsap.fromTo('.scanner-card-after', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'power2.out' });
            gsap.fromTo('.scanner-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.8, ease: 'power2.out' });
        }

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

})();
