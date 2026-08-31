// --- FLOATING EMOJI LOGIC ---
function initFloatingEmojis(isDoomsdayTheme) {
    const emojiContainer = document.getElementById('emojiContainer');
    if (!emojiContainer) return;

    const spideyEmojis = ['🕷️', '🕸️', '🍿', '🎥', '🎟️', '❤️‍🔥', '💖', '💞', '💕'];
    const doomEmojis = ['💚', '🖤']; 
    const activeEmojis = isDoomsdayTheme ? doomEmojis : spideyEmojis;

    function spawnEmoji() {
        if (emojiContainer.getElementsByClassName('floating-emoji-wrapper').length >= 8) {
            return;
        }
        const wrapperEl = document.createElement('div');
        wrapperEl.classList.add('floating-emoji-wrapper');
        const innerEl = document.createElement('span');
        innerEl.classList.add('floating-emoji-inner');
        
        const randomEmoji = activeEmojis[Math.floor(Math.random() * activeEmojis.length)];
        innerEl.innerText = randomEmoji;
        
        wrapperEl.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 1.5 + 1.2;
        innerEl.style.fontSize = size + 'rem';
        
        wrapperEl.appendChild(innerEl);
        emojiContainer.appendChild(wrapperEl);
        
        const floatDuration = Math.random() * 10 + 10; 
        wrapperEl.style.animation = `floatEmojiUp ${floatDuration}s linear forwards`;
        innerEl.style.animation = `fadeEmojiInOut ${floatDuration}s linear forwards`;
        
        setTimeout(() => { wrapperEl.remove(); }, floatDuration * 1000);
    }
    setInterval(spawnEmoji, 1500);
}

let isDoomsday = false; 
let isInsidious = false; 

// --- FIRESTORE TRIGGER: This runs once Firestore gets the data ---
window.initializeInvite = function(customData) {
    let mainQ = customData.mainQ ?? "";
    let subQ = customData.subQ ?? "";
    let nameStr = (customData.name && customData.name.trim() !== "") ? customData.name + ", " : "";
    let subQStr = (subQ && subQ.trim() !== "") ? "<br><em>" + subQ + "</em>" : "";

    document.getElementById('inviteTitle').innerHTML = nameStr + mainQ + subQStr;

    const modalClientPic = document.getElementById('modalClientPic');
    if (customData.img && customData.img.trim() !== "") {
        modalClientPic.src = customData.img;
        modalClientPic.style.display = 'block'; 
    } else {
        modalClientPic.style.display = 'none'; 
    }

    const movieChoice = customData.movie;
    if (movieChoice) {
        document.getElementById('movieName').textContent = movieChoice;
        
        if (movieChoice === 'Avengers: Doomsday') {
            isDoomsday = true; 
            document.body.classList.add('doomsday-theme');
            document.getElementById('pageIcon').href = "../assets/dr-doom.png";
            const web1 = document.getElementById('web1');
            web1.src = "../assets/img/magic_effect.png";
            web1.className = "magic-circle-shoot"; 
        } 
        else if (movieChoice === 'Insidious: Out of the Further') {
            isInsidious = true;
            document.body.classList.add('insidious-theme');
            document.getElementById('pageIcon').href = "../assets/ghost.png";
            document.getElementById('yesBtn').textContent = "Enter the Further";
            document.getElementById('noBtn').textContent = "Too scared!";
        }

        if (!isInsidious) {
            initFloatingEmojis(isDoomsday);
        } else {
            const container = document.getElementById('emojiContainer');
            if (container) container.remove();
        }
    }

    let dateVal = customData.date;
    if (!dateVal || dateVal.trim() === "" || dateVal.trim() === "@") {
        document.getElementById('dateLine').style.display = 'none';
    } else {
        let displayDate = dateVal.trim();
        if (displayDate.endsWith('@')) {
            displayDate = displayDate.slice(0, -1).trim();
        }
        document.getElementById('dateTime').textContent = displayDate;
        
        let cleanDateString = displayDate.replace('@', '').trim();
        let countDownDate = new Date(cleanDateString).getTime();

        if (!isNaN(countDownDate)) {
            document.getElementById('countdownContainer').style.display = 'block';
            let x = setInterval(function() {
                let now = new Date().getTime();
                let distance = countDownDate - now;
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById('countdownText').innerHTML = "It's Movie Time!";
                } else {
                    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    document.getElementById('countdownText').innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
                }
            }, 1000);
        }
    }

    const locVal = customData.loc;
    const locLine = document.getElementById('locLine');
    const mapContainer = document.getElementById('mapContainer');
    const mapToggleBtn = document.getElementById('mapToggleBtn');

    if (!locVal || locVal.trim() === "") {
        locLine.style.display = 'none';
    } else {
        document.getElementById('locationPlace').textContent = locVal;
        document.getElementById('miniMap').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(locVal) + '&t=m&z=14&output=embed';
        
        mapToggleBtn.addEventListener('click', function() {
            if (mapContainer.classList.contains('show-map')) {
                mapContainer.classList.remove('show-map');
                mapToggleBtn.textContent = '(View Map)';
            } else {
                mapContainer.classList.add('show-map');
                mapToggleBtn.textContent = '(Hide Map)';
            }
        });
    }

    if (customData.msg !== undefined && customData.msg !== null) {
        document.getElementById('modalMessage').innerHTML = customData.msg;
    }

    // Reveal the card
    document.getElementById('inviteCard').style.visibility = 'visible';
    document.body.style.visibility = 'visible';
};

// --- ANIMATION & BUTTON LOGIC ---
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const modal = document.getElementById('successModal');
const web1 = document.getElementById('web1');
const web2 = document.getElementById('web2');
const magic2 = document.getElementById('magic2'); 
const blackout = document.getElementById('blackout');
const tealFog = document.getElementById('tealFog'); 
const modalContent = document.querySelector('.modal-content');
const jumpscareImg = document.getElementById('jumpscareImage');
const screamSound = document.getElementById('screamSound');
const webSound = document.getElementById('webSound');
const crackSound = document.getElementById('crackSound');
const doomsdayFog = document.getElementById('doomsdayFog');
const crackImage = document.getElementById('doomsdayCrackImage');
const riftImage = document.getElementById('doomsdayRiftImage');

const cheekyText = document.getElementById('cheekyText');
let dodgeCount = 0;

const finalCheekyPhrases = [
    "The universe has spoken. Just click 'Yes' already! ✨",
    "Resistance is futile. See you on our date! 😎",
    "I deleted the 'No' button. You're stuck with me! 💖",
    "Guess it's a date then! You literally have no choice now. 🤷‍♂️",
    "Well, this is awkward... just click Yes so we can move on. 😂",
    "Checkmate. See you at the movies! 🎬",
    "I admire your persistence, but we're still going. 🍿"
];

let randomDodges = ["Too slow! 🐢", "Catch me! 🦋", "Nope! 🏃💨", "Missed! 😛", "Oops! 🙈"];
for (let i = randomDodges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomDodges[i], randomDodges[j]] = [randomDodges[j], randomDodges[i]];
}
randomDodges.push("I'm tired... 🪫");

let splatTimer, pullTimer;

function runaway(e) {
    if (e) e.preventDefault();
    if (dodgeCount >= 6) {
        noBtn.style.display = 'none'; 
        const randomText = finalCheekyPhrases[Math.floor(Math.random() * finalCheekyPhrases.length)];
        cheekyText.textContent = randomText;
        cheekyText.style.display = 'block'; 
        return; 
    }
    noBtn.textContent = randomDodges[dodgeCount];
    dodgeCount++; 

    if (noBtn.style.position !== 'fixed') {
        const rect = noBtn.getBoundingClientRect();
        document.body.appendChild(noBtn);
        noBtn.style.position = 'fixed';
        noBtn.style.left = rect.left + 'px';
        noBtn.style.top = rect.top + 'px';
        noBtn.getBoundingClientRect(); 
    }
    const maxX = window.innerWidth - noBtn.offsetWidth;
    const maxY = window.innerHeight - noBtn.offsetHeight;
    noBtn.style.left = Math.max(0, Math.floor(Math.random() * maxX)) + 'px';
    noBtn.style.top = Math.max(0, Math.floor(Math.random() * maxY)) + 'px';
}

noBtn.addEventListener('mouseover', runaway);
noBtn.addEventListener('touchstart', runaway);
noBtn.addEventListener('click', runaway);

yesBtn.addEventListener('click', function() {
    web1.style.animation = 'none';
    web2.style.animation = 'none';
    magic2.style.animation = 'none';
    modalContent.style.animation = 'none';
    jumpscareImg.style.animation = 'none'; 
    blackout.style.animation = 'none';
    tealFog.style.animation = 'none';
    doomsdayFog.style.animation = 'none';
    crackImage.style.animation = 'none';
    riftImage.style.animation = 'none';
    document.querySelector('.card').classList.remove('shake-active');
    modal.classList.remove('shake-active');
    
    void web1.offsetWidth; 
    void magic2.offsetWidth;

    if (isInsidious) {
        modal.style.transition = 'none'; 
        modal.classList.add('active');
        blackout.style.animation = 'flickerBlack 0.8s ease-in-out forwards';
        setTimeout(() => { tealFog.style.animation = 'driftFog 2.5s ease-in-out forwards'; }, 400);
        splatTimer = setTimeout(() => {
            screamSound.currentTime = 0; 
            screamSound.play().catch(e => console.log("Audio block"));
            jumpscareImg.style.animation = 'snapJumpscare 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }, 800);
        pullTimer = setTimeout(() => {
            blackout.style.animation = 'fadeBlackout 0.8s ease-out forwards';
            modalContent.style.animation = 'pullModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }, 1800); 
    } else {
        modal.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
        modal.classList.add('active');

        if (isDoomsday) {
            document.querySelector('.card').classList.add('shake-active');
            modal.classList.add('shake-active');
            crackSound.currentTime = 0;
            crackSound.play().catch(e => console.log("Audio block"));
            
            web1.style.animation = 'magicPopRotate 1.5s ease-out forwards';
            magic2.style.animation = 'magicPopRotate 1.5s ease-out forwards'; 
            doomsdayFog.style.animation = 'doomsdayFogIn 2.5s ease-out forwards';
            
            splatTimer = setTimeout(() => {
                web1.style.animation = 'magicVanish 0.3s ease-in forwards';
                magic2.style.animation = 'magicVanish 0.3s ease-in forwards'; 
                crackImage.style.animation = 'snapCrack 0.15s ease-out forwards';
                
                setTimeout(() => {
                    crackImage.style.animation = 'shatterCrack 0.2s ease-in forwards';
                    riftImage.style.animation = 'tearImageOpen 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    pullTimer = setTimeout(() => {
                        document.querySelector('.card').classList.remove('shake-active');
                        modal.classList.remove('shake-active');
                        modalContent.style.animation = 'pullModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    }, 500); 
                }, 400); 
            }, 1500); 
        } else {
            webSound.currentTime = 0;
            webSound.play().catch(e => console.log("Audio block"));
            web1.style.animation = 'shootWeb 0.25s ease-out forwards';
            splatTimer = setTimeout(() => {
                web2.style.animation = 'splatIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                pullTimer = setTimeout(() => {
                    web1.style.animation = 'pullOutWeb 0.25s ease-in forwards';
                    web2.style.animation = 'pullOutWeb 0.25s ease-in forwards';
                    modalContent.style.animation = 'pullModal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                }, 250); 
            }, 250); 
        }
    }
});

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('active');
        clearTimeout(splatTimer);
        clearTimeout(pullTimer);
        web1.style.animation = 'none';
        web2.style.animation = 'none';
        magic2.style.animation = 'none'; 
        modalContent.style.animation = 'none';
        jumpscareImg.style.animation = 'none'; 
        blackout.style.animation = 'none';
        tealFog.style.animation = 'none';
        doomsdayFog.style.animation = 'none';
        crackImage.style.animation = 'none';
        riftImage.style.animation = 'none';
        document.querySelector('.card').classList.remove('shake-active');
        modal.classList.remove('shake-active');
    }
});