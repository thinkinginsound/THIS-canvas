/*
Purpose: This class contains a synthesizer used to play chords generated in audioClass

Functions:
  - noteOn
  - noteOff
  - noteOnOff

*/

class Synthesizer {
    constructor(waveform, baseFrequency, baseAmp, preset){
        this.parameters = [
            {
                "volume" : -30,
                "harmonicity" : 3 ,
                "modulationIndex" : 2,
                "oscillator" : {
                    "type" : "sine"
                } ,
                "envelope" : {
                    "attack" : 0.5 ,
                    "decay" : 0.01 ,
                    "sustain" : 1 ,
                    "release" : 1
                } ,
                "modulation" : {
                    "type" : "square"
                } ,
                "modulationEnvelope" : {
                    "attack" : 0.5 ,
                    "decay" : 0.01 ,
                    "sustain" : 1 ,
                    "release" : 1
                }
            },
            {
                "noise" : {
                    "type" : "white"
                } ,
                "envelope" : {
                    "attack" : 0.005 ,
                    "decay" : 0.25 ,
                    "sustain" : 0,
                    "release" : 0.25
                }
                },
            {
                "volume" : -20,
                "harmonicity" : 10,
                "detune" : 0 ,
                "Tone.noise" : {
                    "type" : "brown",
                    "playbackrate" : 1,
                    "min" : 800,
        	          "max" : 15000
                } ,
                "envelope" : {
                    "attack" : 0.01 ,
                    "decay" : 0.01 ,
                    "sustain" : 0.3,
                    "release" : 0.1
                }
            },
            {
                "volume" : -30,
                "harmonicity" : 10 ,
                "modulationIndex" : 10 ,
                "detune" : 0 ,
                "oscillator" : {
                    "type" : "sine"
                } ,
                "envelope" : {
                    "attack" : 0.01 ,
                    "decay" : 0.01 ,
                    "sustain" : 1 ,
                    "release" : 0.5
                } ,
                "modulation" : {
                    "type" : "square"
                } ,
                "modulationEnvelope" : {
                    "attack" : 0.01 ,
                    "decay" : 0.01 ,
                    "sustain" : 1 ,
                    "release" : 0.5
                }
            }
        ];

        // Verander this.parameters[0] voor een andere preset
        this.synthesizer = new Tone.PolySynth(12,Tone.FMSynth,this.parameters[preset]).toMaster();
        this.reverb = new Tone.JCReverb().toMaster();
        this.delay = new Tone.FeedbackDelay();
        this.chorus = new Tone.Chorus();
        this.delay.connect(this.reverb);
        this.chorus.connect(this.delay);
        this.synthesizer.connect(this.chorus);
        this.waveform = waveform;
        this.baseFrequency = baseFrequency;
        this.baseAmp = baseAmp;
    }

    setWaveform(waveform){
        this.synthesizer.voices.oscillator = waveform;
    }

    // Pass these notes as a list.
    noteOn(notes){
        if(this.synthesizer !== undefined){
            this.synthesizer.triggerAttack(notes);
        }
    }

    noteOff(notes){
        if(this.synthesizer !== undefined){
            this.synthesizer.triggerRelease(notes);
        }
    }

    noteOnOff(notes, duration){
      if(Tone.context.state !== 'running')return
      if(this.synthesizer != undefined){
          this.synthesizer.triggerAttackRelease(notes, duration);
      }
    }

    noteOffAll(){
      if(this.synthesizer !== undefined){
        this.synthesizer.releaseAll();
      }
    }

    envelope(){
        // Make the envelope variable
    }

    noteOnOff(rhythmNote, length){
        //placeholder
    }
}

export { Synthesizer };
