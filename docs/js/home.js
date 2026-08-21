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

// --- SMART "NO" BUTTON (HOVER ON PC, TAP ON MOBILE) ---
function executeDodge() {
    if (demoDodgeCount < dodges.length) {
        demoNoBtn.textContent = dodges[demoDodgeCount];
        demoDodgeCount++;
        
        if (demoNoBtn.style.position !== 'absolute') {
            const currentLeft = demoNoBtn.offsetLeft;
            const currentTop = demoNoBtn.offsetTop;
            
            demoNoBtn.style.position = 'absolute';
            demoNoBtn.style.left = currentLeft + 'px';
            demoNoBtn.style.top = currentTop + 'px';
            
            demoNoBtn.getBoundingClientRect(); 
        }

        const maxX = demoCardBounds.clientWidth - demoNoBtn.offsetWidth - 20; 
        const maxY = demoCardBounds.clientHeight - demoNoBtn.offsetHeight - 20; 
        
        const randomX = Math.max(10, Math.floor(Math.random() * maxX));
        const randomY = Math.max(10, Math.floor(Math.random() * maxY));
        
        demoNoBtn.style.left = randomX + 'px';
        demoNoBtn.style.top = randomY + 'px';
        
    } else {
        demoNoBtn.style.display = 'none'; 
        demoCheekyText.style.display = 'block';
    }
}

// 1. DESKTOP MODE: Triggers instantly on mouse hover
demoNoBtn.addEventListener('mouseover', () => {
    executeDodge();
});

// 2. MOBILE MODE: Triggers on physical finger taps (ignoring mouse clicks)
demoNoBtn.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        e.preventDefault();
        demoNoBtn.blur(); // Clears mobile focus lock so it can be tapped repeatedly
        executeDodge();
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



// --- THEMES GIF HOVER/TAP OPTIMIZER ---
const themeImages = document.querySelectorAll('.theme-img');

themeImages.forEach(img => {
    const gifSrc = img.getAttribute('data-gif');
    const pngSrc = img.getAttribute('src');

    if (!gifSrc) return;

    // Preload the heavy GIF in the background so there's zero loading lag
    const preloadGif = new Image();
    preloadGif.src = gifSrc;

    // PC MODE: Play GIF on hover, revert to PNG on mouse leave
    img.addEventListener('mouseenter', () => {
        img.src = gifSrc;
    });

    img.addEventListener('mouseleave', () => {
        img.src = pngSrc;
    });

    // MOBILE MODE: Tap to toggle the animation
    img.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // Prevents delayed mobile mouse clicks
        
        if (img.src.includes(pngSrc)) {
            // Close any other active GIFs so only one plays at a time on mobile
            themeImages.forEach(otherImg => {
                otherImg.src = otherImg.getAttribute('src');
            });
            img.src = gifSrc;
        } else {
            img.src = pngSrc;
        }
    });
});