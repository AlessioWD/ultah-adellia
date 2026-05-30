/* ============================================
   Happy Birthday Adellia — script.js
   Final version: desktop + mobile sempurna
   ============================================ */

// ======= VISIBILITY =======
var appPaused = false;
document.addEventListener('visibilitychange', function() {
    appPaused = document.hidden;
});

// ======= STARS =======
var starsContainer = document.getElementById('stars-container');
var starCount = window.innerWidth < 768 ? 50 : 100;
for (var si = 0; si < starCount; si++) {
    var star = document.createElement('div');
    star.className = 'star';
    var sz = Math.random() * 2.5 + 0.5;
    star.style.width = sz + 'px';
    star.style.height = sz + 'px';
    star.style.left = (Math.random() * 100) + '%';
    star.style.top = (Math.random() * 100) + '%';
    star.style.setProperty('--dur', (Math.random() * 3 + 2).toFixed(2) + 's');
    star.style.setProperty('--delay', (Math.random() * 4).toFixed(2) + 's');
    starsContainer.appendChild(star);
}

// ======= PARTICLES =======
var particleEmojis = ['❤️','💕','💖','💗','✨','🌸','💓','💞','⭐','💝'];
var particlesBg = document.getElementById('particles-bg');
var particleCount = 0;
var MAX_PARTICLES = window.innerWidth < 768 ? 10 : 20;

function createParticle() {
    if (appPaused || particleCount >= MAX_PARTICLES) return;
    particleCount++;
    var p = document.createElement('div');
    p.className = 'particle';
    p.innerText = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
    var dur = (Math.random() * 3 + 4).toFixed(2);
    p.style.left = (Math.random() * 94) + '%';
    p.style.fontSize = (Math.random() * 10 + 12).toFixed(1) + 'px';
    p.style.animationDuration = dur + 's';
    particlesBg.appendChild(p);
    setTimeout(function() {
        if (p.parentNode) p.parentNode.removeChild(p);
        particleCount--;
    }, parseFloat(dur) * 1000 + 200);
}
setInterval(createParticle, 800);
setInterval(createParticle, 1500);

// ======= PUZZLE =======
var correctAnswer = "20JUNI2024";
var currentAnswer = "";
var pieces = ["2","0","J","U","N","I","2","0","2","4"];
var shuffledPieces = shuffle(pieces);

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function renderPieces() {
    var container = document.getElementById('puzzle-pieces');
    container.innerHTML = '';
    for (var pi = 0; pi < shuffledPieces.length; pi++) {
        (function(piece) {
            var btn = document.createElement('button');
            btn.className = 'puzzle-piece';
            btn.type = 'button';
            btn.innerText = piece;
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                selectPiece(piece, btn);
            }, { passive: false });
            btn.addEventListener('click', function() {
                selectPiece(piece, btn);
            });
            container.appendChild(btn);
        })(shuffledPieces[pi]);
    }
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
    var count = window.innerWidth < 768 ? 30 : 60;
    for (var ci = 0; ci < count; ci++) {
        (function(idx) {
            setTimeout(function() {
                var c = document.createElement('div');
                c.className = 'confetti-piece';
                var tx = ((Math.random() - 0.5) * window.innerWidth * 0.9).toFixed(0);
                var ty = ((Math.random() - 0.5) * 420 - 80).toFixed(0);
                c.style.left = cx + 'px';
                c.style.top = cy + 'px';
                c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                c.style.setProperty('--tx', tx + 'px');
                c.style.setProperty('--ty', ty + 'px');
                document.body.appendChild(c);
                setTimeout(function() {
                    if (c.parentNode) c.parentNode.removeChild(c);
                }, 1200);
            }, idx * 18);
        })(ci);
    }
}

// ======= MUSIC — Synthesizer =======
var isPlaying = false;

function startMusic() {
    isPlaying = true;
    startSynth();
}

function stopMusic() {
    isPlaying = false;
    stopSynth();
}

var audioCtx = null;
var masterGain = null;
var schedulerTimer = null;
var nextNoteTime = 0;
var BEAT = 60 / 76;
var BAR  = 4 * BEAT;
var LOOP_SEC = 16 * BEAT;

var CHORDS = [
    [261.63, 329.63, 392.00],
    [196.00, 246.94, 293.66],
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63]
];
var MELODY = [
    [392,0],[440,0.5],[523,1],[440,1.5],[392,2],[349,2.75],[392,3.25],
    [392,4],[440,4.5],[392,5],[349,5.5],[329,6],[293,6.75],
    [329,8],[349,8.5],[392,9],[440,9.5],[523,10],[440,10.75],[392,11.25],
    [349,12],[392,12.5],[440,13],[349,13.5],[329,14],[293,15]
];

function initSynth() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    try {
        audioCtx = new Ctx();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        var comp = audioCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-20, audioCtx.currentTime);
        comp.ratio.setValueAtTime(6, audioCtx.currentTime);
        masterGain.connect(comp);
        comp.connect(audioCtx.destination);
        return true;
    } catch(e) { return false; }
}

function pNote(freq, t, dur, vol) {
    if (!audioCtx) return;
    try {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.03);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(g); g.connect(masterGain);
        var s = Math.max(t, audioCtx.currentTime);
        o.start(s); o.stop(s + dur + 0.05);
    } catch(e) {}
}

function scheduleLoop(t0) {
    // Melodi saja — lebih ringan, tidak gebresek
    MELODY.forEach(function(n) {
        pNote(n[0], t0 + n[1] * BEAT, BEAT * 0.75, 0.12);
    });
    // Bass ringan
    for (var b = 0; b < 4; b++) {
        var ch = CHORDS[b];
        pNote(ch[0] / 2, t0 + b * BAR, BAR * 0.9, 0.07);
    }
}

function synthScheduler() {
    if (!isPlaying || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    while (nextNoteTime < audioCtx.currentTime + LOOP_SEC * 1.2) {
        scheduleLoop(nextNoteTime);
        nextNoteTime += LOOP_SEC;
    }
    schedulerTimer = setTimeout(synthScheduler, (LOOP_SEC / 2) * 1000);
}

function startSynth() {
    if (!audioCtx && !initSynth()) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(function() { _beginSynth(); });
    } else {
        _beginSynth();
    }
}

function _beginSynth() {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 1.5);
    nextNoteTime = audioCtx.currentTime + 0.1;
    synthScheduler();
}

function stopSynth() {
    if (schedulerTimer) { clearTimeout(schedulerTimer); schedulerTimer = null; }
    if (masterGain && audioCtx) {
        try {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        } catch(e) {}
        setTimeout(function() {
            if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
        }, 600);
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