import * as Tone from "tone";

const playArpeggioWithSequence = (notes, interval) => {
  const synth = new Tone.Synth().toDestination();

  const sequence = new Tone.Sequence(
    (time, note) => {
      synth.triggerAttackRelease(note, "8n", time);
    },
    notes, // Notes for the sequence
    interval // Interval between notes (e.g., "8n" for eighth notes)
  );

  sequence.start(0); // Start at 0 seconds
  Tone.Transport.start(); // Start the transport
};


function reproducirArpegiosSecuencialmente(notasTone) {
    const synth = new Tone.Synth().toDestination();
  
    let tiempoInicio = Tone.now();
    notasTone.forEach((notas, index) => {
      notas.forEach(nota => {
        synth.triggerAttackRelease(nota, '8n', tiempoInicio);
        tiempoInicio += 0.5; // Ajusta el tiempo entre notas según sea necesario
      });
    });
  }