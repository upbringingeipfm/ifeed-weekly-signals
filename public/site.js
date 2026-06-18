/* iFeed · site.js
   Site-wide interactivity. Loaded via <script defer> on every page.
   Every behaviour is feature-detected and auto-attaches to whatever DOM it finds.
   Pages that lack a hook simply skip it — no errors, no console noise.

   Modules:
     1. theme        · light/dark toggle (also wires existing toggle buttons)
     2. progress     · reading progress bar pinned to top
     3. backtotop    · floating return-to-top affordance
     4. smoothlinks  · anchor links scroll smoothly + offset for sticky nav
     5. externals    · auto-affix ↗ to external links · open in new tab
     6. shortcuts    · keyboard shortcuts (t, g h/l/m/n/r/f/c, ?, esc)
     7. shortcutui   · the help overlay invoked by ?
     8. activesec    · current section indicator (auto-generates side rail when ≥3 sections)
*/
(function () {
  'use strict';

  /* ── 1. theme ─────────────────────────────────────────── */
  function initTheme() {
    var root = document.documentElement;
    var saved = localStorage.getItem('ifeed-theme');
    if (saved && root.getAttribute('data-theme') !== saved) {
      root.setAttribute('data-theme', saved);
    }
    var tLight = document.getElementById('t-light');
    var tDark  = document.getElementById('t-dark');
    function apply(mode) {
      root.setAttribute('data-theme', mode);
      localStorage.setItem('ifeed-theme', mode);
      if (tLight && tDark) {
        tLight.classList.toggle('active', mode === 'light');
        tDark.classList.toggle('active',  mode === 'dark');
      }
    }
    if (tLight) tLight.addEventListener('click', function () { apply('light'); });
    if (tDark)  tDark.addEventListener('click',  function () { apply('dark');  });
    window.iFeedToggleTheme = function () {
      var current = root.getAttribute('data-theme') || 'light';
      apply(current === 'dark' ? 'light' : 'dark');
    };
    if (tLight && tDark) {
      var cur = root.getAttribute('data-theme') || 'light';
      tLight.classList.toggle('active', cur === 'light');
      tDark.classList.toggle('active',  cur === 'dark');
    }
  }

  /* ── 2. progress bar ──────────────────────────────────── */
  function initProgress() {
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'reading progress');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.transform = 'scaleX(' + (pct / 100) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ── 3. back to top ───────────────────────────────────── */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'back to top');
    btn.title = 'Back to top · g g';
    btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 3 L8 13 M3 8 L8 3 L13 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    var ticking = false;
    function update() {
      btn.classList.toggle('visible', window.scrollY > 800);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ── 4. smooth scroll for anchors ─────────────────────── */
  function initSmoothLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var navH = document.querySelector('.nav');
      var offset = navH ? navH.getBoundingClientRect().height + 16 : 16;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.pushState(null, '', '#' + id);
    });
  }

  /* ── 5. external link affordance ──────────────────────── */
  function initExternals() {
    var here = window.location.host;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (a.classList.contains('brand') || a.closest('.theme-toggle')) return;
      var isExternal = /^(https?:)?\/\//i.test(href) && href.indexOf(here) === -1;
      if (!isExternal) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      if (!a.querySelector('.ext-mark') && !a.dataset.noExt && a.textContent.indexOf('↗') === -1) {
        var mark = document.createElement('span');
        mark.className = 'ext-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = ' ↗';
        a.appendChild(mark);
      }
    });
  }

  /* ── 6. keyboard shortcuts ────────────────────────────── */
  function initShortcuts() {
    var prefix = '';
    var prefixTimeout = null;
    function navTo(href) {
      var path = window.location.pathname;
      var depth = (path.match(/\//g) || []).length - 1;
      if (path.endsWith('/')) depth = depth;
      var crumbs = path.split('/').filter(Boolean);
      crumbs.pop();
      var up = '';
      while (crumbs.length && crumbs[crumbs.length - 1] !== 'iFeed_Public_Platform') {
        up += '../';
        crumbs.pop();
      }
      window.location.href = up + href;
    }
    function tagFromBase() {
      var p = window.location.pathname;
      var name = p.split('/').filter(Boolean).pop() || '';
      return name;
    }
    function inEditable(t) {
      if (!t) return false;
      var tag = (t.tagName || '').toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
    }
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (inEditable(e.target)) return;

      if (e.key === 'Escape') {
        var help = document.getElementById('shortcut-help');
        if (help && help.classList.contains('visible')) {
          help.classList.remove('visible');
          e.preventDefault();
        }
        prefix = '';
        return;
      }

      if (e.key === '?' && e.shiftKey) {
        var help2 = document.getElementById('shortcut-help');
        if (help2) { help2.classList.toggle('visible'); e.preventDefault(); }
        return;
      }

      if (prefix === 'g') {
        clearTimeout(prefixTimeout); prefix = '';
        var map = {
          h: 'index.html',
          l: 'library.html',
          m: 'methodology.html',
          n: 'notes/index.html',
          a: 'academy.html',
          c: 'connect.html',
          f: 'founder.html',
          r: 'register.html',
          y: 'community.html',
          g: null
        };
        if (e.key === 'g') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          e.preventDefault();
          return;
        }
        if (map[e.key]) {
          navTo(map[e.key]);
          e.preventDefault();
        }
        return;
      }

      if (e.key === 't') {
        if (window.iFeedToggleTheme) window.iFeedToggleTheme();
        e.preventDefault();
        return;
      }
      if (e.key === 'g') {
        prefix = 'g';
        prefixTimeout = setTimeout(function () { prefix = ''; }, 1200);
        e.preventDefault();
      }
    });
  }

  /* ── 7. shortcut help overlay ────────────────────────── */
  function initShortcutUI() {
    var html = ''
      + '<div class="sh-card">'
      +   '<div class="sh-head">'
      +     '<span class="sh-title">Keyboard shortcuts</span>'
      +     '<span class="sh-close">esc</span>'
      +   '</div>'
      +   '<div class="sh-grid">'
      +     '<div class="sh-row"><kbd>t</kbd><span>Toggle theme</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>g</kbd><span>Back to top</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>h</kbd><span>Home</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>m</kbd><span>Methodology</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>l</kbd><span>Library</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>n</kbd><span>Notes</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>a</kbd><span>Academy</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>y</kbd><span>Community</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>f</kbd><span>Founder</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>c</kbd><span>Connect</span></div>'
      +     '<div class="sh-row"><kbd>g</kbd><kbd>r</kbd><span>Register</span></div>'
      +     '<div class="sh-row"><kbd>?</kbd><span>Toggle this help</span></div>'
      +   '</div>'
      + '</div>';
    var help = document.createElement('div');
    help.id = 'shortcut-help';
    help.className = 'shortcut-help';
    help.setAttribute('role', 'dialog');
    help.setAttribute('aria-label', 'keyboard shortcut help');
    help.innerHTML = html;
    document.body.appendChild(help);
    help.addEventListener('click', function (e) {
      if (e.target === help || e.target.classList.contains('sh-close')) {
        help.classList.remove('visible');
      }
    });

    var hint = document.createElement('button');
    hint.className = 'sh-hint';
    hint.setAttribute('aria-label', 'show keyboard shortcuts');
    hint.title = 'Keyboard shortcuts · ?';
    hint.textContent = '?';
    hint.addEventListener('click', function () {
      help.classList.toggle('visible');
    });
    document.body.appendChild(hint);
  }

  /* ── 8. active section ToC (auto-side-rail when ≥5 sections) ── */
  function initActiveSec() {
    var heads = document.querySelectorAll('section.sec .sec-h h2, section.sec h2');
    if (heads.length < 5) return;
    /* Suppress the rail on narrow viewports where it would overlap content. */
    if (window.matchMedia && window.matchMedia('(max-width: 1280px)').matches) return;
    var rail = document.createElement('nav');
    rail.className = 'sec-rail';
    rail.setAttribute('aria-label', 'page sections');
    var list = document.createElement('ul');
    rail.appendChild(list);
    var entries = [];
    heads.forEach(function (h, i) {
      var sec = h.closest('section');
      if (!sec) return;
      if (!sec.id) sec.id = 'sec-' + (i + 1);
      var num = sec.querySelector('.num');
      var label = (num && num.textContent.trim()) || (h.textContent.trim().slice(0, 28));
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.textContent = label;
      a.dataset.target = sec.id;
      li.appendChild(a);
      list.appendChild(li);
      entries.push({ section: sec, link: a });
    });
    if (!entries.length) return;
    document.body.appendChild(rail);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (items) {
        items.forEach(function (item) {
          var match = entries.find(function (en) { return en.section === item.target; });
          if (!match) return;
          if (item.isIntersecting && item.intersectionRatio > 0.15) {
            entries.forEach(function (en) { en.link.classList.remove('current'); });
            match.link.classList.add('current');
          }
        });
      }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.5] });
      entries.forEach(function (en) { io.observe(en.section); });
    }
  }

  /* ── 9. platform dropdowns · shared clusters without page rewrites ─── */
  function initPlatformDropdowns() {
    var clusters = {
      'library.html': {
        label: 'Library',
        items: [
          ['library/bioanalytical.html', 'Bio-Analytical Trials'],
          ['library/bioequivalence.html', 'Bio-Equivalence Trials'],
          ['library/clinical-trials.html', 'Clinical Trials'],
          ['library/governance.html', 'Governance']
        ],
        all: ['library.html', 'All · Library hub →']
      },
      'regulations.html': {
        label: 'Regulations',
        items: [
          ['regulations/eu-ai-act.html', 'EU AI Act'],
          ['regulations/fda-qmsr.html', 'FDA QMSR'],
          ['regulations/fda-csa.html', 'FDA CSA'],
          ['regulations/gamp5-ai-validation.html', 'GAMP 5 / AI'],
          ['regulations/ich-e6-r3.html', 'ICH E6(R3)'],
          ['regulations/good-ai-practice.html', 'Good AI Practice'],
          ['regulations/iso-iec-42001.html', 'ISO/IEC 42001'],
          ['regulations/ai-medtech-samd.html', 'AI-enabled MedTech / SaMD']
        ],
        all: ['regulations.html', 'All · Regulations hub →']
      },
      'ai.html': {
        label: 'AI',
        items: [
          ['ai/foundations.html', 'AI Foundations in Healthcare'],
          ['ai/clinical-care.html', 'Clinical Care & Decision Support'],
          ['ai/diagnostics-biomarkers.html', 'Diagnostics & Digital Biomarkers'],
          ['ai/clinical-trials.html', 'Clinical Trials & Evidence Generation'],
          ['ai/medicines-lifecycle.html', 'Medicines & Lifecycle AI'],
          ['ai/medtech-samd.html', 'AI-enabled MedTech / SaMD'],
          ['ai/data-infrastructure.html', 'Data & Infrastructure'],
          ['ai/governance-adoption.html', 'AI Governance & Adoption']
        ],
        all: ['ai.html', 'All · AI hub →']
      },
      'notes/index.html': {
        label: 'Notes',
        items: [
          ['notes/2026-06-01_weekly-w22.html', 'W22 · Evidence-Readiness Release'],
          ['notes/2026-05-25_weekly-w21.html', 'W21 · Structured Evidence Week'],
          ['notes/2026-05-18_weekly-w20.html', 'W20 · Evidence Architecture Shift'],
          ['notes/2026-05-11_weekly-w19.html', 'W19 · Algorithmic Evidence Shift']
        ],
        all: ['notes/index.html', 'All · Notes hub →']
      }
    };

    function rootPrefix(link, rootHref, cfg) {
      var href = link ? link.getAttribute('href') : '';
      var clean = (href || '').split('#')[0].split('?')[0].replace(/^https?:\/\/[^/]+/i, '');
      if (clean.slice(-rootHref.length) === rootHref) {
        return { prefix: clean.slice(0, clean.length - rootHref.length), strip: '', pretty: false };
      }
      var target = rootHref.replace(/\.html$/, '').replace(/\/index$/, '');
      var normal = clean.replace(/^\/+/, '').replace(/\/+$/, '');
      if (normal.slice(-5) === '.html') normal = normal.slice(0, -5);
      normal = normal.replace(/\/index$/, '');
      if (normal === target) {
        return { prefix: clean.charAt(0) === '/' ? '/' : clean.slice(0, Math.max(0, clean.length - target.length)), strip: '', pretty: clean.indexOf('.html') === -1 };
      }
      var text = link ? (link.textContent || '').replace(/▾/g, '').trim().toLowerCase() : '';
      if (cfg.label === 'Notes' && text === 'notes' && clean.slice(-'index.html'.length) === 'index.html') {
        return { prefix: clean.slice(0, clean.length - 'index.html'.length), strip: 'notes/', pretty: false };
      }
      return null;
    }

    function routeHref(route, context) {
      var out = route;
      if (context.strip && out.indexOf(context.strip) === 0) out = out.slice(context.strip.length);
      if (context.pretty) {
        out = out.replace(/\.html$/, '').replace(/\/index$/, '/');
      }
      return context.prefix + out;
    }

    function addDropLink(menu, href, label, className) {
      var a = document.createElement('a');
      a.href = href;
      if (className) a.className = className;
      var span = document.createElement('span');
      span.className = 'd-name';
      span.textContent = label;
      a.appendChild(span);
      menu.appendChild(a);
    }

    function enhanceLink(link, rootHref, cfg) {
      if (!link || !link.parentElement || link.parentElement.classList.contains('has-dropdown')) return;
      var context = rootPrefix(link, rootHref, cfg);
      if (context === null) return;

      var wrap = document.createElement('span');
      wrap.className = 'has-dropdown';
      var trigger = document.createElement('a');
      trigger.href = link.getAttribute('href');
      trigger.innerHTML = cfg.label + '<span class="caret">▾</span>';
      if (link.className) trigger.className = link.className;
      if (link.getAttribute('aria-current')) trigger.setAttribute('aria-current', link.getAttribute('aria-current'));

      var menu = document.createElement('div');
      menu.className = 'dropdown';
      menu.setAttribute('role', 'menu');
      cfg.items.forEach(function (item) {
        addDropLink(menu, routeHref(item[0], context), item[1]);
      });
      var sep = document.createElement('div');
      sep.className = 'd-sep';
      menu.appendChild(sep);
      addDropLink(menu, routeHref(cfg.all[0], context), cfg.all[1], 'd-all');

      wrap.appendChild(trigger);
      wrap.appendChild(menu);
      link.replaceWith(wrap);
    }

    document.querySelectorAll('.nav .links, .w20-drawer').forEach(function (links) {
      Array.prototype.slice.call(links.children).forEach(function (child) {
        if (!child.matches || !child.matches('a[href]')) return;
        Object.keys(clusters).forEach(function (rootHref) {
          enhanceLink(child, rootHref, clusters[rootHref]);
        });
      });
    });

    document.querySelectorAll('.w20-drawer .has-dropdown > a').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        var item = trigger.parentElement;
        if (!item) return;
        e.preventDefault();
        var drawer = item.closest('.w20-drawer');
        if (drawer) {
          drawer.querySelectorAll('.has-dropdown.is-open').forEach(function (other) {
            if (other !== item) other.classList.remove('is-open');
          });
        }
        item.classList.toggle('is-open');
      });
    });
  }

  /* ── 10. mobile nav · hamburger toggle + theme toggle relocation ─── */
  function initNavToggle() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) return;
    var links = nav.querySelector('.links');
    var themeToggle = document.querySelector('.theme-toggle');
    var themeToggleHome = themeToggle ? themeToggle.parentNode : null;
    var themeWrapInPanel = null;

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var open = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Close any open dropdown sub-menus when modal closes
      if (!open) {
        nav.querySelectorAll('.has-dropdown.is-open').forEach(function (d) {
          d.classList.remove('is-open');
        });
      }
    });
    // Mobile dropdown · tap the trigger link to expand/collapse the sub-menu
    nav.querySelectorAll('.has-dropdown').forEach(function (item) {
      var trigger = item.querySelector(':scope > a');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        var isMobile = window.matchMedia('(max-width: 960px)').matches;
        if (isMobile && nav.classList.contains('open')) {
          e.preventDefault();
          // Close other open dropdowns (single-open accordion)
          nav.querySelectorAll('.has-dropdown.is-open').forEach(function (other) {
            if (other !== item) other.classList.remove('is-open');
          });
          item.classList.toggle('is-open');
        }
      });
    });
    // Close panel on real link navigation (skip the trigger link · skip dropdown items handled below)
    nav.querySelectorAll('.links a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var isMobile = window.matchMedia('(max-width: 960px)').matches;
        // Skip if this is a dropdown trigger that we already handled above
        var parent = a.parentElement;
        var isDropdownTrigger = parent && parent.classList.contains('has-dropdown') && a === parent.querySelector(':scope > a');
        if (isMobile && isDropdownTrigger) return;
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        nav.querySelectorAll('.has-dropdown.is-open').forEach(function (d) {
          d.classList.remove('is-open');
        });
      });
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && nav.classList.contains('open') && (!themeToggle || !themeToggle.contains(e.target))) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Theme toggle relocation (round 2.19 · always inside the nav-inner)
       - Mobile (<= 960px): inside the .links drawer panel (top of menu)
       - Desktop (> 960px): inside .nav-inner as a flex sibling after .links
         so it's part of the pill layout · no overlapping with REGISTER */
    function relocateThemeToggle() {
      if (!themeToggle || !links || !nav) return;
      var navInner = nav.querySelector('.nav-inner');
      if (!navInner) return;
      if (themeToggle.closest('.nav-right')) return;
      var isMobile = window.matchMedia('(max-width: 960px)').matches;
      var insidePanel = themeToggle.closest('.links');
      var directNavInnerChild = themeToggle.parentElement === navInner;

      if (isMobile) {
        if (!insidePanel) {
          if (!themeWrapInPanel) {
            themeWrapInPanel = document.createElement('div');
            themeWrapInPanel.className = 'mobile-theme-wrap';
          }
          themeWrapInPanel.appendChild(themeToggle);
          links.insertBefore(themeWrapInPanel, links.firstChild);
        }
      } else {
        if (!directNavInnerChild || insidePanel) {
          // Append directly to .nav-inner so the toggle is the right-most
          // flex child (after .links) in the pill layout
          navInner.appendChild(themeToggle);
        }
      }
    }
    relocateThemeToggle();
    window.addEventListener('resize', function () {
      // Debounce-light: just call the function on resize (cheap)
      relocateThemeToggle();
    });
  }

  /* ── 11. mobile collapse · subnav chapter tabs + filter chips
     Transforms existing markup at runtime: pill stays, links collapse
     into a dropdown opened by a button on the right. Saves vertical
     space on phones where the wrapped chapter tabs eat 2-4 rows. ──── */
  function initMobileCollapse() {
    /* Pattern A · subnav chapter tabs */
    document.querySelectorAll('.subnav').forEach(function (subnav) {
      var inner = subnav.querySelector('.subnav-inner');
      if (!inner || inner.querySelector('.subnav-toggle')) return;
      var tag = inner.querySelector('.domain-tag');
      var links = Array.prototype.slice.call(inner.querySelectorAll(':scope > a'));
      if (!tag || links.length < 3) return;

      var menu = document.createElement('div');
      menu.className = 'subnav-menu';
      links.forEach(function (a) { menu.appendChild(a); });

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'subnav-toggle';
      btn.setAttribute('aria-label', 'Open chapter menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="st-label">Chapters</span><span class="st-icon" aria-hidden="true">▾</span>';

      inner.appendChild(btn);
      inner.appendChild(menu);

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = subnav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          subnav.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('click', function (e) {
        if (!subnav.contains(e.target) && subnav.classList.contains('is-open')) {
          subnav.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* Pattern B · filter-strip topic chips (notes/library hub) */
    document.querySelectorAll('.filter-strip').forEach(function (strip) {
      if (strip.querySelector('.filter-toggle')) return;
      var label = strip.querySelector('.fl-label');
      var chipsBox = strip.querySelector('.chips');
      if (!label || !chipsBox) return;
      // Skip if too few chips (not worth collapsing)
      if (chipsBox.querySelectorAll('.chip').length < 4) return;

      // Wrap label and toggle in a header bar
      var head = document.createElement('div');
      head.className = 'filter-head';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-toggle';
      btn.setAttribute('aria-label', 'Toggle topic filter');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="ft-label">Topics</span><span class="ft-icon" aria-hidden="true">▾</span>';
      // Move label into head, then add button after label
      strip.insertBefore(head, label);
      head.appendChild(label);
      head.appendChild(btn);

      // Helper to refresh button label with active chip text
      var labelEl = btn.querySelector('.ft-label');
      function refreshLabel() {
        var active = chipsBox.querySelector('.chip.active');
        if (active && labelEl) labelEl.textContent = (active.textContent || 'Topics').trim();
      }
      refreshLabel();

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = strip.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close on chip click (the chip handler will run separately to filter)
      chipsBox.querySelectorAll('.chip').forEach(function (c) {
        c.addEventListener('click', function () {
          // Defer until external chip handler updates .active state
          setTimeout(refreshLabel, 0);
          // Auto-close on mobile · let user see the result
          if (window.matchMedia('(max-width: 760px)').matches) {
            strip.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    /* Pattern C · summary-tabs (library hub cross-domain lens tabs)
       Collapse the 5-tab horizontal strip into a single button + dropdown
       on mobile. The active tab name shows in the button label. */
    document.querySelectorAll('.summary-tabs').forEach(function (tabs) {
      if (tabs.dataset.collapseInit === '1') return;
      tabs.dataset.collapseInit = '1';
      var tabEls = Array.prototype.slice.call(tabs.querySelectorAll('.summary-tab'));
      if (tabEls.length < 3) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'summary-tabs-toggle';
      btn.setAttribute('aria-label', 'Toggle lens menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="stt-pre">Lens:</span> <span class="stt-label">History</span> <span class="stt-icon" aria-hidden="true">▾</span>';
      tabs.parentNode.insertBefore(btn, tabs);

      var labelEl = btn.querySelector('.stt-label');
      function refreshLabel() {
        var active = tabs.querySelector('.summary-tab.active');
        if (active && labelEl) labelEl.textContent = (active.textContent || 'Lens').trim();
      }
      refreshLabel();

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = tabs.classList.toggle('is-open');
        btn.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      tabEls.forEach(function (t) {
        t.addEventListener('click', function () {
          setTimeout(refreshLabel, 0);
          if (window.matchMedia('(max-width: 760px)').matches) {
            tabs.classList.remove('is-open');
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      });
      document.addEventListener('click', function (e) {
        if (!tabs.contains(e.target) && e.target !== btn && !btn.contains(e.target) && tabs.classList.contains('is-open')) {
          tabs.classList.remove('is-open');
          btn.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* boot */
  function boot() {
    try { initTheme();        } catch (e) { console.warn('theme:', e); }
    try { initProgress();     } catch (e) { console.warn('progress:', e); }
    try { initBackToTop();    } catch (e) { console.warn('backtotop:', e); }
    try { initSmoothLinks();  } catch (e) { console.warn('smoothlinks:', e); }
    try { initExternals();    } catch (e) { console.warn('externals:', e); }
    try { initShortcuts();    } catch (e) { console.warn('shortcuts:', e); }
    try { initShortcutUI();   } catch (e) { console.warn('shortcutui:', e); }
    try { initActiveSec();    } catch (e) { console.warn('activesec:', e); }
    try { initPlatformDropdowns(); } catch (e) { console.warn('platformdropdowns:', e); }
    try { initNavToggle();    } catch (e) { console.warn('navtoggle:', e); }
    try { initMobileCollapse(); } catch (e) { console.warn('mobilecollapse:', e); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
