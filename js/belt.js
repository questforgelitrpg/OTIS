// OTIS belt / drop / declaration subsystem — extracted from index.html in Phase 5 of the monolith refactor.

    function buildManifestSummary(manifest) {
        if (gameState.state.day === 1) {
            return "First intake. Four items. Common origin. Belt is running. Examine each one. George had a method. Worth learning before diverging from it.";
        }
        var n = manifest.length;
        var cats = {};
        manifest.forEach(function(i) { cats[i.category] = (cats[i.category] || 0) + 1; });
        var catList = Object.keys(cats).map(function(c) { return c + '(' + cats[c] + ')'; }).join(', ');
        var rec = getOTISPickRecommendation();
        var recNote = rec ? ' Your ' + rec.category + ' trend continues.' : '';
        var choice = gameState.state.pickListChoice || {};
        var pickNote = (choice.mode !== 'DROP' || choice.category)
            ? ' Pick list: ' + choice.mode + (choice.category ? ' ' + choice.category : '') + '.' : '';
        return 'Barge inbound. ' + n + ' items. Categories: ' + catList + '.' + pickNote + recNote;
    }

    function renderManifestSummary(manifest) {
        var panel = document.getElementById('manifest-category-bars');
        var empty = document.getElementById('manifest-summary-empty');
        if (!panel) return;
        if (!manifest || !manifest.length) {
            panel.innerHTML = '';
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';
        var cats = {};
        manifest.forEach(function(i) { cats[i.category] = (cats[i.category] || 0) + 1; });
        var total = manifest.length;
        panel.innerHTML = PICK_CATEGORIES.filter(function(c) { return cats[c]; }).map(function(cat) {
            var n = cats[cat];
            var pct = Math.round((n / total) * 100);
            var barWidth = Math.max(4, Math.round((n / total) * MANIFEST_BAR_MAX_PX));
            return '<div style="margin-bottom:0.35rem">' +
                '<div style="display:flex;justify-content:space-between;font-size:14px">' +
                '<span>' + cat.toUpperCase() + '</span>' +
                '<span style="color:var(--text-dim)">' + n + ' (' + pct + '%)</span>' +
                '</div>' +
                '<div class="manifest-cat-bar-track">' +
                '<div class="manifest-cat-bar-fill" style="width:' + barWidth + 'px"></div>' +
                '</div></div>';
        }).join('');
    }

    window.buildManifestSummary = buildManifestSummary;
    window.renderManifestSummary = renderManifestSummary;

    function getEffectiveValue(item) {
        if (item.rarity === 'Anomalous') return 0;
        var raw = Math.floor((item.otisValue || 0) * (CONDITION_MULTIPLIERS[item.condition] || 1.0));
        var cap = RARITY_CREDIT_CAPS[item.rarity];
        return (cap != null) ? Math.min(raw, cap) : raw;
    }
    window.getEffectiveValue = getEffectiveValue;

    function getBeltMs() { return getBotDeliveryMs(); }
    function startBeltDelivery() { if (beltTimer) return; beltTimer = setInterval(deliverNextBeltItem, getBeltMs()); }
    function stopBeltDelivery()  { clearInterval(beltTimer); beltTimer = null; }
    window.getBeltMs = getBeltMs;
    window.startBeltDelivery = startBeltDelivery;
    window.stopBeltDelivery = stopBeltDelivery;

    // Maximum characters to store for archived item names (keeps log sizes bounded)
    var MAX_ARCHIVE_NAME_LENGTH = 30;

    // ── Per-drop routing stats (ephemeral — reset each drop, never persisted) ──
    // Used to populate the end-of-drop debrief modal.
    var _dropRoutes = { kept: 0, sold: 0, sven: 0, archived: 0, scrap: 0, skip: 0 };
    var _dropCreditsStart = 0;

    function _resetDropRoutes() {
        _dropRoutes = { kept: 0, sold: 0, sven: 0, archived: 0, scrap: 0, skip: 0 };
        _dropCreditsStart = gameState.state.credits || 0;
    }

    // ── Per-bot fetch loop constants and state ────────────────────────────────
    //
    // Design math (8 real minutes per drop window = 2 in-game days × 4 min/day):
    // Player decision time avg ≈ 8s/item.
    //
    // Scenario                    | Items | Bot arrival | Player time | Total | Fits 8min?
    // Act 1 (10), 3 NOMINAL bots  |  10   | every 6s    | 80s         | ~80s  | ✅
    // Act 2 (20), 3 NOMINAL bots  |  20   | every 6s    | 160s        | ~165s | ✅
    // Act 3 (30), 3 NOMINAL bots  |  30   | every 6s    | 240s        | ~245s | ✅
    // Act 3, 2 NOMINAL + 1 OFF    |  30   | every 9s    | 240s        | ~280s | ⚠ tight
    // Act 3, all 3 RED (degr 6+)  |  30   | every ~11s  | 240s        | ~350s | ⚠ resolved via dynamic cap + overflow buffer
    // Act 3, 3 NOMINAL + Belt G3  |  30   | every 3s    | 240s        | ~245s | ✅ trivial
    //
    // Belt queue cap is now dynamic — see computeBeltQueueCap().
    var beltQueueCap = 3;
    var botFetchTimer = null;
    // _lastStallWarnAt is intentionally ephemeral (not persisted). Resetting on reload
    // is acceptable — the player may have just fixed the bots, and re-seeing the warning
    // immediately is not harmful. Storing it in gameState would add save noise every 60s.
    var _lastStallWarnAt = 0;

    function computeFetchDuration(bot) {
        var s = gameState.state;
        var base = 12000;
        if (TIMING.DEBUG_FAST_MODE) base = Math.floor(base / TIMING.DEBUG_SPEED_MULTIPLIER);
        var degradationMult = 1 + (bot.degradation * 0.15);
        var beltTier = (s.upgrades && s.upgrades.belt) || 0;
        var beltMult = [1.0, 0.85, 0.70, 0.50][beltTier];
        return Math.round(base * degradationMult * beltMult);
    }

    function computeReturnDuration(bot) {
        var s = gameState.state;
        var base = 6000;
        if (TIMING.DEBUG_FAST_MODE) base = Math.floor(base / TIMING.DEBUG_SPEED_MULTIPLIER);
        var degradationMult = 1 + (bot.degradation * 0.15);
        var beltTier = (s.upgrades && s.upgrades.belt) || 0;
        var beltMult = [1.0, 0.85, 0.70, 0.50][beltTier];
        return Math.round(base * degradationMult * beltMult);
    }

    // Dynamic belt queue cap — scales with drop size and degraded bot count so that
    // large Act 3 drops with degraded bots don't silently stall the belt.
    // Min 3 (original), max 8 — gives breathing room without unbounded memory use.
    function computeBeltQueueCap() {
        var s = gameState.state;
        var dropSize = s.dropStartSize || (s.fieldPool && s.fieldPool.length) || 0;
        var degradedBots = (s.bots || []).filter(function(b) { return b.status === 'RED' || b.status === 'OFFLINE'; }).length;
        var base = Math.ceil(dropSize / 6);
        if (degradedBots >= 2) base += 2;
        return Math.min(8, Math.max(3, base));
    }
    window.computeBeltQueueCap = computeBeltQueueCap;

    // Maximum number of recently-routed items tracked for CONSULT_GEORGE item callbacks.
    var MAX_RECENT_ROUTED_ITEMS = 12;

    // Track a routed item in the ephemeral recentRoutedItems list (last MAX_RECENT_ROUTED_ITEMS).
    // Used by CONSULT_GEORGE to surface item-level callbacks and history.
    function trackRecentRoutedItem(item, route) {
        var s = gameState.state;
        if (!s.recentRoutedItems) s.recentRoutedItems = [];
        s.recentRoutedItems.unshift({
            name: item.name.substring(0, 30),
            rarity: item.rarity,
            category: item.category,
            route: route,
            day: s.day,
        });
        s.recentRoutedItems = s.recentRoutedItems.slice(0, MAX_RECENT_ROUTED_ITEMS);
    }
    window.trackRecentRoutedItem = trackRecentRoutedItem;
    window.MAX_RECENT_ROUTED_ITEMS = MAX_RECENT_ROUTED_ITEMS;

    // ── WEIGH-IT competing-pressure hint ─────────────────────────────────────
    // Fires on ~12% of items, or any item that matches a live standing order,
    // has a Sven bid potential (Rare/Anomalous), or is Rare+ value.
    // Shows a short inline hint on the declare card — non-blocking, resolvable
    // from existing routing buttons.
    function maybeShowWeighItHint(item) {
        if (!item) return;
        var s = gameState.state;
        var hints = [];

        // Standing order match?
        var matchedOrder = null;
        (s.activeOrders || []).forEach(function(o) {
            if (o.fulfilled || !o.accepted) return;
            var key = o.requirementKey;
            if (key === 'settlementItems' && item.category === 'Settlement') matchedOrder = o;
            if (key === 'vesselItems' && item.category === 'Vessel') matchedOrder = o;
            if (key === 'industrialItems' && item.category === 'Industrial') matchedOrder = o;
            if (key === 'anomalousItem' && item.rarity === 'Anomalous') matchedOrder = o;
        });
        if (matchedOrder) {
            var remaining = matchedOrder.requirementQty - (matchedOrder.progressQty || 0);
            hints.push('\u25B8 ' + matchedOrder.npc + ' standing order needs ' + remaining + ' more ' + (matchedOrder.npc === 'SVEN' ? 'item' : item.category) + '.');
        }

        // Sven bid potential (Rare/Anomalous)?
        var isSvenEligible = (item.rarity === 'Rare' || item.rarity === 'Anomalous') && (s.svenBin || []).length < 3;
        if (isSvenEligible && !matchedOrder) {
            var svenEst = item.rarity === 'Anomalous'
                ? Math.floor((TIMING.ANOMALOUS_RESERVE_MIN + TIMING.ANOMALOUS_RESERVE_MAX) / 2 * 0.65)
                : Math.floor(getEffectiveValue(item) * 0.65);
            hints.push('\u25B8 Sven offers ~' + svenEst + ' cr now (quick sale).');
        }

        // High base value worth flagging?
        var ev = getEffectiveValue(item);
        if (ev >= 500 && !isSvenEligible && !matchedOrder) {
            hints.push('\u25B8 High-value item \u2014 broker bin pays full rate when full.');
        }

        // Random 12% chance on any item (if no structural signal above)
        var alreadyShown = (s.weighItShown || []).indexOf(item.name) !== -1;
        var showRandom = !alreadyShown && Math.random() < 0.12 && !hints.length;

        if (!hints.length && !showRandom) return;
        if (!hints.length) hints.push('\u25B8 Belt trend: ' + (s.otisLearning && s.otisLearning.keepByCategory ? 'KEEP' : 'mixed') + ' recently. Worth a second look?');

        // Record so we don't re-show same item name
        if (!alreadyShown) {
            s.weighItShown = (s.weighItShown || []).concat([item.name]).slice(-30);
        }

        var hintEl = document.getElementById('weigh-it-hint');
        if (hintEl) {
            hintEl.textContent = hints.slice(0, 2).join('  ');
            hintEl.style.display = '';
        }
    }
    window.maybeShowWeighItHint = maybeShowWeighItHint;

    function clearWeighItHint() {
        var hintEl = document.getElementById('weigh-it-hint');
        if (hintEl) { hintEl.textContent = ''; hintEl.style.display = 'none'; }
    }
    window.clearWeighItHint = clearWeighItHint;

    function computePickListFocus(s) {
        var choice = s.confirmedPickChoice || s.pickListChoice || {};
        if (choice.mode === 'DOUBLE_WEIGHT' && choice.category) return choice.category;
        if (choice.mode === 'DROP' && choice.category) {
            // DROP = exclude that category, so dominant focus is opposite
            var cats = ['Industrial', 'Civilian', 'Vessel', 'Settlement'];
            var others = cats.filter(function(c) { return c !== choice.category; });
            return others.length === 1 ? others[0] : 'mixed';
        }
        return 'mixed';
    }

    // Shared belt-saturation message generator.
    function _beltSaturationMsg(queueCap) {
        var s = gameState.state;
        var degradedCount = (s.bots || []).filter(function(b) { return b.status === 'RED' || b.status === 'OFFLINE'; }).length;
        return degradedCount >= 2
            ? 'Belt saturated, boss \u2014 bots degraded. Queue full (' + queueCap + '). Repair bots to clear backlog.'
            : 'Belt queue full (' + queueCap + '). Item held until belt clears.';
    }

    function pushToBeltQueue(item) {
        var s = gameState.state;
        if (!s.beltQueue) s.beltQueue = [];
        beltQueueCap = computeBeltQueueCap();
        if (s.beltQueue.length >= beltQueueCap) {
            // Belt saturated — surface stall state once per minute
            var now = Date.now();
            if (now - _lastStallWarnAt >= 60000) {
                _lastStallWarnAt = now;
                var stallMsg = _beltSaturationMsg(beltQueueCap);
                otisLines.push({ role: 'otis', text: stallMsg }); renderOTIS();
                var stalledEl = document.getElementById('belt-stall-indicator');
                if (stalledEl) stalledEl.style.display = '';
            }
            return;
        }
        // Clear stall indicator when queue accepts items again
        var stalledEl = document.getElementById('belt-stall-indicator');
        if (stalledEl) stalledEl.style.display = 'none';
        item = Object.assign({}, item);
        s.beltQueue.push(item);
        // Track delivery cadence for OTIS side comments
        var deliveryCount = s.deliveryCount = (s.deliveryCount || 0) + 1;
        if (deliveryCount % 7 === 0) fireOtisSideComment();
        // If belt is empty, promote to display (CSS media query handles mobile open)
        if (currentItem === null) {
            setItemInQueue(item);
            updateBeltUI('DELIVERING');
        }
    }
    window.pushToBeltQueue = pushToBeltQueue;

    function advanceBeltQueue() {
        var s = gameState.state;
        if (!s.beltQueue) s.beltQueue = [];
        // Shift out the item that was just declared
        if (s.beltQueue.length > 0) s.beltQueue.shift();
        // Promote next item if available
        if (s.beltQueue.length > 0) {
            setItemInQueue(s.beltQueue[0]);
            updateBeltUI('DELIVERING');
        }
    }
    window.advanceBeltQueue = advanceBeltQueue;

    function stopBotFetch() {
        if (botFetchTimer) { clearInterval(botFetchTimer); botFetchTimer = null; }
    }
    window.stopBotFetch = stopBotFetch;

    function startBotFetch() {
        stopBotFetch();
        botFetchTimer = setInterval(botFetchTick, 250);
    }
    window.startBotFetch = startBotFetch;

    function finishDrop() {
        stopBotFetch();
        stopBeltDelivery();
        var s = gameState.state;
        s.dropActive = false;
        s.bargeActive = false;
        s.dropItemsRemaining = 0;
        s.dropCount = (s.dropCount || 0) + 1;
        s.lastDropFillPct = (s.dropStartSize || 0) > 0
            ? Math.round(((s.currentDropScrapped || 0) / s.dropStartSize) * 100) : 0;
        s.currentDropScrapped = 0;
        s.dropStartSize = 0;
        // Reset all bot activities to IDLE after drop
        (s.bots || []).forEach(function(bot) {
            if (bot.activity !== 'OFFLINE') {
                bot.activity = 'IDLE';
                bot.activityRemainingMs = 0;
                bot.carrying = null;
            }
        });
        checkActProgression();
        s.pickListChoice = { mode: 'DROP', category: null };
        gameState._save();
        updateBeltUI('DROP_COMPLETE');
        setBotDots(false);
        if (window.OtisSound) OtisSound.stopAmbient('conveyor');
        renderManifestSummary([]);
        // Show debrief before bot animation and post-drop events
        showDebrief();
    }
    window.finishDrop = finishDrop;

    // ── END-OF-DROP DEBRIEF MODAL ─────────────────────────────────────────────
    // Populated from _dropRoutes / _dropCreditsStart, then dismissed via
    // continueAfterDebrief() which runs the original post-drop sequence.
    function showDebrief() {
        var s = gameState.state;
        var routes = _dropRoutes;
        var total = routes.kept + routes.sold + routes.sven + routes.archived + routes.scrap + routes.skip;
        var productive = routes.kept + routes.sold + routes.sven + routes.archived;
        var efficiency = total > 0 ? productive / total : 0;

        // Credits earned during this drop window
        var creditsEarned = (s.credits || 0) - _dropCreditsStart;

        // Cycles-to-payoff estimate at current installment rate
        var installment = s.currentInstallment || 850;
        var debt = s.debt || 0;
        var cyclesToPayoff = installment > 0 ? Math.ceil(debt / installment) : '—';

        // Choose OTIS performance line
        var tier = efficiency >= 0.70 ? 'good' : efficiency >= 0.40 ? 'neutral' : 'poor';
        var pool = (window.DEBRIEF_OTIS_LINES && window.DEBRIEF_OTIS_LINES[tier]) || [];
        var otisLine = pool.length ? pool[Math.floor(Math.random() * pool.length)] : 'Drop complete.';

        // Build routing rows
        function routeRow(label, count, cls) {
            if (count === 0) return '';
            var pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return '<div class="debrief-route-row' + (cls ? ' ' + cls : '') + '">' +
                '<span class="debrief-route-label">' + label + '</span>' +
                '<span class="debrief-route-count">' + count + '</span>' +
                '<span class="debrief-route-pct">(' + pct + '%)</span>' +
                '</div>';
        }

        var routeHtml =
            routeRow('SELL', routes.sold) +
            routeRow('SVEN', routes.sven, 'debrief-sven') +
            routeRow('KEEP', routes.kept) +
            routeRow('ARCHIVE', routes.archived, 'debrief-archive') +
            routeRow('SCRAP', routes.scrap) +
            routeRow('SKIP',  routes.skip,  'debrief-skip');

        var archiveCount = s.humanityArchive || 0;

        // Populate the modal
        var el = function(id) { return document.getElementById(id); };
        var totalEl      = el('debrief-total');
        var creditsEl    = el('debrief-credits');
        var debtEl       = el('debrief-debt');
        var cyclesEl     = el('debrief-cycles');
        var routeEl      = el('debrief-routes');
        var otisEl       = el('debrief-otis-line');
        var archiveEl    = el('debrief-archive-count');

        if (totalEl)   totalEl.textContent   = total;
        if (creditsEl) creditsEl.textContent = (creditsEarned >= 0 ? '+' : '') + creditsEarned + ' cr (running: ' + (s.credits || 0).toLocaleString() + ' cr)';
        if (debtEl)    debtEl.textContent    = (debt).toLocaleString() + ' cr remaining';
        if (cyclesEl) {
            if (typeof cyclesToPayoff === 'number') {
                cyclesEl.textContent = cyclesToPayoff + ' payment cycle' + (cyclesToPayoff === 1 ? '' : 's') + ' at current rate';
            } else {
                cyclesEl.textContent = '\u2014 cycles to payoff unknown';
            }
        }
        if (routeEl)   routeEl.innerHTML     = routeHtml || '<span style="color:var(--text-dim)">No items routed.</span>';
        if (otisEl)    otisEl.textContent    = otisLine;
        var archiveSection = el('debrief-archive-section');
        if (archiveEl && archiveCount > 0) {
            archiveEl.textContent = '\u25C6 ARCHIVE: ' + archiveCount + ' item' + (archiveCount === 1 ? '' : 's') + ' total';
            if (archiveSection) archiveSection.style.display = '';
        } else if (archiveSection) {
            archiveSection.style.display = 'none';
        }

        openModal('debrief');
        // Mark emotional beat active to suppress dad jokes
        window.emotionalBeatActive = true;
        // Focus the continue button for keyboard accessibility
        var contBtn = el('debrief-continue-btn');
        if (contBtn) setTimeout(function() { contBtn.focus(); }, 80);
    }
    window.showDebrief = showDebrief;

    function continueAfterDebrief() {
        closeModal('debrief');
        window.emotionalBeatActive = false;
        // Run the original post-drop sequence
        var s = gameState.state;
        var daysLeft = (s.daysUntilNextDrop != null) ? s.daysUntilNextDrop : TIMING.DAYS_BETWEEN_DROPS;
        showBotAnimation(3000);
        renderPickList();
        narratorLine(DROP_COMPLETE_POOL, { DAYS: daysLeft });
        AnimWindow.startBotsReturn();
        onDropCompleteBotDegradation();
        rollConveyorJam();
        checkEasterEgg();
        maybeSvenInterference();
        if (typeof updateBotUI === 'function') updateBotUI();
    }
    window.continueAfterDebrief = continueAfterDebrief;

    function botFetchTick() {
        var s = gameState.state;
        if (!s.dropActive) { stopBotFetch(); return; }
        var dt = 250;
        var anyChange = false;

        (s.bots || []).forEach(function(bot) {
            // OFFLINE bots do nothing
            if (bot.status === 'OFFLINE') {
                if (bot.activity !== 'OFFLINE') {
                    // Return any carried item to fieldPool
                    if (bot.carrying) { s.fieldPool.unshift(bot.carrying); bot.carrying = null; }
                    bot.activity = 'OFFLINE';
                    bot.activityRemainingMs = 0;
                    anyChange = true;
                }
                return;
            }

            // Bot recovered from OFFLINE
            if (bot.activity === 'OFFLINE') {
                bot.activity = 'IDLE';
                bot.activityRemainingMs = 0;
                anyChange = true;
            }

            if (bot.activityRemainingMs > 0) {
                bot.activityRemainingMs = Math.max(0, bot.activityRemainingMs - dt);
                anyChange = true;
                return;
            }

            // Activity completed — transition
            switch (bot.activity) {
                case 'IDLE':
                    if (!s.fieldPool || s.fieldPool.length === 0) return;
                    beltQueueCap = computeBeltQueueCap();
                    if ((s.beltQueue || []).length >= beltQueueCap) return;
                    bot.carrying = s.fieldPool.shift();
                    bot.carrying.condition = assignCondition();
                    s.dropItemsRemaining = s.fieldPool.length;
                    bot.activity = 'FETCHING';
                    bot.activityRemainingMs = computeFetchDuration(bot);
                    anyChange = true;
                    break;
                case 'FETCHING':
                    bot.activity = 'CARRYING';
                    bot.activityRemainingMs = computeReturnDuration(bot);
                    anyChange = true;
                    break;
                case 'CARRYING':
                    pushToBeltQueue(bot.carrying);
                    bot.carrying = null;
                    bot.activity = 'IDLE';
                    bot.activityRemainingMs = 0;
                    anyChange = true;
                    break;
            }
        });

        // All-bots-OFFLINE stall warning (once per 60s)
        var allOffline = (s.bots || []).every(function(b) { return b.status === 'OFFLINE'; });
        if (allOffline && (s.fieldPool || []).length > 0) {
            var now = Date.now();
            if (now - _lastStallWarnAt >= 60000) {
                _lastStallWarnAt = now;
                otisLines.push({ role: 'otis', text: _beltSaturationMsg(beltQueueCap) });
                renderOTIS();
                var stalledEl = document.getElementById('belt-stall-indicator');
                if (stalledEl) stalledEl.style.display = '';
            }
        }

        // Drop completion: field empty AND belt empty AND no bot carrying/fetching
        var anyCarrying = (s.bots || []).some(function(b) {
            return b.activity === 'FETCHING' || b.activity === 'CARRYING';
        });
        var fieldEmpty = !s.fieldPool || s.fieldPool.length === 0;
        var beltEmpty = !s.beltQueue || s.beltQueue.length === 0;
        if (fieldEmpty && beltEmpty && !anyCarrying && currentItem === null) {
            finishDrop();
            return;
        }

        if (anyChange) {
            if (typeof updateBotUI === 'function') updateBotUI();
            renderItemQueue();
        }

        // Throttled save: every 8 ticks (~2s)
        s._botTickCounter = (s._botTickCounter || 0) + 1;
        if (s._botTickCounter % 8 === 0) gameState._save();
    }
    window.botFetchTick = botFetchTick;

    function assignCondition() { var r = Math.random(); return r < 0.15 ? 'Broken' : r < 0.50 ? 'Poor' : r < 0.85 ? 'Used' : 'Excellent'; }
    window.assignCondition = assignCondition;

    function deliverNextBeltItem() {
        if (!gameState.state.dropActive) { stopBeltDelivery(); return; }
        if (gameState.state.manifestItems.length === 0) {
            stopBeltDelivery();
            gameState.state.dropActive = false;
            gameState.state.bargeActive = false;
            gameState.state.dropItemsRemaining = 0;
            gameState.state.dropCount = (gameState.state.dropCount || 0) + 1;
            // Track scrap fill per drop
            var s0 = gameState.state;
            s0.lastDropFillPct = (s0.dropStartSize||0) > 0 ? Math.round(((s0.currentDropScrapped||0) / s0.dropStartSize) * 100) : 0;
            s0.currentDropScrapped = 0;
            s0.dropStartSize = 0;
            checkActProgression();
            gameState.state.pickListChoice = { mode: 'DROP', category: null };
            gameState._save();
            updateBeltUI('DROP_COMPLETE');
            setBotDots(false);
            if (window.OtisSound) OtisSound.stopAmbient('conveyor');
            renderManifestSummary([]);
            showDebrief();
            return;
        }
        if (currentItem !== null) {
            updateBeltUI('BACKED_UP');
            var backed = gameState.state.manifestItems.length;
            var overflowWarn = document.getElementById('storeroom-overflow-warning');
            var overflowCount = document.getElementById('overflow-count');
            if (overflowWarn) overflowWarn.style.display = backed >= TIMING.OVERFLOW_THRESHOLD ? '' : 'none';
            if (overflowCount) overflowCount.textContent = backed;
            return;
        }
        var item = gameState.state.manifestItems.shift();
        item.condition = assignCondition();
        gameState.state.dropItemsRemaining = gameState.state.manifestItems.length;
        gameState._save();
        setItemInQueue(item);
        updateBeltUI('DELIVERING');
        var s = gameState.state;
        var deliveryCount = s.deliveryCount = (s.deliveryCount || 0) + 1;
        if (deliveryCount % 7 === 0) fireOtisSideComment();
        // Mobile: CSS media query handles auto-opening the belt panel at ≤600px
    }

    window.deliverNextBeltItem = deliverNextBeltItem;

    function handleBeltScan() {
        var s = gameState.state;
        // Bot-fetch mode: barge drop started via handleBargeArrival
        // (manifestItems is empty; items are in fieldPool / beltQueue / bot carry slots)
        if (s.dropActive && (!s.manifestItems || s.manifestItems.length === 0)) {
            var bq = s.beltQueue || [];
            var fp = s.fieldPool || [];
            var botsActive = (s.bots || []).some(function(b) {
                return b.activity === 'FETCHING' || b.activity === 'CARRYING';
            });
            if (bq.length > 1) {
                // Multiple items queued — skip/advance current item
                clearItemQueue();
                advanceBeltQueue();
            } else if (fp.length > 0 || botsActive) {
                // One item on belt (or none), more in field/transit — show ETAs
                var activeBotsInfo = (s.bots || []).filter(function(b) {
                    return b.activity === 'FETCHING' || b.activity === 'CARRYING';
                }).map(function(b) {
                    return 'Bot-' + b.id + ': ' + Math.ceil(b.activityRemainingMs / 1000) + 's';
                }).join(', ');
                var etaMsg = activeBotsInfo
                    ? 'Bots still fielding. ' + activeBotsInfo + '.'
                    : 'Bots fielding. All in transit — items incoming.';
                otisLines.push({ role: 'otis', text: etaMsg }); renderOTIS();
            } else {
                // Drop winding down — advance if possible
                if (bq.length > 0 || currentItem !== null) {
                    clearItemQueue();
                    advanceBeltQueue();
                }
            }
            return;
        }
        // Fallback: old behaviour for Day-1 items / warehouse / storeroom
        deliverNextBeltItem();
    }
    window.handleBeltScan = handleBeltScan;

    function fireOtisSideComment() {
        var s = gameState.state;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var tier = s.namingTier || 0;
        var keeps = (s.keepLog || []).length;
        var drops = s.dropCount || 0;
        var msgs;
        if (dup <= 3) {
            msgs = [
                'Payment in ' + dup + ' days. Belt is not moving fast enough.',
                'Three days. George always had something in the queue by now.',
                'The bank does not send reminders. They send receivers.',
            ];
        } else if (keeps >= 8) {
            msgs = [
                'Keep log is heavy. ' + keeps + ' items. George capped at seven.',
                'You are keeping a lot. George said that is either instinct or sentiment.',
                'The keep log does not pay the debt. Just noting that.',
            ];
        } else if (tier >= 2) {
            msgs = [
                "George cleared this in under a minute on day one. You're faster now.",
                "Belt running. That's what matters.",
                "You're getting George's rhythm. I'm noting that whether you want me to or not.",
            ];
        } else if (drops >= 5 && s.skipCount > drops) {
            // Operator has skipped GEORGE consults more times than drops completed
            msgs = [
                "You've been skipping more than consulting. That's your call.",
                "George consulted on everything. I'm not saying you're wrong.",
                "The George Archive is there. You don't have to use it.",
            ];
        } else {
            msgs = [
                'Belt running.',
                'Intake nominal.',
                'George had an opinion about this one. You didn\'t ask.',
                'The moon does not care about your backlog.',
                'Running nominal. Barely.',
                'Station holding.',
            ];
        }
        if ((s.brokerBin||[]).length >= 8) {
            msgs = [
                'Broker bin at ' + s.brokerBin.length + '. Ship now at 88% or wait for full.',
                'Eight items. Two more and you get full value. Or ship now.',
                'Broker bin getting heavy. Payment is in ' + dup + ' days.',
            ];
        }
        if ((s.mayBin||[]).length >= 8) {
            msgs = [
                'May bin has ' + s.mayBin.length + ' items. Dispatch alongside scrap.',
                'May bin is ready whenever you are. She pays full.',
            ];
        }
        var sideMsg = msgs[Math.floor(Math.random() * msgs.length)];
        otisLines.push({ role: 'otis', text: sideMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(sideMsg);
    }

    window.fireOtisSideComment = fireOtisSideComment;

    var _dropShuffledPool = [];
    var _dropShuffleIndex = 0;

    function shuffleDropPool(pickChoice) {
        var nonRare = MANIFEST_POOL.filter(function(i) { return i.rarity !== 'Rare'; });
        var rareItems = MANIFEST_POOL.filter(function(i) { return i.rarity === 'Rare'; });
        // Include each Rare item with base 25% probability + scanner bonus to adjust drop frequency.
        var rareReduced = rareItems.filter(function() { return Math.random() < (0.25 + getScannerBonus()); });
        var pool = nonRare.concat(rareReduced);
        // Fallback: if all Rare items were filtered out and there are no non-Rare items, use full pool.
        if (!pool.length) pool = MANIFEST_POOL.slice();
        if (pickChoice && pickChoice.mode === 'DOUBLE_WEIGHT' && pickChoice.category) {
            var extras = MANIFEST_POOL.filter(function(i) { return i.category === pickChoice.category; });
            pool = pool.concat(extras);
        }
        if (pickChoice && pickChoice.mode === 'PRIORITIZE') {
            var high = MANIFEST_POOL.filter(function(i) { return i.rarity === 'Rare' || i.rarity === 'Uncommon'; });
            pool = pool.concat(high);
        }
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
        }
        if (pickChoice && pickChoice.mode === 'DROP' && pickChoice.category) {
            var filtered = pool.filter(function(i) { return i.category !== pickChoice.category; });
            if (filtered.length) pool = filtered;
        }
        _dropShuffledPool = pool;
        _dropShuffleIndex = 0;
    }

    function weightedPickItem() {
        if (_dropShuffleIndex >= _dropShuffledPool.length) {
            var s = gameState.state;
            shuffleDropPool(s.confirmedPickChoice || s.pickListChoice || {});
        }
        if (!_dropShuffledPool.length) { return Object.assign({}, MANIFEST_POOL[Math.floor(Math.random() * MANIFEST_POOL.length)]); }
        var item = _dropShuffledPool[_dropShuffleIndex++];
        return Object.assign({}, item);
    }
    window.shuffleDropPool = shuffleDropPool;
    window.weightedPickItem = weightedPickItem;


    // ── Animation Window ─────────────────────────────────────────────────────
    var AnimWindow = (function() {
      var BARGE_ART = '                                                               —                          \n                                                              ›—                          \n                                                             ›—{— ›                       \n                                                             ›—íz{í—                    › \n                                                           ›{{{íí———————{——›››          { \n                                                        ›{íí{ííííííííí› › ›››››{›››››—›\n                                                  {ííí› ———{——›———›—————————— —{  › ›› ›››\n                ›{ › —›—              —{Ï{—{   ——{{{————————————{————{—  ››—›››{ ››—›› ›››\n                        ›—›{—{›—›—{{›››—z{{ {í{—{—íí{{———››› ›› › ›› — ›       {      ›   \n   ››——››—›——í{——{—››—›››í{—{{{{{{{{{{{{{{{›{{{í——{{í——››› ›››  ››—›—{ ›      ›í— ›› ›  — \n           ———››› —  ›    ›{›{z{{Ï{íí{Ï{{z{ {—z—í——í{í——››{{——{—{{—{  ›      —››——  ›—  \n           ›   ›› —  ›  ›› {›{íí{{{íí{{ííí{—{——{›———{›—{››› —{ííííííz››› ›  ›››—››  —   \n                › ››——››› —› —              {› › —› › —        ›——{{{—         {››—— —    \n                   {{—                                         — ›—› ›     › ››           \n                    —                                          ›››››                      \n                                                               ›{›—                       \n                                                                ——›                       \n                                                                 ›                        ';

      var BOT_ART = '                             .#@@@@@@@@@@@@@-                                             \n                              :%+  .=-  .*#=@=                                             \n                              .%+.#@+*@=.**=%=                                             \n                              .%+:## .@*.**=%=                                             \n                              :%=  +%%:  *#=%=                                             \n                              :%%********%@%@=                                             \n                                ....%@+@=....                                              \n                                    %@-%-                                                  \n                                    %@-%:                                                  \n                                    %@-%-                                          .       \n     --                             %@*@=                                       .*@%%-     \n     .*%=                        :#%*=-+#%=                  *%%%%%%%%+       .*@*.:#@%-   \n :.    :#@-                     :%+      -%+                .#*     .#*     :*%+ :#@+=%@%= \n +@+.    #@                :%@%@@@@%%%@@@@@@@@@@@%%@@@@%%%@@@@@@%@@@@@@@@@@@@*.:#%=-#%=.+@#\n   *%+. :@%                -@-  .:.                :-:                     =%+#%==%%- -#%= \n    :+#%#*@*.              -@= +%#%%:            -%#+%%          :%@@@@@%. =@%==%%- -#%-   \n           *@+             -@=-@* -@+          .=%@+.*@#-        .++****+. =@*%%- -#%-     \n            :*%=           +@@%+*%#=        :*%%=::+*+:-*@*-      :::::::  =@#- =%%-       \n              :#%-      :*%@@=          .=#@#-.           -#%*-::.         =%--%%-         \n                -%%: :*%#- -@=.    ..:+%@*=:.   ....   .... .*@#+@*.....   =@@#:           \n                  =@@#-    .#####%@@@%#####################@@@@- *@@@%######*:             \n                    .     .=#-:+%@*:               =#-. .+%%=.-##*::+%%+. .=*-             \n                      -+%@#+%*%@%*-           =+%@#***%@@%=          .+@@@#*#*%@#==        \n                     :@@-       =@%:         :@@=       =@%.         =@@:       +@@.       \n                    .@*    -=:   .#%        :@*    -=:    *#:       -%+    -=:    %%       \n                    *%:  -%#-#%:  -@+       #@   :%#=%@   :@+      .*%.  :@#=#%:  .@+      \n                    #%:  -@+.*%:  :%*      .%@   -@+:#@.  -@+      .#%:  :@*:#%.  :@*      \n                    .@+    +#+.   *@.       -@+   .+*=   .*%:       -@=    +*=    #@:      \n                     -@%-       =@@.         =@%:       :@%-         -@%.       =@@.       \n                      +#@@*=*=*@@#=           *#@@*=++#@@#=           +#@@*=+=#@@*+        \n                          :+@*:                   :*@=.                   :+%+:            ';
      var BOT_ART_LINES  = BOT_ART.split('\n');
      var BOT_SPINNER    = ['|','/','-','\\'];
      var BOT_SPIN_SET   = {'=':1,'-':1,'*':1,'+':1,':':1,'/':1,'\\':1};
      var BOT_LINE_HEIGHT  = 1.05;
      var BOT_SPIN_START   = 22; // lines 0-21 are head/body; legs start at line 22

      function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

      var _spinFrame = 0;
      var _spinTimer = null;
      var _botEls    = [];

      function _spinBots() {
        _spinFrame++;
        var spinChar = BOT_SPINNER[_spinFrame % 4];
        var spun = BOT_ART_LINES.map(function(line, i) {
          if (i < BOT_SPIN_START) return line;
          var out = '';
          for (var c = 0; c < line.length; c++) {
            out += BOT_SPIN_SET[line[c]] ? spinChar : line[c];
          }
          return out;
        }).join('\n');
        for (var b = 0; b < _botEls.length; b++) { _botEls[b].textContent = spun; }
      }

      var _clearTimer = null;
      var _botsOutboundTimer = null;

      function _clearTimers() {
        if (_clearTimer) { clearTimeout(_clearTimer); _clearTimer = null; }
        if (_botsOutboundTimer) { clearTimeout(_botsOutboundTimer); _botsOutboundTimer = null; }
      }

      function _clearBots() {
        if (_spinTimer) { clearInterval(_spinTimer); _spinTimer = null; }
        _botEls = [];
        var layer = document.getElementById('anim-bots-layer');
        if (layer) layer.innerHTML = '';
      }

      function _buildBotRows(direction) {
        var layer = document.getElementById('anim-bots-layer');
        if (!layer) return;
        _clearBots();
        var lineCount = BOT_ART_LINES.length;
        var windowH   = 120; // always size for the non-maze base height
        var fontSize  = Math.max(2, windowH / (lineCount * BOT_LINE_HEIGHT));
        var botCount  = 3;
        var animDur   = 14;
        for (var r = 0; r < botCount; r++) {
          var el = document.createElement('pre');
          el.className = 'anim-bot-row ' + direction;
          el.style.top        = '50%';
          el.style.fontSize   = fontSize + 'px';
          el.style.lineHeight = BOT_LINE_HEIGHT.toString();
          el.style.margin     = '0';
          el.style.padding    = '0';
          el.style.animationDuration = animDur + 's';
          el.style.animationDelay   = (-r * (animDur / botCount)) + 's';
          el.textContent = BOT_ART;
          layer.appendChild(el);
          _botEls.push(el);
        }
        _spinFrame = 0;
        _spinBots();
        _spinTimer = setInterval(_spinBots, 100);
      }

      function startBargeSequence() {
        _clearTimers();
        if (window.mazePause) window.mazePause();
        var bargeEl = document.getElementById('anim-barge');
        if (!bargeEl) return;
        _clearBots();
        bargeEl.textContent = BARGE_ART;
        bargeEl.classList.remove('running');
        void bargeEl.offsetWidth;
        bargeEl.classList.add('running');

        _botsOutboundTimer = setTimeout(function() {
          bargeEl.classList.remove('running');
          bargeEl.textContent = '';
          _buildBotRows('outbound');
          if (window.OtisSound) OtisSound.startAmbient('bots');
        }, 3500);
      }

      function startBotsReturn() {
        _clearTimers();
        if (window.mazePause) window.mazePause();
        var bargeEl = document.getElementById('anim-barge');
        if (bargeEl) { bargeEl.classList.remove('running'); bargeEl.textContent = ''; }
        if (window.OtisSound) {
          OtisSound.stopAmbient('bots');
          OtisSound.playSFX('bots');
        }
        _buildBotRows('returning');
        _clearTimer = setTimeout(function() { clear(); }, 8000);
      }

      function clear() {
        _clearTimers();
        _clearBots();
        var bargeEl = document.getElementById('anim-barge');
        if (bargeEl) { bargeEl.classList.remove('running'); bargeEl.textContent = ''; }
        if (window.OtisSound) OtisSound.stopAmbient('bots');
        if (window.mazeResume) window.mazeResume();
      }

      return { startBargeSequence: startBargeSequence, startBotsReturn: startBotsReturn, clear: clear };
    }());
    window.AnimWindow = AnimWindow;

    function handleBargeArrival() {
        // Bug #9 fix: if warehouse search is running, queue the barge and tell the player.
        var s = gameState.state;
        if (s.warehouseSearching) {
            s.bargePendingDuringSearch = true;
            gameState._save();
            var conflictMsg = 'Barge inbound \u2014 search still running, holding belt. Barge will deploy when search resolves.';
            otisLines.push({ role: 'otis', text: conflictMsg }); renderOTIS();
            var bargeHoldEl = document.getElementById('barge-hold-indicator');
            if (bargeHoldEl) bargeHoldEl.style.display = '';
            return;
        }
        _doBargeArrival();
    }
    window.handleBargeArrival = handleBargeArrival;

    function _doBargeArrival() {
        if (gameState.state.dropActive) return;
        // BUG 14 fix: call checkActProgression() BEFORE reading the act so that the
        // very first Act-3 barge uses Act-3 drop sizes (26–32 items) rather than
        // Act-2 sizes.  checkActProgression() is idempotent when the act hasn't
        // changed, so calling it here is safe.
        checkActProgression();
        // Lock immediately to prevent double-firing during the staged delay windows
        gameState.state.dropActive = true;
        // Build manifest synchronously so data is ready when bots start fetching
        var manifest = [];
        if (gameState.state.day === 1) {
            // Day 1 scripted drop: 4 Common items, all Used condition, no easter eggs
            var commonPool = MANIFEST_POOL.filter(function(i) {
                return i.rarity === 'Common';
            });
            for (var si = commonPool.length - 1; si > 0; si--) {
                var sj = Math.floor(Math.random() * (si + 1));
                var st = commonPool[si]; commonPool[si] = commonPool[sj]; commonPool[sj] = st;
            }
            manifest = commonPool.slice(0, 4).map(function(i) {
                return Object.assign({}, i, { condition: 'Used' });
            });
        } else {
            var act = gameState.state.act;
            var count;
            if (act === 1) count = TIMING.DROP_SIZE_ACT1;
            else if (act === 2) count = TIMING.DROP_SIZE_ACT2_MIN + Math.floor(Math.random() * (TIMING.DROP_SIZE_ACT2_MAX - TIMING.DROP_SIZE_ACT2_MIN + 1));
            else count = TIMING.DROP_SIZE_ACT3_MIN + Math.floor(Math.random() * (TIMING.DROP_SIZE_ACT3_MAX - TIMING.DROP_SIZE_ACT3_MIN + 1));
            var s2 = gameState.state;
            shuffleDropPool(s2.confirmedPickChoice || s2.pickListChoice || {});
            for (var k = 0; k < count; k++) manifest.push(weightedPickItem());
            // 10% chance to append one easter egg item to the drop
            if (Math.random() < 0.10) {
                var eeItem = Object.assign({}, EASTER_EGG_POOL[Math.floor(Math.random() * EASTER_EGG_POOL.length)]);
                manifest.push(eeItem);
            }
        }
        // Move all manifest items into fieldPool — bots will fetch them one by one.
        gameState.state.fieldPool = manifest.slice();
        gameState.state.beltQueue = [];
        gameState.state.manifestItems = [];  // keep for backward compat
        gameState.state.bargeActive = true;
        gameState.state.dropItemsRemaining = manifest.length;
        gameState.state.dropStartSize = manifest.length;
        gameState.state.currentDropScrapped = 0;
        // Reset bot activities to IDLE at drop start
        (gameState.state.bots || []).forEach(function(bot) {
            if (bot.status !== 'OFFLINE') {
                bot.activity = 'IDLE';
                bot.activityRemainingMs = 0;
                bot.carrying = null;
            }
        });
        // Reset per-drop routing stats for the debrief
        _resetDropRoutes();
        gameState._save();

        // Stage 1 — wait 3 s, then play bargedrop sound + show OTIS manifest summary
        setTimeout(function() {
            if (window.OtisSound) OtisSound.playSFX('bargedrop');
            AnimWindow.startBargeSequence();
            // BARGE_IMMINENT: hint at variety without revealing count
            var s = gameState.state;
            var pickFocus = computePickListFocus(s);
            var otisMsg = 'Barge inbound. Manifest looks '
                + (pickFocus === 'mixed' ? 'varied.' : 'heavier on ' + pickFocus + ' — matches your pick list.');
            appendOTIS(otisMsg, 'BARGE_IMMINENT');
            renderManifestSummary(manifest);

            // Stage 2 — wait 2 s, then deploy bots
            setTimeout(function() {
                var scanBtn = document.getElementById('btn-scan-belt');
                if (scanBtn) scanBtn.disabled = false;
                setBotDots(true);
                showBotAnimation(4000);
                renderPickList();

                // Stage 3 — wait 2 s, then start bot fetch loop
                setTimeout(function() {
                    updateBeltUI('DELIVERING');
                    // Tutorial step 1: insta-move first item so tutorial UX isn't blocked
                    if (gameState.state.tutorialStep === 1) {
                        var fp = gameState.state.fieldPool;
                        if (fp && fp.length > 0) {
                            var firstItem = fp.shift();
                            firstItem.condition = firstItem.condition || assignCondition();
                            gameState.state.dropItemsRemaining = fp.length;
                            pushToBeltQueue(firstItem);
                        }
                    }
                    startBotFetch();
                    if (typeof updateBotUI === 'function') updateBotUI();
                }, 2000);
            }, 2000);
        }, 3000);
    }

    window.handleBargeArrival = handleBargeArrival;
    window._doBargeArrival = _doBargeArrival;

    // Pull the next available item from the storeroom buffer onto the belt.
    function handlePullNextStoreroomItem() {
        var s = gameState.state;
        if (!s.storeroomBuffer || s.storeroomBuffer.length === 0) return;
        if (currentItem !== null) return;
        handlePullFromBuffer(0);
        _updatePullStoreroomBtn();
    }

    // Sync the pull-storeroom button state to current buffer / belt state.
    function _updatePullStoreroomBtn() {
        var btn = document.getElementById('btn-pull-storeroom');
        if (!btn) return;
        var buf = (gameState.state.storeroomBuffer || []).length;
        btn.disabled = (buf === 0 || currentItem !== null);
    }

    function setBotDots(active) {
        ['bot-dot-1','bot-dot-2','bot-dot-3','sys-bot-dot-1','sys-bot-dot-2','sys-bot-dot-3'].forEach(function(id) {
            var d = document.getElementById(id); if (d) d.className = 'dot' + (active ? ' amber' : '');
        });
        if (window.OtisSound) {
            if (active) OtisSound.startAmbient('bots');
            else OtisSound.stopAmbient('bots');
        }
    }

    window.handlePullNextStoreroomItem = handlePullNextStoreroomItem;
    window._updatePullStoreroomBtn = _updatePullStoreroomBtn;
    window.setBotDots = setBotDots;

    function showBotAnimation(durationMs) {
        var panel = document.getElementById('arm-bot-anim');
        if (!panel) return;
        panel.style.display = '';
        setTimeout(function() { panel.style.display = 'none'; }, durationMs);
    }
    window.showBotAnimation = showBotAnimation;

    // ITEM QUEUE UI
    function setItemInQueue(item) {
        currentItem = Object.assign({}, item, { consultedExamine: false, consultedWorth: false, consultedGeorge: false });
        gameState.state.itemDisplayedAt = Date.now();
        gameState.state.beltJammed = false;
        renderItemQueue();
        _updatePullStoreroomBtn();
        maybeShowWeighItHint(currentItem);
    }
    function clearItemQueue() { currentItem = null; renderItemQueue(); _updatePullStoreroomBtn(); clearWeighItHint(); }

    function renderItemQueue() {
        var emptyEl = document.getElementById('item-queue-empty');
        var present = document.getElementById('item-queue-present');
        var nameEl  = document.getElementById('item-queue-name');
        var tagsEl  = document.getElementById('item-tags');
        var estEl   = document.getElementById('otis-estimate');
        var declEl  = document.getElementById('item-declaration');
        if (currentItem) {
            if (emptyEl) emptyEl.style.display = 'none';
            if (present) present.style.display = '';
            if (nameEl)  nameEl.textContent = currentItem.name;
            if (tagsEl) {
                var rc = { Common:'tag-common', Uncommon:'tag-uncommon', Rare:'tag-rare', Anomalous:'tag-anomalous' };
                tagsEl.innerHTML =
                    '<span class="tag tag-common">' + escapeHtml(currentItem.category) + '</span> ' +
                    '<span class="tag ' + (rc[currentItem.rarity]||'tag-common') + '">' + escapeHtml(currentItem.rarity) + '</span> ' +
                    '<span class="tag tag-common">' + escapeHtml(currentItem.condition) + '</span>';
            }
            if (estEl) {
                if (currentItem.consultedWorth) {
                    var isUnk = getEffectiveValue(currentItem) === 0 && (currentItem.rarity === 'Anomalous' || currentItem.category === 'Unknown');
                    estEl.textContent = isUnk ? 'OTIS ESTIMATE: ERROR \u2014 NO COMPARABLE' : 'OTIS ESTIMATE: ' + getEffectiveValue(currentItem) + ' cr';
                    estEl.style.display = '';
                } else estEl.style.display = 'none';
            }
            var any = currentItem.consultedExamine || currentItem.consultedWorth || currentItem.consultedGeorge;
            if (declEl) declEl.style.display = any ? 'flex' : 'none';
            var cc = { 'cc-examine': 'consultedExamine', 'cc-george': 'consultedGeorge' };
            Object.keys(cc).forEach(function(id) { var b = document.getElementById(id); if (b) b.classList.toggle('consulted', !!currentItem[cc[id]]); });
            // Easter egg ASCII art for belt items
            var artEl = document.getElementById('item-queue-ascii');
            if (artEl) {
                if (currentItem.asciiFile) {
                    artEl.textContent = '[ART PENDING]';
                    var safeColor = /^#[0-9a-fA-F]{3,8}$/.test(currentItem.asciiColor) ? currentItem.asciiColor : '';
                    artEl.style.color = safeColor;
                    artEl.style.display = '';
                    fetch(currentItem.asciiFile).then(function(r){return r.text();}).then(function(txt){
                        if (artEl) artEl.textContent = txt;
                    }).catch(function(){
                        if (artEl) artEl.textContent = '[ART PENDING]';
                    });
                } else {
                    artEl.style.display = 'none';
                }
            }
            // Bin button state management
            if (currentItem) {
                var itemCat = currentItem.category;
                var itemRar = currentItem.rarity;
                var s = gameState.state;
                var mayBtn    = document.getElementById('btn-to-may');
                var brokerBtn = document.getElementById('btn-to-broker');
                var svenBtn   = document.getElementById('btn-to-sven');
                var archiveBtn = document.getElementById('btn-to-archive');
                if (mayBtn) {
                    var mayOk = (itemCat === 'Civilian' || itemCat === 'Settlement');
                    mayBtn.disabled = !mayOk || (s.mayBin||[]).length >= 12;
                    mayBtn.title = mayOk ? 'May bin: ' + (s.mayBin||[]).length + '/12' : 'May only takes Civilian and Settlement';
                }
                if (brokerBtn) {
                    brokerBtn.disabled = (s.brokerBin||[]).length >= 10;
                    brokerBtn.title = 'Broker bin: ' + (s.brokerBin||[]).length + '/10';
                }
                if (svenBtn) {
                    var svenOk = (itemRar === 'Rare' || itemRar === 'Anomalous');
                    svenBtn.disabled = !svenOk || (s.svenBin||[]).length >= 3;
                    svenBtn.title = svenOk ? 'Sven bin: ' + (s.svenBin||[]).length + '/3 \u2014 auto-ships at 2' : 'Sven only takes Rare and Anomalous';
                }
                // ARCHIVE button: only available for Anomalous items
                if (archiveBtn) {
                    var isAnomalous = (itemRar === 'Anomalous');
                    archiveBtn.style.display = isAnomalous ? '' : 'none';
                    archiveBtn.disabled = !isAnomalous;
                    archiveBtn.title = isAnomalous ? 'Route to Humanity Archive — no market value, permanent record' : '';
                }
            }
        } else {
            if (emptyEl) emptyEl.style.display = '';
            if (present) present.style.display = 'none';
            if (declEl)  declEl.style.display = 'none';
        }
        updateModuleLights();
    }

    window.setItemInQueue = setItemInQueue;
    window.clearItemQueue = clearItemQueue;
    window.renderItemQueue = renderItemQueue;

    function buildItemContext(item) {
        if (!item) return '';
        var ev = getEffectiveValue(item);
        var est = (ev === 0 && (item.rarity === 'Anomalous' || item.category === 'Unknown'))
            ? 'OTIS estimate: ERROR \u2014 NO COMPARABLE.' : 'OTIS estimate: ' + ev + ' cr (condition: ' + (item.condition || 'Used') + ').';
        return 'Item: ' + item.name + '. Category: ' + item.category + '. Rarity: ' + item.rarity + '. Condition: ' + item.condition + '. ' + est;
    }
    window.buildItemContext = buildItemContext;

    function handleSkip() {
        if (!currentItem) return;
        gameState.state.skipCount = (gameState.state.skipCount || 0) + 1;
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        _dropRoutes.skip++;
        gameState._save();
        var declEl = document.getElementById('item-declaration'); if (declEl) declEl.style.display = 'flex';
        var n = gameState.state.skipCount;
        var tierMsg = null;
        if (n === 7) tierMsg = SKIP_TIER_MSGS[7];
        else if (n === 5) tierMsg = SKIP_TIER_MSGS[5];
        else if (n === 3) tierMsg = SKIP_TIER_MSGS[3];
        var msg = tierMsg || SKIP_SHORTS[Math.floor(Math.random() * SKIP_SHORTS.length)];
        if (tierMsg) {
            appendOTIS(msg, 'ITEM_SCAN');
        } else {
            otisLines.push({ role: 'otis', text: msg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
        }
    }
    window.handleSkip = handleSkip;

    // NOTE: handleConsult and handleConsultMerged are intentionally separate.
    // - handleConsult(trigger) — used by GEORGE ARCHIVE path; always hits the API
    // - handleConsultMerged() — used by EXAMINE & VALUE path; short-circuits Common rarity to a hardcoded line
    // They share the consultedExamine/consultedWorth flags but follow different prompt paths.
    // Do not merge — the Common-rarity short-circuit is a deliberate cost optimization.
    function handleConsult(trigger) {
        if (!currentItem) return;
        var ctx = buildItemContext(currentItem);
        if (trigger === 'CONSULT_GEORGE') currentItem.consultedGeorge = true;
        renderItemQueue();
        if (trigger === 'CONSULT_GEORGE') {
            var georgeCtx = '[GEORGE ARCHIVE REQUEST] ' + ctx
                + ' Vernon is asking specifically what George knew about this type of item.'
                + ' Surface a specific memory, method, or comparable — not general knowledge.';
            appendOTIS(georgeCtx, 'CONSULT_GEORGE');
        } else {
            appendOTIS(ctx, trigger);
        }
        if (gameState.state.tutorialStep === 2) tutorialAdvance();
    }
    window.handleConsult = handleConsult;

    function handleConsultMerged() {
        if (!currentItem) return;
        currentItem.consultedExamine = true;
        currentItem.consultedWorth = true;
        renderItemQueue();
        if (gameState.state.tutorialStep === 2) tutorialAdvance();

        // Common items: no API call — display hardcoded assessment
        if (currentItem.rarity === 'Common') {
            var ev = getEffectiveValue(currentItem);
            var condNote = currentItem.condition !== 'Used'
                ? ' ' + currentItem.condition + ' condition.'
                : '';
            var msg = currentItem.category + '. Common salvage.' + condNote
                + ' OTIS estimate: ' + ev + ' credits.';
            otisLines.push({ role: 'otis', text: msg });
            renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
            return;
        }

        // Uncommon, Rare, Anomalous, George items — full API call
        appendOTIS(buildItemContext(currentItem), 'CONSULT_EXAMINE');
    }

    window.handleConsultMerged = handleConsultMerged;

    var SCRAP_SHORTS = ['Canned.','Logged.','Processed.','To May.','Binned.','Filed as scrap.'];

    function handleDeclare(method) {
        if (!currentItem) return;
        var item = currentItem;
        var ctx  = buildItemContext(item);
        var ev   = getEffectiveValue(item);
        var eeMultiplier = item.easterEgg ? 3 : 1;
        // Advance tutorial step 3 before item processing
        if (gameState.state.tutorialStep === 3) tutorialAdvance();
        // Clear belt jam state on any player declaration
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        var jamWarn = document.getElementById('conveyor-jam-warning');
        var jamClr  = document.getElementById('conveyor-jam-clear');
        if (jamWarn) jamWarn.style.display = 'none';
        if (jamClr)  jamClr.style.display  = 'none';
        // Phase 5: George item sell / scrap protection
        var isSellOrScrap = (method === 'MAY_BIN' || method === 'BROKER_BIN' || method === 'SVEN_BIN' || method === 'SCRAP');
        if (isSellOrScrap && item.targetNodeID) {
            var _gwItem = null;
            for (var _gi = 0; _gi < GEORGE_WAREHOUSE.length; _gi++) {
                if (GEORGE_WAREHOUSE[_gi].targetNodeID === item.targetNodeID) { _gwItem = GEORGE_WAREHOUSE[_gi]; break; }
            }
            if (_gwItem && (gameState.state.installedNodes || []).indexOf(item.targetNodeID) === -1) {
                var _confirmSell = window.confirm('OTIS: This item is required for the Master Integration Schematic. Selling it will permanently disable one station node. Proceed?');
                if (!_confirmSell) return;
                // Mark node as permanently offline
                var _failedNodes = gameState.state.failedNodes || [];
                if (_failedNodes.indexOf(item.targetNodeID) === -1) {
                    _failedNodes.push(item.targetNodeID);
                    gameState.state.failedNodes = _failedNodes;
                }
                // OTIS item sold dialogue
                var _soldItemName = item.name;
                setTimeout(function() {
                    var _sm = 'You sold the ' + _soldItemName + ' for credits? George spent years waiting for that to arrive. I hope the debt payment was worth the silence.';
                    otisLines.push({ role: 'otis', text: _sm }); renderOTIS();
                    if (window.OtisTTS) OtisTTS.speak(_sm);
                    renderSchematic();
                }, 500);
            }
        }
        if (method === 'MAY_BIN') {
            var allowed = (item.category === 'Civilian' || item.category === 'Settlement');
            if (!allowed) {
                var wrongMsg = item.name.substring(0,22) + ' \u2014 May only takes Civilian and Settlement.';
                otisLines.push({ role:'otis', text: wrongMsg }); renderOTIS();
                return;
            }
            var mayBin = gameState.state.mayBin || [];
            if (mayBin.length >= 12) {
                var fullMsg = 'May bin at capacity. Ship before sorting more.';
                otisLines.push({ role:'otis', text: fullMsg }); renderOTIS();
                return;
            }
            mayBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, addedDay: gameState.state.day });
            gameState.state.mayBin = mayBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            trackRecentRoutedItem(item, 'SELL');
            _dropRoutes.sold++;
            clearItemQueue(); advanceBeltQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var binMsg = item.name.substring(0,22) + ' to May bin. ' + mayBin.length + '/12.';
            otisLines.push({ role:'otis', text: binMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(binMsg);
        } else if (method === 'BROKER_BIN') {
            var brokerBin = gameState.state.brokerBin || [];
            if (brokerBin.length >= 10) {
                var bfMsg = 'Broker bin at capacity. Ship before sorting more.';
                otisLines.push({ role:'otis', text: bfMsg }); renderOTIS();
                return;
            }
            brokerBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, addedDay: gameState.state.day, eeMultiplier: item.easterEgg ? 3 : 1 });
            gameState.state.brokerBin = brokerBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            trackRecentRoutedItem(item, 'SELL');
            _dropRoutes.sold++;
            clearItemQueue(); advanceBeltQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var bbMsg = item.name.substring(0,22) + ' to broker. ' + brokerBin.length + '/10.';
            otisLines.push({ role:'otis', text: bbMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(bbMsg);
        } else if (method === 'SVEN_BIN') {
            var allowedSven = (item.rarity === 'Rare' || item.rarity === 'Anomalous');
            if (!allowedSven) {
                var swMsg = 'Sven only takes Rare and Anomalous. This is ' + item.rarity + '.';
                otisLines.push({ role:'otis', text: swMsg }); renderOTIS();
                return;
            }
            var svenBin = gameState.state.svenBin || [];
            if (svenBin.length >= 3) {
                var sfMsg = 'Sven bin full. He pays when it hits 2 \u2014 it should have shipped.';
                otisLines.push({ role:'otis', text: sfMsg }); renderOTIS();
                return;
            }
            var svenValue = Math.floor(getEffectiveValue(item) * 0.65);
            if (item.rarity === 'Anomalous') {
                svenValue = Math.floor((Math.random() * (TIMING.ANOMALOUS_RESERVE_MAX - TIMING.ANOMALOUS_RESERVE_MIN) + TIMING.ANOMALOUS_RESERVE_MIN) * 0.65);
            }
            // Sven rare refusal standing order: track complicity when routing Rare items to Sven
            if (item.rarity === 'Rare' && gameState.state.svenRareRefusalActive) {
                gameState.state.svenComplicity = (gameState.state.svenComplicity || 0) + 1;
            }
            svenBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, svenValue: svenValue, addedDay: gameState.state.day });
            gameState.state.svenBin = svenBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            trackRecentRoutedItem(item, 'SVEN');
            _dropRoutes.sven++;
            clearItemQueue(); advanceBeltQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var svMsg = item.name.substring(0,22) + ' to Sven. His offer: ' + svenValue + ' cr. Bin: ' + svenBin.length + '/3.';
            otisLines.push({ role:'otis', text: svMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(svMsg);
            // Auto-pay when bin reaches 2 items
            if (svenBin.length >= 2) {
                setTimeout(handleSvenBinShip, 1500);
            }
        } else if (method === 'KEEP') {
            var _keepEntry = { name: item.name, day: gameState.state.day, keepDay: gameState.state.day, condition: item.condition, otisValue: item.otisValue, baseValue: item.otisValue, category: item.category, rarity: item.rarity };
            if (item.targetNodeID) _keepEntry.targetNodeID = item.targetNodeID;
            if (item.evidenceID)   _keepEntry.evidenceID   = item.evidenceID;
            gameState.state.keepLog.push(_keepEntry);
            gameState.state.keepLog = gameState.state.keepLog.slice(0, getStorageCap());
            // Humanity archive tracking
            if (item.category === 'Civilian' || item.category === 'Settlement') {
                gameState.state.humanityArchive = (gameState.state.humanityArchive || 0) + 1;
                gameState.state.humanityLog = gameState.state.humanityLog || [];
                if (gameState.state.humanityLog.length < 50) {
                    gameState.state.humanityLog.push(item.name.substring(0, MAX_ARCHIVE_NAME_LENGTH));
                }
            }
            gameState._save();
            trackOTISLearning('KEEP', item);
            trackRecentRoutedItem(item, 'KEEP');
            _dropRoutes.kept++;
            clearItemQueue(); advanceBeltQueue();
            var kn = gameState.state.keepLog.length;
            if (kn >= getStorageCap() - 2) {
                narratorLine(DECLARE_KEEP_FULL_POOL, { N: kn });
            } else {
                // Skip the last 2 entries (George-reference lines) for low keep counts
                var keepPool = DECLARE_KEEP_POOL.slice(0, -2);
                var keepMsg = keepPool[Math.floor(Math.random() * keepPool.length)]
                    .replace('{N}', kn);
                keepMsg = item.name.substring(0, 22) + '. ' + keepMsg;
                otisLines.push({ role: 'otis', text: keepMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak(keepMsg);
            }
        } else if (method === 'ARCHIVE') {
            // ARCHIVE: dedicated route for Anomalous items — feeds the humanity archive.
            // Triggers a unique discovery-flavored OTIS line (never a dad joke).
            var archLog = gameState.state.anomalyLog || [];
            if (archLog.length < 100) archLog.push(item.name.substring(0, MAX_ARCHIVE_NAME_LENGTH));
            gameState.state.anomalyLog = archLog;
            gameState.state.humanityArchive = (gameState.state.humanityArchive || 0) + 1;
            gameState.state.humanityLog = gameState.state.humanityLog || [];
            if (gameState.state.humanityLog.length < 50) {
                gameState.state.humanityLog.push(item.name.substring(0, MAX_ARCHIVE_NAME_LENGTH));
            }
            gameState._save();
            _dropRoutes.archived++;
            trackRecentRoutedItem(item, 'ARCHIVE');
            window.emotionalBeatActive = true;
            clearItemQueue(); advanceBeltQueue();
            var archPool = window.ARCHIVE_DISCOVERY_POOL || ['Archived.'];
            var archMsg = archPool[Math.floor(Math.random() * archPool.length)];
            otisLines.push({ role: 'otis', text: archMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(archMsg);
            // Update archive count in header
            gameState._updateUI();
            // Clear emotional beat after a short delay so it does not block future jokes permanently
            setTimeout(function() { window.emotionalBeatActive = false; }, 8000);
        } else if (method === 'SCRAP') {
            gameState.state.scrapFill = Math.min(100, (gameState.state.scrapFill || 0) + 12);
            gameState.state.currentDropScrapped = (gameState.state.currentDropScrapped || 0) + 1;
            gameState._save();
            trackOTISLearning('SCRAP', item);
            trackRecentRoutedItem(item, 'SCRAP');
            _dropRoutes.scrap++;
            clearItemQueue(); advanceBeltQueue();
            recordOrderProgress(item.category, item.rarity);
            var msg = SCRAP_SHORTS[Math.floor(Math.random() * SCRAP_SHORTS.length)];
            otisLines.push({ role: 'otis', text: msg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
        }
        gameState._updateUI();
        // B3 — SCRAP_HEAP ending: track George item sells and civilian/settlement scraps.
        var _isSell = (method === 'MAY_BIN' || method === 'BROKER_BIN' || method === 'SVEN_BIN');
        if (_isSell && item.targetNodeID) {
            var _gs = gameState.state;
            _gs.georgeItemsSold = (_gs.georgeItemsSold || 0) + 1;
            gameState._save();
            if (_gs.georgeItemsSold > 5 && (_gs.civilianScrapped || 0) > 50 && !_gs.endingTriggered) {
                setTimeout(function() { triggerEnding('SCRAP_HEAP'); }, 500);
            }
        }
        if (method === 'SCRAP' && (item.category === 'Civilian' || item.category === 'Settlement')) {
            var _cs = gameState.state;
            _cs.civilianScrapped = (_cs.civilianScrapped || 0) + 1;
            gameState._save();
            if ((_cs.georgeItemsSold || 0) > 5 && _cs.civilianScrapped > 50 && !_cs.endingTriggered) {
                setTimeout(function() { triggerEnding('SCRAP_HEAP'); }, 500);
            }
        }
        // B1/B4 — McGuffin no longer goes on the visible belt; it auto-sells via
        // spawnMcGuffin().  The old in-belt mcguffin resolution branch is removed.
    }
    window.handleDeclare = handleDeclare;

    function handleRouteToStoreroom() {
        var s = gameState.state;
        // In bot-fetch mode, route from fieldPool; otherwise from manifestItems.
        var sourcePool = (s.fieldPool && s.fieldPool.length > 0) ? s.fieldPool : s.manifestItems;
        var toBuffer = sourcePool.splice(0, TIMING.BUFFER_ROUTE_COUNT);
        toBuffer.forEach(function(item) {
            if (!item.condition) item.condition = assignCondition();
            s.storeroomBuffer.push(item);
        });
        s.dropItemsRemaining = sourcePool.length;
        gameState._save();
        gameState._updateUI();
        renderStoreroomBuffer();
        var warn = document.getElementById('storeroom-overflow-warning');
        if (warn) warn.style.display = 'none';
        var rsMsg = 'Routing items to storeroom buffer. ' + s.storeroomBuffer.length + ' held.';
        otisLines.push({ role: 'otis', text: rsMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(rsMsg);
    }
    window.handleRouteToStoreroom = handleRouteToStoreroom;

    function handlePullFromBuffer(index) {
        var s = gameState.state;
        if (!s.storeroomBuffer || !s.storeroomBuffer[index]) return;
        if (currentItem !== null) return; // only one item at a time — belt must be clear first
        var item = s.storeroomBuffer.splice(index, 1)[0];
        setItemInQueue(item);
        gameState._save();
        renderStoreroomBuffer();
        gameState._updateUI();
    }

    // BOT DEGRADATION
    window.handlePullFromBuffer = handlePullFromBuffer;

    function getBotDeliveryMs() {
        var base = TIMING.DEBUG_FAST_MODE ? Math.floor(TIMING.BELT_DELIVERY_MS / TIMING.DEBUG_SPEED_MULTIPLIER) : TIMING.BELT_DELIVERY_MS;
        var bots = gameState.state.bots || [];
        var hasRed = bots.some(function(b) { return b.status === 'RED'; });
        var hasOffline = bots.some(function(b) { return b.status === 'OFFLINE'; });
        if (hasOffline) return Math.floor(base * 2.0);
        if (hasRed) return Math.floor(base * 1.5);
        return base;
    }

    window.getBotDeliveryMs = getBotDeliveryMs;

    function rollConveyorJam() {
        gameState.state.dropsSinceLastJam = (gameState.state.dropsSinceLastJam || 0) + 1;
        if (gameState.state.dropsSinceLastJam < 3) return;
        if (Math.random() >= 0.15 * getJamRateMultiplier()) return;
        gameState.state.dropsSinceLastJam = 0;
        gameState.state.conveyorJammed = true;
        gameState.state.daysUntilNextDrop = (gameState.state.daysUntilNextDrop || TIMING.DAYS_BETWEEN_DROPS) + 1;
        gameState._save();
        var warn = document.getElementById('conveyor-jam-warning');
        var clr  = document.getElementById('conveyor-jam-clear');
        if (warn) warn.style.display = '';
        if (clr)  clr.style.display  = '';
        var jamMsg = 'Conveyor jam. Belt stalled.';
        otisLines.push({ role: 'otis', text: jamMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(jamMsg);
    }

    function checkBeltJam() {
        var s = gameState.state;
        if (!currentItem) return;
        if ((s.manifestItems || []).length < 3) return;
        if (!s.itemDisplayedAt) return;
        if (Date.now() - s.itemDisplayedAt < 30000) return;
        if (s.beltJammed) return;
        s.beltJammed = true;
        gameState._save();
        var backMsg = 'Belt backed up. Clear the queue.';
        otisLines.push({ role: 'otis', text: backMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(backMsg);
        updateArmSprite('CONVEYOR_JAM');
        setLight('light-belt', 'light-amber');
        var w = document.getElementById('conveyor-jam-warning');
        var b = document.getElementById('conveyor-jam-clear');
        if (w) w.style.display = '';
        if (b) b.style.display = '';
    }

    function handleClearJam() {
        gameState.state.conveyorJammed = false;
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        gameState._save();
        var warn = document.getElementById('conveyor-jam-warning');
        var clr  = document.getElementById('conveyor-jam-clear');
        if (warn) warn.style.display = 'none';
        if (clr)  clr.style.display  = 'none';
        var clearMsg = 'Jam cleared. Belt running.';
        otisLines.push({ role: 'otis', text: clearMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(clearMsg);
        updateBeltUI(gameState.state.dropActive ? 'DELIVERING' : 'CLEAR');
    }
    window.rollConveyorJam = rollConveyorJam;
    window.checkBeltJam = checkBeltJam;
    window.handleClearJam = handleClearJam;

    function setPickMode(mode) {
        var s = gameState.state;
        if (!s.pickListChoice) s.pickListChoice = { mode: 'DROP', category: null };
        s.pickListChoice.mode = mode;
        gameState._save();
        renderPickList();
    }
    window.setPickMode = setPickMode;

    function getAppraisedValue(keepItem) {
        var base = keepItem.baseValue || keepItem.otisValue || 0;
        if (keepItem.rarity === 'Anomalous' || base === 0) return base;
        var daysHeld = Math.max(0, (gameState.state.day || 1) - (keepItem.keepDay || keepItem.day || 1));
        var mult = Math.pow(1.02, daysHeld);
        return Math.floor(base * mult * (CONDITION_MULTIPLIERS[keepItem.condition] || 1.0));
    }
    window.getAppraisedValue = getAppraisedValue;
