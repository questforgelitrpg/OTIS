// OTIS economy subsystem — day clock, payments, arrears, bin shipping, Sven interference, bank inspection. Extracted from index.html in Phase 6 of the monolith refactor.

    // PAYMENT
    function handleMakePayment() {
        if ((gameState.state.outstandingDebt || 0) > 0) { var pf1 = 'Cannot process. Arrears outstanding. Clear arrears first.'; otisLines.push({ role: 'otis', text: pf1 }); renderOTIS(); if (window.OtisTTS) OtisTTS.speak(pf1); return; }
        var installment = gameState.state.currentInstallment || 850;
        if (gameState.state.credits < installment) { var pf2 = 'Insufficient credits. Need ' + installment + ' cr, have ' + gameState.state.credits + ' credits.'; otisLines.push({ role: 'otis', text: pf2 }); renderOTIS(); if (window.OtisTTS) OtisTTS.speak(pf2); return; }
        gameState.state.credits -= installment;
        gameState.state.debt = Math.max(0, gameState.state.debt - installment);
        // Reset the full cycle from the payment date, whether early or on time.
        gameState.state.daysUntilPayment = TIMING.PAYMENT_CYCLE_DAYS;
        gameState.state.paymentCycle = (gameState.state.paymentCycle || 0) + 1;
        checkPaymentEscalation();
        gameState._save(); gameState._updateUI();
        recalculateNamingTier();
        var mpMsg = 'Payment processed. ' + installment + ' credits. Balance: ' + gameState.state.debt.toLocaleString() + ' credits.';
        otisLines.push({ role: 'otis', text: mpMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(mpMsg);
    }
    function handleClearArrears() {
        var a = gameState.state.outstandingDebt || 0; if (a === 0) return;
        if (gameState.state.credits < a) { var pf3 = 'Insufficient credits. Need ' + a + ' cr to clear arrears, have ' + gameState.state.credits + ' credits.'; otisLines.push({ role: 'otis', text: pf3 }); renderOTIS(); if (window.OtisTTS) OtisTTS.speak(pf3); return; }
        gameState.state.credits -= a;
        gameState.state.outstandingDebt = 0;
        gameState.state.consecutiveArrearsCycles = 0; // reset when arrears cleared
        gameState._save(); gameState._updateUI();
        var arMsg = 'Arrears cleared. Balance zero.';
        otisLines.push({ role: 'otis', text: arMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(arMsg);
    }

    // SCRAP
    function handleDispatchMay() {
        var fill = gameState.state.scrapFill || 0; if (fill === 0) return;
        var prevFill = fill;
        var earned = Math.floor(fill * (5 + Math.random() * 5));
        var s = gameState.state;
        gameState.state.credits += earned; gameState.state.scrapFill = 0;
        s.scrapDispatchCount = (s.scrapDispatchCount || 0) + 1;
        s.avgScrapFillPct = Math.round(
            ((s.avgScrapFillPct||0) * (s.scrapDispatchCount - 1) + prevFill)
            / s.scrapDispatchCount
        );
        gameState._save(); gameState._updateUI();
        renderStoreroomBuffer();
        var sdMsg = 'Scrap dispatched. ' + prevFill + '% fill. +' + earned + ' cr from May.';
        otisLines.push({ role: 'otis', text: sdMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(sdMsg);
        shipMayBin();
    }

    function shipMayBin() {
        var s = gameState.state;
        var bin = s.mayBin || [];
        if (!bin.length) return;
        var total = bin.reduce(function(sum, item) {
            return sum + Math.floor(getEffectiveValue(item));
        }, 0);
        s.credits += total;
        s.mayBin = [];
        s.mayNotifUnread = true;
        gameState._save(); gameState._updateUI();
        renderBinPanel();
        var mMsg = 'May bin shipped. ' + bin.length + ' items. +' + total + ' cr.';
        otisLines.push({ role:'otis', text: mMsg }); renderOTIS();
        var mayDot = document.getElementById('comms-dot-may');
        if (mayDot) mayDot.className = 'comms-dot dot-on';
        if (window.OtisTTS) OtisTTS.speak(mMsg);
    }
    function handleBrokerBinShip() {
        var s = gameState.state;
        var bin = s.brokerBin || [];
        if (!bin.length) {
            otisLines.push({ role:'otis', text: 'Broker bin is empty.' }); renderOTIS(); return;
        }
        var fillPct = bin.length / 10;
        var mult = fillPct >= 1.0 ? 1.0 : fillPct >= 0.75 ? 0.88 : 0.75;
        var total = bin.reduce(function(sum, item) {
            return sum + Math.floor(getEffectiveValue(item) * (item.eeMultiplier||1) * mult);
        }, 0);
        s.credits += total;
        s.brokerBin = [];
        gameState._save(); gameState._updateUI();
        renderBinPanel();
        var pctStr = Math.round(fillPct * 100) + '% fill';
        var multStr = mult < 1.0 ? ' (' + Math.round(mult*100) + '% value)' : '';
        var bMsg = 'Broker bin shipped. ' + bin.length + ' items. ' + pctStr + multStr + '. +' + total + ' cr.';
        otisLines.push({ role:'otis', text: bMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(bMsg);
    }
    function handleSvenBinShip() {
        var s = gameState.state;
        var bin = s.svenBin || [];
        if (bin.length < 2) {
            // Bug fix: silent failure was swallowing player feedback.
            // If the player manually triggers ship on a single-item bin, tell them why it won't go.
            if (bin.length === 1) {
                var shortMsg = 'Sven won\u2019t ship a single-item lot. Add one more Rare or Anomalous first.';
                otisLines.push({ role: 'otis', text: shortMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak(shortMsg);
                // Flash the ship button so the player sees the rejection
                var shipBtn = document.getElementById('btn-sven-ship');
                if (shipBtn) {
                    shipBtn.classList.add('btn-flash-warn');
                    setTimeout(function() { shipBtn.classList.remove('btn-flash-warn'); }, 1200);
                }
            }
            return;
        }
        var total = bin.reduce(function(sum, item) { return sum + (item.svenValue || 0); }, 0);
        s.credits += total;
        s.svenBin = [];
        gameState._save(); gameState._updateUI();
        renderBinPanel();
        var svMsg = '[SVEN] Items received. Credits transferred. ' + total + ' cr. \u2014 Digut';
        otisLines.push({ role:'otis', text: svMsg }); renderOTIS();
        var dot = document.getElementById('comms-dot-sven');
        if (dot) dot.className = 'comms-dot dot-on';
        var svenEl = document.getElementById('sys-sven');
        if (svenEl) { svenEl.textContent = 'NOMINAL'; svenEl.className = 'status-ok'; }
        if (window.OtisTTS) OtisTTS.speak(svMsg);
    }

    // ── BANK INSPECTIONS ──────────────────────────────────────────────────────
    // Scheduled every 14 days. Check bot status; apply pass/fail with Hull Patch.
    function checkBankInspection() {
        var s = gameState.state;
        if (!s.nextInspectionDay) s.nextInspectionDay = s.day + 14;
        if (s.day < s.nextInspectionDay) return;
        s.nextInspectionDay = s.day + 14;

        var bots = s.bots || [];
        var offlineBots = bots.filter(function(b) { return b.status === 'OFFLINE'; });
        var redBots     = bots.filter(function(b) { return b.status === 'RED'; });
        var amberBots   = bots.filter(function(b) { return b.status === 'AMBER'; });
        var allNominal  = bots.every(function(b) { return b.status === 'NOMINAL'; });

        var result;
        var penalty = 0;

        if (allNominal) {
            // Pass — small credit reward
            var reward = 200;
            s.credits = (s.credits || 0) + reward;
            result = 'PASS';
            // LORE
            var passMsg = '[UBC INSPECTION] Day ' + s.day + '. All systems NOMINAL. Compliance confirmed. Operational credit: ' + reward + ' cr. George ran clean inspections for nineteen years. You are catching up.';
            otisLines.push({ role: 'otis', text: passMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(passMsg);
        } else if (offlineBots.length > 0 || redBots.length > 0) {
            // Fail — significant penalty
            var basePenalty = 600 + (offlineBots.length * 300) + (redBots.length * 150);
            penalty = Math.round(basePenalty * getHullPatchFactor());
            s.outstandingDebt = (s.outstandingDebt || 0) + penalty;
            result = 'FAIL';
            // LORE
            var failMsg = '[UBC INSPECTION] Day ' + s.day + '. Critical deficiencies found. '
                + (offlineBots.length ? offlineBots.length + ' bot(s) OFFLINE. ' : '')
                + (redBots.length ? redBots.length + ' bot(s) RED. ' : '')
                + 'Penalty: ' + penalty + ' cr added to arrears.'
                + (getHullPatchFactor() < 1.0 ? ' Hull Patch reduced original penalty.' : '')
                + ' George never failed an inspection. He also never ran bots this hard.';
            otisLines.push({ role: 'otis', text: failMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(failMsg);
        } else {
            // Warning — AMBER bots, minor penalty
            var warnPenalty = Math.round(150 * amberBots.length * getHullPatchFactor());
            penalty = warnPenalty;
            if (penalty > 0) s.outstandingDebt = (s.outstandingDebt || 0) + penalty;
            result = 'WARNING';
            // LORE
            var warnMsg = '[UBC INSPECTION] Day ' + s.day + '. ' + amberBots.length + ' bot(s) AMBER. Warning filed. '
                + (penalty > 0 ? 'Minor penalty: ' + penalty + ' cr. ' : '')
                + 'Bring systems to NOMINAL before next cycle.';
            otisLines.push({ role: 'otis', text: warnMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(warnMsg);
        }

        // Check if there is an active compliance standing order for allBotsNominal
        if (result === 'PASS' && s.activeOrders) {
            s.activeOrders.forEach(function(o) {
                if (!o.fulfilled && o.requirementKey === 'allBotsNominal') {
                    o.fulfilled = true;
                    applyOrderReward(o, s);
                }
            });
        }

        var dot = document.getElementById('comms-dot-bank');
        if (dot) dot.className = 'comms-dot dot-' + (result === 'PASS' ? 'on' : result === 'FAIL' ? 'red' : 'amber');
        gameState._save();
        gameState._updateUI();
        renderActiveOrders();
    }

    function checkPaymentEscalation() {
      var s = gameState.state;
      if (!s.escalationFired) s.escalationFired = { tier1: false, tier2: false, tier3: false };
      PAYMENT_ESCALATION_EVENTS.forEach(function(event) {
        var tierKey = "tier" + event.tier;
        if (s.paymentCycle >= event.cycle && !s.escalationFired[tierKey]) {
          s.escalationFired[tierKey] = true;
          s.currentInstallment = event.amount;
          gameState._save();
          appendHardcodedComm(event.bankMsg);
          var dot = document.getElementById("comms-dot-bank");
          if (dot) dot.className = "comms-dot dot-on";
          setTimeout(function() {
            otisLines.push({ role: "otis", text: event.otisMsg });
            renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(event.otisMsg);
          }, 3000);
        }
      });
    }

    function advanceDay() {
        var s = gameState.state;
        s.day = (s.day || 1) + 1;
        s.daysUntilPayment = Math.max(0, (s.daysUntilPayment || 7) - 1);
        s.daysUntilNextDrop = Math.max(0, (s.daysUntilNextDrop || 7) - 1);
        // Fire bank notification once per day — always if behind, once per day if approaching
        if ((s.outstandingDebt || 0) > 0 || s.daysUntilPayment <= 3) {
            if (s.lastBankNotifDay !== s.day) {
                s.bankNotifUnread = true;
                s.lastBankNotifDay = s.day;
            }
        }
        if (s.outstandingDebt > 0) {
            s.outstandingDebt = Math.ceil(s.outstandingDebt * 1.05);
            if (s.outstandingDebt > 2000) { var awMsg = 'Arrears: ' + s.outstandingDebt.toLocaleString() + ' credits. Compounding at 5% per day.'; otisLines.push({ role: 'otis', text: awMsg }); renderOTIS(); if (window.OtisTTS) OtisTTS.speak(awMsg); }
        }
        if (s.daysUntilPayment <= 0) {
            var installment = s.currentInstallment || 850;
            if (s.credits >= installment) {
                // BUG 3 fix: auto-pay fires whenever credits >= installment, regardless
                // of outstanding arrears.  Remaining credits are applied toward arrears.
                s.credits -= installment;
                s.debt = Math.max(0, s.debt - installment);
                s.daysUntilPayment = TIMING.PAYMENT_CYCLE_DAYS;
                // Increment payment cycle counter and check escalations
                s.paymentCycle = (s.paymentCycle || 0) + 1;
                checkPaymentEscalation();
                // Optionally apply remaining credits toward arrears
                if ((s.outstandingDebt || 0) > 0 && s.credits > 0) {
                    var apply = Math.min(s.credits, s.outstandingDebt);
                    s.credits -= apply;
                    s.outstandingDebt -= apply;
                }
                var payMsg = 'Payment logged. ' + installment + ' credits. Balance: ' + s.debt.toLocaleString() + ' credits.';
                otisLines.push({ role: 'otis', text: payMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak(payMsg);
                // Notify next installment due
                var instMsg = INSTALLMENT_DUE_POOL[Math.floor(Math.random() * INSTALLMENT_DUE_POOL.length)]
                  .replace('{AMT}', (s.currentInstallment || 850).toLocaleString())
                  .replace('{DEBT}', (s.debt || 0).toLocaleString());
                setTimeout(function() { otisLines.push({ role: 'otis', text: instMsg }); renderOTIS(); if (window.OtisTTS) OtisTTS.speak(instMsg); }, 2000);
            } else {
                s.missedPayments = (s.missedPayments || 0) + 1;
                s.outstandingDebt = (s.outstandingDebt || 0) + (s.currentInstallment || 850);
                s.daysUntilPayment = TIMING.PAYMENT_CYCLE_DAYS;
                // Increment cycle even on miss
                s.paymentCycle = (s.paymentCycle || 0) + 1;
                checkPaymentEscalation();
                appendOTIS('Payment missed. Arrears: ' + s.outstandingDebt + ' credits. Compound rate: 5% per day.', 'PAYMENT_MISSED');
                if (s.missedPayments >= 3) triggerForeclosure();
            }
            // Track consecutive arrears cycles for POWER_FAILURE ending.
            // Placed AFTER optional arrears reduction so that if the player's
            // remaining credits cleared outstandingDebt above, cycles reset to 0.
            if ((s.outstandingDebt || 0) > 0) {
                s.consecutiveArrearsCycles = (s.consecutiveArrearsCycles || 0) + 1;
            } else {
                s.consecutiveArrearsCycles = 0;
            }
        }
        if (s.daysUntilNextDrop <= 0 && !s.dropActive) {
            s.daysUntilNextDrop = TIMING.DAYS_BETWEEN_DROPS + Math.floor(Math.random() * (TIMING.DROP_VARIANCE_DAYS * 2 + 1)) - TIMING.DROP_VARIANCE_DAYS;
            handleBargeArrival();
        }
        if (s.daysUntilNextDrop === 1 && !s.dropActive) {
            var imminentNote = document.getElementById('picklist-confirmed-note');
            if (!s.confirmedPickChoice && imminentNote)
                imminentNote.textContent = '\u26a0 BARGE TOMORROW \u2014 CONFIRM PICK LIST';
            setLight('light-belt', 'light-amber');
        }
        // Fire toast once per day — autoToast() checks toastFiredToday internally and
        // deducts credits synchronously, avoiding the race condition caused by the
        // previous setTimeout(handleToasterIncident, 3000) approach.
        s.toastFiredToday = false;
        autoToast();
        // Every 3rd day: real API call so OTIS can observe the actual state.
        // Other days: scripted pool — fast, no latency, still atmospheric.
        if (s.day % 3 === 0) {
            appendOTIS('Day ' + s.day + '. Status check.', 'DAY_TICK');
        } else {
            var beltState = s.dropActive ? 'active' : 'idle';
            var dayMsg = DAY_TICK_POOL[Math.floor(Math.random() * DAY_TICK_POOL.length)]
                .replace('{D}', s.day)
                .replace('{STATE}', beltState)
                .replace('{PAY}', (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS)
                .replace('{DEBT}', (s.debt || 0).toLocaleString());
            otisLines.push({ role: 'otis', text: dayMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(dayMsg);
        }
        updateArmSprite('DAY_TICK');
        gameState._save();
        gameState._updateUI();
        recalculateNamingTier();
        checkScriptedComms();
        checkUpgradeThreshold();
        checkDiaryUnlocksDay();
        checkStandingOrders();
        checkBankInspection();
        resolvePendingBotRepairs();
        // Belt jam check — evaluated every 2 in-game days to reduce frequency
        _beltJamDayCounter++;
        if (_beltJamDayCounter >= 2) { _beltJamDayCounter = 0; checkBeltJam(); }
        // B6 — near loan payoff before Act 3: trigger McGuffin when total remaining
        // debt drops below 1500 cr during Act 2 (fires once via mcguffinFired guard).
        if (s.act === 2 && ((s.debt || 0) + (s.outstandingDebt || 0)) < 1500 && !s.mcguffinFired) {
            spawnMcGuffin();
        }
        // B4 — POWER_FAILURE ending: all bots offline + 3+ consecutive arrears cycles
        if (!s.endingTriggered) {
            var _bots = s.bots || [];
            var _allOffline = _bots.length > 0 && _bots.every(function(b) { return b.status === 'OFFLINE'; });
            if (_allOffline && (s.consecutiveArrearsCycles || 0) >= 3) {
                triggerEnding('POWER_FAILURE');
            }
        }
    }

    // SVEN INTERFERENCE — auto-fires after each drop completes
    function maybeSvenInterference() {
        var s = gameState.state;
        var pct = s.svenInterferencePct || 20;
        if (Math.random() * 100 > pct) return;
        s.recentBotConflict = true;
        // --- NEW: STEAL FROM BROKER BIN ---
        var broker = s.brokerBin || [];
        if (broker.length > 0) {
            var stealIdx = Math.floor(Math.random() * broker.length);
            var stolen = broker.splice(stealIdx, 1)[0];
            var svenPaid = Math.floor(getEffectiveValue(stolen) * 0.65);
            s.credits += svenPaid;
            s.brokerBin = broker;
            gameState._save();
            renderBinPanel();
            var stealMsg = '[SVEN INTERFERENCE] ' + stolen.name.substring(0,22) + ' removed from broker bin. Credited at Sven rate: ' + svenPaid + ' cr. Interference probability: ' + pct + '%.';
            otisLines.push({ role:'otis', text: stealMsg }); renderOTIS();
            var dot = document.getElementById('comms-dot-sven');
            if (dot) dot.className = 'comms-dot dot-amber';
            setLight('light-comms', 'light-amber');
            var svenEl = document.getElementById('sys-sven');
            if (svenEl) { svenEl.textContent = 'INTERFERENCE'; svenEl.className = 'status-warn'; }
            return;  // Steal replaces the bot degradation this interference event
        }
        // --- EXISTING: BOT DEGRADATION (only if broker bin was empty) ---
        // Degrade one bot faster
        var bots = s.bots || [];
        if (bots.length > 0) {
            var idx = Math.floor(Math.random() * bots.length);
            bots[idx].degradation = Math.min(9, (bots[idx].degradation || 0) + 2);
            if (bots[idx].degradation >= 9) bots[idx].status = 'OFFLINE';
            else if (bots[idx].degradation >= 6) bots[idx].status = 'RED';
            else if (bots[idx].degradation >= 3) bots[idx].status = 'AMBER';
        }
        // Replace one manifest item with lower value substitute
        if ((s.fieldPool||[]).length > 0) {
            var fpIdx = Math.floor(Math.random() * s.fieldPool.length);
            s.fieldPool[fpIdx] = weightedPickItem();
        } else if ((s.manifestItems||[]).length > 0) {
            var mIdx = Math.floor(Math.random() * s.manifestItems.length);
            s.manifestItems[mIdx] = weightedPickItem();
        }
        gameState._save();
        updateBotUI();
        var msg = '[SVEN INTERFERENCE] Bay sensor conflict detected. One bot running degraded. Manifest integrity affected. SVEN signal active.';
        otisLines.push({ role:'otis', text: msg }); renderOTIS();
        var dot = document.getElementById('comms-dot-sven');
        if (dot) dot.className = 'comms-dot dot-amber';
        setLight('light-comms', 'light-amber');
        var svenEl = document.getElementById('sys-sven');
        if (svenEl) { svenEl.textContent = 'INTERFERENCE'; svenEl.className = 'status-warn'; }
    }

    // McGUFFIN — auto-sell helper (B1).
    // Called by the debug button, the B6 near-payoff trigger, and the B7 Act-3
    // fallback.  Idempotent: no-op if mcguffinFired is already true.
    // The McGuffin never appears on the visible belt; credits are posted directly.
    function spawnMcGuffin() {
        var s = gameState.state;
        if (s.mcguffinFired) return;
        s.mcguffinFired = true;
        gameState._save();
        // Payout = all outstanding arrears + all remaining principal + 10,000 surplus
        var payout = (s.outstandingDebt || 0) + (s.debt || 0) + 10000;
        s.credits = (s.credits || 0) + payout;
        gameState._save();
        gameState._updateUI();
        var mcgMsg = 'Anomalous high-value sale logged. Bank credits posted.';
        otisLines.push({ role: 'otis', text: mcgMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(mcgMsg);
        // Trigger upgrade threshold check so the v5.0 modal can appear promptly
        if (typeof checkUpgradeThreshold === 'function') {
            setTimeout(checkUpgradeThreshold, 1000);
        }
    }

    // FORECLOSURE CUTSCENE — B2: converted to a true game-over with restart
    // NOTE: endingTriggered is set at the very top (before the cutscene) to prevent
    // any other ending from firing during the 16+ second sequence.  renderEndingScreen
    // is called directly (not via triggerEnding) because endingTriggered is already
    // set and triggerEnding would return early.
    function triggerForeclosure() {
        if (gameState.state.endingTriggered) return;
        gameState.state.endingTriggered = true;
        gameState._save();
        var seq = [
            { delay: 0,     msg: '[BANK] Final notice. Account ' + (gameState.state.accountId||'VRN-001') + '. Three consecutive missed payments.' },
            { delay: 3000,  msg: '[BANK] Asset review initiated. Station operations suspended pending receivership.' },
            { delay: 6000,  msg: '[BANK] Belt access revoked. Manifest processing halted.' },
            { delay: 9000,  msg: '[BANK] George Verne\'s estate records have been filed. Operational successor liability: active.' },
            { delay: 12000, msg: 'OTIS: I told you. I kept telling you.' },
            { delay: 14000, msg: 'OTIS: The numbers were always there.' }
        ];
        seq.forEach(function(step) {
            setTimeout(function() {
                otisLines.push({ role:'otis', text: step.msg }); renderOTIS();
            }, step.delay);
        });
        setTimeout(function() {
            var term = document.getElementById('terminal');
            if (term) { term.style.filter = 'brightness(0)'; term.style.transition = 'filter 3s'; }
            setTimeout(function() {
                if (term) { term.style.filter = ''; term.style.transition = 'filter 2s'; }
                renderEndingScreen('FORECLOSURE');
            }, 3500);
        }, 16000);
    }

    function checkActProgression() {
        var s = gameState.state;
        var drops = s.dropCount || 0;
        var newAct = drops < 3 ? 1 : drops < 7 ? 2 : 3;
        if (newAct !== s.act) {
            s.act = newAct;
            gameState._save();
            var actNames = { 2: 'PRESSURE', 3: 'THE FIND' };
            appendOTIS('ACT ' + newAct + ': ' + (actNames[newAct] || ''), 'LOGIN');
            // Act 3 start: schedule the one-time toaster incident (power-outage plot
            // event).  Brief delay lets the act-transition OTIS message render first.
            // This is the ONLY place fireToasterIncident() should be called from the
            // normal game flow — never from autoToast() or any daily-toast path.
            if (newAct === 3 && !s.toasterIncidentFired) {
                setTimeout(fireToasterIncident, 4000);
            }
            // B7 — Act 3 entry fallback McGuffin trigger.  Fires 8 s after the act
            // transition so the toaster cutscene plays first.  The spawnMcGuffin
            // idempotency guard ensures it only fires once.
            if (newAct === 3 && !s.mcguffinFired) {
                setTimeout(spawnMcGuffin, 8000);
            }
        }
    }

    window.handleMakePayment = handleMakePayment;
    window.handleClearArrears = handleClearArrears;
    window.handleDispatchMay = handleDispatchMay;
    window.shipMayBin = shipMayBin;
    window.handleBrokerBinShip = handleBrokerBinShip;
    window.handleSvenBinShip = handleSvenBinShip;
    window.checkBankInspection = checkBankInspection;
    window.checkPaymentEscalation = checkPaymentEscalation;
    window.advanceDay = advanceDay;
    window.maybeSvenInterference = maybeSvenInterference;
    window.triggerForeclosure = triggerForeclosure;
    window.checkActProgression = checkActProgression;
    window.spawnMcGuffin = spawnMcGuffin;
