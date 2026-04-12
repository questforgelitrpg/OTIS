const STATE_KEY = 'deadsignal_state';

class StateManager {
    constructor() {
        this.state = this._defaultState();
    }

    _defaultState() {
        return {
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
            savedAt: null,
        };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    getState() {
        return this.state;
    }

    addRecentEvent(event) {
        this.state.recentEvents = [event, ...this.state.recentEvents].slice(0, 5);
    }

    addCredits(amount) {
        this.state.credits += amount;
        this.save();
    }

    deductCredits(amount) {
        this.state.credits = Math.max(0, this.state.credits - amount);
        this.save();
    }

    advanceDay() {
        this.state.day++;
        this.state.daysUntilPayment = Math.max(0, (this.state.daysUntilPayment || 28) - 1);
        this.checkPaymentDue();
        this.save();
    }

    checkPaymentDue() {
        if (this.state.daysUntilPayment <= 0) {
            this.state.daysUntilPayment = 28;
        }
    }

    getNamingLabel() {
        const tiers = ['Mr. Serling', 'Vernon', 'Vern', 'Buddy'];
        return tiers[Math.min(this.state.namingTier, tiers.length - 1)];
    }

    save() {
        this.state.savedAt = Date.now();
        localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    }

    load() {
        const raw = localStorage.getItem(STATE_KEY);
        if (raw) {
            try {
                this.state = { ...this._defaultState(), ...JSON.parse(raw) };
                return true;
            } catch (e) {
                console.warn('Failed to load saved state:', e);
            }
        }
        return false;
    }

    clearSave() {
        localStorage.removeItem(STATE_KEY);
        this.state = this._defaultState();
    }
}

const stateManager = new StateManager();