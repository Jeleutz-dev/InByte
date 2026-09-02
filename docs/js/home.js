// --- SCROLL ANIMATION OBSERVER ---
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-fade').forEach((el) => {
    scrollObserver.observe(el);
});

// --- LIVE COUNTDOWN LOGIC ---
const demoCountdownText = document.getElementById('demoCountdownText');
const targetDate = new Date("October 31, 2026 21:00:00").getTime();

if (demoCountdownText) {
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
}

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
const dodges = ["Too slow!", "Catch me!", "Nope!", "Missed!", "I'm tired..."];
let jumpscareTimers = [];

if (demoYesBtn) {
    demoYesBtn.addEventListener('click', () => {
        demoBlackout.style.animation = 'flickerBlack 0.8s ease-in-out forwards';
        
        jumpscareTimers.push(setTimeout(() => {
            demoFog.style.animation = 'driftFog 2.5s ease-in-out forwards';
        }, 400));

        jumpscareTimers.push(setTimeout(() => {
            if (demoScreamSound) {
                demoScreamSound.currentTime = 0; 
                demoScreamSound.play().catch(e => console.log("Audio block: browser policy."));
            }
            demoJumpscareImg.style.animation = 'snapJumpscare 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }, 800));
        
        jumpscareTimers.push(setTimeout(() => {
            demoBlackout.style.animation = 'fadeBlackout 0.8s ease-out forwards';
            demoModal.classList.add('active');
            demoModalContent.style.animation = 'pullModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }, 1800));
    });
}

if (demoModal) {
    demoModal.addEventListener('click', () => {
        demoModal.classList.remove('active');
        jumpscareTimers.forEach(timer => clearTimeout(timer));
        jumpscareTimers = [];
        demoBlackout.style.animation = 'none';
        demoFog.style.animation = 'none';
        demoJumpscareImg.style.animation = 'none';
        demoModalContent.style.animation = 'none';
    });
}

// --- SMART "NO" BUTTON ---
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

if (demoNoBtn) {
    demoNoBtn.addEventListener('mouseover', () => { executeDodge(); });
    demoNoBtn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            e.preventDefault();
            demoNoBtn.blur();
            executeDodge();
        }
    });
}

// --- FAQ ACCORDION LOGIC ---
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerBox = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });
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

    const preloadGif = new Image();
    preloadGif.src = gifSrc;

    img.addEventListener('mouseenter', () => { img.src = gifSrc; });
    img.addEventListener('mouseleave', () => { img.src = pngSrc; });
    img.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (img.src.includes(pngSrc)) {
            themeImages.forEach(otherImg => { otherImg.src = otherImg.getAttribute('src'); });
            img.src = gifSrc;
        } else {
            img.src = pngSrc;
        }
    });
});

// --- BASELINE STATS COUNT-UP ANIMATION ---
function initCounterObserver() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const runCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 2000; 
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = Math.floor(easeProgress * target);

            el.textContent = currentVal.toLocaleString() + '+';

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target.toLocaleString() + '+';
            }
        };

        requestAnimationFrame(updateCount);
    };

    const statsObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(el => runCounter(el));
                obs.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.home-stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initCounterObserver();
});