import * as Tone from "tone";

export const playArpeggioWithSequence = (notes, interval) => {
  const synth = new Tone.Synth().toDestination();

  const sequence = new Tone.Sequence(
    (time, note) => {
      synth.triggerAttackRelease(note, "8n", time);
    },
    notes,
    interval
  );

  sequence.start(0);
  Tone.Transport.start();
};

export function playArpeggiosSequentially(toneNotes) {
    const synth = new Tone.Synth().toDestination();
  
    let startTime = Tone.now();
    toneNotes.forEach((notes) => {
      notes.forEach(note => {
        synth.triggerAttackRelease(note, '8n', startTime);
        startTime += 0.5; // Adjust time between notes as needed
      });
    });
}
