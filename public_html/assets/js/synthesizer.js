const tone = require("tone")

class Synthesizer { 
    constructor(waveform, baseFrequency, baseAmp){
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
        this.synthesizer = new tone.Synth().toMaster();
    }
    setFrequency(){

    }

    setAmp(){

    }

    setWaveform(){

    }

    playNote(){
        synth.triggerAttackRelease("C4", "8n");
    }

    envelope(){

    }
}

module.exports = {
    Synthesizer: Synthesizer
}

syth = new Synthesizer("saw",500,1);
syth.playNote();