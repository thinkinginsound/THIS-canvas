const Tone = require("tone")

class Synthesizer { 
    constructor(waveform, baseFrequency, baseAmp){
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
        this.synthesizer = new Tone.Synth().toMaster();
    }
    setFrequency(){

    }

    setAmp(){

    }

    setWaveform(){

    }

    playNote(){
        this.synthesizer.triggerAttackRelease("C4", "8n");
    }

    envelope(){

    }
}

export { Synthesizer };

// module.exports = {
//     Synthesizer: Synthesizer
// }