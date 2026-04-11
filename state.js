const STATE_KEY = 'deadsignal_state';

class StateManager {
    constructor() {
        this.state = this._defaultState();
    }

    _defaultState() {
        return {
            debt: 0,
            day: 1,
            sessionHours: 0,
            namingTier: 0,
            skipCount: 0,
            act: 1,
            keepLog: [],
            recentEvents: [],
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