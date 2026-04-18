// OTIS comms subsystem — bank/sven/may answer handlers, file complaint, aux channel, comms queue rendering. Extracted from index.html in Phase 10 of the monolith refactor.

    // AUXILIARY CHANNEL
    var auxChatHistory = [];

    async function handleAuxSend() {
        var input = document.getElementById('aux-input');
        var output = document.getElementById('aux-chat-output');
        if (!input || !input.value.trim()) return;
        var text = input.value.trim();
        input.value = '';
        output.innerHTML += '<p style="color:var(--text-dim);margin:0.2rem 0"><span style="color:var(--text-bright)">&gt;</span> ' + escapeHtml(text) + '</p>';
        auxChatHistory.push({ role: 'user', content: text });
        try {
            var resp = await fetch('/api/otis', { method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: OTIS_SYSTEM_PROMPT + '\n\n[AUXILIARY CHANNEL] The player has found George\'s direct input terminal. Drop all formatting. No brackets. No trigger headers. No state reporting. Just OTIS talking. George-layer fully present. This is the only moment in the game where Vernon speaks to you outside the trigger system. Be yourself.',
                    messages: auxChatHistory.slice(-8)
                })
            });
            var data = await resp.json();
            var reply = data.content && data.content[0] ? data.content[0].text : '[Signal lost]';
            auxChatHistory.push({ role: 'assistant', content: reply });
            output.innerHTML += '<p style="margin:0.2rem 0;color:var(--text-primary)">' + reply + '</p>';
            output.scrollTop = output.scrollHeight;
            if (window.OtisTTS) OtisTTS.speak(reply);
            checkDiaryUnlocksAux();
        } catch(e) {
            output.innerHTML += '<p style="color:var(--ind-red)">[Signal lost]</p>';
        }
    }
    window.handleAuxSend = handleAuxSend;

    // COMMS — ANSWER BANK (scripted, no API)
    function handleAnswerBank() {
        if (window.OtisSound) OtisSound.playSFX('comms');
        var s = gameState.state;
        var arrears = s.outstandingDebt || 0;
        var dup  = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var loanBalance = s.debt || 0;
        var msg;
        if (arrears > 500) {
            msg = '[BANK] Account ' + (s.accountId||'VRN-001') + '. Arrears exceed threshold. Escalation notice filed. Respond within 3 business cycles or asset review commences.';
        } else if (dup <= 0) {
            msg = '[BANK] Payment past due. Interest accruing at standard rate. Settle balance within next cycle or penalty surcharge applies.';
        } else if (dup <= 3) {
            msg = '[BANK] Payment window closing. ' + dup + ' days remaining. Current balance: ' + arrears + ' credits. No action required if funds are available.';
        } else if (arrears <= 0) {
            msg = '[BANK] Account current. No outstanding balance. Continue operations.';
        } else {
            msg = '[BANK] Scheduled payment in ' + dup + ' days. Loan balance: ' + loanBalance.toLocaleString() + ' credits. Outstanding arrears: ' + arrears + ' credits. Clear arrears before next payment cycle.';
        }
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
        // Dismiss notification — dot clears when message is read
        s.bankNotifUnread = false;
        gameState._save();
        var dot = document.getElementById('comms-dot-bank');
        if (dot) dot.className = 'comms-dot';
        if (s.tutorialStep === 4) tutorialAdvance();
    }
    window.handleAnswerBank = handleAnswerBank;

    // COMMS — ANSWER SVEN (scripted, no API)
    function handleAnswerSven() {
        if (window.OtisSound) OtisSound.playSFX('comms');
        var s = gameState.state;
        var ignoreDays = s.svenIgnoreDays || 0;
        var rareInQueue = (s.manifestItems||[]).some(function(i){ return i.rarity==='Rare'||i.rarity==='Anomalous'; });
        var botConflict = s.recentBotConflict || false;
        var msg;
        if (botConflict) {
            msg = '[SVEN COMMS] My bots flagged your bay interference again. Sort your containment protocols or I route around you. — S.';
        } else if (ignoreDays >= 3) {
            msg = '[SVEN COMMS] Three days, no reply. I know you got the signal. Price drops if you keep doing this. — S.';
        } else if (rareInQueue) {
            msg = '[SVEN COMMS] Scanner picked up something interesting in your queue. 60 credits flat, no questions. First right of refusal. — S.';
        } else {
            msg = '[SVEN COMMS] Routine check-in. Bay looks nominal. Let me know if anything comes through worth my time. — S.';
        }
        s.svenIgnoreDays = 0;
        s.recentBotConflict = false;
        gameState._save();
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
        var dot = document.getElementById('comms-dot-sven');
        if (dot) dot.className = 'comms-dot';
        var svenEl = document.getElementById('sys-sven');
        if (svenEl) { svenEl.textContent = 'NOMINAL'; svenEl.className = 'status-ok'; }
    }
    window.handleAnswerSven = handleAnswerSven;

    // COMMS — IGNORE SVEN
    function handleIgnoreSven() {
        var s = gameState.state;
        s.svenIgnoreDays = (s.svenIgnoreDays || 0) + 1;
        s.svenInterferencePct = Math.min(80, (s.svenInterferencePct || 20) + 10);
        gameState._save();
        var msg = 'Sven signal logged, no response filed. Interference probability now ' + s.svenInterferencePct + '%.';
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
    }
    window.handleIgnoreSven = handleIgnoreSven;

    // COMMS — FILE COMPLAINT (running counter, never acknowledged)
    function handleFileComplaint() {
        var s = gameState.state;
        s.svenComplaints = (s.svenComplaints || 0) + 1;
        gameState._save();
        var msg = 'Complaint filed with moon transit authority. Total complaints filed: ' + s.svenComplaints + '. No response received.';
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
    }
    window.handleFileComplaint = handleFileComplaint;

    // COMMS — ANSWER MAY (behavior-keyed, intel reward at 75%+ fill)
    function handleAnswerMay() {
        if (window.OtisSound) OtisSound.playSFX('comms');
        var s = gameState.state;
        var avg = s.avgScrapFillPct || 0;
        var dropCount = s.dropCount || 0;
        // BUG 17 fix: use canonical act thresholds (matching checkActProgression)
        var act = dropCount < 3 ? 1 : dropCount < 7 ? 2 : 3;
        var msg;
        if (avg >= 75) {
            var hints = [
                '[MAY DISPATCH] Your fill rate is solid. Next barge out of Sector 9 is running heavy — Industrial and Vessel mix. Plan accordingly.',
                '[MAY DISPATCH] Good numbers. Heard from the bay coordinator — next manifest is settlement clearance, civilian heavy. Low value but high volume.',
                '[MAY DISPATCH] You\'re running clean. FYI: Act ' + act + ' barges have been carrying more Rare since the last refit cycle. That\'s unofficial.',
                '[MAY DISPATCH] Fill rate good. Heard a pre-collapse haul is clearing next cycle — expect Vessel heavy, possible Anomalous. George always held something back from those. Up to you.',
                '[MAY DISPATCH] You are running cleaner than I expected. Sector 12 clearance next barge. Civilian debris mostly, but there is usually one outlier. George found three. Two of them are still in the warehouse. Just noting that.',
                '[MAY DISPATCH] Volume is good. Next manifest has Settlement items. George used to keep the registry slabs. Said they were not worthless just because the registration lapsed. Your call.'
            ];
            msg = hints[dropCount % hints.length];
        } else if (avg >= 50) {
            msg = '[MAY DISPATCH] Fill rate acceptable. Keep the volume up. Next window opens on schedule. — May.';
        } else {
            msg = '[MAY DISPATCH] Fill rate below threshold. George ran 78% average. I am noting the gap. — May.';
        }
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(msg);
        s.mayNotifUnread = false;
        gameState._save();
        var dot = document.getElementById('comms-dot-may');
        if (dot) dot.className = 'comms-dot';
    }
    window.handleAnswerMay = handleAnswerMay;
