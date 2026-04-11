const MS_PER_MINUTE = 60000;

const NAMING_TIERS = ['Mr. Serling', 'Vern', 'Buddy'];

const TRIGGERS = {
    LOGIN: 'LOGIN',
    TOAST: 'TOAST',
    ITEM_SCAN: 'ITEM_SCAN',
    CONSULT_DEBT: 'CONSULT_DEBT',
    CONSULT_DAY: 'CONSULT_DAY',
    CONSULT_STATUS: 'CONSULT_STATUS',
    DECLARE_KEEP: 'DECLARE_KEEP',
    DECLARE_SCRAP: 'DECLARE_SCRAP',
    KEEP: 'KEEP',
    SCRAP: 'SCRAP',
    COMMS: 'COMMS',
    LOGOFF: 'LOGOFF',
};

class GameState {
    constructor() {
        this.state = {
            debt: 0,
            day: 1,
            sessionHours: 0,
            namingTier: 0,
            skipCount: 0,
            act: 1,
            keepLog: [],
            recentEvents: [],
        };
        this._sessionStart = Date.now();
        this._sessionTimer = null;
    }

    init() {
        if (typeof stateManager !== 'undefined' && stateManager.load()) {
            const loaded = stateManager.getState();
            this.state = {
                debt: loaded.debt || 0,
                day: loaded.day || 1,
                sessionHours: loaded.sessionHours || 0,
                namingTier: loaded.namingTier || 0,
                skipCount: loaded.skipCount || 0,
                act: loaded.act || 1,
                keepLog: loaded.keepLog || [],
                recentEvents: loaded.recentEvents || [],
            };
        }
        this._startSessionTimer();
        this.fire(TRIGGERS.LOGIN);
    }

    _startSessionTimer() {
        this._sessionStart = Date.now();
        this._sessionTimer = setInterval(() => {
            const elapsed = (Date.now() - this._sessionStart) / (MS_PER_MINUTE * 60);
            this.state.sessionHours = parseFloat(elapsed.toFixed(2));
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
        if (h < 1) return 'FRESH';
        if (h < 2) return 'TIRED';
        if (h < 3) return 'WORN';
        return 'SPENT';
    }

    addKeepItem(item) {
        this.state.keepLog = [
            { item, day: this.state.day },
            ...this.state.keepLog,
        ].slice(0, 20);
        this.fire(TRIGGERS.KEEP, { item });
    }

    _updateUI() {
        const dayEl = document.getElementById('stat-day');
        const debtEl = document.getElementById('stat-debt');
        const hoursEl = document.getElementById('stat-hours');
        const namingEl = document.getElementById('stat-naming');
        if (dayEl) dayEl.textContent = `Day ${this.state.day}`;
        if (debtEl) debtEl.textContent = `Debt: ${this.state.debt}%`;
        if (hoursEl) hoursEl.textContent = `Session: ${this.state.sessionHours}h`;
        if (namingEl) namingEl.textContent = this.getNamingLabel();

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