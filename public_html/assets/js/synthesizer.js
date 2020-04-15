class Synthesizer { 
    constructor(waveform, baseFrequency, baseAmp){
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
        this.synthesizer = new Tone.FMSynth().toMaster();
        // this.gainNode = Tone.context.createGain();
        // this.env;
    }
    setFrequency(){

    }

    setAmp(){

    }

    setWaveform(){

    }

    playNote(){
        this.synthesizer.triggerRelease("C5", "4n");
    }

    envelope(){
        // env = new Tone.Envelope ({
        //     "attack" : 0.1,
        //     "decay" : 0.2,
        //     "sustain" : 1,
        //     "release" : 0.8,
        // });
        // env.connect(gainNode.gain);
    }
}

export { Synthesizer };