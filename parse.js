let fs = require("fs");
let { MidiMarkovSet } = require("./MidiMarkovSet");

fs.readFile('./example.json', 'utf-8', (err, data) => {  
  if (err) throw err;
  let midi = JSON.parse(data);

  const bpm = midi.header.bpm;
  const duration = midi.duration - midi.startTime;
  const numTracks = midi.tracks.length;
  const tracks = midi.tracks;

  console.log('General data:');
  console.log("BPM \n" + bpm);
  console.log("Song duration: " + duration);
  console.log("Number of tracks: " + numTracks);

  tracks.forEach((track) => {
    let noteTable = createNoteTable(track);
  });
});

function createNoteTable(track) {
  const totalNotes = track.notes.length;

  let noteSet = new Set();
  if (track.instrument) {
    track.notes.forEach((note) => {
      noteSet.add(note.midi);
    });
    console.log(track.instrument);
  } 

  let markov = {};
  [...noteSet].sort().forEach((note) => {
    markov[note] = {};
  });

  let counter = 1;
  if (track.notes.length > 0) {
    let prevNote = track.notes[0].midi;
    for (let i = 1; i < track.notes.length; i++) {
      counter++;
      let currentNote = track.notes[i].midi;
      if (typeof markov[prevNote][currentNote] !== 'undefined') {
        markov[prevNote][currentNote]++;
      } else {
        markov[prevNote][currentNote] = 1;
      }
      prevNote = currentNote;
    }
    
    // tfw no es2017
    Object.keys(markov).forEach((midiSet) => {
      convertToPercentage(markov[midiSet]);
    });
    console.log(markov);
    return markov;
  }
}

function convertToPercentage(midiSet) {
  let density = getDensity(midiSet);
  Object.keys(midiSet).forEach((note) => {
    midiSet[note] /= density;
    midiSet[note] *= 100;
    midiSet[note] = roundNum(midiSet[note]);
  });
}

function roundNum(num) {
  return Math.round(num * 100) / 100;
}