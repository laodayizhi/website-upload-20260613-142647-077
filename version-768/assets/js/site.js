(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        play();
      });
    });
    show(0);
    if (slides.length > 1) {
      play();
    }
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-search]");
    var select = document.querySelector("[data-card-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var count = document.querySelector("[data-card-count]");
    if (!input && !select) {
      return;
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = select ? select.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var typeMatched = typeValue === "all" || cardType === typeValue;
        var keywordMatched = keyword === "" || haystack.indexOf(keyword) !== -1;
        var matched = typeMatched && keywordMatched;
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    if (!video || !button || !options.source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    var waitingForManifest = false;
    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        waitingForManifest = true;
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (waitingForManifest) {
            waitingForManifest = false;
            playVideo();
          }
        });
        return;
      }
      video.src = options.source;
    }
    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      if (!waitingForManifest) {
        playVideo();
      }
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilter();
  });
})();
