// OTIS state manager + TIMING constants — extracted from index.html in Phase 3 of the monolith refactor.
// IMPORTANT: STATE_KEY is duplicated in the early redirect script at the top of index.html. If this value changes, update both.

    // TIMING
    const TIMING = {
        MS_PER_INGAME_DAY:     240000,
        BELT_DELIVERY_MS:      45000,
        DAYS_BETWEEN_DROPS:    2,
        DROP_VARIANCE_DAYS:    0,
        DROP_SIZE_ACT1:        10,
        DROP_SIZE_ACT2_MIN:    18,
        DROP_SIZE_ACT2_MAX:    22,
        DROP_SIZE_ACT3_MIN:    26,
        DROP_SIZE_ACT3_MAX:    32,
        PAYMENT_CYCLE_DAYS:    7,
        ANOMALOUS_RESERVE_MIN: 400,
        ANOMALOUS_RESERVE_MAX: 1800,
        DEBUG_FAST_MODE:       false,
        DEBUG_SPEED_MULTIPLIER: 10,
        OVERFLOW_THRESHOLD:    6,
        BUFFER_ROUTE_COUNT:    6,
    };
    window.TIMING = TIMING;

    // Time penalty (in sessionHours minutes) for a failed verification attempt
    var VERIFICATION_FAILURE_PENALTY_HOURS = 120;
    window.VERIFICATION_FAILURE_PENALTY_HOURS = VERIFICATION_FAILURE_PENALTY_HOURS;
    var VERIFY_FAIL_WRONG_NODE     = "That component is an industrial-grade regulator. You are trying to install it into a civilian comm-array. George was eccentric, not incompetent.";
    window.VERIFY_FAIL_WRONG_NODE = VERIFY_FAIL_WRONG_NODE;
    var VERIFY_FAIL_WRONG_EVIDENCE = "Vernon, your data points do not intersect. George's entry for that date discusses a toaster, not the hardware in your hand. The math does not hold.";
    window.VERIFY_FAIL_WRONG_EVIDENCE = VERIFY_FAIL_WRONG_EVIDENCE;

    // STATE MANAGER
    // IMPORTANT: STATE_KEY is declared twice — once above in the redirect script and once here.
    // Both must be kept in sync. If you bump the key, update BOTH declarations.
    const STATE_KEY = 'otis_state_v5';
    window.STATE_KEY = STATE_KEY;

    const stateManager = {
        _default: function() {
            return {
                debt: 25000, credits: 200, day: 1,
                paymentDue: 850, daysUntilPayment: 7,
                sessionHours: 0, namingTier: 0, skipCount: 0, act: 1,
                scrapFill: 0, keepLog: [], recentEvents: [],
                dropActive: false, bargeActive: false, dropItemsRemaining: 0,
                manifestItems: [], outstandingDebt: 0, missedPayments: 0,
                fieldPool: [], beltQueue: [],
                daysUntilNextDrop: 1, toastFiredToday: false, // 1 ensures first automatic drop fires on Day 2 via advanceDay→checkDropSchedule
                scriptedCommsFired: { bank: false, sven: false, may: false },
                pickListChoice: { mode: 'DROP', category: null },
                confirmedPickChoice: null,
                otisLearning: { keepByCategory: {}, scrapByCategory: {}, sellByRarity: {} },
                bots: [
                    { id: 1, status: 'NOMINAL', degradation: 0, activity: 'IDLE', activityRemainingMs: 0, carrying: null },
                    { id: 2, status: 'NOMINAL', degradation: 0, activity: 'IDLE', activityRemainingMs: 0, carrying: null },
                    { id: 3, status: 'NOMINAL', degradation: 0, activity: 'IDLE', activityRemainingMs: 0, carrying: null },
                ],
                conveyorJammed: false,
                beltJammed: false,
                itemDisplayedAt: null,
                georgeWarehouseRevealed: false,
                georgeWarehouseSold: [],
                georgeWarehouseFound: [],
                warehouseSearching: false,
                warehouseMisses: 0,
                dropCount: 0,
                dropsSinceLastJam: 0,
                reserveSuccesses: 0,
                easterEggFired: false,
                toasterIncidentFired: false,
                nextDropDay: null,
                storeroomBuffer: [],
                storeroomBufferActive: false,
                storeroomBufferTarget: 0,
                declarationBatch: [],
                declarationBatchCount: 0,
                deliveryCount: 0,
                stateVersion: 7,
                svenIgnoreDays: 0,
                svenInterferencePct: 20,
                recentBotConflict: false,
                svenComplaints: 0,
                humanityArchive: 0,
                humanityLog: [],
                anomalyLog: [],
                endingTriggered: false,
                scrapDispatchCount: 0,
                avgScrapFillPct: 0,
                lastDropFillPct: 0,
                dropStartSize: 0,
                currentDropScrapped: 0,
                upgradePrompted: false,
                upgradeDeflections: 0,
                upgradeCost: 5000,
                upgradeDecision: null,
                upgradeModalShown: false,
                introPlayed: false,
                tutorialStep: 0,
                georgesDiaryFound: [],
                // --- MASTER INTEGRATION SCHEMATIC ---
                schematicFound: false,
                installedNodes: [],
                failedNodes: [],
                // --- BIN SYSTEM ---
                mayBin: [],
                brokerBin: [],
                svenBin: [],
                // --- PAYMENT ESCALATION ---
                paymentCycle: 0,
                currentInstallment: 850,
                escalationFired: { tier1: false, tier2: false, tier3: false },
                // --- BANK NOTIFICATION THROTTLE ---
                bankNotifUnread: false,
                lastBankNotifDay: 0,
                // --- MAY NOTIFICATION ---
                mayNotifUnread: false,
                // --- MAZE MINI-GAME ---
                mazeCurrentIndex: 0,
                mazesCompletedTotal: 0,
                mazeCompletionLoops: 0,
                mazeRewardGiven: false,
                mazePlayerPos: null,
                mazeActive: false,
                // --- MCGUFFIN ---
                mcguffinFired: false,
                pendingMcGuffin: false,
                // --- UPGRADE DEFLECT THROTTLE ---
                lastUpgradeDeflectDay: 0,
                // --- SCRAP HEAP COUNTERS ---
                georgeItemsSold: 0,
                civilianScrapped: 0,
                // --- POWER FAILURE COUNTER ---
                consecutiveArrearsCycles: 0,
                // --- STATION UPGRADES ---
                upgrades: { scanner: 0, belt: 0, storeroom: 0, comm: 0, power: 0, hull: 0, cooling: 0 },
                // --- SVEN COMPLICITY ---
                svenComplicity: 0,
                svenRareRefusalActive: false,
                svenRareRefusalExpiresDay: 0,
                // --- STANDING ORDERS ---
                activeOrders: [],
                nextOrderId: 1,
                // --- BANK INSPECTIONS ---
                nextInspectionDay: 14,
                // --- PENDING BOT REPAIRS ---
                pendingBotRepairs: [],
                // --- v7 FIELDS ---
                earlyDebtEventFired: false,  // Day 2-4 collector ping
                weighItShown: [],            // item names already shown weigh-it hint
        orderFollowUpDay: {},        // last follow-up day per NPC (Sven/May) — used to
                                     // rate-limit future NPC follow-up pings to once per day
            };
        },
        save: function(state) {
            try { localStorage.setItem(STATE_KEY, JSON.stringify(Object.assign({}, state, { savedAt: Date.now() }))); }
            catch(e) { console.warn('Save failed:', e); }
        },
        load: function() {
            try {
                var raw = localStorage.getItem(STATE_KEY);
                if (raw) {
                    var parsed = JSON.parse(raw);
                    // Solo-dev project: no active player saves to migrate.
                    // Any save older than v7 is intentionally cleared — this is a
                    // breaking reset, not a silent data loss.
                    if (!parsed.stateVersion || parsed.stateVersion < 7) {
                        console.log('Save version ' + (parsed.stateVersion || '?') + ' < 7 — clearing (intentional reset, no active saves).');
                        this.clear();
                        return null;
                    }
                    var result = Object.assign({}, this._default(), parsed);
                    ensureStateDefaults(result);
                    return result;
                }
            } catch(e) { console.warn('Load failed:', e); }
            return null;
        },
        clear: function() { localStorage.removeItem(STATE_KEY); },
    };
    window.stateManager = stateManager;

    // ensureStateDefaults — applied after loading a saved state to guarantee all
    // fields are present.  Add a guard here whenever a new Array/object field
    // is added; scalar fields are covered by Object.assign({}, _default(), parsed).
    function ensureStateDefaults(state) {
        if (!Array.isArray(state.anomalyLog))  state.anomalyLog  = [];
        if (!Array.isArray(state.humanityLog)) state.humanityLog = [];
        if (typeof state.humanityArchive !== 'number') state.humanityArchive = 0;
        if (typeof state.earlyDebtEventFired !== 'boolean') state.earlyDebtEventFired = false;
        if (!Array.isArray(state.weighItShown)) state.weighItShown = [];
        if (typeof state.orderFollowUpDay !== 'object' || state.orderFollowUpDay === null) state.orderFollowUpDay = {};
    }
    window.ensureStateDefaults = ensureStateDefaults;

    function GameState() {
        this.state = stateManager._default();
        this._sessionStart = null;
        this._sessionTimer = null;
        // Note: _dayTimer is intentionally absent; the canonical day interval is
        // window._otisDayIntervalId (set in DOMContentLoaded), not a prototype timer.
    }
    GameState.prototype.init = function() {
        var loaded = stateManager.load();
        if (loaded) this.state = loaded;
    };
    GameState.prototype._save = function() { stateManager.save(this.state); };
    GameState.prototype._trackEvent = function(trigger) {
        this.state.recentEvents = [{ trigger: trigger, at: Date.now() }].concat(this.state.recentEvents).slice(0, 5);
        this._save();
    };
    GameState.prototype._updateUI = function() {
        var s = this.state;
        var naming = NAMING_TIERS[Math.min(s.namingTier, NAMING_TIERS.length - 1)];
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        setEl('hdr-day', 'DAY ' + s.day);
        setEl('hdr-credits', s.credits.toLocaleString() + ' cr');
        setEl('hdr-debt', 'LOAN: ' + s.debt.toLocaleString() + ' cr');
        setEl('hdr-naming', naming.toUpperCase());
        var payEl = document.getElementById('hdr-payment');
        if (payEl) { payEl.textContent = 'INST: ' + (s.currentInstallment||850) + 'cr/' + dup + 'd'; payEl.className = 'hdr-stat' + (dup <= 1 ? ' payment-crit' : dup <= 3 ? ' payment-warn' : ''); }
        var daysUntilDrop = (s.daysUntilNextDrop != null) ? s.daysUntilNextDrop : TIMING.DAYS_BETWEEN_DROPS;
        var bargeEl = document.getElementById('hdr-barge');
        if (bargeEl) bargeEl.textContent = s.bargeActive ? 'BARGE: ACTIVE' : 'BARGE: ' + daysUntilDrop + 'd';
        var hoursEl = document.getElementById('hdr-hours');
        if (hoursEl) { var sh = s.sessionHours || 0; hoursEl.textContent = 'SESSION: ' + Math.floor(sh / 60) + 'h ' + (sh % 60) + 'm'; }
        setEl('ledger-debt', s.debt.toLocaleString() + ' cr');
        setEl('ledger-credits', s.credits.toLocaleString() + ' cr');
        setEl('ledger-days', String(dup));
        var instEl = document.getElementById('ledger-installment');
        if (instEl) instEl.textContent = (s.currentInstallment || 850).toLocaleString() + ' cr';

        var arrearsRow = document.getElementById('arrears-row');
        var arrearsEl  = document.getElementById('ledger-arrears');
        var arrears = s.outstandingDebt || 0;
        if (arrearsRow) arrearsRow.style.display = arrears > 0 ? '' : 'none';
        if (arrearsEl)  arrearsEl.textContent = arrears.toLocaleString() + ' cr';
        var debtBar = document.getElementById('debt-bar-fill');
        if (debtBar) {
            var pct = Math.max(0, Math.min(100, ((25000 - s.debt) / 25000) * 100));
            debtBar.style.width = pct + '%';
            debtBar.style.background = s.debt > 15000 ? 'var(--ind-on)' : s.debt >= 8000 ? 'var(--ind-amber)' : 'var(--ind-red)';
        }
        var bdc = document.getElementById('belt-drop-countdown');
        if (bdc) bdc.textContent = daysUntilDrop;
        // Archive count in header — visible once at least one item has been archived
        var archiveHdrEl = document.getElementById('hdr-archive');
        if (archiveHdrEl) {
            var archCount = s.humanityArchive || 0;
            archiveHdrEl.textContent = '\u25C6 ARCHIVE: ' + archCount;
            archiveHdrEl.style.display = archCount > 0 ? '' : 'none';
        }
        this._renderKeepLog();
        updateModuleLights();
        updateCommsIndicators();
        updateSystemsStatus();
        updateScrapBar();
        if (typeof updateBotUI === 'function') updateBotUI();
        if (typeof renderPickList === 'function') renderPickList();
        if (typeof renderGeorgeWarehouse === 'function' && (this.state.georgeWarehouseRevealed || (this.state.georgeWarehouseFound && this.state.georgeWarehouseFound.length))) renderGeorgeWarehouse();
        if (typeof renderGeorgeDiary === 'function') renderGeorgeDiary();
        if (typeof renderStoreroomBuffer === 'function') renderStoreroomBuffer();
        if (typeof updateGameHints === 'function') updateGameHints();
        if (typeof renderBinPanel === 'function') renderBinPanel();
        if (typeof renderUpgrades === 'function') renderUpgrades();
        if (typeof renderActiveOrders === 'function') renderActiveOrders();
    };
    GameState.prototype._renderKeepLog = function() {
        var list  = document.getElementById('keep-log-list');
        var empty = document.getElementById('keep-log-empty');
        var cnt   = document.getElementById('keep-log-count');
        var state = this.state;
        var n = state.keepLog.length;
        if (cnt) { cnt.textContent = n + ' / ' + getStorageCap(); cnt.style.color = n >= getStorageCap() ? 'var(--text-danger)' : n >= (getStorageCap() - 2) ? 'var(--text-warn)' : 'var(--text-dim)'; }
        if (list) {
            list.innerHTML = state.keepLog.map(function(k, i) {
                var daysHeld = Math.max(0, (state.day||1) - (k.keepDay||k.day||1));
                var appraised = getAppraisedValue(k);
                var baseVal = Math.floor((k.baseValue||k.otisValue||0) * (CONDITION_MULTIPLIERS[k.condition]||1.0));
                var gained = appraised - baseVal;
                var gainStr = gained > 0 ? ' (+' + gained + ' cr appreciated)' : '';
                var beltOccupied = (currentItem !== null);
                return '<li class="keep-list-item"><span>' + escapeHtml(k.name) + '</span>' +
                    '<span class="keep-item-meta">' + escapeHtml(k.condition||'') + ' \u2014 ' + appraised + ' cr' + gainStr + ' \u2014 Day ' + (k.keepDay||k.day) + ' \u2014 ' + daysHeld + 'd held</span>' +
                    '<button class="consult-card" onclick="handleReturnToBelt(' + i + ')"' + (beltOccupied ? ' disabled title="Belt is occupied — clear current item first"' : '') + '>RETURN TO BELT</button></li>';
            }).join('');
        }
        if (empty) empty.style.display = n ? 'none' : '';
        var hc = document.getElementById('humanity-count');
        if (hc) hc.textContent = state.humanityArchive || 0;
    };
    window.GameState = GameState;

    var gameState = new GameState();
    window.gameState = gameState;
