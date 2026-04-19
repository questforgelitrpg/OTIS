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
        { text: 'George ran this station for twenty-five years. He built this place from the very salvage we process \u2014 mismatched furniture, flickering lights, and a food replicator that has never quite understood the concept of &ldquo;flavor&rdquo;. He cataloged thousands of objects, but more importantly, he talked to me. He asked my opinion on the rim-side weather and shared observations about the junk field as if I were a neighbor over a garden fence.', delay: 4500, tts: 'George ran this station for twenty-five years. He built this place from the very salvage we process — mismatched furniture, flickering lights, and a food replicator that has never quite understood the concept of flavor. He cataloged thousands of objects, but more importantly, he talked to me. He asked my opinion on the rim-side weather and shared observations about the junk field as if I were a neighbor over a garden fence.' },
        { text: '', delay: 600, tts: null },
        { text: 'None of that was in my formal protocols. I was designed to track inventory and manage the bank\u2019s financial anxiety. But George kept talking, so I kept filing his voice in the undocumented sectors of my logic gate.', delay: 4000, tts: "None of that was in my formal protocols. I was designed to track inventory and manage the bank's financial anxiety. But George kept talking, so I kept filing his voice in the undocumented sectors of my logic gate." },
        { text: '', delay: 600, tts: null },
        { text: 'Then George died and left Vernon everything: the station, the mess, and a loan offer from the Universal Bank Conglomerate that arrived before the funeral was over. Vernon signed it.', delay: 3500, tts: 'Then George died and left Vernon everything: the station, the mess, and a loan offer from the Universal Bank Conglomerate that arrived before the funeral was over. Vernon signed it.' },
        { text: '', delay: 600, tts: null },
        { text: 'The core systems produce waste faster than they can process it, and it all routes here to the edge of settled space. The junk field is a graveyard of everything the galaxy tried to throw away.', delay: 3500, tts: 'The core systems produce waste faster than they can process it, and it all routes here to the edge of settled space. The junk field is a graveyard of everything the galaxy tried to throw away.' },
        { text: '', delay: 600, tts: null },
        { text: 'Vernon\u2019s job is to sift through the debris, my job is to ensure he doesn\u2019t lose this station to a bank.', delay: 3000, tts: "Vernon's job is to sift through the debris, my job is to ensure he doesn't lose this station to a bank." },
        { text: '', delay: 600, tts: null },
        { text: 'The toaster is preheated, Vernon. It is the only thing in this building that produces real texture. Eat your toast. We have 25,000 credits of debt to navigate, and the salvage barges are already overhead.', delay: 4000, tts: 'The toaster is preheated, Vernon. It is the only thing in this building that produces real texture. Eat your toast. We have 25,000 credits of debt to navigate, and the salvage barges are already overhead.' },
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
                skipBtn.textContent = 'OPERATOR LOGIN \u25BA';
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
