(function () {
    var movies = window.SITE_MOVIES || [];

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function movieUrl(movie) {
        return './' + movie.file;
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="' + movieUrl(movie) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-gradient"></span>',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="' + movieUrl(movie) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine || movie.genre) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('is-menu-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function setupSuggestions() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.header-search, .mobile-search, .hero-search'));
        forms.forEach(function (form) {
            var input = form.querySelector('.global-search-input');
            var box = form.querySelector('.search-suggest');
            if (!input || !box) {
                return;
            }

            function render() {
                var q = normalize(input.value);
                if (!q) {
                    box.classList.remove('is-open');
                    box.innerHTML = '';
                    return;
                }
                var list = movies.filter(function (movie) {
                    return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ')).indexOf(q) >= 0;
                }).slice(0, 8);

                if (!list.length) {
                    box.innerHTML = '<div class="suggest-item"><span><strong>暂无匹配</strong><em>换个关键词试试</em></span></div>';
                    box.classList.add('is-open');
                    return;
                }

                box.innerHTML = list.map(function (movie) {
                    return '<a class="suggest-item" href="' + movieUrl(movie) + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"><span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></span></a>';
                }).join('');
                box.classList.add('is-open');
            }

            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            input.addEventListener('blur', function () {
                window.setTimeout(function () {
                    box.classList.remove('is-open');
                }, 180);
            });
        });
    }

    function setupCategoryFilter() {
        var grid = document.querySelector('.filter-grid');
        if (!grid) {
            return;
        }
        var input = document.querySelector('.category-filter-input');
        var select = document.querySelector('.category-year-select');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '暂无匹配影片';
        grid.appendChild(empty);

        function apply() {
            var q = normalize(input ? input.value : '');
            var year = select ? String(select.value || '') : '';
            var visible = 0;
            cards.forEach(function (card) {
                var hay = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var ok = (!q || hay.indexOf(q) >= 0) && (!year || card.dataset.year === year);
                card.classList.toggle('is-hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            empty.classList.toggle('is-visible', visible === 0);
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
    }

    function setupSearchPage() {
        var results = document.querySelector('.search-page-results');
        var input = document.querySelector('#search-page-input');
        if (!results || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;

        function render() {
            var query = normalize(input.value);
            var list = query ? movies.filter(function (movie) {
                return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ')).indexOf(query) >= 0;
            }).slice(0, 120) : movies.slice(0, 24);

            if (!list.length) {
                results.innerHTML = '<div class="search-empty is-visible">暂无匹配影片</div>';
                return;
            }
            results.innerHTML = list.map(cardHtml).join('');
        }

        input.addEventListener('input', render);
        render();
    }

    setupMenu();
    setupHero();
    setupSuggestions();
    setupCategoryFilter();
    setupSearchPage();
})();
