// tts.js — OTIS Text-to-Speech module (Web Speech API)
// Exposes window.OtisTTS for use by index.html

(function () {
    const STORAGE_KEY = 'otis_tts_muted';
    const PREFERRED_VOICE_NAME = 'Google UK English Male';
    let _rate = 1.2;
    const PITCH = 1.0;
    const VOLUME = 1.0;
    const MAX_QUEUE_DEPTH = 6; // prevent unbounded backup

    let _muted = false;
    try { _muted = localStorage.getItem(STORAGE_KEY) === 'true'; } catch (e) { /* private browsing or storage disabled */ }
    let _resolvedVoice = null;

    // Queue of pending text strings; spoken one at a time via onend chaining.
    const _queue = [];
    let _speaking = false;
    let _utteranceStartedAt = 0; // timestamp when current utterance began
    let _watchdogTimer = null;

    function _resolveVoice() {
        if (_resolvedVoice) return _resolvedVoice;
        if (!window.speechSynthesis) return null;

        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        // 1. Exact name match
        const preferred = voices.find(v => v.name === PREFERRED_VOICE_NAME);
        if (preferred) { _resolvedVoice = preferred; return _resolvedVoice; }

        // 2. Any English voice
        const english = voices.find(v => v.lang && v.lang.startsWith('en'));
        if (english) { _resolvedVoice = english; return _resolvedVoice; }

        // 3. Any voice
        _resolvedVoice = voices[0];
        return _resolvedVoice;
    }

    // Chrome loads voices asynchronously; use addEventListener to avoid overwriting
    // any other handler that may be registered on speechSynthesis.
    if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', function () {
            _resolvedVoice = null; // reset so next speak() re-resolves
            _resolveVoice();
        });
    }

    function _saveMuted() {
        try { localStorage.setItem(STORAGE_KEY, String(_muted)); } catch (e) { /* storage unavailable */ }
    }

    // Watchdog: Chrome can silently stall synthesis (onend never fires).
    // If _speaking has been true for longer than a reasonable ceiling, reset and advance.
    function _startWatchdog() {
        _stopWatchdog();
        _watchdogTimer = setInterval(function () {
            if (!_speaking) return;
            const elapsed = Date.now() - _utteranceStartedAt;
            // Allow up to 30 s for a single utterance; longer than any realistic message.
            if (elapsed > 30000) {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                _speaking = false;
                _speakNext();
            }
        }, 5000);
    }

    function _stopWatchdog() {
        if (_watchdogTimer !== null) { clearInterval(_watchdogTimer); _watchdogTimer = null; }
    }

    // Speak the next item in _queue if nothing is currently speaking.
    function _speakNext() {
        if (_speaking || _queue.length === 0) return;
        if (!window.speechSynthesis) { _queue.length = 0; return; }

        _speaking = true;
        _utteranceStartedAt = Date.now();
        const text = _queue.shift();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = _resolveVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = _rate;
        utterance.pitch = PITCH;
        utterance.volume = VOLUME;

        utterance.onend = function () {
            _speaking = false;
            _speakNext();
        };
        utterance.onerror = function () {
            _speaking = false;
            _speakNext();
        };

        window.speechSynthesis.speak(utterance);
        _startWatchdog();
    }

    function speak(text) {
        if (_muted) return;
        if (!window.speechSynthesis) return;
        // Drop oldest queued items if queue is already deep to prevent backup.
        while (_queue.length >= MAX_QUEUE_DEPTH) _queue.shift();
        _queue.push(text);
        _speakNext();
    }

    function isSupported() {
        return !!window.speechSynthesis;
    }

    function isMuted() {
        return _muted;
    }

    function toggleMute() {
        _muted = !_muted;
        _saveMuted();
        if (_muted && window.speechSynthesis) {
            _queue.length = 0;
            _speaking = false;
            _stopWatchdog();
            window.speechSynthesis.cancel();
        }
        return _muted;
    }

    function setMuted(bool) {
        _muted = Boolean(bool);
        _saveMuted();
        if (_muted && window.speechSynthesis) {
            _queue.length = 0;
            _speaking = false;
            _stopWatchdog();
            window.speechSynthesis.cancel();
        }
    }

    function setRate(rate) {
        _rate = Number(rate) || 1.0;
    }

    function interrupt(text) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        _queue.length = 0;
        _speaking = false;
        _stopWatchdog();
        speak(text);
    }

    window.OtisTTS = { speak, interrupt, isSupported, isMuted, toggleMute, setMuted, setRate };
})();
