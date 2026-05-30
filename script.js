// Ambil elemen HTML
const btnGift = document.getElementById('btn-gift');
const overlay = document.getElementById('gift-overlay');
const closeBtn = document.getElementById('close-gift');
const puzzlePieces = document.getElementById('puzzle-pieces');
const puzzleAnswer = document.getElementById('puzzle-answer');
const puzzleResult = document.getElementById('puzzle-result');

// Jawaban yang benar: 20 JUNI 2024
const correctAnswer = "20JUNI2024";
let currentAnswer = "";

// Puzzle pieces - diacak
const pieces = ["2", "0", "J", "U", "N", "I", "2", "0", "2", "4"];

// Acak pieces
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const shuffledPieces = shuffle([...pieces]);

// Render pieces
function renderPieces() {
    puzzlePieces.innerHTML = "";
    shuffledPieces.forEach((piece, index) => {
        const btn = document.createElement("span");
        btn.className = "puzzle-piece";
        btn.innerText = piece;
        btn.onclick = () => selectPiece(piece, btn);
        puzzlePieces.appendChild(btn);
    });
}

// Pilih piece
function selectPiece(piece, btnElement) {
    // Cek jika piece sudah digunakan
    if (btnElement.classList.contains("used")) return;
    
    // Tambahkan ke jawaban
    currentAnswer += piece;
    puzzleAnswer.innerText = currentAnswer;
    
    // Tandai piece sebagai digunakan
    btnElement.classList.add("used");
    
    // Cek jawaban
    if (currentAnswer.length === correctAnswer.length) {
        checkAnswer();
    }
}

// Cek jawaban
function checkAnswer() {
    if (currentAnswer === correctAnswer) {
        puzzleResult.innerText = "🎉 Benar! Kita jadian tanggal 20 Juni 2024!";
        puzzleResult.className = "puzzle-result correct";
        btnGift.disabled = false;
    } else {
        puzzleResult.innerText = "❌ Coba lagi!";
        puzzleResult.className = "puzzle-result wrong";
        
        // Reset setelah 1 detik
        setTimeout(function() {
            currentAnswer = "";
            puzzleAnswer.innerText = "";
            puzzleResult.innerText = "";
            renderPieces();
        }, 1000);
    }
}

// Init puzzle
renderPieces();

// Buka kejutan
btnGift.addEventListener('click', function() {
    overlay.style.display = 'flex';
    throwConfetti();
});

// Tutup kejutan
closeBtn.addEventListener('click', function() {
    overlay.style.display = 'none';
});

// Efek Hati Jatuh
function createHearts() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    const size = Math.random() * 20 + 10 + 'px';
    heart.style.width = size;
    heart.style.height = size;
    document.querySelector('.hearts-bg').appendChild(heart);
    setTimeout(function() {
        heart.remove();
    }, 5000);
}
setInterval(createHearts, 500);

// Efek Confetti
function throwConfetti() {
    const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#ff6b81'];
    for(let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        confetti.style.left = startX + 'px';
        confetti.style.top = startY + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const targetX = (Math.random() - 0.5) * 1000;
        const targetY = (Math.random() - 1) * 1000;
        confetti.style.setProperty('--tx', targetX + 'px');
        confetti.style.setProperty('--ty', targetY + 'px');
        document.body.appendChild(confetti);
        setTimeout(function() {
            confetti.remove();
        }, 2000);
    }
}