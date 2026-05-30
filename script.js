/* ============================================
   Happy Birthday Adellia — script.js
   Fixed: kompatibel Realme 5i, Samsung A32, Android 9+
   ============================================ */

// ======= PAUSE WHEN TAB HIDDEN =======
var appPaused = false;
document.addEventListener('visibilitychange', function() {
    appPaused = document.hidden;
    if (appPaused && audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
    } else if (!appPaused && audioCtx && audioCtx.state === 'suspended' && isPlaying) {
        audioCtx.resume();
    }
});

// ======= STARS BACKGROUND =======
var starsContainer = document.getElementById('stars-container');
var starCount = window.innerWidth < 500 ? 40 : 80;
for (var i = 0; i < starCount; i++) {
    var star = document.createElement('div');
    star.className = 'star';
    var size = Math.random() * 2.5 + 0.5;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = (Math.random() * 100) + '%';
    star.style.top = (Math.random() * 100) + '%';
    // CSS custom properties — didukung semua Android 5+
    star.style.setProperty('--dur', (Math.random() * 3 + 2).toFixed(2) + 's');
    star.style.setProperty('--delay', (Math.random() * 4).toFixed(2) + 's');
    starsContainer.appendChild(star);
}

// ======= FALLING PARTICLES =======
var particleEmojis = ['❤️','💕','💖','💗','✨','🌸','💓','💞','⭐','💝'];
var particlesBg = document.getElementById('particles-bg');
var particleCount = 0;
var MAX_PARTICLES = 12;

function createParticle() {
    if (appPaused) return;
    if (particleCount >= MAX_PARTICLES) return;
    particleCount++;
    var p = document.createElement('div');
    p.className = 'particle';
    p.innerText = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
    var dur = (Math.random() * 3 + 4).toFixed(2);
    p.style.left = (Math.random() * 94) + '%';
    p.style.fontSize = (Math.random() * 10 + 12).toFixed(1) + 'px';
    p.style.animationDuration = dur + 's';
    particlesBg.appendChild(p);
    var removeAfter = (parseFloat(dur) * 1000) + 200;
    setTimeout(function() {
        if (p.parentNode) p.parentNode.removeChild(p);
        particleCount--;
    }, removeAfter);
}

setInterval(createParticle, 900);
setInterval(createParticle, 1700);

// ======= PUZZLE LOGIC =======
var correctAnswer = "20JUNI2024";
var currentAnswer = "";
var pieces = ["2","0","J","U","N","I","2","0","2","4"];

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i]; a[i] = a[j]; a[j] = temp;
    }
    return a;
}

var shuffledPieces = shuffle(pieces);

function renderPieces() {
    var container = document.getElementById('puzzle-pieces');
    container.innerHTML = '';
    shuffledPieces.forEach(function(piece) {
        var btn = document.createElement('button');
        btn.className = 'puzzle-piece';
        btn.type = 'button';
        btn.innerText = piece;

        // touchstart untuk respons cepat di Android (no 300ms delay)
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            selectPiece(piece, btn);
        }, { passive: false });

        // click sebagai fallback
        btn.addEventListener('click', function() {
            selectPiece(piece, btn);
        });

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
    var resultEl = document.getElementById('puzzle-result');
    if (currentAnswer === correctAnswer) {
        resultEl.innerText = '✓ Benar! Kita jadian 20 Juni 2024 💕';
        resultEl.className = 'puzzle-result correct';
        document.getElementById('btn-gift').disabled = false;
    } else {
        resultEl.innerText = '✗ Hmm, coba lagi ya!';
        resultEl.className = 'puzzle-result wrong';
        setTimeout(function() { resetPuzzle(); }, 900);
    }
}

function resetPuzzle() {
    currentAnswer = '';
    document.getElementById('puzzle-answer').innerText = '';
    var resultEl = document.getElementById('puzzle-result');
    if (resultEl.classList.contains('correct')) return;
    resultEl.innerText = '';
    resultEl.className = 'puzzle-result';
    shuffledPieces = shuffle(pieces);
    renderPieces();
}

renderPieces();

// ======= MODAL =======
document.getElementById('btn-gift').addEventListener('click', function() {
    document.getElementById('gift-overlay').classList.add('active');
    launchConfetti();
});

document.getElementById('close-gift').addEventListener('click', function() {
    document.getElementById('gift-overlay').classList.remove('active');
});

document.getElementById('gift-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('gift-overlay')) {
        document.getElementById('gift-overlay').classList.remove('active');
    }
});

// ======= CONFETTI =======
function launchConfetti() {
    var colors = ['#e8527a','#c9a84c','#4ecba0','#f9a8c1','#f0d080','#ffffff'];
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var count = window.innerWidth < 500 ? 25 : 45;

    for (var i = 0; i < count; i++) {
        (function(idx) {
            setTimeout(function() {
                var c = document.createElement('div');
                c.className = 'confetti-piece';
                var tx = ((Math.random() - 0.5) * (window.innerWidth * 0.85)).toFixed(0);
                var ty = ((Math.random() - 0.5) * 380 - 80).toFixed(0);
                var color = colors[Math.floor(Math.random() * colors.length)];
                var isCircle = Math.random() > 0.5;
                c.style.left = cx + 'px';
                c.style.top = cy + 'px';
                c.style.backgroundColor = color;
                c.style.borderRadius = isCircle ? '50%' : '2px';
                // CSS custom property untuk animasi
                c.style.setProperty('--tx', tx + 'px');
                c.style.setProperty('--ty', ty + 'px');
                document.body.appendChild(c);
                setTimeout(function() {
                    if (c.parentNode) c.parentNode.removeChild(c);
                }, 1150);
            }, idx * 20);
        })(i);
    }
}

// ======================================================
// MUSIC PLAYER — Web Audio API
// iOS & Android: AudioContext harus dibuat di dalam
// direct user gesture (click/touchstart)
// ======================================================

var audioCtx    = null;
var isPlaying   = false;
var masterGain  = null;
var schedulerTimer = null;
var nextNoteTime   = 0;

var BPM      = 76;
var BEAT     = 60 / BPM;
var BAR      = 4 * BEAT;
var LOOP_BEATS  = 16;
var LOOP_SEC    = LOOP_BEATS * BEAT;
var LOOKAHEAD   = LOOP_SEC * 1.5;
var TICK_MS     = (LOOP_SEC / 2) * 1000;

var CHORDS = [
    { root: 261.63, third: 329.63, fifth: 392.00 },
    { root: 196.00, third: 246.94, fifth: 293.66 },
    { root: 220.00, third: 261.63, fifth: 329.63 },
    { root: 174.61, third: 220.00, fifth: 261.63 },
];

var MELODY = [
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
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try { return new Ctx(); } catch(e) { return null; }
}

function playNote(freq, startTime, duration, type, vol, detune) {
    if (!audioCtx || audioCtx.state === 'closed') return;
    type   = type   || 'sine';
    vol    = vol    || 0.15;
    detune = detune || 0;

    try {
        var osc  = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        if (detune) osc.detune.setValueAtTime(detune, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.04);
        gain.gain.linearRampToValueAtTime(vol * 0.6, startTime + duration * 0.5);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        var safeStart = Math.max(startTime, audioCtx.currentTime);
        osc.start(safeStart);
        osc.stop(safeStart + duration + 0.05);
    } catch(e) {
        // abaikan error node yang sudah expired
    }
}

function scheduleLoop(t0) {
    if (!audioCtx || audioCtx.state === 'closed') return;
    var bar, ch, t, b, notes, freq, i;

    // Pad chords
    for (bar = 0; bar < 4; bar++) {
        ch = CHORDS[bar];
        t  = t0 + bar * BAR;
        [ch.root, ch.third, ch.fifth, ch.root * 2].forEach(function(f) {
            playNote(f, t, BAR - 0.1, 'sine', 0.025, (Math.random() * 4 - 2));
        });
    }
    // Arpeggio
    for (b = 0; b < LOOP_BEATS; b++) {
        ch = CHORDS[Math.floor(b / 4)];
        notes = [ch.root, ch.third, ch.fifth, ch.third];
        t = t0 + b * BEAT;
        notes.forEach(function(f, idx) {
            playNote(f * 2, t + idx * (BEAT / 4), BEAT / 4, 'sine', 0.038);
        });
    }
    // Bass
    for (bar = 0; bar < 4; bar++) {
        ch = CHORDS[bar];
        t  = t0 + bar * BAR;
        playNote(ch.root / 2, t,            BEAT * 1.9, 'sine', 0.08);
        playNote(ch.root / 2, t + BAR / 2, BEAT * 1.9, 'sine', 0.065);
    }
    // Melody
    MELODY.forEach(function(note) {
        var f = note[0], beat = note[1];
        var nt = t0 + beat * BEAT;
        playNote(f, nt, BEAT * 0.8, 'sine', 0.13);
        // Harmonic ringan saja — bukan 1.25x (interval minor 3rd yg bikin kasar)
        playNote(f * 2, nt, BEAT * 0.8, 'sine', 0.03);
    });
}

function scheduler() {
    if (!isPlaying || !audioCtx || audioCtx.state === 'closed') return;
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
    if (!audioCtx) {
        audioCtx = createAudioContext();
        if (!audioCtx) {
            alert('Browser kamu tidak mendukung Web Audio 😢');
            return;
        }
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

        // DynamicsCompressor = mencegah clipping/distorsi di speaker HP kecil
        var compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-18, audioCtx.currentTime); // mulai compress di -18dB
        compressor.knee.setValueAtTime(6, audioCtx.currentTime);        // soft knee
        compressor.ratio.setValueAtTime(4, audioCtx.currentTime);       // 4:1 ratio — halus
        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);  // cepat tangkap peak
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);  // natural release

        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(function() { _beginPlayback(); });
    } else {
        _beginPlayback();
    }
}

function _beginPlayback() {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.38, audioCtx.currentTime + 1.5);
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
        try {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
        } catch(e) {}
        setTimeout(function() {
            if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
        }, 700);
    }
}

// ======= MUSIC UI =======
var musicBtn   = document.getElementById('music-btn');
var musicLabel = document.getElementById('music-label');
var titleTimer = null;
var titleFlip  = false;

musicBtn.addEventListener('click', function() {
    if (!isPlaying) {
        startMusic();
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.music-icon').innerText = '⏸';
        musicLabel.innerText = '♪ Still Here For You';
        titleTimer = setInterval(function() {
            titleFlip = !titleFlip;
            musicLabel.innerText = titleFlip ? '♪ Still Here For You ♫' : '♪ Still Here For You';
        }, 1800);
    } else {
        stopMusic();
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('.music-icon').innerText = '🎵';
        musicLabel.innerText = 'Play Lagu Bucin ♥';
        if (titleTimer) { clearInterval(titleTimer); titleTimer = null; }
    }
});