(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".nav-links");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function buildSearchResult(movie) {
        var link = document.createElement("a");
        link.className = "search-result";
        link.href = movie.url;
        link.innerHTML = "<img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\"><span><strong>" + movie.title + "</strong><span>" + movie.year + " · " + movie.region + " · " + movie.genre + "</span></span><em>" + movie.rating + "</em>";
        return link;
    }

    function initSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var panel = document.querySelector("[data-search-panel]");
        var data = window.MOVIE_SEARCH_INDEX || [];
        if (!forms.length || !panel || !data.length) {
            return;
        }
        function render(query) {
            var keyword = normalize(query);
            panel.innerHTML = "";
            if (!keyword) {
                panel.classList.remove("is-open");
                return;
            }
            var results = data.filter(function (movie) {
                return normalize(movie.title + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.category).indexOf(keyword) !== -1;
            }).slice(0, 8);
            if (!results.length) {
                var empty = document.createElement("p");
                empty.className = "search-empty";
                empty.textContent = "没有匹配影片";
                panel.appendChild(empty);
            } else {
                results.forEach(function (movie) {
                    panel.appendChild(buildSearchResult(movie));
                });
            }
            panel.classList.add("is-open");
        }
        forms.forEach(function (form) {
            var input = form.querySelector("input");
            if (!input) {
                return;
            }
            input.addEventListener("input", function () {
                render(input.value);
            });
            input.addEventListener("focus", function () {
                render(input.value);
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render(input.value);
            });
        });
        document.addEventListener("click", function (event) {
            if (!panel.contains(event.target) && !event.target.closest("[data-search-form]")) {
                panel.classList.remove("is-open");
            }
        });
    }

    function initFilters() {
        var bar = document.querySelector("[data-filter-bar]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!bar || !grid) {
            return;
        }
        var controls = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector(".filter-empty");
        function valueOf(name) {
            var node = bar.querySelector("[data-filter=\"" + name + "\"]");
            return node ? normalize(node.value) : "";
        }
        function apply() {
            var keyword = valueOf("keyword");
            var year = valueOf("year");
            var region = valueOf("region");
            var type = valueOf("type");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year"));
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute("data-region")) !== region) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute("data-type")) !== type) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        controls.forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var trigger = document.getElementById("playTrigger");
        var stage = document.getElementById("playerStage");
        if (!video || !trigger || !stage || !source) {
            return;
        }
        var attached = false;
        var hls = null;
        function hideTrigger() {
            trigger.classList.add("is-hidden");
            stage.classList.add("is-playing");
        }
        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        function attach(autoplay) {
            if (attached) {
                if (autoplay) {
                    playVideo();
                }
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                if (autoplay) {
                    playVideo();
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (autoplay) {
                        playVideo();
                    }
                });
                return;
            }
            video.src = source;
            if (autoplay) {
                playVideo();
            }
        }
        function start() {
            hideTrigger();
            attach(true);
        }
        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            }
        });
        video.addEventListener("play", hideTrigger);
        video.addEventListener("loadedmetadata", function () {
            stage.classList.add("is-ready");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initFilters();
    });
})();
