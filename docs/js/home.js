// --- SCROLL ANIMATION OBSERVER ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-fade').forEach((el) => {
    observer.observe(el);
});

// --- LIVE COUNTDOWN LOGIC ---
const demoCountdownText = document.getElementById('demoCountdownText');
const targetDate = new Date("October 31, 2026 21:00:00").getTime();

const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        clearInterval(countdownInterval);
        demoCountdownText.innerHTML = "It's Movie Time!";
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        demoCountdownText.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }
}, 1000);

// --- JUMPSCARE & DEMO LOGIC ---
const demoYesBtn = document.getElementById('demoYesBtn');
const demoNoBtn = document.getElementById('demoNoBtn');
const demoModal = document.getElementById('demoModal');
const demoModalContent = document.getElementById('demoModalContent');
const demoCardBounds = document.getElementById('demoCardBounds');
const demoCheekyText = document.getElementById('demoCheekyText');

const demoBlackout = document.getElementById('demoBlackout');
const demoFog = document.getElementById('demoFog');
const demoJumpscareImg = document.getElementById('demoJumpscareImg');
const demoScreamSound = document.getElementById('demoScreamSound');

let demoDodgeCount = 0;
const dodges = ["Too slow! 🐢", "Catch me! 🦋", "Nope! 🏃💨", "Missed! 😛", "I'm tired... 🪫"];
let jumpscareTimers = [];

demoYesBtn.addEventListener('click', () => {
    demoBlackout.style.animation = 'flickerBlack 0.8s ease-in-out forwards';
    
    jumpscareTimers.push(setTimeout(() => {
        demoFog.style.animation = 'driftFog 2.5s ease-in-out forwards';
    }, 400));

    jumpscareTimers.push(setTimeout(() => {
        demoScreamSound.currentTime = 0; 
        demoScreamSound.play().catch(e => console.log("Audio block: browser policy."));
        demoJumpscareImg.style.animation = 'snapJumpscare 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    }, 800));
    
    jumpscareTimers.push(setTimeout(() => {
        demoBlackout.style.animation = 'fadeBlackout 0.8s ease-out forwards';
        demoModal.classList.add('active');
        demoModalContent.style.animation = 'pullModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    }, 1800));
});

demoModal.addEventListener('click', () => {
    demoModal.classList.remove('active');
    jumpscareTimers.forEach(timer => clearTimeout(timer));
    jumpscareTimers = [];
    demoBlackout.style.animation = 'none';
    demoFog.style.animation = 'none';
    demoJumpscareImg.style.animation = 'none';
    demoModalContent.style.animation = 'none';
});

// --- BUG FIX: SMOOTH "NO" BUTTON TELEPORT ---
demoNoBtn.addEventListener('mouseover', function(e) {
    if (demoDodgeCount < dodges.length) {
        this.textContent = dodges[demoDodgeCount];
        demoDodgeCount++;
        
        if (this.style.position !== 'absolute') {
            // Record current position before switching to absolute
            const currentLeft = this.offsetLeft;
            const currentTop = this.offsetTop;
            
            this.style.position = 'absolute';
            this.style.left = currentLeft + 'px';
            this.style.top = currentTop + 'px';
            
            // Force the browser to register the new absolute position before moving
            this.getBoundingClientRect(); 
        }

        const maxX = demoCardBounds.clientWidth - this.offsetWidth - 20; 
        const maxY = demoCardBounds.clientHeight - this.offsetHeight - 20; 
        
        const randomX = Math.max(10, Math.floor(Math.random() * maxX));
        const randomY = Math.max(10, Math.floor(Math.random() * maxY));
        
        this.style.left = randomX + 'px';
        this.style.top = randomY + 'px';
        
    } else {
        this.style.display = 'none'; 
        demoCheekyText.style.display = 'block';
    }
});

// --- HOME FAQ ACCORDION LOGIC ---
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerBox = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all others
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Open clicked item
        if (!isActive) {
            item.classList.add('active');
            answerBox.style.maxHeight = answerBox.scrollHeight + "px";
        }
    });
});
// --- CHEF'S KISS: FLOATING EMOJI BACKGROUND LOGIC ---
const emojiList = ['💕', '💞', '💓', '💗', '💖', '💘', '💝', '💋', '🌸', '🩷', '🎟️', '✨', '🌷'];
const emojiContainer = document.getElementById('emojiContainer');

function spawnEmoji() {
    if (!emojiContainer) return;

    // THE LIMITER: If there are 6 or more emojis on screen, cancel the spawn
    if (emojiContainer.getElementsByClassName('floating-emoji-wrapper').length >= 6) {
        return;
    }

    // Create the outer wrapper (handles the floating)
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('floating-emoji-wrapper');
    
    // Create the inner element (handles the fading)
    const innerEl = document.createElement('span');
    innerEl.classList.add('floating-emoji-inner');
    
    // Pick a random emoji
    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    innerEl.innerText = randomEmoji;
    
    // Randomize the starting position on the wrapper
    wrapperEl.style.left = Math.random() * 100 + 'vw';
    
    // Randomize the size on the inner emoji
    const size = Math.random() * 1.3 + 1.2;
    innerEl.style.fontSize = size + 'rem';
    
    // Combine them
    wrapperEl.appendChild(innerEl);
    emojiContainer.appendChild(wrapperEl);
    
    // Set the duration for BOTH animations (12 to 24 seconds)
    const floatDuration = Math.random() * 12 + 12;
    
    // Apply animations directly to the separate elements!
    wrapperEl.style.animation = `floatUp ${floatDuration}s linear forwards`;
    innerEl.style.animation = `fadeInOut ${floatDuration}s linear forwards`;
    
    // Clean up when the float animation is completely finished
    setTimeout(() => {
        wrapperEl.remove();
    }, floatDuration * 1000);
}

// Try to spawn a new emoji every 2 seconds
setInterval(spawnEmoji, 2000);