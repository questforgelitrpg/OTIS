// tts.js — OTIS Text-to-Speech module (Web Speech API)
// Exposes window.OtisTTS for use by index.html

(function () {
    const STORAGE_KEY = 'otis_tts_muted';
    const PREFERRED_VOICE_NAME = 'Google UK English Male';
    const RATE = 1.2;
    const PITCH = 1.0;
    const VOLUME = 1.0;

    let _muted = false;
    try { _muted = localStorage.getItem(STORAGE_KEY) === 'true'; } catch (e) { /* private browsing or storage disabled */ }
    let _resolvedVoice = null;

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

    // Chrome loads voices asynchronously; resolve when list is ready
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = function () {
            _resolvedVoice = null; // reset so next speak() re-resolves
            _resolveVoice();
        };
    }

    function _saveMuted() {
        try { localStorage.setItem(STORAGE_KEY, String(_muted)); } catch (e) { /* storage unavailable */ }
    }

    function speak(text) {
        if (_muted) return;
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = _resolveVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = RATE;
        utterance.pitch = PITCH;
        utterance.volume = VOLUME;

        window.speechSynthesis.speak(utterance);
    }

    function isMuted() {
        return _muted;
    }

    function toggleMute() {
        _muted = !_muted;
        _saveMuted();
        if (_muted && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        return _muted;
    }

    function setMuted(bool) {
        _muted = Boolean(bool);
        _saveMuted();
        if (_muted && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    window.OtisTTS = { speak, isMuted, toggleMute, setMuted };
})();
