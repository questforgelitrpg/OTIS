// OTIS bot subsystem — calibration, repair, degradation, status rendering. Extracted from index.html in Phase 8 of the monolith refactor.

    function onDropCompleteBotDegradation() {
        var s = gameState.state;
        if (!s.bots) s.bots = [{ id:1,status:'NOMINAL',degradation:0 },{ id:2,status:'NOMINAL',degradation:0 },{ id:3,status:'NOMINAL',degradation:0 }];
        var idx = Math.floor(Math.random() * 3);
        var bot = s.bots[idx];
        var wasNominal = bot.status === 'NOMINAL';
        // Power Regulator: reduces chance that degradation actually ticks
        if (Math.random() < getDegradationMultiplier()) {
            bot.degradation++;
            // Cooling Loop: chance to prevent a bot slipping from NOMINAL to AMBER
            if (wasNominal && bot.degradation >= 3 && Math.random() < getCoolingBonus()) {
                bot.degradation = Math.max(0, bot.degradation - 1); // undo the slip
            }
        }
        if (bot.degradation >= 9) bot.status = 'OFFLINE';
        else if (bot.degradation >= 6) bot.status = 'RED';
        else if (bot.degradation >= 3) bot.status = 'AMBER';
        else bot.status = 'NOMINAL';
        gameState._save();
        updateBotUI();
    }
    window.onDropCompleteBotDegradation = onDropCompleteBotDegradation;

    function updateBotUI() {
        var bots = gameState.state.bots || [];
        var statusMap = { NOMINAL: 'NOMINAL', AMBER: 'AMBER \u2014 DEGRADED', RED: 'RED \u2014 CRITICAL', OFFLINE: 'OFFLINE' };
        var clsMap = { NOMINAL: 'status-ok', AMBER: 'status-warn', RED: 'status-err', OFFLINE: 'status-err' };
        var dotClsMap = { NOMINAL: '', AMBER: ' amber', RED: ' red', OFFLINE: ' offline' };
        bots.forEach(function(bot) {
            var i = bot.id;
            var d1 = document.getElementById('bot-dot-' + i);
            if (d1) d1.className = 'dot' + (gameState.state.dropActive ? dotClsMap[bot.status] || '' : '');
            var d2 = document.getElementById('sys-bot-dot-' + i);
            if (d2) d2.className = 'dot' + dotClsMap[bot.status];
            var st = document.getElementById('sys-bot' + i);
            if (st) { st.textContent = statusMap[bot.status] || bot.status; st.className = clsMap[bot.status] || 'status-ok'; }
            var rep = document.getElementById('sys-bot' + i + '-repair');
            if (rep) rep.style.display = (bot.status !== 'NOMINAL') ? '' : 'none';
        });
        var arm = document.getElementById('arm-panel');
        if (arm) {
            var hasAlert = bots.some(function(b) { return b.status === 'RED' || b.status === 'OFFLINE'; });
            var hasWarn  = bots.some(function(b) { return b.status === 'AMBER'; });
            if (hasAlert) { if (!arm.classList.contains('arm-alert')) arm.classList.add('arm-alert'); arm.classList.remove('arm-warning'); }
            else if (hasWarn) { if (!arm.classList.contains('arm-warning')) arm.classList.add('arm-warning'); arm.classList.remove('arm-alert'); }
        }
        renderPendingBotRepairs();
    }
    window.updateBotUI = updateBotUI;

    function renderPendingBotRepairs() {
        var el = document.getElementById('pending-bot-repairs');
        if (!el) return;
        var repairs = gameState.state.pendingBotRepairs || [];
        if (!repairs.length) { el.style.display = 'none'; return; }
        el.style.display = '';
        el.innerHTML = repairs.map(function(r) {
            var daysLeft = Math.max(0, r.repairOnDay - (gameState.state.day || 1));
            return '<div>BOT-' + r.botId + ' \u2014 parts en route \u2014 ' + daysLeft + 'd remaining</div>';
        }).join('');
    }
    window.renderPendingBotRepairs = renderPendingBotRepairs;

    function handleBotCalibrate(id) {
        var s = gameState.state;
        var bot = (s.bots || []).find(function(b) { return b.id === id; });
        if (!bot || bot.status === 'OFFLINE') { var b1 = 'BOT-' + id + ' OFFLINE. Order parts to restore.'; otisLines.push({ role: 'otis', text: b1 }); renderOTIS(); return; }
        if (s.credits < 50) { var b2 = 'Insufficient credits. CALIBRATE: 50 credits.'; otisLines.push({ role: 'otis', text: b2 }); renderOTIS(); return; }
        s.credits -= 50;
        bot.degradation = Math.max(0, bot.degradation - 2);
        if (bot.degradation >= 9) bot.status = 'OFFLINE';
        else if (bot.degradation >= 6) bot.status = 'RED';
        else if (bot.degradation >= 3) bot.status = 'AMBER';
        else bot.status = 'NOMINAL';
        gameState._save(); gameState._updateUI();
        var b3 = 'BOT-' + id + ' calibrated. Status: ' + bot.status + '.';
        otisLines.push({ role: 'otis', text: b3 }); renderOTIS();
    }
    window.handleBotCalibrate = handleBotCalibrate;

    function handleBotOrderParts(id) {
        var s = gameState.state;
        var bot = (s.bots || []).find(function(b) { return b.id === id; });
        if (!bot) return;
        // Already has a pending repair order
        var pending = s.pendingBotRepairs || [];
        if (pending.some(function(r) { return r.botId === id; })) {
            var already = 'BOT-' + id + ' parts already ordered. Awaiting delivery.';
            otisLines.push({ role: 'otis', text: already }); renderOTIS();
            return;
        }
        if (s.credits < 200) { var b4 = 'Insufficient credits. ORDER PARTS: 200 credits.'; otisLines.push({ role: 'otis', text: b4 }); renderOTIS(); return; }
        s.credits -= 200;
        // Deferred repair: parts arrive in 2 in-game days
        s.pendingBotRepairs = pending;
        s.pendingBotRepairs.push({ botId: id, repairOnDay: s.day + 2 });
        gameState._save(); gameState._updateUI();
        renderPendingBotRepairs();
        var b5 = 'BOT-' + id + ' parts ordered. ETA: 2 days. Bot remains degraded until delivery.';
        otisLines.push({ role: 'otis', text: b5 }); renderOTIS();
    }
    window.handleBotOrderParts = handleBotOrderParts;

    function resolvePendingBotRepairs() {
        var s = gameState.state;
        var pending = s.pendingBotRepairs || [];
        if (!pending.length) return;
        var remaining = [];
        var resolved = false;
        pending.forEach(function(r) {
            if (s.day >= r.repairOnDay) {
                var bot = (s.bots || []).find(function(b) { return b.id === r.botId; });
                if (bot) {
                    bot.degradation = 0;
                    bot.status = 'NOMINAL';
                    resolved = true;
                    var msg = 'BOT-' + r.botId + ' parts delivered. Repair complete. Status: NOMINAL.';
                    otisLines.push({ role: 'otis', text: msg }); renderOTIS();
                    if (window.OtisTTS) OtisTTS.speak(msg);
                }
            } else {
                remaining.push(r);
            }
        });
        if (resolved) {
            s.pendingBotRepairs = remaining;
            gameState._save();
            gameState._updateUI();
        }
    }
    window.resolvePendingBotRepairs = resolvePendingBotRepairs;
