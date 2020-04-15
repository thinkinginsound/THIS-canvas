class Synthesizer { 
    constructor(waveform, baseFrequency, baseAmp){
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
        this.synthesizer = new Tone.PolySynth(6,Tone.FMSynth,{
            harmonicity : 3 ,
            modulationIndex : 10 ,
            detune : 0 ,
            oscillator : {
            type : "sine"
            } ,
            envelope : {
            attack : 0.01 ,
            decay : 0.01 ,
            sustain : 1 ,
            release : 0.5
            } ,
            modulation : {
            type : "square"
            } ,
            modulationEnvelope : {
            attack : 0.01 ,
            decay : 0.01 ,
            sustain : 1 ,
            release : 0.5
            }
        }).toMaster();
    }
    setFrequency(){

    }

    setAmp(){

    }

    setWaveform(){

    }

    playNote(){
        this.synthesizer.triggerAttackRelease("C3", "4n"); //noteOn
        this.synthesizer.triggerAttackRelease("E3", "4n"); //noteOn
        this.synthesizer.triggerAttackRelease("G3", "4n"); //noteOn
        // this.synthesizer.triggerRelease("C5", "4n"); //NoteOff
    }

    envelope(){
    }
}

export { Synthesizer };