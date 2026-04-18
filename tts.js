// tts.js — OTIS Text-to-Speech module (Web Speech API)
// Exposes window.OtisTTS for use by index.html

(function () {
    const STORAGE_KEY     = 'otis_tts_muted';
    const VOICE_OVERRIDE_KEY = 'otis_tts_voice';

    // Prioritized list of known UK male voices across platforms.
    // First exact match in this list wins.
    const PREFERRED_VOICE_NAMES = [
        'Google UK English Male',                                     // Chrome/Edge desktop
        'Microsoft Ryan Online (Natural) - English (United Kingdom)', // Edge neural
        'Microsoft Ryan - English (United Kingdom)',                   // Edge classic
        'Microsoft George - English (United Kingdom)',                 // Win10/11
        'Daniel (Enhanced)',                                          // Safari macOS/iOS enhanced
        'Daniel',                                                     // Safari macOS/iOS
        'en-gb-x-rjs-network',                                        // Android Google TTS male UK
        'en-gb-x-gbb-network',                                        // Android Google TTS UK
        'en-gb-x-gbc-network',                                        // Android Google TTS UK
    ];

    // Female-name fragments to exclude from fallback searches (case-insensitive).
    const FEMALE_NAMES = ['female', 'woman', 'samantha', 'karen', 'serena', 'moira', 'tessa', 'fiona', 'kate', 'martha', 'hazel', 'susan'];

    let _rate = 1.2;
    const PITCH = 1.0;
    const VOLUME = 1.0;
    // Queue depth limit: set high enough to hold all intro narrative lines (~11 TTS utterances)
    // plus a comfortable margin for rapid in-game bursts, without allowing unbounded growth.
    const MAX_QUEUE_DEPTH = 15;

    let _muted = false;
    try { _muted = localStorage.getItem(STORAGE_KEY) === 'true'; } catch (e) { /* private browsing or storage disabled */ }
    let _resolvedVoice = null;

    // Queue of pending text strings; spoken one at a time via onend chaining.
    const _queue = [];
    let _speaking = false;
    let _utteranceStartedAt = 0; // timestamp when current utterance began
    let _expectedDuration = 12000; // estimated ms for current utterance, updated per-speak
    let _watchdogTimer = null;

    function _isFemale(name) {
        const lower = name.toLowerCase();
        return FEMALE_NAMES.some(function (f) { return lower.indexOf(f) !== -1; });
    }

    function _resolveVoice() {
        if (_resolvedVoice) return _resolvedVoice;
        if (!window.speechSynthesis) return null;

        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        // 0. localStorage override — lets any device pin a specific voice via console.
        let overrideName = null;
        try { overrideName = localStorage.getItem(VOICE_OVERRIDE_KEY); } catch (e) { /* storage unavailable */ }
        if (overrideName) {
            const overrideVoice = voices.find(v => v.name === overrideName);
            if (overrideVoice) { _resolvedVoice = overrideVoice; return _resolvedVoice; }
        }

        // 1. Iterate preferred names in order; first exact match wins.
        for (let i = 0; i < PREFERRED_VOICE_NAMES.length; i++) {
            const match = voices.find(v => v.name === PREFERRED_VOICE_NAMES[i]);
            if (match) { _resolvedVoice = match; return _resolvedVoice; }
        }

        // 2. Any en-GB voice whose name does NOT contain a female-name fragment.
        const ukMale = voices.find(v => v.lang === 'en-GB' && !_isFemale(v.name));
        if (ukMale) { _resolvedVoice = ukMale; return _resolvedVoice; }

        // 3. Any en-GB voice (fallback).
        const ukAny = voices.find(v => v.lang && v.lang.startsWith('en-GB'));
        if (ukAny) { _resolvedVoice = ukAny; return _resolvedVoice; }

        // 4. Any English voice whose name contains "male" but NOT "female".
        const enMale = voices.find(v => v.lang && v.lang.startsWith('en') && /male/i.test(v.name) && !/female/i.test(v.name));
        if (enMale) { _resolvedVoice = enMale; return _resolvedVoice; }

        // 5. Any English voice.
        const english = voices.find(v => v.lang && v.lang.startsWith('en'));
        if (english) { _resolvedVoice = english; return _resolvedVoice; }

        // 6. First available voice.
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

    // Watchdog: Chrome can silently stall or pause synthesis (onend never fires).
    // First try resume() in case Chrome merely paused (common when tab loses focus).
    // If still stuck beyond the expected utterance duration, cancel and advance the queue.
    // Thresholds scale with _expectedDuration so long narrative paragraphs are not
    // cancelled prematurely (a fixed 12 s was too short for ~60-word intro passages).
    function _startWatchdog() {
        _stopWatchdog();
        _watchdogTimer = setInterval(function () {
            if (!_speaking) return;
            const elapsed = Date.now() - _utteranceStartedAt;
            // Attempt resume if we are past expected duration (Chrome may have paused).
            const resumeAt = Math.max(10000, _expectedDuration - 2000);
            // Give up and advance the queue if synthesis is clearly stuck.
            const cancelAt = _expectedDuration + 5000;
            if (elapsed > resumeAt) {
                if (window.speechSynthesis) window.speechSynthesis.resume();
            }
            if (elapsed > cancelAt) {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                _speaking = false;
                _speakNext();
            }
        }, 2000);
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
        // Estimate duration: ~150 wpm at rate 1.0, scaled by _rate.
        // Add 3 s start/end buffer; floor at 12 s so short utterances still get a
        // reasonable watchdog window.
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        _expectedDuration = Math.max(12000, Math.ceil(wordCount * 60000 / (150 * _rate)) + 3000);
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

    // Sanitize text before speech: replace abbreviations that TTS mispronounces.
    // "cr." and standalone "cr" are read as "crossing" by some engines; use "credits".
    function _sanitize(text) {
        return text.replace(/\bcr\.?(?!\w)/g, 'credits');
    }

    function speak(text) {
        if (_muted) return;
        if (!window.speechSynthesis) return;
        // Drop oldest queued items if queue is already deep to prevent backup.
        while (_queue.length >= MAX_QUEUE_DEPTH) _queue.shift();
        _queue.push(_sanitize(text));
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

    // Flush the pending queue without interrupting the currently-speaking utterance.
    // Use this to skip stale queued items while letting the current sentence finish.
    function flush() {
        _queue.length = 0;
    }

    // ── Debug / console helpers ──────────────────────────────────────────────
    // Returns all available voices with metadata — useful for pinning a voice on any device.
    function listVoices() {
        if (!window.speechSynthesis) return [];
        return window.speechSynthesis.getVoices().map(function (v) {
            return { name: v.name, lang: v.lang, default: v.default, localService: v.localService };
        });
    }

    // Returns the currently resolved voice's name and lang.
    function getCurrentVoice() {
        const v = _resolveVoice();
        if (!v) return null;
        return { name: v.name, lang: v.lang };
    }

    // Saves a voice name override to localStorage and resets resolution so the
    // next speak() call picks it up. Pass null to clear the override.
    function setVoice(nameOrNull) {
        try {
            if (nameOrNull == null) {
                localStorage.removeItem(VOICE_OVERRIDE_KEY);
            } else {
                localStorage.setItem(VOICE_OVERRIDE_KEY, String(nameOrNull));
            }
        } catch (e) { /* storage unavailable */ }
        _resolvedVoice = null; // force re-resolution on next speak()
    }

    window.OtisTTS = { speak, interrupt, flush, isSupported, isMuted, toggleMute, setMuted, setRate, listVoices, getCurrentVoice, setVoice };
})();
