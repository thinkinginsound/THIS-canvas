/*
Purpose: This class contains a synthesizer used to play chords generated in audioClass

Functions:
  - noteOn
  - noteOff
  - noteOnOff

*/

class Synthesizer {
    constructor(synthType,preset){
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
                "volume" : -20,
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
                    "decay" : 0.075 ,
                    "sustain" : 0.0,
                    "release" : 0.1
                }
            },
            {
                "volume" : -3,
                "oscillator" : {
                    "type" : "sine"
                } ,
                "envelope" : {
                    "attack" : 0.01 ,
                    "decay" : 0.25 ,
                    "sustain" : 0.0,
                    "release" : 0.1
                }
            }
        ];
        this.synthType = synthType;
        // Verander this.parameters[0] voor een andere preset
        if(synthType == "chords"){
            this.synthesizer = new Tone.PolySynth(12,Tone.FMSynth,this.parameters[preset]).toMaster();
            this.reverb = new Tone.JCReverb().toMaster();
            this.delay = new Tone.FeedbackDelay();
            this.chorus = new Tone.Chorus();
            this.delay.connect(this.reverb);
            this.chorus.connect(this.delay);
            this.synthesizer.connect(this.chorus);
        } 
        if(synthType == "rhythm"){
            this.synthesizer = new Tone.NoiseSynth(this.parameters[preset]).toMaster();
        }
        if(synthType == "drum"){
            this.synthesizer = new Tone.MonoSynth(this.parameters[preset]).toMaster();
        }
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
          if(this.synthType == "drum")this.synthesizer.triggerAttackRelease("G2", "8n");
          if(this.synthType == "rhythm")this.synthesizer.triggerAttackRelease("8n");
      }
    }
}

export { Synthesizer };
