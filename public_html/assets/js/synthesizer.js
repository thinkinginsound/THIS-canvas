class Synthesizer {
    constructor(waveform, baseFrequency, baseAmp){
        $.getJSON("/assets/js/synth_presets/presets.json", (parameters) => {
            this.parameters = parameters;
            // Verander this.parameters[0] voor een andere preset
            this.synthesizer = new Tone.PolySynth(6,Tone.FMSynth,this.parameters[0]).toMaster();
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
            notes.forEach((note) => {
                this.synthesizer.triggerAttack(note, "4n");
            });
        }
    }

    noteOff(notes){
        if(this.synthesizer != undefined){
            notes.forEach((note) => {
                this.synthesizer.triggerRelease(note, "4n");
            });
        }
    }

    envelope(){
        // Make the envelope variable
    }

    // Add effects
}

export { Synthesizer };
