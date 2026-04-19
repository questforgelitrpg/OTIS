// OTIS tutorial subsystem — 22-step pre-game guided walkthrough.
// Amber halo highlight, step badges, back/forward navigation, gated actions.

    var TUTORIAL_TOTAL = 22;

    function _tutorialActive() {
        var step = gameState.state.tutorialStep;
        return step >= 1 && step <= TUTORIAL_TOTAL;
    }

    function _clearTutorialHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(function(el) {
            el.classList.remove('tutorial-highlight');
        });
    }

    function _clearTutorialBadge() {
        document.querySelectorAll('.tutorial-badge').forEach(function(el) {
            el.remove();
        });
    }

    function _placeTutorialBadge(targetEl, stepNum, total) {
        _clearTutorialBadge();
        if (!targetEl) return;
        var badge = document.createElement('span');
        badge.className = 'tutorial-badge';
        badge.textContent = stepNum + ' / ' + total;
        targetEl.parentNode.insertBefore(badge, targetEl.nextSibling);
    }

    function _showTutorialNav(visible) {
        ['tutorial-skip-btn','tutorial-next-btn','tutorial-back-btn'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = visible ? '' : 'none';
        });
    }
    window._showTutorialNav = _showTutorialNav;

    function _updateBackBtn() {
        var back = document.getElementById('tutorial-back-btn');
        if (!back) return;
        var isFirst = gameState.state.tutorialStep <= 1;
        back.disabled = isFirst;
        back.style.opacity = isFirst ? '0.3' : '1';
    }

    function _startTutorialStep(step) {
        _clearTutorialHighlight();
        _clearTutorialBadge();
        var data = TUTORIAL_STEPS[step - 1];
        if (!data) return;

        var el = data.target ? document.getElementById(data.target) : null;
        if (el) {
            el.classList.add('tutorial-highlight');
            _placeTutorialBadge(el, step, TUTORIAL_TOTAL);
        }

        var msg = '[STEP ' + step + '/' + TUTORIAL_TOTAL + '] ' + data.msg;
        otisLines.push({ role: 'otis', text: msg }); renderOTIS();
        if (data.tts !== false) ttsSay(data.msg);

        _showTutorialNav(true);
        _updateBackBtn();

        var nextBtn = document.getElementById('tutorial-next-btn');
        if (nextBtn) {
            nextBtn.disabled = !!data.gated;
            nextBtn.style.opacity = data.gated ? '0.3' : '1';
        }
    }
    window._startTutorialStep = _startTutorialStep;

    function tutorialAdvance() {
        var s = gameState.state;
        if (!_tutorialActive()) return;
        var data = TUTORIAL_STEPS[s.tutorialStep - 1];
        if (data && data.gated) {
            var nextBtn = document.getElementById('tutorial-next-btn');
            if (nextBtn && nextBtn.disabled) return;
        }
        var next = s.tutorialStep + 1;
        if (next > TUTORIAL_TOTAL) {
            _clearTutorialHighlight();
            _clearTutorialBadge();
            _showTutorialNav(false);
            s.tutorialStep = 0;
            gameState._save();
            var doneMsg = 'Tutorial complete. The station is yours when you are ready. Click BEGIN GAME to start. The clock starts then.';
            otisLines.push({ role: 'otis', text: doneMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(doneMsg);
            var beginBtn = document.getElementById('tutorial-begin-btn');
            if (beginBtn) beginBtn.style.display = '';
            return;
        }
        s.tutorialStep = next;
        gameState._save();
        _startTutorialStep(next);
    }
    window.tutorialAdvance = tutorialAdvance;

    function tutorialNext() { tutorialAdvance(); }
    window.tutorialNext = tutorialNext;

    function tutorialBack() {
        var s = gameState.state;
        if (!_tutorialActive()) return;
        var prev = s.tutorialStep - 1;
        if (prev < 1) return;
        s.tutorialStep = prev;
        gameState._save();
        _startTutorialStep(prev);
    }
    window.tutorialBack = tutorialBack;

    function tutorialExit() {
        _clearTutorialHighlight();
        _clearTutorialBadge();
        _showTutorialNav(false);
        gameState.state.tutorialStep = 0;
        gameState._save();
        var msg = 'Tutorial skipped. Review topics in the HELP module at any time.';
        otisLines.push({ role: 'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
        var loginBtn = document.getElementById('btn-login');
        var loginHidden = !loginBtn || loginBtn.style.display === 'none';
        if (loginHidden) {
            var beginBtn = document.getElementById('tutorial-begin-btn');
            if (beginBtn) beginBtn.style.display = '';
        }
    }
    window.tutorialExit = tutorialExit;

    function tutorialUnlockGate(stepNum) {
        if (gameState.state.tutorialStep !== stepNum) return;
        var nextBtn = document.getElementById('tutorial-next-btn');
        if (nextBtn) { nextBtn.disabled = false; nextBtn.style.opacity = '1'; }
        // Brief pause so the player sees the gate unlock before auto-advancing
        setTimeout(tutorialAdvance, 900);
    }
    window.tutorialUnlockGate = tutorialUnlockGate;

    function checkTutorialModalOpen(name) {
        var s = gameState.state;
        if (s.tutorialStep === 8 && name === 'belt') {
            // Spawn a tutorial demo item so step 9 ("There is an item on the belt") is true
            var tutorialDemoItem = {
                name: 'Salvaged Power Cell',
                category: 'Industrial',
                rarity: 'Common',
                condition: 'Used',
                otisValue: 45,
                tutorialItem: true,
                consultedExamine: false,
                consultedWorth: false,
                consultedGeorge: false
            };
            if (typeof setItemInQueue === 'function') setItemInQueue(tutorialDemoItem);
            tutorialUnlockGate(8);
        }
        if (s.tutorialStep === 18 && name === 'comms') {
            tutorialUnlockGate(18);
        }
    }
    window.checkTutorialModalOpen = checkTutorialModalOpen;
