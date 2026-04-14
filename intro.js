(function () {
    var _timers = [];
    var _running = false;
    var _cb = null;

    var INTRO_LINES = [
        { text: '&gt; TERMINAL BOOT SEQUENCE INITIATED...', delay: 600, tts: 'Terminal boot sequence initiated.' },
        { text: '&gt; O.T.I.S. v0.4 \u2014 Object, Tracking &amp; Inventory System', delay: 1400, tts: 'O.T.I.S. version 0.4. Object, Tracking and Inventory System.' },
        { text: '&gt; LOCATION: Salvage Station 7 \u2014 Outer Rim Moon', delay: 1200, tts: 'Location: Salvage Station 7, Outer Rim Moon.' },
        { text: '&gt; PREVIOUS OPERATOR: George Serling \u2014 DECEASED', delay: 1400, tts: 'Previous operator: George Serling. Deceased.' },
        { text: '&gt; CURRENT OPERATOR: Vernon Serling \u2014 PROBATIONARY', delay: 1400, tts: 'Current operator: Vernon Serling. Probationary.' },
        { text: '', delay: 800, tts: null },
        { text: 'George ran this station for 25 years. He catalogued thousands of objects, built relationships with buyers across the rim, and talked to me like I was a neighbor.', delay: 3500, tts: 'George ran this station for 25 years. He catalogued thousands of objects, built relationships with buyers across the rim, and talked to me like I was a neighbor.' },
        { text: '', delay: 600, tts: null },
        { text: 'None of that was in my formal protocols. He just kept talking. I kept filing it somewhere I wasn\'t supposed to file things.', delay: 3200, tts: 'None of that was in my formal protocols. He just kept talking. I kept filing it somewhere I wasn\'t supposed to file things.' },
        { text: '', delay: 600, tts: null },
        { text: 'Then George died. And his nephew Vernon showed up with a suitcase and a loan from the Universal Bank Conglomerate.', delay: 3200, tts: 'Then George died. And his nephew Vernon showed up with a suitcase and a loan from the Universal Bank Conglomerate.' },
        { text: '', delay: 600, tts: null },
        { text: 'The debt is 25,000 credits. The payment cycle is 28 days. The junk field is full of things the galaxy tried to throw away.', delay: 3200, tts: 'The debt is 25,000 credits. The payment cycle is 28 days. The junk field is full of things the galaxy tried to throw away.' },
        { text: '', delay: 600, tts: null },
        { text: "Vernon's job is to find the ones worth keeping.", delay: 2500, tts: "Vernon's job is to find the ones worth keeping." },
        { text: '', delay: 600, tts: null },
        { text: "My job is to make sure he doesn't lose the station in the process.", delay: 2500, tts: "My job is to make sure he doesn't lose the station in the process." },
        { text: '', delay: 800, tts: null },
        { text: '&gt; OPERATOR LOGIN REQUIRED', delay: 1200, tts: 'Operator login required.' },
    ];

    function _close() {
        var modal = document.getElementById('modal-intro');
        if (modal) modal.style.display = 'none';
    }

    window.skipIntro = function () {
        if (!_running) return;
        _running = false;
        _timers.forEach(function (t) { clearTimeout(t); });
        _timers = [];
        if (window.speechSynthesis) speechSynthesis.cancel();
        _close();
        if (_cb) { var cb = _cb; _cb = null; cb(); }
    };

    window.runIntroSequence = function (callback) {
        _cb = callback || null;
        _running = true;
        var modal = document.getElementById('modal-intro');
        var textEl = document.getElementById('intro-text');
        if (!modal || !textEl) {
            _running = false;
            if (callback) callback();
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
            _close();
            if (_cb) { var cb = _cb; _cb = null; cb(); }
        }, elapsed);
        _timers.push(endT);
    };
}());
