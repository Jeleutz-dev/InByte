        // --- SPIDERMAN FLOATING EMOJI LOGIC ---
        function initSpidermanEmojis() {
            const emojiContainer = document.getElementById('emojiContainer');
            if (!emojiContainer) return;

            const spideyEmojis = ['🕷️', '🕸️', '🍿', '🎥', '🎟️', '❤️‍🔥', '💖', '💞', '💕'];

            function spawnEmoji() {
                // Limit to 8 emojis on screen at once
                if (emojiContainer.getElementsByClassName('floating-emoji-wrapper').length >= 8) {
                    return;
                }

                const wrapperEl = document.createElement('div');
                wrapperEl.classList.add('floating-emoji-wrapper');
                
                const innerEl = document.createElement('span');
                innerEl.classList.add('floating-emoji-inner');
                
                const randomEmoji = spideyEmojis[Math.floor(Math.random() * spideyEmojis.length)];
                innerEl.innerText = randomEmoji;
                
                wrapperEl.style.left = Math.random() * 100 + 'vw';
                
                const size = Math.random() * 1.5 + 1.2;
                innerEl.style.fontSize = size + 'rem';
                
                wrapperEl.appendChild(innerEl);
                emojiContainer.appendChild(wrapperEl);
                
                const floatDuration = Math.random() * 10 + 10; // Floats for 10-20 seconds
                
                wrapperEl.style.animation = `floatEmojiUp ${floatDuration}s linear forwards`;
                innerEl.style.animation = `fadeEmojiInOut ${floatDuration}s linear forwards`;
                
                setTimeout(() => {
                    wrapperEl.remove();
                }, floatDuration * 1000);
            }

            // Spawn a new emoji every 1.5 seconds
            setInterval(spawnEmoji, 1500);
        }

        // --- URL PARAMETER LOGIC ---
        const params = new URLSearchParams(window.location.search);
        let customData = {};

        if (params.has('invite')) {
            try {
                const safeBase64 = params.get('invite').replace(/ /g, '+'); 
                const decodedString = decodeURIComponent(atob(safeBase64));
                customData = JSON.parse(decodedString);
            } catch (e) {
                console.error("Invalid invite code");
            }
        } else {
            customData = {
                name: params.get('name'), movie: params.get('movie'),
                date: params.get('date'), loc: params.get('loc'),
                msg: params.get('msg'), mainQ: params.get('mainQ'), subQ: params.get('subQ')
            };
        }
        
        // --- FIXED: Custom Question Logic Using "??" ---
        let mainQ = customData.mainQ ?? "";
        let subQ = customData.subQ ?? "";

        // Ensure we don't render empty tags if they are blank
        let nameStr = (customData.name && customData.name.trim() !== "") ? customData.name + ", " : "";
        let subQStr = (subQ && subQ.trim() !== "") ? "<br><em>" + subQ + "</em>" : "";

        document.getElementById('inviteTitle').innerHTML = nameStr + mainQ + subQStr;

        // --- NEW: CUSTOM IMAGE LOGIC ---
        const modalClientPic = document.getElementById('modalClientPic');
        if (customData.img && customData.img.trim() !== "") {
            modalClientPic.src = customData.img;
            modalClientPic.style.display = 'block'; // Unhide it!
        } else {
            modalClientPic.style.display = 'none'; // Keep hidden if standard link
        }

        // --- THEME SWAP LOGIC ---
        const movieChoice = customData.movie;
        let isDoomsday = false; 
        let isInsidious = false; 

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

                // --- Change button text for the horror theme! ---
                document.getElementById('yesBtn').textContent = "Enter the Further";
                document.getElementById('noBtn').textContent = "Too scared!";
            }

            if (!isDoomsday && !isInsidious) {
            initSpidermanEmojis();
            } else {
                // Ensure the container is removed if another theme is active
                const container = document.getElementById('emojiContainer');
                if (container) container.remove();
            }
        }

        // --- DATE, LOCATION & COUNTDOWN ---
        if (Object.keys(customData).length > 0 || window.location.search) {
            const dateVal = customData.date;
            if (!dateVal || dateVal.trim() === "") {
                document.getElementById('dateLine').style.display = 'none';
            } else {
                document.getElementById('dateTime').textContent = dateVal;
                
                let cleanDateString = dateVal.replace('@', '').trim();
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
                // Pre-load the map URL, but keep it hidden by default!
                document.getElementById('miniMap').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(locVal) + '&t=m&z=14&output=embed';
                
                // Toggle Map Visibility on Click
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
        }
        
        // --- FIXED: Modal Message Logic ---
        if (customData.msg !== undefined && customData.msg !== null) {
            document.getElementById('modalMessage').innerHTML = customData.msg;
        }
        
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
        
        // --- RANDOMIZED BUTTON LOGIC ---
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

        let randomDodges = [
            "Too slow! 🐢", "Catch me! 🦋", "Nope! 🏃💨", "Missed! 😛", "Oops! 🙈"
        ];

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
                noBtn.getBoundingClientRect(); // Forces layout recalculation to ensure transition works
            }

            const maxX = window.innerWidth - noBtn.offsetWidth;
            const maxY = window.innerHeight - noBtn.offsetHeight;
            
            const randomX = Math.max(0, Math.floor(Math.random() * maxX));
            const randomY = Math.max(0, Math.floor(Math.random() * maxY));
            
            noBtn.style.left = randomX + 'px';
            noBtn.style.top = randomY + 'px';
        }

        noBtn.addEventListener('mouseover', runaway);
        noBtn.addEventListener('touchstart', runaway);
        noBtn.addEventListener('click', runaway);

        // --- THE "YES" ACTION ---
        yesBtn.addEventListener('click', function() {
            web1.style.animation = 'none';
            web2.style.animation = 'none';
            magic2.style.animation = 'none';
            modalContent.style.animation = 'none';
            jumpscareImg.style.animation = 'none'; 
            blackout.style.animation = 'none';
            tealFog.style.animation = 'none';
            
            void web1.offsetWidth; 
            void magic2.offsetWidth;

            if (isInsidious) {
                modal.style.transition = 'none'; 
                modal.classList.add('active');

                // 1. Light flicker
                blackout.style.animation = 'flickerBlack 0.8s ease-in-out forwards';
                
                // 2. Teal fog
                setTimeout(() => {
                    tealFog.style.animation = 'driftFog 2.5s ease-in-out forwards';
                }, 400);

                // 3. JUMPSCARE & SCREAM!
                splatTimer = setTimeout(() => {
                    screamSound.currentTime = 0; 
                    screamSound.play().catch(e => console.log("Audio block: user didn't interact properly."));
                    jumpscareImg.style.animation = 'snapJumpscare 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                }, 800);
                
                // 4. Fade to modal
                pullTimer = setTimeout(() => {
                    blackout.style.animation = 'fadeBlackout 0.8s ease-out forwards';
                    modalContent.style.animation = 'pullModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                }, 1800); 

            } else {
                modal.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
                modal.classList.add('active');

                if (isDoomsday) {
                    web1.style.animation = 'magicPopRotate 1.5s ease-out forwards';
                    magic2.style.animation = 'magicPopRotate 1.5s ease-out forwards'; 
                    
                    splatTimer = setTimeout(() => {
                        web1.style.animation = 'magicVanish 0.3s ease-in forwards';
                        magic2.style.animation = 'magicVanish 0.3s ease-in forwards'; 
                        
                        pullTimer = setTimeout(() => {
                            modalContent.style.animation = 'pullModal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                        }, 300); 
                    }, 1500); 
                } 
                else {
                    webSound.currentTime = 0;
                    webSound.play().catch(e => console.log("Audio block:", e));
                    
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

        // Close Modal
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
            }
        });