class StateManager {
    constructor() {
        this.state = {};
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    getState() {
        return this.state;
    }
}

module.exports = StateManager;