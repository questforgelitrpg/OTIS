// OtisSound — OTIS sound engine
// Exposes: window.OtisSound
(function () {
    var VOLUMES = {
        music1:          0.20,
        music2:          0.20,
        music3:          0.20,
        storeroom:       0.20,
        bargedrop:       0.20,
        conveyor:        0.20,
        bots:            0.20,
        background_buzz: 0.05,
        comms:           0.50,
        autotoast:       0.50
    };

    var PATHS = {
        music1:          'sounds/music1.mp3',
        music2:          'sounds/music2.mp3',
        music3:          'sounds/music3.mp3',
        storeroom:       'sounds/storeroom.mp3',
        bargedrop:       'sounds/bargedrop.mp3',
        conveyor:        'sounds/conveyer.mp3',
        bots:            'sounds/bots.mp3',
        background_buzz: 'sounds/background_buzz.mp3',
        comms:           'sounds/comms.mp3',
        autotoast:       'sounds/autotoast.mp3'
    };

    var _unlocked = false;
    var _pendingQueue = [];
    var _music2Timer = null;

    // Duration music2 plays before auto-reverting to music1
    var MUSIC2_DURATION_MS = 90000;

    // Mute state — persisted to localStorage
    var _MUTE_KEY = 'otis_sound_muted';
    var _muted = false;
    try { _muted = localStorage.getItem(_MUTE_KEY) === 'true'; } catch (e) {}

    // Music layer state
    var _musicActive = false;
    var _musicCurrent = null; // { name, el, gainNode }

    // Ambient layer — name -> { el, gainNode, counted }
    var _ambients = {};

    // Count of active non-buzz sounds (music layer + non-buzz ambients + SFX)
    var _nonBuzzCount = 0;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function _getCtx() {
        if (window.audioManager && window.audioManager.audioContext) {
            return window.audioManager.audioContext;
        }
        return null;
    }

    function _getDest() {
        if (window.audioManager) {
            if (window.audioManager.lowpassFilter) return window.audioManager.lowpassFilter;
            if (window.audioManager.masterGain)    return window.audioManager.masterGain;
        }
        return null;
    }

    function _ensureManager() {
        if (window.audioManager && !window.audioManager.audioContext) {
            try { window.audioManager.initialize(); } catch (e) {}
        }
    }

    function _wire(el) {
        var ctx  = _getCtx();
        var dest = _getDest();
        if (!ctx || !dest) return null;
        var gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        var source = ctx.createMediaElementSource(el);
        source.connect(gainNode);
        gainNode.connect(dest);
        return gainNode;
    }

    function _fadeIn(gainNode, vol) {
        var ctx = _getCtx();
        if (!ctx || !gainNode) return;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        if (!_muted) {
            gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.0);
        }
    }

    function _fadeOut(gainNode, cb) {
        var ctx = _getCtx();
        if (!ctx || !gainNode) { if (cb) cb(); return; }
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        setTimeout(function () { if (cb) cb(); }, 1100);
    }

    // ── Active-count management ───────────────────────────────────────────────

    function _setMusicActive(on) {
        if (on === _musicActive) return;
        _musicActive = on;
        _nonBuzzCount += on ? 1 : -1;
        if (_nonBuzzCount < 0) _nonBuzzCount = 0;
        _checkBuzz();
    }

    function _setAmbientActive(name, on) {
        var entry = _ambients[name];
        var wasOn = entry ? !!entry.counted : false;
        if (on === wasOn) return;
        if (entry) entry.counted = on;
        _nonBuzzCount += on ? 1 : -1;
        if (_nonBuzzCount < 0) _nonBuzzCount = 0;
        _checkBuzz();
    }

    function _checkBuzz() {
        if (_nonBuzzCount === 0) {
            _startBuzz();
        } else {
            _stopBuzz();
        }
    }

    // ── Background buzz ───────────────────────────────────────────────────────

    function _startBuzz() {
        if (_ambients['background_buzz']) return;
        var el = document.createElement('audio');
        el.crossOrigin = 'anonymous';
        el.src    = PATHS['background_buzz'];
        el.loop   = true;
        el.preload = 'auto';
        var gainNode = _wire(el);
        if (!gainNode) return;
        _ambients['background_buzz'] = { el: el, gainNode: gainNode, counted: false };
        _fadeIn(gainNode, VOLUMES['background_buzz']);
        el.play().catch(function (e) {
            console.warn('OtisSound: could not play background_buzz:', e);
        });
    }

    function _stopBuzz() {
        var entry = _ambients['background_buzz'];
        if (!entry) return;
        delete _ambients['background_buzz'];
        var prev = entry;
        _fadeOut(prev.gainNode, function () {
            prev.el.pause();
            prev.el.currentTime = 0;
        });
    }

    // ── Music layer ───────────────────────────────────────────────────────────

    function startMusic(track) {
        if (!_unlocked) {
            _pendingQueue.push(function () { startMusic(track); });
            return;
        }
        if (_music2Timer) { clearTimeout(_music2Timer); _music2Timer = null; }
        if (track === 'music2') {
            // Auto-revert to music1 after one approximate loop duration
            _music2Timer = setTimeout(function () {
                _music2Timer = null;
                startMusic('music1');
            }, MUSIC2_DURATION_MS);
        }
        _doStartMusic(track);
    }

    // Plays background_buzz.mp3 once as an interlude, then restarts music1.
    function _onMusic1Ended() {
        if (!_musicCurrent || _musicCurrent.name !== 'music1') return;
        _musicCurrent = null;
        // Keep _musicActive = true so the ambient buzz doesn't start during the interlude.
        var buzzEl = document.createElement('audio');
        buzzEl.crossOrigin = 'anonymous';
        buzzEl.src    = PATHS['background_buzz'];
        buzzEl.loop   = false;
        buzzEl.preload = 'auto';
        var buzzGain = _wire(buzzEl);
        if (!buzzGain) {
            _doStartMusic('music1');
            return;
        }
        buzzGain.gain.setValueAtTime(_muted ? 0 : VOLUMES['background_buzz'], (_getCtx() || {}).currentTime || 0);
        buzzEl.addEventListener('ended', function () {
            if (!_musicCurrent) { _doStartMusic('music1'); }
        });
        buzzEl.play().catch(function (e) {
            console.warn('OtisSound: buzz interlude failed:', e);
            if (!_musicCurrent) { _doStartMusic('music1'); }
        });
    }

    function _doStartMusic(name) {
        // Guard: same track already playing
        if (_musicCurrent && _musicCurrent.name === name && !_musicCurrent.el.paused) return;

        var targetVol = VOLUMES[name] || 0.20;

        function _boot() {
            var el = document.createElement('audio');
            el.crossOrigin = 'anonymous';
            el.src     = PATHS[name];
            // music1 uses manual loop management to insert a background_buzz interlude
            el.loop    = (name !== 'music1');
            el.preload = 'auto';
            var gainNode = _wire(el);
            if (!gainNode) { _setMusicActive(false); return; }
            _musicCurrent = { name: name, el: el, gainNode: gainNode };
            _fadeIn(gainNode, targetVol);
            if (name === 'music1') {
                el.addEventListener('ended', _onMusic1Ended);
            }
            el.play().catch(function (e) {
                console.warn('OtisSound: could not play music ' + name + ':', e);
            });
        }

        if (_musicCurrent && !_musicCurrent.el.paused) {
            // Crossfade — music layer stays active (count unchanged)
            var outgoing = _musicCurrent;
            _musicCurrent = null;
            _fadeOut(outgoing.gainNode, function () {
                outgoing.el.pause();
                outgoing.el.currentTime = 0;
                _boot();
            });
        } else {
            _setMusicActive(true);
            _boot();
        }
    }

    function stopMusic() {
        if (!_musicCurrent) return;
        var outgoing = _musicCurrent;
        _musicCurrent = null;
        _setMusicActive(false);
        _fadeOut(outgoing.gainNode, function () {
            outgoing.el.pause();
            outgoing.el.currentTime = 0;
        });
    }

    // ── Ambient layer ─────────────────────────────────────────────────────────

    function startAmbient(name) {
        if (!_unlocked) {
            _pendingQueue.push(function () { startAmbient(name); });
            return;
        }
        if (_ambients[name]) return; // already playing
        var el = document.createElement('audio');
        el.crossOrigin = 'anonymous';
        el.src     = PATHS[name];
        el.loop    = true;
        el.preload = 'auto';
        var gainNode = _wire(el);
        if (!gainNode) return;
        _ambients[name] = { el: el, gainNode: gainNode, counted: false };
        _setAmbientActive(name, true);
        _fadeIn(gainNode, VOLUMES[name] || 0.20);
        el.play().catch(function (e) {
            console.warn('OtisSound: could not play ambient ' + name + ':', e);
        });
    }

    function stopAmbient(name) {
        var entry = _ambients[name];
        if (!entry) return;
        delete _ambients[name];
        var wasCounted = entry.counted;
        var prev = entry;
        _fadeOut(prev.gainNode, function () {
            prev.el.pause();
            prev.el.currentTime = 0;
        });
        if (wasCounted) {
            _nonBuzzCount = Math.max(0, _nonBuzzCount - 1);
            _checkBuzz();
        }
    }

    // ── SFX layer ─────────────────────────────────────────────────────────────

    function playSFX(name) {
        if (!_unlocked) {
            _pendingQueue.push(function () { playSFX(name); });
            return;
        }
        var el = document.createElement('audio');
        el.crossOrigin = 'anonymous';
        el.src     = PATHS[name];
        el.loop    = false;
        el.preload = 'auto';
        var gainNode = _wire(el);
        if (!gainNode) return;
        _nonBuzzCount++;
        _checkBuzz();
        _fadeIn(gainNode, VOLUMES[name] || 0.20);
        el.play().catch(function (e) {
            console.warn('OtisSound: could not play sfx ' + name + ':', e);
        });
        el.addEventListener('ended', function () {
            _nonBuzzCount = Math.max(0, _nonBuzzCount - 1);
            _checkBuzz();
        });
    }

    // ── Init / unlock ─────────────────────────────────────────────────────────

    function init() {
        if (_unlocked) return;
        _unlocked = true;
        _ensureManager();
        var ctx = _getCtx();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(function () {});
        }
        var pending = _pendingQueue.slice();
        _pendingQueue = [];
        pending.forEach(function (fn) { fn(); });
    }

    // ── Mute control ──────────────────────────────────────────────────────────

    function _applyMuteState() {
        var ctx = _getCtx();
        if (!ctx) return;
        var now = ctx.currentTime;

        function _setGain(gainNode, name) {
            if (!gainNode) return;
            var targetVol = _muted ? 0 : (VOLUMES[name] || 0.20);
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(targetVol, now + 0.3);
        }

        if (_musicCurrent) _setGain(_musicCurrent.gainNode, _musicCurrent.name);
        Object.keys(_ambients).forEach(function (name) {
            _setGain(_ambients[name].gainNode, name);
        });
    }

    function toggleMute() {
        _muted = !_muted;
        try { localStorage.setItem(_MUTE_KEY, String(_muted)); } catch (e) {}
        _applyMuteState();
        return _muted;
    }

    function isMuted() { return _muted; }

    function _setupUnlock() {
        function _unlock() {
            init();
            document.removeEventListener('click',   _unlock);
            document.removeEventListener('keydown', _unlock);
        }
        document.addEventListener('click',   _unlock);
        document.addEventListener('keydown', _unlock);
    }
    _setupUnlock();

    // ── Public API ────────────────────────────────────────────────────────────

    window.OtisSound = {
        init:         init,
        startMusic:   startMusic,
        stopMusic:    stopMusic,
        startAmbient: startAmbient,
        stopAmbient:  stopAmbient,
        playSFX:      playSFX,
        toggleMute:   toggleMute,
        isMuted:      isMuted,
        onNoSound:    function (cb) {},
        onSoundStart: function (cb) {}
    };
}());
