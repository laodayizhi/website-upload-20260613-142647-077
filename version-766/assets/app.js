(function() {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-slide-dot]'));
        let activeIndex = 0;

        function showSlide(index) {
            activeIndex = index;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                showSlide((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    const searchInput = document.querySelector('[data-search-input]');
    const searchCount = document.querySelector('[data-search-count]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        const keyword = normalize(searchInput ? searchInput.value : '');
        let count = 0;

        cards.forEach(function(card) {
            const text = normalize(card.getAttribute('data-search-text'));
            const matched = !keyword || text.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                count += 1;
            }
        });

        if (searchCount) {
            searchCount.textContent = count + ' 部影片';
        }
    }

    if (searchInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', filterCards);
        filterCards();
    }
})();
