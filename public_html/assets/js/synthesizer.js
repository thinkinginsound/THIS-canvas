/*
Purpose: This class contains a synthesizer used to play chords generated in audioClass

Functions:
  - noteOn
  - noteOff
  - noteOnOff

*/


class Synthesizer {
    constructor(waveform, baseFrequency, baseAmp, preset){
        $.getJSON("/assets/js/synth_presets/presets.json", (parameters) => {
            this.parameters = parameters;
            // Verander this.parameters[0] voor een andere preset
            this.synthesizer = new Tone.PolySynth(12,Tone.FMSynth,this.parameters[preset]).toMaster();
            this.reverb = new Tone.JCReverb().toMaster();
            this.delay = new Tone.FeedbackDelay();
            this.chorus = new Tone.Chorus();
            this.delay.connect(this.reverb);
            this.chorus.connect(this.delay);
            this.synthesizer.connect(this.chorus);
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

    envelope(){
        // Make the envelope variable
    }

    noteOnOff(rhythmNote, length){
        //placeholder
    }
}

export { Synthesizer };
