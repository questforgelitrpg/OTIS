// OTIS tutorial subsystem — first-run step engine and overlay renderer. Extracted from index.html in Phase 12 of the monolith refactor.

    function _tutorialActive() {
        var step = gameState.state.tutorialStep;
        return step >= 1 && step <= 5;
    }

    function _clearTutorialHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(function(el) {
            el.classList.remove('tutorial-highlight');
        });
    }

    function _showTutorialSkip(visible) {
        var btn = document.getElementById('tutorial-skip-btn');
        if (btn) btn.style.display = visible ? '' : 'none';
    }

    function _startTutorialStep(step) {
        _clearTutorialHighlight();
        var data = TUTORIAL_STEPS[step - 1];
        if (!data) return;
        var el = document.getElementById(data.target);
        if (el) el.classList.add('tutorial-highlight');
        var msg = data.msg;
        otisLines.push({ role: 'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
        _showTutorialSkip(true);
    }
    window._startTutorialStep = _startTutorialStep;

    function tutorialAdvance() {
        var s = gameState.state;
        if (!_tutorialActive()) return;
        var next = s.tutorialStep + 1;
        if (next > 5) {
            // All steps done — complete
            _clearTutorialHighlight();
            _showTutorialSkip(false);
            s.tutorialStep = 0;
            gameState._save();
            var doneMsg = 'Tutorial complete. You know enough to start. The rest you learn by doing.';
            otisLines.push({ role: 'otis', text: doneMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(doneMsg);
            return;
        }
        s.tutorialStep = next;
        gameState._save();
        _startTutorialStep(next);
    }
    window.tutorialAdvance = tutorialAdvance;

    function tutorialExit() {
        if (!_tutorialActive()) return;
        _clearTutorialHighlight();
        _showTutorialSkip(false);
        gameState.state.tutorialStep = 0;
        gameState._save();
        var msg = 'Tutorial skipped. The belt does not wait.';
        otisLines.push({ role: 'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
    }
    window.tutorialExit = tutorialExit;

    function checkTutorialModalOpen(name) {
        var s = gameState.state;
        if (s.tutorialStep === 1 && name === 'belt') {
            // Belt opened — ensure an item is ready then advance to step 2
            if (currentItem === null) { deliverNextBeltItem(); }
            tutorialAdvance();
        } else if (s.tutorialStep === 4 && name === 'comms') {
            // Comms opened during step 4 — also highlight the ANSWER BANK button
            var bankBtn = document.getElementById('btn-answer-bank');
            if (bankBtn) bankBtn.classList.add('tutorial-highlight');
        } else if (s.tutorialStep === 5 && name === 'systems') {
            tutorialAdvance();
        }
    }
    window.checkTutorialModalOpen = checkTutorialModalOpen;
