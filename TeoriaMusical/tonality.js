import Arpeggio from './arpeggio'
import { ArpeggioTypes, Notes, ScaleHarmonization, MinorScaleHarmonizationChords, MajorScaleHarmonizationChords, HarmonizationType } from './musicTheory'

export default class Tonality {
    constructor(tonic) {
        this.tonality = {
            I: { value: 1, name: "I", code: "" },
            IIm: { value: 2, name: "IIm", code: "" },
            II: { value: 3, name: "II", code: "" },
            IIIm: { value: 4, name: "IIIm", code: "" },
            III: { value: 5, name: "III", code: "" },
            IV: { value: 6, name: "IV", code: "" },
            Vm: { value: 7, name: "Vm", code: "" },
            V: { value: 8, name: "V", code: "" },
            VIm: { value: 9, name: "VIm", code: "" },
            VI: { value: 10, name: "VI", code: "" },
            VIIm: { value: 11, name: "VIIm", code: "" },
            VII: { value: 12, name: "VII", code: "" },
        }
        this.tonic = tonic;
        this.setTonality(tonic, this.tonality)
    };

    getHarmony = (harmonyDegrees) => {
        var newHarmony = []
        harmonyDegrees.forEach(degree => {
            newHarmony.push(this.tonality[degree]);
        });
        return newHarmony;
    }

    getPosition = (positionNumber) => {
        var nextTonality = this;
        for (let index = 1; index < positionNumber; index++) {
            nextTonality = new Tonality(Notes[nextTonality.tonality["V"].code]);
        }
        return nextTonality;
    }

    getPositionFromTone = (note) => {
        var nextTonality = this;
        for (let index = 1; index < 13; index++) {
            if (nextTonality.tonality["I"].code == note) return (index);
            nextTonality = new Tonality(Notes[nextTonality.tonality["V"].code]);
        }
    }

    getScaleHarmonization = (mode) => {
        var tonalityScaleHarmonization = [];
        for (let index = 0; index < 7; index++) {
            var degree = ScaleHarmonization[index];
            var tonic = this.tonality[degree];
            var note = Notes[tonic.code];
            var arpeggioType = mode == HarmonizationType.Minor.value ? MinorScaleHarmonizationChords[index] : MajorScaleHarmonizationChords[index];
            var correspondingArpeggio = new Arpeggio(arpeggioType, note);
            tonalityScaleHarmonization.push(correspondingArpeggio);
        }
        return tonalityScaleHarmonization;
    }


    setTonality = (harmonicaTonality, harmonicaProgression) => {
        if (!harmonicaTonality || !harmonicaProgression) {
            console.error('Invalid harmonicaTonality or harmonicaProgression');
            return;
        }

        var interval = harmonicaTonality.value;
        if (interval === undefined) {
            console.error('Invalid harmonicaTonality: missing value property');
            return;
        }

        for (let index = 1; index < 13; index++) {
            var harmonyDegree = this.getHarmonyDegree(index, harmonicaProgression);
            if (!harmonyDegree) {
                console.error(`Invalid harmonyDegree for index ${index}`);
                continue;
            }

            var note = this.getNote(interval);
            if (!note) {
                console.error(`Invalid note for interval ${interval}`);
                continue;
            }

            harmonyDegree.code = note ? note.code : "";
            interval == Notes.B.value ? interval = Notes.C.value : interval += 1;
        }
    }

    getHarmonyDegree = (interval, harmonicaProgression) => {
        return Object.values(harmonicaProgression).filter(function (e) { return e.value == interval })[0];
    }

    getNote = (interval) => {
        return Object.values(Notes).filter(function (e) { return e.value == interval })[0];
    }
}
