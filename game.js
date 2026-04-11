const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;

const NAMING_TIERS = ['Mr. Serling', 'Vernon', 'Vern', 'Buddy', 'Pal', 'Coworker', 'Boss', 'Mr. Serling', 'Oh. You.'];

const TRIGGERS = {
    LOGIN: 'LOGIN',
    TOAST: 'TOAST',
    ITEM_SCAN: 'ITEM_SCAN',
    CONSULT_DEBT: 'CONSULT_DEBT',
    CONSULT_DAY: 'CONSULT_DAY',
    CONSULT_STATUS: 'CONSULT_STATUS',
    CONSULT_VALUE: 'CONSULT_VALUE',
    CONSULT_NOTELLING: 'CONSULT_NOTELLING',
    DECLARE_KEEP: 'DECLARE_KEEP',
    DECLARE_SCRAP: 'DECLARE_SCRAP',
    DECLARE_SELL: 'DECLARE_SELL',
    SCRAP_DISPATCH: 'SCRAP_DISPATCH',
    BARGE_IMMINENT: 'BARGE_IMMINENT',
    PAYMENT: 'PAYMENT',
    KEEP: 'KEEP',
    SCRAP: 'SCRAP',
    COMMS: 'COMMS',
    LOGOFF: 'LOGOFF',
};

class GameState {
    constructor() {
        this.state = {
            debt: 25000,
            credits: 0,
            day: 1,
            sessionHours: 0,
            namingTier: 0,
            skipCount: 0,
            act: 1,
            keepLog: [],
            recentEvents: [],
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
                sessionHours: loaded.sessionHours || 0,
                namingTier: loaded.namingTier || 0,
                skipCount: loaded.skipCount || 0,
                act: loaded.act || 1,
                keepLog: loaded.keepLog || [],
                recentEvents: loaded.recentEvents || [],
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
            keepLogEl.innerHTML = this.state.keepLog.slice(0, 10)
                .map(k => `<li>[Day ${k.day}] ${k.item}</li>`)
                .join('');
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