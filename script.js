/* ==========================================================================
   Amal Krishna - portfolio scripts
   Everything here is vanilla JS, no build step, so it runs as-is on GitHub
   Pages. Sections are labelled - jump to the one you need.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  /* ---------------------------------------------------------------- utils */

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[ch];
      }
    );
  }

  function safeUrl(url) {
    var value = String(url || "").trim();
    return /^(https?:\/\/|\/|\.\/|#)/i.test(value) ? value : "";
  }

  function countUp(el, target, duration, format) {
    format =
      format ||
      function (v) {
        return String(Math.round(v));
      };

    if (reduceMotion || duration <= 0) {
      el.textContent = format(target);
      return;
    }

    var start = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------- theme */

  var THEME_KEY = "portfolio-theme";
  var themeLabel = $("#themeLabel");

  function applyTheme(theme) {
    var dark = theme === "dark";
    body.classList.toggle("dark", dark);
    body.classList.toggle("light", !dark);

    if (themeLabel) themeLabel.textContent = dark ? "dark" : "light";

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0b0f14" : "#f6f8fa");
  }

  var storedTheme = localStorage.getItem(THEME_KEY);
  var urlTheme = new URLSearchParams(window.location.search).get("theme");
  applyTheme(
    storedTheme || (urlTheme === "light" || urlTheme === "dark" ? urlTheme : "dark")
  );

  var themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = body.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ----------------------------------------------------------- mobile nav */

  var nav = $("#nav");
  var hamburger = $("#hamburger");

  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle("nav--open", open);
    if (hamburger) hamburger.setAttribute("aria-expanded", String(open));
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      setNav(!(nav && nav.classList.contains("nav--open")));
    });
  }

  $$(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      setNav(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!nav || !nav.classList.contains("nav--open")) return;
    if (!nav.contains(event.target)) setNav(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  /* -------------------------------------------------------- certifications */

  var certGrid = $("#certGrid");
  var certList = typeof CERTIFICATIONS !== "undefined" ? CERTIFICATIONS : [];

  function renderCertifications() {
    if (!certGrid) return;

    if (!certList.length) {
      certGrid.innerHTML =
        '<p class="empty">No certifications listed yet &mdash; add them in <code>certifications.js</code>.</p>';
      return;
    }

    certGrid.innerHTML = certList
      .map(function (cert, index) {
        var title = escapeHtml(cert.title || "Untitled certification");
        var issuer = escapeHtml(cert.issuer || "");
        var date = escapeHtml(cert.date || "");
        var credId = escapeHtml(cert.id || "");
        var url = safeUrl(cert.url);
        var fileName =
          "cert-" + String(index + 1).padStart(2, "0") + ".pdf";

        var skills = (cert.skills || [])
          .map(function (skill) {
            return "<li>" + escapeHtml(skill) + "</li>";
          })
          .join("");

        var meta = [issuer, date].filter(Boolean).join(" &middot; ");

        var footer = "";
        if (url) {
          footer +=
            '<a class="project__link" href="' +
            escapeHtml(url) +
            '" target="_blank" rel="noopener">' +
            'view credential <span aria-hidden="true">&nearr;</span></a>';
        }
        if (credId) {
          footer +=
            '<span class="cert__id">id: ' + credId + "</span>";
        }
        if (!footer) {
          footer =
            '<span class="cert__id comment">// add a url in certifications.js</span>';
        }

        return (
          '<article class="cert window reveal">' +
          '<div class="window__bar">' +
          '<span class="window__dots">' +
          '<i class="dot dot--red"></i><i class="dot dot--amber"></i><i class="dot dot--green"></i>' +
          "</span>" +
          '<span class="window__title">' +
          fileName +
          "</span>" +
          "</div>" +
          '<div class="window__body">' +
          '<h3 class="cert__title">' +
          title +
          "</h3>" +
          (meta ? '<p class="cert__meta">' + meta + "</p>" : "") +
          (skills ? '<ul class="cert__skills">' + skills + "</ul>" : "") +
          '<div class="cert__links">' +
          footer +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  renderCertifications();

  /* -------------------------------------------------------------- typing */

  var typedEl = $("#typed");
  var ROLES = [
    "Developer",
    "Graphics Designer",
    "Data & ML Enthusiast",
    "Problem Solver",
  ];

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = ROLES[0];
    } else {
      (function typeLoop() {
        var roleIndex = 0;
        var charIndex = 0;
        var deleting = false;

        function tick() {
          var role = ROLES[roleIndex];
          charIndex += deleting ? -1 : 1;
          typedEl.textContent = role.slice(0, charIndex);

          var delay = deleting ? 35 : 70;

          if (!deleting && charIndex === role.length) {
            deleting = true;
            delay = 1500;
          } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % ROLES.length;
            delay = 320;
          }

          window.setTimeout(tick, delay);
        }

        window.setTimeout(tick, 450);
      })();
    }
  }

  /* -------------------------------------------------- reveal on scroll */

  var revealEls = $$(".reveal");

  function staggerDelay(el) {
    var parent = el.parentElement;
    if (!parent) return 0;
    var siblings = Array.prototype.filter.call(parent.children, function (child) {
      return child.classList && child.classList.contains("reveal");
    });
    var index = siblings.indexOf(el);
    return index > 0 ? Math.min(index * 90, 450) : 0;
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = staggerDelay(el);

          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-visible");
          revealObserver.unobserve(el);

          window.setTimeout(
            function () {
              el.style.transitionDelay = "0ms";
            },
            delay + 900
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------- skill meters */

  function animateSkill(skill) {
    var level = Math.max(0, Math.min(100, Number(skill.dataset.level) || 0));
    var fill = $(".skill__fill", skill);
    var pct = $(".skill__pct", skill);

    if (fill) fill.style.width = level + "%";
    if (pct) {
      countUp(pct, level, 900, function (v) {
        return Math.round(v) + "%";
      });
    }
  }

  var skillLists = $$(".skills__list");

  if (!reduceMotion && "IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var list = entry.target;
          $$(".skill", list).forEach(function (skill, index) {
            window.setTimeout(function () {
              animateSkill(skill);
            }, index * 110);
          });
          skillObserver.unobserve(list);
        });
      },
      { threshold: 0.25 }
    );

    skillLists.forEach(function (list) {
      skillObserver.observe(list);
    });
  } else {
    skillLists.forEach(function (list) {
      $$(".skill", list).forEach(animateSkill);
    });
  }

  /* ------------------------------------------------------ stat counters */

  var statObserver = null;

  function runStat(el) {
    var selector = el.dataset.countFrom;
    var value = selector ? document.querySelectorAll(selector).length : 0;
    countUp(el, value, 1000);
  }

  var stats = $$(".stat__num");

  if (!reduceMotion && "IntersectionObserver" in window) {
    statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runStat(entry.target);
          statObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    stats.forEach(runStat);
  }

  /* ----------------------------------------------------- scroll effects */

  var progressBar = $("#progressBar");
  var header = $("#header");
  var scrollTopBtn = $("#scrollTop");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    if (header) header.classList.toggle("header--scrolled", y > 20);
    if (scrollTopBtn) scrollTopBtn.classList.toggle("is-visible", y > 500);

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true }
  );

  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------- scroll spy */

  var navLinks = $$(".nav__link");
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* --------------------------------------------------- dot grid canvas */

  var canvas = $("#bgCanvas");

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var spacing = 40;
    var dots = [];
    var width = 0;
    var height = 0;
    var rafId = null;
    var pointer = { x: -9999, y: -9999 };

    function buildGrid() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      for (var x = spacing / 2; x < width; x += spacing) {
        for (var y = spacing / 2; y < height; y += spacing) {
          dots.push({ x: x, y: y, phase: Math.random() * Math.PI * 2 });
        }
      }
    }

    function drawGrid(time) {
      var styles = getComputedStyle(body);
      var accent = styles.getPropertyValue("--accent").trim() || "#3fb950";
      var base = styles.getPropertyValue("--grid-dot").trim() || "#8b949e";

      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var x = dot.x + Math.sin(time / 1600 + dot.phase) * 2.2;
        var y = dot.y + Math.cos(time / 2000 + dot.phase) * 2.2;
        var dist = Math.hypot(x - pointer.x, y - pointer.y);
        var near = Math.max(0, 1 - dist / 170);

        ctx.beginPath();
        ctx.arc(x, y, 1.1 + near * 1.8, 0, Math.PI * 2);
        ctx.globalAlpha = 0.22 + near * 0.65;
        ctx.fillStyle = near > 0.04 ? accent : base;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function loop(time) {
      drawGrid(time);
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    buildGrid();

    if (reduceMotion) {
      drawGrid(0);
    } else {
      startLoop();

      window.addEventListener("pointermove", function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      });

      window.addEventListener("pointerleave", function () {
        pointer.x = -9999;
        pointer.y = -9999;
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopLoop();
        else startLoop();
      });

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          buildGrid();
        }, 150);
      });
    }
  }

  /* -------------------------------------------------------------- misc */

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
