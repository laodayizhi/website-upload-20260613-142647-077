(function () {
    var config = window.playerEntry || {};
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var source = config.source || '';
    var hls = null;
    var bound = false;

    function bindSource() {
        if (!video || !source || bound) {
            return;
        }
        bound = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    hls = null;
                    video.src = source;
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function play() {
        bindSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (video) {
        bindSource();
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
