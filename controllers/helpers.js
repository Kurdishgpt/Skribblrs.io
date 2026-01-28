/* global MAX_POINTS, round, games */
const { readFileSync } = require('fs');
const Chance = require('chance');
const GraphemeSplitter = require('grapheme-splitter');

const chance = new Chance();
const splitter = new GraphemeSplitter();
const words = JSON.parse(readFileSync('words.json').toString('utf-8'));

function getScore(startTime, roundtime) {
    const now = Date.now() / 1000;
    const elapsedTime = now - startTime;
    const roundTime = roundtime / 1000;
    return Math.floor(((roundTime - elapsedTime) / roundTime) * MAX_POINTS);
}

function populateDisplayTime(hints, roomID) {
    const roundTime = games[roomID].time;
    const startTime = Math.floor(roundTime / 2);
    const hintInterval = Math.floor(startTime / hints.length);
    return hints.map((hint, i) => ({
        hint,
        displayTime: Math.floor((startTime - (i * hintInterval)) / 1000),
    }));
}

function getHints(word, roomID) {
    let hints = [];
    const wordLength = splitter.countGraphemes(word);
    const hintsCount = games[roomID].hints || 0;
    if (hintsCount === 0) return [];
    
    const graphemes = splitter.splitGraphemes(word);
    let prevHint = graphemes.map((char) => (char !== ' ' ? '_' : ' '));
    
    // Determine how many letters to reveal. Let's say we reveal up to hintsCount letters.
    // We want to generate a sequence of hints where each hint reveals one more letter.
    const revealIndices = [];
    for (let i = 0; i < wordLength; i++) {
        if (graphemes[i] !== ' ') revealIndices.push(i);
    }
    
    const pickedIndices = chance.pickset(revealIndices, Math.min(hintsCount, revealIndices.length));
    
    pickedIndices.forEach((pos) => {
        prevHint[pos] = graphemes[pos];
        hints.push(prevHint.join(''));
    });
    
    return populateDisplayTime(hints, roomID);
}

function wait(roomID, drawer, ms) {
    return new Promise((resolve, reject) => {
        round.on('everybodyGuessed', ({ roomID: callerRoomID }) => {
            if (callerRoomID === roomID) resolve();
        });
        drawer.on('disconnect', (err) => reject(err));
        setTimeout(() => resolve(true), ms);
    });
}

function get3Words(roomID) {
    const { probability: p, wordCount } = games[roomID];
    const language = games[roomID].language.toLowerCase();
    
    let availableWords = words[language];
    if (wordCount > 0) {
        availableWords = availableWords.filter(w => splitter.countGraphemes(w) === wordCount);
        // Fallback if no words match the count
        if (availableWords.length < 3) availableWords = words[language];
    }

    if (games[roomID].customWords.length < 3) return chance.pickset(availableWords, 3);
    
    const pickedWords = new Set();
    while (pickedWords.size !== 3) {
        const wordSet = chance.weighted([availableWords, games[roomID].customWords], [1 - p, p]);
        pickedWords.add(chance.pickone(wordSet));
    }
    return Array.from(pickedWords);
}

function getPlayersCount(roomID) {
    return Object.keys(games[roomID]).filter((key) => key.length === 20).length;
}

module.exports = {
    getScore,
    getHints,
    wait,
    get3Words,
    getPlayersCount,
};
