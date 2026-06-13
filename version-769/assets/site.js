(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = $('[data-nav-toggle]');
        var menu = $('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = $all('[data-hero-slide]');
        var dots = $all('[data-hero-dot]');
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide--active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function initLocalFilters() {
        var panels = $all('[data-filter-panel]');
        panels.forEach(function (panel) {
            var input = $('[data-filter-input]', panel);
            var buttons = $all('[data-filter-type]', panel);
            var gridSelector = panel.getAttribute('data-filter-target');
            var grid = gridSelector ? $(gridSelector) : null;
            var empty = grid ? $('[data-empty-state]', grid.parentNode) : null;
            if (!grid) {
                return;
            }
            var cards = $all('[data-card]', grid);
            var activeType = 'all';
            function apply() {
                var keyword = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var typeValue = normalize(card.getAttribute('data-type'));
                    var typeMatched = activeType === 'all' || typeValue.indexOf(activeType) !== -1 || haystack.indexOf(activeType) !== -1;
                    var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                    var matched = typeMatched && keywordMatched;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeType = normalize(button.getAttribute('data-filter-type'));
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '<a class="movie-card__cover" href="' + movie.url + '">',
            '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
            '<span class="movie-card__badge">' + movie.type + '</span>',
            '<span class="movie-card__rating">★ ' + movie.rating + '</span>',
            '</a>',
            '<div class="movie-card__body">',
            '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
            '<p>' + movie.desc + '</p>',
            '<div class="movie-card__meta">' + movie.year + ' · ' + movie.region + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var input = $('[data-global-search]');
        var results = $('[data-search-results]');
        var empty = $('[data-search-empty]');
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render() {
            var keyword = normalize(input.value);
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = normalize([movie.title, movie.type, movie.year, movie.region, movie.genre, movie.tags, movie.category].join(' '));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 96);
            results.innerHTML = list.map(createSearchCard).join('');
            if (empty) {
                empty.classList.toggle('is-visible', list.length === 0);
            }
        }
        input.addEventListener('input', render);
        render();
    }

    function setupVideo(player) {
        var video = $('video[data-video-src]', player);
        var center = $('[data-player-toggle]', player);
        var progress = $('[data-player-progress]', player);
        var progressBar = progress ? $('span', progress) : null;
        var buttons = $all('[data-player-button]', player);
        var loaded = false;
        var hlsInstance = null;
        if (!video) {
            return;
        }
        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            var source = video.getAttribute('data-video-src');
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            loadSource();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        function toggle() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }
        function updateState() {
            player.classList.toggle('is-playing', !video.paused);
            buttons.forEach(function (button) {
                button.textContent = video.paused ? '播放' : '暂停';
            });
        }
        if (center) {
            center.addEventListener('click', toggle);
        }
        video.addEventListener('click', toggle);
        video.addEventListener('play', updateState);
        video.addEventListener('pause', updateState);
        video.addEventListener('timeupdate', function () {
            if (!progressBar || !video.duration) {
                return;
            }
            progressBar.style.width = (video.currentTime / video.duration * 100) + '%';
        });
        if (progress) {
            progress.addEventListener('click', function (event) {
                if (!video.duration) {
                    return;
                }
                var rect = progress.getBoundingClientRect();
                var ratio = (event.clientX - rect.left) / rect.width;
                video.currentTime = Math.max(0, Math.min(1, ratio)) * video.duration;
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', toggle);
        });
        document.addEventListener('click', function (event) {
            var trigger = event.target.closest('[data-start-player]');
            if (!trigger) {
                return;
            }
            var target = document.getElementById('player');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            play();
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function initPlayers() {
        $all('[data-player]').forEach(setupVideo);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initLocalFilters();
        initSearchPage();
        initPlayers();
    });
})();
