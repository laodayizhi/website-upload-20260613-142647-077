(function () {
    "use strict";

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function setupMobileNav() {
        var toggle = one("[data-nav-toggle]");
        var panel = one("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = one("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = all("[data-hero-slide]", hero);
        var dots = all("[data-hero-dot]", hero);
        var prev = one("[data-hero-prev]", hero);
        var next = one("[data-hero-next]", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
                slide.setAttribute("aria-hidden", i === index ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupFilters() {
        all("[data-filter-scope]").forEach(function (scope) {
            var search = one("[data-search-input]", scope);
            var select = one("[data-filter-select]", scope);
            var cards = all("[data-search-card]", scope);
            var empty = one("[data-empty-message]", scope);
            if (!cards.length) {
                return;
            }

            function apply() {
                var q = normalize(search ? search.value : "");
                var type = normalize(select ? select.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search-text"));
                    var cardType = normalize(card.getAttribute("data-card-type"));
                    var matchText = !q || haystack.indexOf(q) !== -1;
                    var matchType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
                    var ok = matchText && matchType;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupPlayer() {
        var shell = one("[data-player]");
        if (!shell) {
            return;
        }
        var video = one("video", shell);
        var startButton = one("[data-player-start]", shell);
        if (!video) {
            return;
        }
        var source = video.getAttribute("data-play-url");
        var hls = null;
        var ready = false;

        function load() {
            if (ready || !source) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }

        function play() {
            load();
            shell.classList.add("is-playing");
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        if (startButton) {
            startButton.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    function setupCardFocus() {
        all(".movie-card, .category-card, .rank-row").forEach(function (card) {
            card.addEventListener("focus", function () {
                card.classList.add("is-focused");
            }, true);
            card.addEventListener("blur", function () {
                card.classList.remove("is-focused");
            }, true);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayer();
        setupCardFocus();
    });
})();
