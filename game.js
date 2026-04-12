const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;

const NAMING_TIERS = ['Mr. Serling', 'Vernon', 'Vern', 'Buddy', 'Pal', 'Coworker', 'Boss', 'Mr. Serling', 'Oh. You.'];

const MANIFEST_POOL = [
    { name: 'Corroded fuel cell casing', category: 'Industrial', rarity: 'Common', condition: 'Poor', otisValue: 45 },
    { name: 'Partial navigation array', category: 'Vessel', rarity: 'Uncommon', condition: 'Used', otisValue: 180 },
    { name: 'Cracked coolant housing', category: 'Industrial', rarity: 'Common', condition: 'Poor', otisValue: 38 },
    { name: 'Unidentified alloy fragment', category: 'Unknown', rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
    { name: 'Burned circuit board cluster', category: 'Industrial', rarity: 'Common', condition: 'Broken', otisValue: 22 },
    { name: 'Pressurized canister — unknown contents', category: 'Unknown', rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
    { name: 'Pre-collapse data crystal', category: 'Vessel', rarity: 'Rare', condition: 'Excellent', otisValue: 620 },
    { name: 'Personal effects bundle — civilian', category: 'Civilian', rarity: 'Common', condition: 'Used', otisValue: 65 },
    { name: 'Ceramic figure — no catalogue match', category: 'Unknown', rarity: 'Anomalous', condition: 'Excellent', otisValue: 0 },
    { name: 'Decommissioned beacon housing', category: 'Vessel', rarity: 'Uncommon', condition: 'Used', otisValue: 210 },
    { name: 'Bent structural strut', category: 'Industrial', rarity: 'Common', condition: 'Poor', otisValue: 28 },
    { name: 'Civilian medical kit — partial', category: 'Civilian', rarity: 'Uncommon', condition: 'Used', otisValue: 95 },
    { name: 'Fused relay core — pre-collapse', category: 'Vessel', rarity: 'Rare', condition: 'Used', otisValue: 450 },
    { name: 'Settlement water filter — ceramic', category: 'Settlement', rarity: 'Common', condition: 'Poor', otisValue: 32 },
    { name: "Children's toy — unidentified origin", category: 'Civilian', rarity: 'Common', condition: 'Used', otisValue: 55 },
    { name: 'Encrypted data slate', category: 'Vessel', rarity: 'Rare', condition: 'Used', otisValue: 380 },
    { name: 'Coolant manifold — intact', category: 'Industrial', rarity: 'Uncommon', condition: 'Excellent', otisValue: 275 },
    { name: 'Settlement cooking unit — communal', category: 'Settlement', rarity: 'Uncommon', condition: 'Used', otisValue: 120 },
    { name: 'Pressure suit fragment — marked', category: 'Vessel', rarity: 'Uncommon', condition: 'Poor', otisValue: 145 },
    { name: 'Autonomous drone chassis — inert', category: 'Industrial', rarity: 'Rare', condition: 'Broken', otisValue: 190 },
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
};

class GameState {
    constructor() {
        this.state = {
            debt: 25000,
            credits: 0,
            day: 1,
            paymentDue: 650,
            daysUntilPayment: 28,
            sessionHours: 0,
            namingTier: 0,
            skipCount: 0,
            act: 1,
            scrapFill: 0,
            keepLog: [],
            shippingQueue: [],
            recentEvents: [],
            dropActive: false,
            dropItemsRemaining: 0,
            manifestItems: [],
        };
        this._sessionStart = null;
        this._sessionTimer = null;
    }

    init() {
        if (typeof stateManager !== 'undefined' && stateManager.load()) {
            const loaded = stateManager.getState();
            this.state = {
                debt: loaded.debt ?? 25000,
                credits: loaded.credits || 0,
                day: loaded.day || 1,
                paymentDue: loaded.paymentDue ?? 650,
                daysUntilPayment: loaded.daysUntilPayment ?? 28,
                sessionHours: loaded.sessionHours || 0,
                namingTier: loaded.namingTier || 0,
                skipCount: loaded.skipCount || 0,
                act: loaded.act || 1,
                scrapFill: loaded.scrapFill || 0,
                keepLog: loaded.keepLog || [],
                shippingQueue: loaded.shippingQueue || [],
                recentEvents: loaded.recentEvents || [],
                dropActive: loaded.dropActive || false,
                dropItemsRemaining: loaded.dropItemsRemaining || 0,
                manifestItems: loaded.manifestItems || [],
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