// OTIS UI utilities — escape/render/modal/light helpers extracted from index.html in Phase 4 of the monolith refactor.

    // HELPERS
    function setEl(id, text) { var e = document.getElementById(id); if (e) e.textContent = text; }
    window.setEl = setEl;
    function escapeHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    window.escapeHtml = escapeHtml;

    function renderOTIS() {
        var out = document.getElementById('otis-output');
        if (!out) return;
        out.innerHTML = otisLines.slice(-MAX_OTIS_LINES).map(function(line) {
            return '<div class="' + (line.role === 'otis' ? 'otis-line' : 'user-line') + '"><span class="line-tag">' + (line.role === 'otis' ? 'OTIS' : 'OPR') + '</span>' + escapeHtml(line.text) + '</div>';
        }).join('');
        out.scrollTop = out.scrollHeight;
    }
    window.renderOTIS = renderOTIS;

    // MODAL MANAGEMENT
    function openModal(name) {
        document.querySelectorAll('.modal.open').forEach(function(m) { m.classList.remove('open'); });
        var el = document.getElementById('modal-' + name);
        if (el) {
            el.classList.add('open');
            if (el.classList.contains('modal-panel')) document.body.classList.add('panel-open');
        }
        var floatBar = document.getElementById('otis-float');
        if (floatBar) floatBar.style.display = 'block';
        checkTutorialModalOpen(name);
        if (name === 'store' && window.OtisSound) OtisSound.startAmbient('storeroom');
        if (name === 'store') renderSchematic();
    }
    window.openModal = openModal;
    function closeModal(name) {
        var el = document.getElementById('modal-' + name);
        if (el) el.classList.remove('open');
        if (!document.querySelector('.modal.open')) {
            var floatBar = document.getElementById('otis-float');
            if (floatBar) floatBar.style.display = 'none';
            document.body.classList.remove('panel-open');
        }
        // Remove ANSWER BANK highlight if comms modal closes during step 4
        if (name === 'comms') {
            var bankBtn = document.getElementById('btn-answer-bank');
            if (bankBtn) bankBtn.classList.remove('tutorial-highlight');
        }
        if (name === 'store' && window.OtisSound) OtisSound.stopAmbient('storeroom');
    }
    window.closeModal = closeModal;

    function updateGameHints() {
        var s = gameState.state;
        var text = '';
        var color = 'var(--text-dim)';
        var scrapFill = s.scrapFill || 0;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var dnd = (s.daysUntilNextDrop != null) ? s.daysUntilNextDrop : 7;
        var keepLen = (s.keepLog && s.keepLog.length) || 0;
        var dropRem = s.dropItemsRemaining || 0;

        if (s.missedPayments > 0) {
            text = '\u26a0 ARREARS ACTIVE \u2014 CLEAR IN COMMS';
            color = 'var(--text-danger)';
        } else if (dup <= 3) {
            text = '\u26a0 INSTALLMENT DUE IN ' + dup + 'd \u2014 ' + ((gameState.state && gameState.state.currentInstallment) || 850) + ' cr';
            color = 'var(--text-danger)';
        } else if (scrapFill >= 90) {
            text = 'SCRAP CRITICAL \u2014 DISPATCH TO MAY';
            color = 'var(--text-warn)';
        } else if (scrapFill >= 75) {
            text = 'SCRAP HIGH \u2014 CONSIDER DISPATCH';
            color = 'var(--text-warn)';
        } else if (s.beltJammed || s.conveyorJammed) {
            text = 'BELT JAMMED \u2014 CLEAR JAM';
            color = 'var(--text-warn)';
        } else if (keepLen >= 10) {
            text = 'KEEP LOG NEAR FULL (' + keepLen + '/12)';
            color = 'var(--text-warn)';
        } else if (s.dropActive && dropRem > 0) {
            text = 'DROP ACTIVE \u2014 ' + dropRem + ' ITEMS REMAINING';
            color = 'var(--text-dim)';
        } else if (dnd <= 2 && !s.dropActive) {
            text = 'BARGE INCOMING \u2014 ' + dnd + 'd';
            color = 'var(--text-dim)';
        } else if (dup <= 3) {
            text = 'PAYMENT: ' + dup + 'd \u2014 ' + (s.credits || 0) + ' cr available';
            color = 'var(--text-dim)';
        } else {
            text = 'STANDING BY';
            color = 'var(--text-muted)';
        }

        var hint = document.getElementById('arm-hint');
        if (hint) {
            hint.textContent = text;
            hint.style.color = color;
        }
        var floatBar = document.getElementById('otis-float');
        if (floatBar) floatBar.textContent = text;
    }
    window.updateGameHints = updateGameHints;

    function updateBeltUI(status) {
        var track  = document.getElementById('belt-bar-track');
        var fill   = document.getElementById('belt-bar-fill');
        var st     = document.getElementById('drop-status-text');
        var backed = document.getElementById('belt-backed-up');
        var bdc    = document.getElementById('belt-drop-countdown');
        var rem    = gameState.state.dropItemsRemaining || 0;
        var days   = (gameState.state.daysUntilNextDrop != null) ? gameState.state.daysUntilNextDrop : TIMING.DAYS_BETWEEN_DROPS;
        if (status === 'DELIVERING') {
            if (track) track.style.display = '';
            if (fill) { fill.className = 'belt-bar-fill'; setTimeout(function() { fill.style.animationDuration = (getBeltMs()/1000)+'s'; fill.classList.add('belt-active'); }, 0); }
            if (backed) backed.style.display = 'none';
            if (st) st.textContent = 'ACTIVE \u2014 ' + rem + ' items remaining';
            if (window.OtisSound) OtisSound.startAmbient('conveyor');
        } else if (status === 'BACKED_UP') {
            if (fill) fill.className = 'belt-bar-fill';
            if (backed) backed.style.display = '';
            if (st) st.textContent = 'BACKED UP \u2014 ' + rem + ' items remaining';
        } else if (status === 'DROP_COMPLETE') {
            if (track) track.style.display = 'none';
            if (backed) backed.style.display = 'none';
            if (st) st.textContent = 'DROP COMPLETE';
            if (bdc) bdc.textContent = days;
            var sb  = document.getElementById('btn-scan-belt');  if (sb)  sb.disabled = true;
            _updatePullStoreroomBtn();
        } else {
            if (track) track.style.display = 'none';
            if (backed) backed.style.display = 'none';
            if (st) st.textContent = gameState.state.dropActive ? 'WINDOW: ACTIVE' : 'WINDOW: CLOSED';
            if (bdc) bdc.textContent = days;
        }
    }
    window.updateBeltUI = updateBeltUI;

    // INDICATORS
    function updateModuleLights() {
        var s = gameState.state;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var arrears = s.outstandingDebt || 0;
        var scrap = s.scrapFill || 0;
        var keep = s.keepLog.length;
        setLight('light-belt',    s.dropActive ? 'light-on' : currentItem ? 'light-amber' : '');
        var brokerFull = (s.brokerBin||[]).length >= 8;
        var mayFull = (s.mayBin||[]).length >= 10;
        var behindPayment = arrears > 0 || dup <= 0;
        var bankLit = behindPayment || s.bankNotifUnread;
        setLight('light-comms',
            (arrears > 0 || dup <= 3 || brokerFull) ? 'light-red' :
            (bankLit || scrap >= 75 || mayFull) ? 'light-amber' : '');
        var bufLen = (s.storeroomBuffer || []).length;
        setLight('light-store',   scrap >= 90 || bufLen >= 4 ? 'light-red' : (scrap >= 75 || bufLen > 0 || keep >= 10) ? 'light-amber' : '');
        setLight('light-systems', (s.missedPayments > 0 || arrears > 2000) ? 'light-red' : '');
        var arm = document.getElementById('arm-panel');
        var armSt = document.getElementById('arm-status');
        if (arm) {
            var alert = s.missedPayments > 0 || arrears > 2000;
            var warn  = dup <= 3 || scrap >= 75;
            arm.className = alert ? 'arm-alert' : warn ? 'arm-warning' : '';
            if (armSt) armSt.textContent = alert ? 'ALERT' : warn ? 'WARNING' : 'NOMINAL';
        }
    }
    window.updateModuleLights = updateModuleLights;
    function setLight(id, cls) {
        var el = document.getElementById(id);
        if (!el) return;
        el.className = el.className.replace(/\blight-\w+/g, '').trim();
        if (cls) el.className += ' ' + cls;
    }
    window.setLight = setLight;
    function updateCommsIndicators() {
        var s = gameState.state;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var arrears = s.outstandingDebt || 0;
        var behindPayment = arrears > 0 || dup <= 0;
        var bankLit = behindPayment || s.bankNotifUnread;
        var bd = document.getElementById('comms-dot-bank');
        if (bd) bd.className = 'comms-dot' + (bankLit ? (behindPayment || dup <= 2 ? ' dot-red' : dup <= 4 ? ' dot-amber' : ' dot-on') : '');
        var scrap = s.scrapFill || 0;
        var mayMessages = (s.mayBin || []).length;
        var md = document.getElementById('comms-dot-may');
        if (md) md.className = 'comms-dot' + (mayMessages > 0 ? ' dot-on' : '');
    }
    window.updateCommsIndicators = updateCommsIndicators;
    function updateSystemsStatus() {
        var s = gameState.state;
        var scrap = s.scrapFill || 0;
        var st = document.getElementById('sys-store');
        if (st) { st.textContent = scrap >= 90 ? 'CRITICAL' : scrap >= 75 ? 'ATTENTION' : 'NOMINAL'; st.className = scrap >= 90 ? 'status-err' : scrap >= 75 ? 'status-warn' : 'status-ok'; }
        var sh = document.getElementById('sys-ship');
        if (sh) { sh.textContent = 'NOMINAL'; sh.className = 'status-ok'; }
        var pw = document.getElementById('sys-power');
        if (pw) { var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS; pw.textContent = dup <= 3 ? 'ALERT' : 'NOMINAL'; pw.className = dup <= 3 ? 'status-warn' : 'status-ok'; }
    }
    window.updateSystemsStatus = updateSystemsStatus;
    function updateScrapBar() {
        var fill = gameState.state.scrapFill || 0;
        setEl('scrap-pct', fill + '%');
        var bar = document.getElementById('scrap-bar-fill');
        if (bar) { bar.style.width = fill + '%'; bar.className = 'scrap-bar-fill' + (fill >= 90 ? ' scrap-red' : fill >= 75 ? ' scrap-amber' : ''); }
        setEl('may-scrap-readout', 'SCRAP: ' + fill + '%');
    }
    window.updateScrapBar = updateScrapBar;

    // FATIGUE VISUALS
    function getFatigueTier() {
        var h = gameState.state.sessionHours;
        if (h < 30) return 'NONE';
        if (h < 60) return 'LOW';
        if (h < 120) return 'MODERATE';
        if (h < 180) return 'HIGH';
        return 'CRITICAL';
    }
    window.getFatigueTier = getFatigueTier;
    function updateFatigueVisuals() {
        var h = gameState.state.sessionHours;
        var overlay = document.getElementById('fatigue-overlay');
        var noise = document.getElementById('fatigue-noise');
        var term = document.getElementById('terminal');
        var warnBtn = document.getElementById('fatigue-warn-btn');
        if (h < 30) {
            if (overlay) overlay.style.opacity = '0';
            if (noise) noise.style.opacity = '0';
            if (term) term.style.filter = 'blur(0px)';
            if (warnBtn) warnBtn.style.display = 'none';
        } else if (h < 60) {
            if (overlay) overlay.style.opacity = '0.3';
            if (noise) noise.style.opacity = '0.05';
            if (term) term.style.filter = 'blur(0.2px)';
            if (warnBtn) warnBtn.style.display = 'none';
        } else if (h < 120) {
            if (overlay) overlay.style.opacity = '0.6';
            if (noise) noise.style.opacity = '0.15';
            if (term) term.style.filter = 'blur(0.6px)';
            if (warnBtn) warnBtn.style.display = 'none';
        } else if (h < 180) {
            if (overlay) overlay.style.opacity = '0.85';
            if (noise) noise.style.opacity = '0.30';
            if (term) term.style.filter = 'blur(1.2px)';
            if (warnBtn) warnBtn.style.display = '';
        } else {
            if (overlay) overlay.style.opacity = '1';
            if (noise) noise.style.opacity = '0.50';
            if (term) term.style.filter = 'blur(2px)';
            if (warnBtn) { warnBtn.style.display = ''; warnBtn.classList.add('fatigue-pulse'); }
        }
    }
    window.updateFatigueVisuals = updateFatigueVisuals;

    var ARM_DEFAULT_SPRITE = 'images/otis_sprite/idle.png';
    window.ARM_DEFAULT_SPRITE = ARM_DEFAULT_SPRITE;

    function updateArmSprite(trigger) {
        var src = ARM_ZONE_MAP[trigger] || ARM_DEFAULT_SPRITE;
        var el = document.getElementById('arm-art');
        if (el) el.src = src;
    }
    window.updateArmSprite = updateArmSprite;

    // Sidebar bot animation — self-contained eye-candy (arm-bot-anim element in sidebar).
    // Wrapped in DOMContentLoaded because ui.js loads in <head>, before the element exists.
    document.addEventListener('DOMContentLoaded', function() {
        (function() {
            var BOT_FRAMES = [' [o_o]>', ' [^_^]>', ' [-_-]>', ' [*_*]>'];
            var CARRY_FRAMES = [' [o_o]>[=]', ' [^_^]>[#]', ' [-_-]>[~]'];
            var LABELS = ['BOT-1', 'BOT-2', 'UNIT-A', 'UNIT-B', 'DRONE'];
            var ROW_SPACING_PCT = 20;
            function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
            function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
            function makeBotStr() {
                var n = randInt(2, 4);
                var parts = [];
                for (var i = 0; i < n; i++) {
                    var frame = Math.random() < 0.25 ? rand(CARRY_FRAMES) : rand(BOT_FRAMES);
                    parts.push(rand(LABELS) + ':' + frame + '  ');
                }
                return parts.join('');
            }
            var container = document.getElementById('arm-bot-anim');
            if (!container) return;
            var rows = [];
            for (var r = 0; r < 5; r++) {
                var el = document.createElement('div');
                el.className = 'bot-row';
                el.style.top = (r * ROW_SPACING_PCT + randInt(1, 4)) + '%';
                var dur = randInt(4, 8);
                el.style.animationDuration = dur + 's';
                el.style.animationDelay = (-randInt(0, dur)) + 's';
                el.textContent = makeBotStr();
                container.appendChild(el);
                rows.push({ el: el, dur: dur, timer: null });
            }
            rows.forEach(function(row) {
                row.timer = setInterval(function() { row.el.textContent = makeBotStr(); }, row.dur * 1000);
            });
            container._botTimers = rows.map(function(row) { return row.timer; });
        }());
    });
