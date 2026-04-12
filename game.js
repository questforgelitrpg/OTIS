const TIMING = {
    // CLOCK TIMER — payment pressure
    // 1 in-game day = 4 real minutes
    MS_PER_INGAME_DAY: 240000,

    // BELT TIMER — item pressure, independent of clock
    // 1 item arrives every 30 real seconds during active drop
    BELT_DELIVERY_MS: 30000,

    // DROP SCHEDULE — in in-game days
    DAYS_BETWEEN_DROPS: 7,
    DROP_VARIANCE_DAYS: 2,

    // DROP SIZE — number of items, not time-based
    DROP_SIZE_ACT1: 6,
    DROP_SIZE_ACT2_MIN: 9,
    DROP_SIZE_ACT2_MAX: 11,
    DROP_SIZE_ACT3_MIN: 13,
    DROP_SIZE_ACT3_MAX: 15,

    // PAYMENT
    PAYMENT_CYCLE_DAYS: 28,

    // RESERVE RESOLUTION — real time
    RESERVE_RESOLVE_MIN_MS: 120000,   // 2 real minutes min
    RESERVE_RESOLVE_MAX_MS: 480000,   // 8 real minutes max

    // WAREHOUSE SEARCH — real time
    WAREHOUSE_SEARCH_MS: 20000,

    // ANOMALOUS RESERVE price range
    ANOMALOUS_RESERVE_MIN: 400,
    ANOMALOUS_RESERVE_MAX: 2000,

    // DEBUG
    DEBUG_FAST_MODE: false,
    DEBUG_SPEED_MULTIPLIER: 10,
};

// Apply debug multiplier if enabled (affects all _MS keys)
if (TIMING.DEBUG_FAST_MODE) {
    Object.keys(TIMING).forEach(k => {
        if (k.endsWith('_MS')) {
            TIMING[k] = Math.floor(TIMING[k] / TIMING.DEBUG_SPEED_MULTIPLIER);
        }
    });
}

const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;

const NAMING_TIERS = ['Mr. Serling', 'Vernon', 'Vern', 'Buddy', 'Pal', 'Coworker', 'Boss', 'Mr. Serling', 'Oh. You.'];

const MANIFEST_POOL = [
    // Common (otisValue 30–80)
    { name: 'Personal effects bundle — civilian origin',  category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 50 },
    { name: 'Corroded fuel cell casing',                  category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 38 },
    { name: 'Settlement cooking unit — communal',         category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 65 },
    { name: 'Burned circuit board cluster',               category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 32 },
    { name: 'Bent structural strut',                      category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 35 },
    { name: "Children's toy — unidentified origin",       category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 45 },
    { name: 'Settlement water filter — ceramic',          category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 40 },
    // Uncommon (otisValue 90–250)
    { name: 'Partial navigation array',                   category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 155 },
    { name: 'Cracked coolant housing',                    category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 95 },
    { name: 'Civilian medical kit — partial',             category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 110 },
    { name: 'Coolant manifold — intact',                  category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 210 },
    { name: 'Settlement community archive — partial',     category: 'Settlement', rarity: 'Uncommon',  condition: 'Used', otisValue: 130 },
    { name: 'Pressure suit fragment — marked',            category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 115 },
    { name: 'Decommissioned beacon housing',              category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 180 },
    // Rare (otisValue 300–650)
    { name: 'Pre-collapse data crystal',                  category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 580 },
    { name: 'Fused relay core — pre-collapse',            category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 440 },
    { name: 'Encrypted data slate',                       category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 360 },
    { name: 'Autonomous drone chassis — inert',           category: 'Industrial', rarity: 'Rare',      condition: 'Used', otisValue: 310 },
    // Anomalous (otisValue 0 — OTIS cannot assess; reserve range 400–2000)
    { name: 'Unidentified alloy fragment',                category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
    { name: 'Pressurized canister — unknown contents',    category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
    { name: 'Ceramic figure — no catalogue match',        category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
];

function buildManifestSummary(manifest) {
    const n = manifest.length;
    const categories = [...new Set(manifest.map(i => i.category))];
    const highest = manifest.reduce((best, i) => (i.otisValue > best.otisValue ? i : best), manifest[0]);
    return `Barge inbound. Manifest: ${n} items. Categories: ${categories.join(', ')}. Notable: ${highest.name}.`;
}

const TRIGGERS = {
    LOGIN: 'LOGIN',
    TOAST: 'TOAST',
    ITEM_SCAN: 'ITEM_SCAN',
    CONSULT_DEBT: 'CONSULT_DEBT',
    CONSULT_DAY: 'CONSULT_DAY',
    CONSULT_STATUS: 'CONSULT_STATUS',
    CONSULT_VALUE: 'CONSULT_VALUE',
    CONSULT_WHATIS: 'CONSULT_WHATIS',
    CONSULT_WORTH: 'CONSULT_WORTH',
    CONSULT_GEORGE: 'CONSULT_GEORGE',
    DECLARE_KEEP: 'DECLARE_KEEP',
    DECLARE_SCRAP: 'DECLARE_SCRAP',
    DECLARE_SELL: 'DECLARE_SELL',
    DECLARATION_OTIS: 'DECLARATION_OTIS',
    DECLARATION_RESERVE: 'DECLARATION_RESERVE',
    DECLARATION_NORESERVE: 'DECLARATION_NORESERVE',
    SCRAP_DISPATCH: 'SCRAP_DISPATCH',
    BARGE_IMMINENT: 'BARGE_IMMINENT',
    PAYMENT: 'PAYMENT',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_MISSED: 'PAYMENT_MISSED',
    RECOGNITION_BONUS: 'RECOGNITION_BONUS',
    RESERVE_EXPIRED: 'RESERVE_EXPIRED',
    KEEP: 'KEEP',
    SCRAP: 'SCRAP',
    COMMS: 'COMMS',
    COMMS_BANK: 'COMMS_BANK',
    COMMS_SVEN: 'COMMS_SVEN',
    COMMS_IGNORE_SVEN: 'COMMS_IGNORE_SVEN',
    COMMS_COMPLAINT: 'COMMS_COMPLAINT',
    COMMS_MAY: 'COMMS_MAY',
    SELL_FROM_LOG: 'SELL_FROM_LOG',
    DROP_COMPLETE: 'DROP_COMPLETE',
    DAY_TICK: 'DAY_TICK',
    ZONE_SYSTEMS: 'ZONE_SYSTEMS',
    LOGOFF: 'LOGOFF',
    ARREARS_NOTICE: 'ARREARS_NOTICE',
    ARREARS_WARNING: 'ARREARS_WARNING',
    ARREARS_CLEARED: 'ARREARS_CLEARED',
    ARREARS_CRITICAL: 'ARREARS_CRITICAL',
};

class GameState {
    constructor() {
        this.state = {
            debt: 25000,
            credits: 200,
            day: 1,
            paymentDue: 650,
            daysUntilPayment: TIMING.PAYMENT_CYCLE_DAYS,
            sessionHours: 0,
            namingTier: 0,
            skipCount: 0,
            act: 1,
            scrapFill: 0,
            keepLog: [],
            shippingQueue: [],
            recentEvents: [],
            dropActive: false,
            bargeActive: false,
            dropItemsRemaining: 0,
            manifestItems: [],
            outstandingDebt: 0,
            missedPayments: 0,
            daysUntilNextDrop: TIMING.DAYS_BETWEEN_DROPS,
        };
        this._sessionStart = null;
        this._sessionTimer = null;
        this._dayTimer = null;
    }

    init() {
        if (typeof stateManager !== 'undefined' && stateManager.load()) {
            const loaded = stateManager.getState();
            this.state = {
                debt: loaded.debt ?? 25000,
                credits: loaded.credits ?? 200,
                day: loaded.day || 1,
                paymentDue: loaded.paymentDue ?? 650,
                daysUntilPayment: loaded.daysUntilPayment ?? TIMING.PAYMENT_CYCLE_DAYS,
                sessionHours: loaded.sessionHours || 0,
                namingTier: loaded.namingTier || 0,
                skipCount: loaded.skipCount || 0,
                act: loaded.act || 1,
                scrapFill: loaded.scrapFill || 0,
                keepLog: loaded.keepLog || [],
                shippingQueue: loaded.shippingQueue || [],
                recentEvents: loaded.recentEvents || [],
                dropActive: loaded.dropActive || false,
                bargeActive: loaded.bargeActive || false,
                dropItemsRemaining: loaded.dropItemsRemaining || 0,
                manifestItems: loaded.manifestItems || [],
                outstandingDebt: loaded.outstandingDebt ?? 0,
                missedPayments: loaded.missedPayments ?? 0,
                daysUntilNextDrop: loaded.daysUntilNextDrop ?? TIMING.DAYS_BETWEEN_DROPS,
            };
        }
        this.fire(TRIGGERS.LOGIN);
    }

    startSessionTimer() {
        if (this._sessionTimer) return; // already running
        // sessionHours stores game hours; 1 game hour = 1 real minute.
        // Backdate _sessionStart so elapsed real minutes equals saved sessionHours.
        this._sessionStart = Date.now() - this.state.sessionHours * MS_PER_MINUTE;
        this._sessionTimer = setInterval(() => {
            // Elapsed real minutes = elapsed game hours
            this.state.sessionHours = Math.floor((Date.now() - this._sessionStart) / MS_PER_MINUTE);
            this._updateUI();
        }, MS_PER_MINUTE);
    }

    startDayTimer() {
        if (this._dayTimer) return;
        this._dayTimer = setInterval(() => {
            this.advanceDay();
        }, TIMING.MS_PER_INGAME_DAY);
    }

    stopDayTimer() {
        clearInterval(this._dayTimer);
        this._dayTimer = null;
    }

    advanceDay() {
        this.state.day++;
        this.state.daysUntilPayment = Math.max(0, (this.state.daysUntilPayment || TIMING.PAYMENT_CYCLE_DAYS) - 1);
        this.state.daysUntilNextDrop = Math.max(0, (this.state.daysUntilNextDrop ?? TIMING.DAYS_BETWEEN_DROPS) - 1);

        // Accrue interest on outstanding debt
        if (this.state.outstandingDebt > 0) {
            this.state.outstandingDebt = Math.ceil(this.state.outstandingDebt * 1.05);
            if (this.state.outstandingDebt > 2000) {
                if (typeof appendOTIS === 'function') {
                    appendOTIS('Arrears critical. Functional insolvency threshold reached.', 'ARREARS_CRITICAL');
                }
            } else if (this.state.outstandingDebt > 500) {
                if (typeof appendOTIS === 'function') {
                    appendOTIS('Arrears exceeding 500 credits. Bank protocol flags this as secondary default risk.', 'ARREARS_WARNING');
                }
            }
        }

        this.checkPaymentDue();
        this.checkDropSchedule();
        this._save();
        if (typeof updateAllDisplays === 'function') updateAllDisplays();
    }

    checkPaymentDue() {
        if (this.state.daysUntilPayment <= 0) {
            if (this.state.credits >= 650 && (this.state.outstandingDebt || 0) === 0) {
                // Reset timer — player will be prompted to pay manually
                this.state.daysUntilPayment = TIMING.PAYMENT_CYCLE_DAYS;
                if (typeof appendOTIS === 'function') {
                    appendOTIS('Payment due, Mr. Serling. 650 credits. Make payment when ready.', 'PAYMENT');
                }
            } else {
                this.state.missedPayments = (this.state.missedPayments || 0) + 1;
                this.state.outstandingDebt = (this.state.outstandingDebt || 0) + 650;
                this.state.daysUntilPayment = TIMING.PAYMENT_CYCLE_DAYS;
                if (typeof appendOTIS === 'function') {
                    appendOTIS(`Payment missed. Arrears increased. This is the ${this.state.missedPayments} missed payment, Mr. Serling.`, 'PAYMENT_MISSED');
                }
                if (this.state.missedPayments >= 3) {
                    if (typeof appendOTIS === 'function') {
                        appendOTIS('Three missed payments. Bank initiating foreclosure proceedings.', 'PAYMENT_FAILED');
                    }
                }
            }
        }
    }

    checkDropSchedule() {
        if (this.state.daysUntilNextDrop <= 0 && !this.state.dropActive) {
            if (typeof appendOTIS === 'function') {
                appendOTIS('Barge inbound. Manifest incoming.', 'BARGE_IMMINENT');
            }
            this.state.daysUntilNextDrop = TIMING.DAYS_BETWEEN_DROPS +
                Math.floor(Math.random() * (TIMING.DROP_VARIANCE_DAYS * 2 + 1)) - TIMING.DROP_VARIANCE_DAYS;
            if (typeof triggerBargeArrival === 'function') {
                triggerBargeArrival();
            }
        }
    }

    fire(trigger, payload = {}) {
        this.state.recentEvents = [
            { trigger, payload, at: Date.now() },
            ...this.state.recentEvents,
        ].slice(0, 5);
        this._updateUI();
        this._save();
        return { trigger, payload };
    }

    getNamingLabel() {
        return NAMING_TIERS[Math.min(this.state.namingTier, NAMING_TIERS.length - 1)];
    }

    advanceNamingTier() {
        if (this.state.namingTier < NAMING_TIERS.length - 1) {
            this.state.namingTier++;
            this.fire(TRIGGERS.COMMS, { namingAdvanced: true });
        }
    }

    getFatigueTier() {
        const h = this.state.sessionHours;
        if (h < 12) return 'NONE';
        if (h < 20) return 'LOW';
        if (h < 32) return 'MODERATE';
        if (h < 48) return 'HIGH';
        return 'CRITICAL';
    }

    incrementSkipCount() {
        this.state.skipCount = (this.state.skipCount || 0) + 1;
        this._save();
    }

    addKeepItem(item) {
        this.state.keepLog = [
            { item, day: this.state.day },
            ...this.state.keepLog,
        ].slice(0, 12);
        this.fire(TRIGGERS.KEEP, { item });
    }

    _updateUI() {
        const dayEl = document.getElementById('stat-day');
        const debtEl = document.getElementById('stat-debt');
        const hoursEl = document.getElementById('stat-hours');
        const namingEl = document.getElementById('stat-naming');
        if (dayEl) dayEl.textContent = `Day ${this.state.day}`;
        if (debtEl) debtEl.textContent = `Loan: ${this.state.debt.toLocaleString()} cr`;
        if (hoursEl) hoursEl.textContent = `Session: ${this.state.sessionHours}h`;
        if (namingEl) namingEl.textContent = this.getNamingLabel();

        const ledgerDebtEl = document.getElementById('ledger-debt');
        if (ledgerDebtEl) ledgerDebtEl.textContent = this.state.debt.toLocaleString() + ' cr';

        const creditsEl = document.getElementById('stat-credits');
        if (creditsEl) creditsEl.textContent = `Credits: ${this.state.credits.toLocaleString()} cr`;
        const ledgerCreditsEl = document.getElementById('ledger-credits');
        if (ledgerCreditsEl) ledgerCreditsEl.textContent = this.state.credits.toLocaleString() + ' cr';

        const keepLogEl = document.getElementById('keep-log-list');
        if (keepLogEl) {
            const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            keepLogEl.innerHTML = this.state.keepLog
                .map((k, i) => `<li class="keep-list-item">
                    <span>${_esc(k.name)}</span>
                    <span class="keep-item-meta">${_esc(k.condition || '')} — ${k.otisValue || 0} cr — Day ${k.day}</span>
                    <button class="zone-btn btn-sellback" onclick="handleSellBack(${i})">SELL BACK</button>
                </li>`).join('');
        }

        const keepCountEl = document.getElementById('keep-log-count');
        if (keepCountEl) {
            const n = this.state.keepLog.length;
            keepCountEl.textContent = `${n} / 12`;
            keepCountEl.style.color = n >= 12 ? 'var(--text-danger)' : n >= 10 ? 'var(--text-warn)' : 'var(--text-dim)';
        }
    }

    _save() {
        if (typeof stateManager !== 'undefined') {
            stateManager.setState(this.state);
            stateManager.save();
        }
    }

    initUI() {
        this.init();
        this._updateUI();
    }
}

const gameState = new GameState();