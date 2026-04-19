// OTIS narrative subsystem — appendOTIS, narratorLine, scripted comms, toaster/power-outage cutscenes, ending dispatcher. Extracted from index.html in Phase 7 of the monolith refactor.

    // Patch appendHardcodedComm to reset the silence clock
    var _origAppendHardcoded = appendHardcodedComm;
    appendHardcodedComm = function(text) {
        window._lastOtisActivity = Date.now();
        return _origAppendHardcoded(text);
    };

    var _dadJokeIndex = 0;
    var _dadJokeShuffled = null;
    function _getNextDadJoke() {
        if (!_dadJokeShuffled) {
            _dadJokeShuffled = DAD_JOKES.slice();
            for (var i = _dadJokeShuffled.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = _dadJokeShuffled[i]; _dadJokeShuffled[i] = _dadJokeShuffled[j]; _dadJokeShuffled[j] = t;
            }
        }
        if (_dadJokeIndex >= _dadJokeShuffled.length) {
            _dadJokeShuffled = null; _dadJokeIndex = 0; return _getNextDadJoke();
        }
        return _dadJokeShuffled[_dadJokeIndex++];
    }

    var SILENCE_THRESHOLD_MS = 120000; // 2 real minutes
    setInterval(function() {
        var s = gameState.state;
        // Only fire during active session, not during a drop or power outage
        if (s.dropActive || s.powerOutageActive) return;
        if (Date.now() - _lastOtisActivity < SILENCE_THRESHOLD_MS) return;
        // Suppress dad jokes while an emotional beat is active (debrief, anomaly archive, debt warning, etc.)
        if (window.emotionalBeatActive) return;

        var joke = _getNextDadJoke();
        var setups = [
            'Station quiet. Nothing on the belt. George used to tell jokes.',
            'Intake window closed. Running a catalogue maintenance subroutine. Also:',
            'No manifest activity. Idle logging active. Unrelated:',
            'Systems nominal. Belt clear. Processing non-essential data.',
            'Routine observation while belt is inactive:',
            'Nothing actionable on the manifest. Filing a non-operational entry:',
        ];
        var setup = setups[Math.floor(Math.random() * setups.length)];
        var full = setup + ' ' + joke;

        otisLines.push({ role: 'otis', text: full });
        renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(full);
        _lastOtisActivity = Date.now(); // reset so it doesn't fire again immediately
        // Track dad joke count for achievements
        gameState.state.dadJokesHeard = (gameState.state.dadJokesHeard || 0) + 1;
        if (window.Achievements) Achievements.check();
    }, 30000); // check every 30 seconds

    async function appendOTIS(userText, trigger) {
        window._lastOtisActivity = Date.now();
        var statusEl = document.getElementById('sys-otis');
        if (statusEl) { statusEl.textContent = 'ACTIVE'; statusEl.className = 'status-warn'; }
        if (userText) otisLines.push({ role: 'user', text: userText });
        renderOTIS();
        gameState._trackEvent(trigger);
        try {
            var reply = await askOTIS(userText || '', gameState, trigger || 'COMMS');
            otisLines.push({ role: 'otis', text: reply });
            renderOTIS();
            updateArmSprite(trigger);
            if (window.OtisTTS) {
                var tier = getFatigueTier();
                if (tier === 'MODERATE' || tier === 'HIGH' || tier === 'CRITICAL') {
                    OtisTTS.interrupt(reply);
                } else {
                    OtisTTS.speak(reply);
                }
            }
            if (statusEl) { statusEl.textContent = 'NOMINAL'; statusEl.className = 'status-ok'; }
        } catch(e) {
            if (statusEl) { statusEl.textContent = 'FAULT'; statusEl.className = 'status-err'; }
        }
        gameState._updateUI();
    }

    var _toastIndex = 0;
    var _toastShuffled = null;

    function getNextToastComment() {
        if (!_toastShuffled) {
            _toastShuffled = TOAST_COMMENTS.slice();
            for (var i = _toastShuffled.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = _toastShuffled[i]; _toastShuffled[i] = _toastShuffled[j]; _toastShuffled[j] = t;
            }
            _toastIndex = 0;
        }
        if (_toastIndex >= _toastShuffled.length) {
            _toastShuffled = null; return getNextToastComment();
        }
        return _toastShuffled[_toastIndex++];
    }

    // DAILY TOAST — fires once per in-game day.
    // Deducts 6 credits for George's toaster, shows the toast modal, and adds an
    // OTIS comment to the terminal.  This routine is intentionally self-contained and
    // NEVER triggers the toaster incident (power-outage plot event).  The toaster
    // incident is a separate Act-3 event; see fireToasterIncident() below.
    function autoToast() {
        if (gameState.state.toastFiredToday) return;
        if (window.OtisSound) OtisSound.startMusic('music2');
        var s = gameState.state;
        if (s.credits >= 6) s.credits -= 6;
        else { s.outstandingDebt = (s.outstandingDebt || 0) + (6 - s.credits); s.credits = 0; }
        s.toastFiredToday = true;
        gameState._save();
        gameState._updateUI();
        var toastMsg = getNextToastComment();
        var toastContent = document.getElementById('toast-content');
        if (toastContent) toastContent.textContent = toastMsg;
        openModal('toast');
        if (window.OtisSound) OtisSound.playSFX('autotoast');
        otisLines.push({ role: 'otis', text: toastMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(toastMsg);
    }

    // SCRIPTED DAY 1-3 COMMS
    var SCRIPTED_COMMS = {
        bank: '[BANK] Universal Bank Conglomerate, automated channel. This is a courtesy notice. Station debt: 25,000 credits. Your 28-day payment cycle has begun. First payment: 650 credits. We expect prompt settlement. Welcome to the operation, Mr. Serling.',
        sven: '[SVEN] Sven Digut, Digut Operations. You\'re the new operator. Good. I buy goods — Industrial, Vessel, Rare if the price is right. Route items to my bin and I\'ll move them fast. Don\'t scrap what I can move. We\'ll work fine as long as you don\'t waste my time.',
        may: '[MAY] May Finster, Leftover Recycling. I handle scrap for this station — always have, since your uncle. You fill the bin, you dispatch to me, I return credits based on fill rate. Simple. Don\'t let it back up past 90. George never did.',
    };

    // Narrator delivery — picks from a pool, substitutes {tokens}, speaks.
    // Does NOT call the API. Does NOT add to _otisHistory.
    function narratorLine(pool, tokens) {
        tokens = tokens || {};
        var line = pool[Math.floor(Math.random() * pool.length)];
        // Substitute {KEY} tokens
        Object.keys(tokens).forEach(function(k) {
            line = line.replace(new RegExp('\\{' + k + '\\}', 'g'), String(tokens[k]));
        });
        otisLines.push({ role: 'otis', text: line });
        renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(line);
    }

    function appendHardcodedComm(text) {
        otisLines.push({ role: 'otis', text: text });
        renderOTIS();
    }

    function checkScriptedComms() {
        var s = gameState.state;
        if (!s.scriptedCommsFired) s.scriptedCommsFired = { bank: false, sven: false, may: false };
        if (s.day >= 1 && !s.scriptedCommsFired.bank) {
            s.scriptedCommsFired.bank = true;
            s.bankNotifUnread = true;
            s.lastBankNotifDay = s.day;
            appendHardcodedComm(SCRIPTED_COMMS.bank);
            var bankDot = document.getElementById('comms-dot-bank');
            if (bankDot) bankDot.className = 'comms-dot dot-on';
            setLight('light-comms', 'light-amber');
            gameState._save();
        }
        if (s.day >= 2 && !s.scriptedCommsFired.sven) {
            s.scriptedCommsFired.sven = true;
            appendHardcodedComm(SCRIPTED_COMMS.sven);
            var svenDot = document.getElementById('comms-dot-sven');
            if (svenDot) svenDot.className = 'comms-dot dot-on';
            setLight('light-comms', 'light-amber');
            gameState._save();
        }
        if (s.day >= 3 && !s.scriptedCommsFired.may) {
            s.scriptedCommsFired.may = true;
            s.mayNotifUnread = true;
            appendHardcodedComm(SCRIPTED_COMMS.may);
            var mayDot = document.getElementById('comms-dot-may');
            if (mayDot) mayDot.className = 'comms-dot dot-on';
            setLight('light-comms', 'light-amber');
            gameState._save();
        }
    }

    // TOASTER INCIDENT SEQUENCE
    function runPowerOutageSequence() {
        var term = document.getElementById('terminal');
        var grid = document.getElementById('module-grid');
        var arm  = document.getElementById('arm-panel');
        var pw   = document.getElementById('sys-power');
        var overlay = document.getElementById('fatigue-overlay');
        var noise   = document.getElementById('fatigue-noise');
        var auxBtn  = document.getElementById('module-btn-auxiliary');

        // Mark power outage active so silence detector does not fire dad jokes
        gameState.state.powerOutageActive = true;
        gameState._save();

        // STAGE 1 — BLACKOUT (immediate)
        if (grid)    grid.style.display = 'none';
        document.querySelectorAll('#hdr .hdr-stat').forEach(function(el) { el.style.display = 'none'; });
        if (arm)     arm.style.display = 'none';
        if (term)    term.classList.add('power-out');
        if (overlay) overlay.style.opacity = '1';
        if (noise)   noise.style.opacity = '0.6';
        if (auxBtn)  { auxBtn.style.display = ''; auxBtn.style.opacity = '1'; }
        appendHardcodedComm('[POWER GRID] Cascade event detected. Drawing from backup reserves.');
        if (pw) { pw.textContent = 'CRITICAL'; pw.className = 'status-err'; }
        setModuleButtonsEnabled(false, false, false, false);

        // STAGE 2 — BANK OTIS ONLY (delay 2500ms)
        setTimeout(function() {
            var out = document.getElementById('otis-output');
            if (out) out.style.display = '';
            if (term) term.style.filter = 'brightness(0.15)';
            appendOTIS('Bank protocol engaged. Running power restoration sequence.', 'COMMS_BANK');
            appendHardcodedComm('[BANK-OTIS] Step 1: isolate main breaker. Step 2: reroute to secondary bus.');

            // STAGE 3 — SYSTEMS RESTORE (delay 6000ms from stage 2)
            setTimeout(function() {
                if (grid) grid.style.display = '';
                if (term) term.style.filter = 'brightness(0.4)';
                appendHardcodedComm('[BANK-OTIS] Systems online. Diagnostics nominal.');
                if (pw) { pw.textContent = 'NOMINAL'; pw.className = 'status-ok'; }
                setModuleButtonsEnabled(false, false, false, true);

                // STAGE 4 — COMMS RESTORE (delay 4000ms from stage 3)
                setTimeout(function() {
                    if (term) term.style.filter = 'brightness(0.7)';
                    appendHardcodedComm('[BANK-OTIS] Communications restored.');
                    setModuleButtonsEnabled(false, true, false, true);

                    // STAGE 5 — FULL RESTORE + GEORGE RETURNS (delay 4000ms from stage 4)
                    setTimeout(function() {
                        if (term) { term.classList.remove('power-out'); term.style.filter = ''; }
                        document.querySelectorAll('#hdr .hdr-stat').forEach(function(el) { el.style.display = ''; });
                        if (arm) arm.style.display = '';
                        updateFatigueVisuals();
                        appendOTIS('Power restored. All systems nominal.', 'LOGIN');
                        appendHardcodedComm('[GEORGE_LAYER] He built that toaster into the grid himself. Every morning for 25 years.');
                        setModuleButtonsEnabled(true, true, true, true);
                        // Deactivate AUXILIARY INPUT button
                        if (auxBtn) {
                            auxBtn.style.transition = 'opacity 2s';
                            auxBtn.style.opacity = '0';
                            setTimeout(function() { auxBtn.style.display = 'none'; }, 2000);
                        }
                        setLight('light-auxiliary', '');
                        // Clear power outage flag so silence detector resumes
                        gameState.state.powerOutageActive = false;
                        gameState._save();
                    }, 4000);
                }, 4000);
            }, 6000);
        }, 2500);
    }

    // TOASTER INCIDENT — Act 3 plot event (DISTINCT from the daily autoToast routine).
    // George's old toaster causes a cascade power outage exactly once, at the start
    // of Act 3.  This function is called by checkActProgression() and by the debug
    // button (handleToasterIncident).  It must NEVER be called from autoToast() or
    // from any daily-toast code path — the two events are intentionally separate.
    function fireToasterIncident() {
        if (gameState.state.toasterIncidentFired) return;
        // BUG 4 fix: set fired guard synchronously at the very start, before any
        // setTimeout chain, so re-entry is impossible even if called again quickly.
        gameState.state.toasterIncidentFired = true;
        gameState._save();
        if (window.OtisSound) OtisSound.startMusic('music3');
        var s = gameState.state;
        if (s.credits >= 6) s.credits -= 6;
        else { s.outstandingDebt = (s.outstandingDebt || 0) + (6 - s.credits); s.credits = 0; }
        gameState._save();
        gameState._updateUI();
        var toastContent = document.getElementById('toast-content');
        if (toastContent) toastContent.textContent = "George's toaster fired. Energy draw logged.";
        openModal('toast');
        // fireToasterIncident toast is hardcoded — different from daily autoToast
        var tiMsg = 'Toaster event. Grid draw detected. Cascade possible.';
        otisLines.push({ role: 'otis', text: tiMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(tiMsg);
        setTimeout(function() { closeModal('toast'); runPowerOutageSequence(); }, 2000);
    }

    // Shared helper: renders the ending screen for any ending key.
    // Handles {{ARCHIVE}} / {{CREDITS}} substitution, shows restart or acknowledge
    // button based on whether the ending has restart: true, and fires an optional
    // scripted OTIS line (ending.otisLine) for failure endings.
    function renderEndingScreen(endingKey) {
        var s = gameState.state;
        var ending = ENDINGS[endingKey];
        if (!ending) return;
        // Track ending seen for achievements (deduplicated)
        if (!Array.isArray(s.endingsSeen)) s.endingsSeen = [];
        if (s.endingsSeen.indexOf(endingKey) === -1) {
            s.endingsSeen.push(endingKey);
            gameState._save();
        }
        var archive = s.humanityArchive || 0;
        var credits = s.credits || 0;
        var titleEl = document.getElementById('ending-title');
        var bodyEl  = document.getElementById('ending-body');
        if (titleEl) titleEl.textContent = ending.title;
        if (bodyEl)  bodyEl.textContent = ending.body
            .replace('{{ARCHIVE}}', archive)
            .replace('{{CREDITS}}', credits);
        var restartBtn = document.getElementById('btn-ending-restart');
        var ackBtn     = document.getElementById('btn-ending-ack');
        var needsRestart = !!ending.restart;
        if (restartBtn) restartBtn.style.display = needsRestart ? '' : 'none';
        if (ackBtn)     ackBtn.style.display     = needsRestart ? 'none' : '';
        // Scripted OTIS line — present only on endings that have otisLine defined
        // (currently SCRAP_HEAP and POWER_FAILURE).  FORECLOSURE uses a bespoke
        // cutscene in triggerForeclosure().  MAZE_MASTER, LEGACY, HUMANITY, COMMERCE,
        // and COMPROMISE have no otisLine field and are unaffected.
        if (ending.otisLine) {
            otisLines.push({ role: 'otis', text: ending.otisLine }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(ending.otisLine);
        }
        if (window.Achievements) Achievements.check();
        openModal('ending');
    }

    function triggerEnding(overrideKey) {
        var s = gameState.state;
        if (s.endingTriggered) return;
        s.endingTriggered = true;
        gameState._save();
        var endingKey;
        if (overrideKey) {
            endingKey = overrideKey;
        } else {
            var archive = s.humanityArchive || 0;
            if (s.upgradeDecision === 'install') {
                endingKey = 'COMMERCE';
            } else {
                // 'decline' and null both produce the same ending — player did not install v5.0
                endingKey = archive >= 5 ? 'HUMANITY' : 'COMPROMISE';
            }
        }
        renderEndingScreen(endingKey);
    }

    function handleEndingClose() {
        closeModal('ending');
        handleLogoff();
    }

    function handleEndingRestart() {
        closeModal('ending');
        gameState.state = stateManager._default();
        stateManager.clear();
        location.reload();
    }

    window.appendOTIS = appendOTIS;
    window.narratorLine = narratorLine;
    window.appendHardcodedComm = appendHardcodedComm;
    window.checkScriptedComms = checkScriptedComms;
    window.autoToast = autoToast;
    window.fireToasterIncident = fireToasterIncident;
    window.runPowerOutageSequence = runPowerOutageSequence;
    window.renderEndingScreen = renderEndingScreen;
    window.triggerEnding = triggerEnding;
    window.handleEndingClose = handleEndingClose;
    window.handleEndingRestart = handleEndingRestart;
