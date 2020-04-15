class Synthesizer { 
    constructor(waveform, baseFrequency, baseAmp){
        $.getJSON("/assets/js/synth_presets/presets.json", (parameters) => {
            this.parameters = parameters;
            this.synthesizer = new Tone.PolySynth(6,Tone.FMSynth,this.parameters[0]).toMaster();
        });
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
        //Change this list to a JSON file.
    }

    setWaveform(waveform){
        this.synthesizer.voices.oscillator = "square";
    }

    //Pass these notes as a list.
    playNote(notes){
        this.synthesizer.triggerAttack(notes[0], "4n"); //noteOn
        this.synthesizer.triggerAttack(notes[1], "4n"); //noteOn
        this.synthesizer.triggerAttack(notes[2], "4n"); //noteOn
    }

    //Make a noteOff Function
    // this.synthesizer.triggerRelease("C5", "4n"); //NoteOff

    envelope(){
        //Make the envelope variable
    }

    //Add effects
}

export { Synthesizer };