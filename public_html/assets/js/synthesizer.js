class Synthesizer {
    constructor(waveform, baseFrequency, baseAmp){
        $.getJSON("/assets/js/synth_presets/presets.json", (parameters) => {
            this.parameters = parameters;
            // Verander this.parameters[0] voor een andere preset
            this.synthesizer = new Tone.PolySynth(12,Tone.FMSynth,this.parameters[0]).toMaster();
            this.verb = new Tone.Freeverb(1,3000).toMaster();
            this.verb.dampening.value = 2500;
            this.synthesizer.connect(this.verb);
        });
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
    }

    setWaveform(waveform){
        this.synthesizer.voices.oscillator = waveform;
    }

    // Pass these notes as a list.
    noteOn(notes){
        if(this.synthesizer != undefined){
            this.synthesizer.triggerAttack(notes);
        }
    }

    noteOff(notes){
        if(this.synthesizer != undefined){
            this.synthesizer.triggerRelease(notes);
        }
    }

    envelope(){
        // Make the envelope variable
    }

    // Add effects
}

export { Synthesizer };
