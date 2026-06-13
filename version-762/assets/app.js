(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    document.querySelectorAll("[data-filter-box]").forEach(function (box) {
      var target = document.querySelector(box.getAttribute("data-filter-box"));
      if (!target) return;
      var search = box.querySelector("[data-search-input]");
      var genre = box.querySelector("[data-genre-filter]");
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector('[data-empty-for="' + target.id + '"]');

      function filter() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var g = genre ? genre.value.trim() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-search") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var ok = (!q || haystack.indexOf(q) !== -1) && (!g || cardGenre.indexOf(g) !== -1);
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (search) search.addEventListener("input", filter);
      if (genre) genre.addEventListener("change", filter);
    });
  });

  window.startMoviePlayer = function (videoId, buttonId, coverId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!video || !source) return;
      if (cover) cover.classList.add("is-hidden");
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = source;
      playVideo();
    }

    if (button) button.addEventListener("click", start);
    if (cover) cover.addEventListener("click", start);
    if (video) {
      video.addEventListener("click", function () {
        if (!started || video.paused) start();
      });
      video.addEventListener("play", function () {
        if (cover) cover.classList.add("is-hidden");
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  };
})();
