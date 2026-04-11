class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.lowpassFilter = null;
    }

    initialize() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.lowpassFilter = this.audioContext.createBiquadFilter();
        this.lowpassFilter.type = 'lowpass';
        this.lowpassFilter.frequency.setValueAtTime(20000, this.audioContext.currentTime);
        this.lowpassFilter.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    activateMcGuffinFilter() {
        this.lowpassFilter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    }

    deactivateMcGuffinFilter() {
        this.lowpassFilter.frequency.setValueAtTime(20000, this.audioContext.currentTime);
    }
}

const audioManager = new AudioManager();