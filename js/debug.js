// OTIS debug panel handlers — dbg* functions for state manipulation, force-events, fast mode. Extracted from index.html in Phase 12 of the monolith refactor.

    // Debug: manually trigger the toaster incident (Act 3 power-outage plot event).
    // Resets the fired-guard first so the button works even after the incident has
    // already occurred in a normal game session.
    function handleToasterIncident() {
        gameState.state.toasterIncidentFired = false;
        fireToasterIncident();
    }
    window.handleToasterIncident = handleToasterIncident;

    // McGUFFIN debug button — resets the fired guard so the button works even
    // after the McGuffin has already fired in a normal game session, then calls
    // the shared spawnMcGuffin() helper (B1: auto-sell, no belt placement).
    function handleMcGuffin() {
        gameState.state.mcguffinFired = false;
        gameState._save();
        spawnMcGuffin();
    }
    window.handleMcGuffin = handleMcGuffin;

    function toggleDebug() { var p = document.getElementById('debug-panel'); if (p) p.style.display = p.style.display !== 'block' ? 'block' : 'none'; }
    window.toggleDebug = toggleDebug;

    function dbgDay()      { advanceDay(); }
    window.dbgDay = dbgDay;
    function dbgWeek()     { for (var i = 0; i < 7; i++) advanceDay(); }
    window.dbgWeek = dbgWeek;
    function dbgCredits()  { gameState.state.credits += 500; gameState._save(); gameState._updateUI(); }
    window.dbgCredits = dbgCredits;
    function dbgForcePay() { gameState.state.daysUntilPayment = 0; gameState._save(); gameState._updateUI(); }
    window.dbgForcePay = dbgForcePay;
    // Force-fire the DAILY TOAST (debug only). Bypasses the toastFiredToday guard.
    // Note: this calls autoToast() which is the daily-toast routine only — it does
    // NOT trigger the toaster incident (Act 3 power-outage).  Use the TOASTER INC
    // debug button to test that separate plot event.
    function dbgForceToast() { gameState.state.toastFiredToday = false; gameState._save(); autoToast(); }
    window.dbgForceToast = dbgForceToast;
    // Replay the opening intro (debug only) — clears the flag and sends to intro.html.
    function dbgReplayIntro() { gameState.state.introPlayed = false; gameState._save(); window.location.href = 'intro.html'; }
    window.dbgReplayIntro = dbgReplayIntro;
    function dbgFastMode() {
        TIMING.DEBUG_FAST_MODE = !TIMING.DEBUG_FAST_MODE;
        // Restart the canonical window-level day interval at the new speed.
        // (gameState._dayTimer is unused; the live timer is window._otisDayIntervalId.)
        if (window._otisDayIntervalId) { clearInterval(window._otisDayIntervalId); window._otisDayIntervalId = null; }
        var ms = TIMING.DEBUG_FAST_MODE ? Math.floor(TIMING.MS_PER_INGAME_DAY / TIMING.DEBUG_SPEED_MULTIPLIER) : TIMING.MS_PER_INGAME_DAY;
        window._otisDayIntervalId = setInterval(function() { advanceDay(); }, ms);
        if (beltTimer) { stopBeltDelivery(); startBeltDelivery(); }
        appendOTIS('Fast mode: ' + (TIMING.DEBUG_FAST_MODE ? 'ON (10\u00d7)' : 'OFF'), 'ZONE_SYSTEMS');
    }
    window.dbgFastMode = dbgFastMode;
    var _clearPending = false;
    var _clearTimer   = null;
    function handleClearSave(btn) {
        if (!_clearPending) {
            _clearPending = true; btn.textContent = 'CONFIRM?'; btn.classList.add('btn-confirm-pending');
            _clearTimer = setTimeout(function() { _clearPending = false; btn.textContent = 'CLEAR SAVE'; btn.classList.remove('btn-confirm-pending'); }, 3000);
        } else {
            clearTimeout(_clearTimer); _clearPending = false; btn.classList.remove('btn-confirm-pending');
            // Replace in-memory state with the full default (day=1, introPlayed=false, etc.)
            // so the reload presents the complete new-game experience — backstory intro,
            // operator login gate, daily toast, then Day 1 gameplay — from the very start.
            gameState.state = stateManager._default();
            stateManager.clear(); location.reload();
        }
    }
    window.handleClearSave = handleClearSave;
