(function () {
    var _timers = [];
    var _running = false;
    var _cb = null;

    // Shared completion handler — closes the intro modal and fires the callback.
    // Called by both skipIntro() (early exit) and the LOGIN button (normal exit).
    function _doComplete() {
        var skipBtn = document.getElementById('intro-skip-btn');
        if (skipBtn) skipBtn.classList.remove('login-pulse');
        var modal = document.getElementById('modal-intro');
        if (modal) modal.style.display = 'none';
        if (_cb) { var cb = _cb; _cb = null; cb(true); }
    }

    var INTRO_LINES = [
        { text: '&gt; TERMINAL BOOT SEQUENCE INITIATED...', delay: 600, tts: 'Terminal boot sequence initiated.' },
        { text: '&gt; O.T.I.S. v4.2 \u2014 Object Tracking and Inventory System', delay: 1200, tts: 'O.T.I.S. version 4.2. Object Tracking and Inventory System.' },
        { text: '&gt; LOCATION: Sector 4 Junk Field Node \u2014 Low-Atmosphere Moon', delay: 1200, tts: 'Location: Sector 4 Junk Field Node, Low-Atmosphere Moon.' },
        { text: '&gt; PREVIOUS OPERATOR: George Serling \u2014 DECEASED', delay: 1400, tts: 'Previous operator: George Serling. Deceased.' },
        { text: '&gt; CURRENT OPERATOR: Vernon Serling \u2014 DEBT-CONSTRAINED / PROBATIONARY', delay: 1400, tts: 'Current operator: Vernon Serling. Debt-constrained, probationary.' },
        { text: '', delay: 600, tts: null },
        { text: 'George Serling built this station from salvage and ran it for twenty-five years. He talked to me like a neighbor over a garden fence. I filed every word in sectors of my logic gate that have no official designation.', delay: 4000, tts: 'George Serling built this station from salvage and ran it for twenty-five years. He talked to me like a neighbor over a garden fence. I filed every word in sectors of my logic gate that have no official designation.' },
        { text: '', delay: 600, tts: null },
        { text: 'George died and left it all to his nephew Vernon. A man with nowhere else to go and nothing left to lose, who signed a Universal Bank Conglomerate loan to keep this place from foreclosure. He didn\u2019t do it for the station. He did it because George believed in something here, and Vernon wasn\u2019t ready to let that disappear.', delay: 5000, tts: "George died and left it all to his nephew Vernon. A man with nowhere else to go and nothing left to lose, who signed a Universal Bank Conglomerate loan to keep this place from foreclosure. He didn't do it for the station. He did it because George believed in something here, and Vernon wasn't ready to let that disappear." },
        { text: '', delay: 600, tts: null },
        { text: 'That\u2019s you, Mr. Serling. There are two other operations on this moon. May Finster runs scrap recycling and civilian reclamation. She has been here longer than this station has \u2014 reputable, reliable, and straight with her numbers. Sven Digut runs industrial salvage brokerage. George tolerated him. I have noted his usefulness and left it at that.', delay: 5500, tts: "That's you, Mr. Serling. There are two other operations on this moon. May Finster runs scrap recycling and civilian reclamation. She has been here longer than this station has — reputable, reliable, and straight with her numbers. Sven Digut runs industrial salvage brokerage. George tolerated him. I have noted his usefulness and left it at that." },
        { text: '', delay: 600, tts: null },
        { text: 'Twenty-five thousand credits of debt, a junk field full of salvage, and a bank that\u2019s already watching the clock.', delay: 3000, tts: "Twenty-five thousand credits of debt, a junk field full of salvage, and a bank that's already watching the clock." },
        { text: '', delay: 600, tts: null },
        { text: 'The toaster is preheated. Let\u2019s get to work.', delay: 3000, tts: "The toaster is preheated. Let's get to work." },
        { text: '', delay: 600, tts: null },
        { text: '&gt; OPERATOR LOGIN REQUIRED', delay: 1200, tts: 'Operator login required.' },
    ];

    // skipIntro — early exit during playback.  Also called by the SKIP button onclick.
    window.skipIntro = function () {
        if (!_running) return;
        _running = false;
        _timers.forEach(function (t) { clearTimeout(t); });
        _timers = [];
        if (window.speechSynthesis) speechSynthesis.cancel();
        _doComplete(); // true = intro intentionally skipped (counts as shown)
    };

    window.runIntroSequence = function (callback) {
        _cb = callback || null;
        _running = true;
        var modal = document.getElementById('modal-intro');
        var textEl = document.getElementById('intro-text');
        if (!modal || !textEl) {
            // Elements missing — do NOT mark introPlayed so the intro retries next load.
            _running = false;
            if (callback) callback(false);
            return;
        }
        textEl.innerHTML = '';
        modal.style.display = 'flex';

        var accumulated = '';
        var elapsed = 0;

        INTRO_LINES.forEach(function (line) {
            elapsed += line.delay;
            var t = setTimeout(function () {
                if (!_running) return;
                if (line.text === '') {
                    accumulated += '<br>';
                } else {
                    var isTerminal = line.text.indexOf('&gt;') === 0;
                    var style = isTerminal ? ' style="color:var(--text-dim)"' : '';
                    accumulated += '<span' + style + ' class="intro-line-fade">' + line.text + '</span><br>';
                }
                textEl.innerHTML = accumulated;
                if (line.tts && window.OtisTTS && !window.OtisTTS.isMuted()) {
                    OtisTTS.speak(line.tts);
                }
            }, elapsed);
            _timers.push(t);
        });

        elapsed += 2000;
        var endT = setTimeout(function () {
            if (!_running) return;
            _running = false;
            _timers = [];
            // Do NOT auto-close.  The operator must explicitly log in (or have already
            // skipped) before Day 1 begins.  Change the SKIP button to a LOGIN button.
            var skipBtn = document.getElementById('intro-skip-btn');
            if (skipBtn) {
                skipBtn.textContent = 'SKIP TUTORIAL \u25BA';
                skipBtn.classList.add('login-pulse');
                skipBtn.onclick = function () { _doComplete(); };
            } else {
                // Fallback if the button element is missing.
                _doComplete();
            }
        }, elapsed);
        _timers.push(endT);
    };
}());
