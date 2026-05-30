/* ============================================
   Happy Birthday Adellia — script.js
   Mobile-safe version (fixed all known bugs)
   ============================================ */

// ======= PAUSE WHEN TAB HIDDEN (memory leak fix) =======
let appPaused = false;
document.addEventListener('visibilitychange', () => {
    appPaused = document.hidden;
    // Pause audio context when tab is hidden
    if (appPaused && audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
    } else if (!appPaused && audioCtx && audioCtx.state === 'suspended' && isPlaying) {
        audioCtx.resume();
    }
});

// ======= STARS BACKGROUND =======
const starsContainer = document.getElementById('stars-container');
// Fewer stars on mobile to save CPU
const starCount = window.innerWidth < 500 ? 40 : 80;
for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    // Use % instead of vw/vh to avoid iOS scrollbar overflow
    star.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        --dur:${(Math.random() * 3 + 2).toFixed(2)}s;
        --delay:${(Math.random() * 4).toFixed(2)}s;
    `;
    starsContainer.appendChild(star);
}

// ======= FALLING PARTICLES (rate-limited) =======
const particleEmojis = ['❤️','💕','💖','💗','✨','🌸','💓','💞','⭐','💝'];
const particlesBg = document.getElementById('particles-bg');
let particleCount = 0;
const MAX_PARTICLES = 15; // cap to avoid DOM bloat on low-end phones

function createParticle() {
    if (appPaused) return;
    if (particleCount >= MAX_PARTICLES) return;
    particleCount++;
    const p = document.createElement('div');
    p.className = 'particle';
    p.innerText = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
    const dur = (Math.random() * 3 + 4).toFixed(2);
    // Use % for left to avoid iOS horizontal overflow
    p.style.cssText = `
        left:${Math.random() * 96}%;
        font-size:${(Math.random() * 10 + 12).toFixed(1)}px;
        animation-duration:${dur}s;
    `;
    particlesBg.appendChild(p);
    setTimeout(() => {
        p.remove();
        particleCount--;
    }, parseFloat(dur) * 1000 + 200);
}

setInterval(createParticle, 900);
setInterval(createParticle, 1600);

// ======= PUZZLE LOGIC =======
const correctAnswer = "20JUNI2024";
let currentAnswer = "";
const pieces = ["2","0","J","U","N","I","2","0","2","4"];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let shuffledPieces = shuffle(pieces);

function renderPieces() {
    const container = document.getElementById('puzzle-pieces');
    container.innerHTML = '';
    shuffledPieces.forEach((piece) => {
        const btn = document.createElement('button'); // button not span — better for touch
        btn.className = 'puzzle-piece';
        btn.type = 'button';
        btn.innerText = piece;
        // touchstart for instant response on mobile (no 300ms delay)
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // prevent ghost click
            selectPiece(piece, btn);
        }, { passive: false });
        btn.addEventListener('click', () => selectPiece(piece, btn));
        container.appendChild(btn);
    });
}

function selectPiece(piece, btnEl) {
    if (btnEl.classList.contains('used')) return;
    if (currentAnswer.length >= correctAnswer.length) return;
    currentAnswer += piece;
    document.getElementById('puzzle-answer').innerText = currentAnswer;
    btnEl.classList.add('used');
    if (currentAnswer.length === correctAnswer.length) checkAnswer();
}

function checkAnswer() {
    const resultEl = document.getElementById('puzzle-result');
    if (currentAnswer === correctAnswer) {
        resultEl.innerText = '✓ Benar! Kita jadian 20 Juni 2024 💕';
        resultEl.className = 'puzzle-result correct';
        document.getElementById('btn-gift').disabled = false;
    } else {
        resultEl.innerText = '✗ Hmm, coba lagi ya!';
        resultEl.className = 'puzzle-result wrong';
        setTimeout(() => resetPuzzle(), 900);
    }
}

function resetPuzzle() {
    currentAnswer = '';
    document.getElementById('puzzle-answer').innerText = '';
    const resultEl = document.getElementById('puzzle-result');
    if (resultEl.classList.contains('correct')) return;
    resultEl.innerText = '';
    resultEl.className = 'puzzle-result';
    shuffledPieces = shuffle(pieces);
    renderPieces();
}

renderPieces();

// ======= MODAL =======
document.getElementById('btn-gift').addEventListener('click', () => {
    document.getElementById('gift-overlay').classList.add('active');
    launchConfetti();
});

document.getElementById('close-gift').addEventListener('click', () => {
    document.getElementById('gift-overlay').classList.remove('active');
});

document.getElementById('gift-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('gift-overlay')) {
        document.getElementById('gift-overlay').classList.remove('active');
    }
});

// ======= CONFETTI (reduced on mobile) =======
function launchConfetti() {
    const colors = ['#e8527a','#c9a84c','#4ecba0','#f9a8c1','#f0d080','#ffffff'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const count = window.innerWidth < 500 ? 25 : 50; // fewer on mobile

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.cssText = `
                left:${cx}px;top:${cy}px;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
                --tx:${((Math.random() - 0.5) * (window.innerWidth * 0.9)).toFixed(0)}px;
                --ty:${((Math.random() - 0.5) * 400 - 100).toFixed(0)}px;
            `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 1100);
        }, i * 20);
    }
}

// ======================================================
// MUSIC PLAYER — Web Audio API (mobile-safe)
// iOS Safari: AudioContext MUST be created inside a
// direct user gesture handler (touchstart / click).
// ======================================================

let audioCtx    = null;
let isPlaying   = false;
let masterGain  = null;
let schedulerTimer = null;
let nextNoteTime   = 0;

const BPM  = 76;
const BEAT = 60 / BPM;          // seconds per beat
const BAR  = 4 * BEAT;           // seconds per bar
const LOOP_BEATS = 16;           // 4 bars per loop
const LOOP_SEC   = LOOP_BEATS * BEAT;
const LOOKAHEAD  = LOOP_SEC * 1.5; // schedule 1.5 loops ahead
const TICK_MS    = (LOOP_SEC / 2) * 1000; // check every half-loop

const CHORDS = [
    { root: 261.63, third: 329.63, fifth: 392.00 }, // C
    { root: 196.00, third: 246.94, fifth: 293.66 }, // G
    { root: 220.00, third: 261.63, fifth: 329.63 }, // Am
    { root: 174.61, third: 220.00, fifth: 261.63 }, // F
];

const MELODY = [
    [392.00, 0.0],[440.00, 0.5],[523.25, 1.0],[440.00, 1.5],
    [392.00, 2.0],[349.23, 2.75],[392.00, 3.25],
    [392.00, 4.0],[440.00, 4.5],[392.00, 5.0],[349.23, 5.5],
    [329.63, 6.0],[293.66, 6.75],
    [329.63, 8.0],[349.23, 8.5],[392.00, 9.0],[440.00, 9.5],
    [523.25,10.0],[440.00,10.75],[392.00,11.25],
    [349.23,12.0],[392.00,12.5],[440.00,13.0],[349.23,13.5],
    [329.63,14.0],[293.66,15.0],
];

function createAudioContext() {
    // Cross-browser: standard + webkit prefix
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
}

function playNote(freq, startTime, duration, type, vol, detune) {
    if (!audioCtx || audioCtx.state === 'closed') return;
    type   = type   || 'sine';
    vol    = vol    || 0.15;
    detune = detune || 0;

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (detune) osc.detune.setValueAtTime(detune, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.04);
    gain.gain.linearRampToValueAtTime(vol * 0.6, startTime + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    // Guard: don't schedule notes that already passed
    const safeStart = Math.max(startTime, audioCtx.currentTime);
    try {
        osc.start(safeStart);
        osc.stop(safeStart + duration + 0.05);
    } catch(e) { /* ignore already-stopped errors */ }
}

function scheduleLoop(t0) {
    if (!audioCtx || audioCtx.state === 'closed') return;

    // Pad chords
    for (let bar = 0; bar < 4; bar++) {
        const ch = CHORDS[bar];
        const t  = t0 + bar * BAR;
        [ch.root, ch.third, ch.fifth, ch.root * 2].forEach(freq => {
            playNote(freq, t, BAR - 0.1, 'sine', 0.04, (Math.random() * 4 - 2));
        });
    }
    // Arpeggio
    for (let b = 0; b < LOOP_BEATS; b++) {
        const ch = CHORDS[Math.floor(b / 4)];
        const notes = [ch.root, ch.third, ch.fifth, ch.third];
        const t = t0 + b * BEAT;
        notes.forEach((freq, i) => {
            playNote(freq * 2, t + i * (BEAT / 4), BEAT / 4, 'triangle', 0.055);
        });
    }
    // Bass
    for (let bar = 0; bar < 4; bar++) {
        const ch = CHORDS[bar];
        const t  = t0 + bar * BAR;
        playNote(ch.root / 2, t,             BEAT * 1.9, 'sine', 0.11);
        playNote(ch.root / 2, t + BAR / 2,  BEAT * 1.9, 'sine', 0.09);
    }
    // Melody
    MELODY.forEach(([freq, beat]) => {
        const t = t0 + beat * BEAT;
        playNote(freq,        t, BEAT * 0.8, 'sine', 0.17);
        playNote(freq * 1.25, t, BEAT * 0.8, 'sine', 0.055);
    });
}

function scheduler() {
    if (!isPlaying || !audioCtx || audioCtx.state === 'closed') return;
    // Resume if iOS suspended it (e.g. phone call, lock screen)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    while (nextNoteTime < audioCtx.currentTime + LOOKAHEAD) {
        scheduleLoop(nextNoteTime);
        nextNoteTime += LOOP_SEC;
    }
    schedulerTimer = setTimeout(scheduler, TICK_MS);
}

function startMusic() {
    // Must be called from a user gesture for iOS
    if (!audioCtx) {
        audioCtx = createAudioContext();
        if (!audioCtx) {
            alert('Browser kamu tidak mendukung Web Audio API 😢');
            return;
        }
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
    }
    // Resume suspended context (iOS requires this after page load)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => _beginPlayback());
    } else {
        _beginPlayback();
    }
}

function _beginPlayback() {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.5);

    nextNoteTime = audioCtx.currentTime + 0.15;
    isPlaying = true;
    scheduler();
}

function stopMusic() {
    isPlaying = false;
    if (schedulerTimer) {
        clearTimeout(schedulerTimer);
        schedulerTimer = null;
    }
    if (masterGain && audioCtx && audioCtx.state !== 'closed') {
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
        // Don't close context so re-play works without reloading page
        // Just suspend instead — lighter on battery
        setTimeout(() => {
            if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
        }, 700);
    }
}

// ======= MUSIC PLAYER UI =======
const musicBtn   = document.getElementById('music-btn');
const musicLabel = document.getElementById('music-label');

let titleTimer = null;
let titleFlip  = false;

musicBtn.addEventListener('click', () => {
    if (!isPlaying) {
        startMusic();
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.music-icon').innerText = '⏸';
        musicLabel.innerText = '♪ Still Here For You';
        titleTimer = setInterval(() => {
            titleFlip = !titleFlip;
            musicLabel.innerText = titleFlip
                ? '♪ Still Here For You ♫'
                : '♪ Still Here For You';
        }, 1800);
    } else {
        stopMusic();
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('.music-icon').innerText = '🎵';
        musicLabel.innerText = 'Play Lagu Bucin ♥';
        if (titleTimer) { clearInterval(titleTimer); titleTimer = null; }
    }
});