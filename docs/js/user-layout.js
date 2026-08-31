// --- 1. THE PRIVATE TOP BAR (Dashboard & Generator) ---
class PrivateHeader extends HTMLElement {
    connectedCallback() {
        const path = window.location.pathname;
        const isSubfolder = path.includes('/pages/') || path.includes('/web-generator/') || path.includes('/invite/');
        const root = isSubfolder ? '..' : '.';

        const isDashboard = path.includes('dashboard.html');
        const logoHref = isDashboard ? '#' : `${root}/pages/dashboard.html`;
        const logoAction = isDashboard ? 'onclick="window.location.reload()"' : '';

        this.innerHTML = `
            <nav class="navbar">
                <a href="${logoHref}" ${logoAction} class="logo-container">
                    <img src="${root}/assets/inbyte.png" alt="InByte Logo" class="nav-logo-img">
                    <div class="logo-text">
                        <span style="color: #f1c1c8;">In</span><span style="color: #8e5968;">Byte</span><span>.date</span>
                    </div>
                </a>
                
                <!-- Hamburger Button -->
                <button class="hamburger" id="privateHamburgerMenu" aria-label="Toggle Menu">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>

                <div class="nav-menu" id="privateNavMenu" style="gap: 30px;">
                    <div class="nav-right" style="display: flex; align-items: center; gap: 15px;">
                        <a href="${root}/pages/dashboard.html" class="login-btn" style="text-decoration: none; text-align: center;">Dashboard</a>
                        <button id="privateLogoutBtn" class="login-btn" style="cursor: pointer; font-family: inherit;">Log Out</button>
                        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">🌙</button>
                    </div>
                </div>
            </nav>
        `;

        // Hamburger Menu Logic
        const hamburger = this.querySelector('#privateHamburgerMenu');
        const navMenu = this.querySelector('#privateNavMenu');
        
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); 
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active')) {
                const isClickInside = this.contains(event.target);
                if (!isClickInside) {
                    navMenu.classList.remove('active');
                }
            }
        });

        // Dark Mode Logic
        const themeToggle = this.querySelector('#themeToggle');
        const html = document.documentElement; 
        const body = document.body;            

        if (localStorage.getItem('theme') === 'dark') {
            html.classList.add('dark-mode');
            body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
            themeToggle.textContent = '🌙';
        }

        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark-mode');
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                themeToggle.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// --- PRIVATE BOTTOM BAR ---
class PrivateFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer" style="padding-top: 20px;">
                <p class="footer-copy">&copy; 2026 InByte.date. All rights reserved.</p>
            </footer>
        `;
    }
}

customElements.define('private-header', PrivateHeader);
customElements.define('private-footer', PrivateFooter);

// --- GLOBAL FLOATING EMOJI BACKGROUND INJECTOR ---
function initFloatingEmojis() {
    let emojiContainer = document.getElementById('emojiContainer');
    if (!emojiContainer) {
        emojiContainer = document.createElement('div');
        emojiContainer.id = 'emojiContainer';
        emojiContainer.className = 'floating-emojis-container';
        document.body.prepend(emojiContainer);
    }

    function spawnEmoji() {
        if (!emojiContainer) return;

        if (emojiContainer.getElementsByClassName('floating-emoji-wrapper').length >= 6) {
            return;
        }

        const wrapperEl = document.createElement('div');
        wrapperEl.classList.add('floating-emoji-wrapper');
        
        const innerEl = document.createElement('span');
        innerEl.classList.add('floating-emoji-inner');
        
        const lightEmojis = ['💕', '💞', '💓', '💗', '💖', '💘', '💝', '💋', '🌸', '🩷', '🎟️', '✨', '🌷'];
        const darkEmojis = ['✨', '⭐', '🌟', '☄️', '🌕', '🌙', '🪐', '🤍', '💖'];

        const isDark = document.body.classList.contains('dark-mode');
        const activeArray = isDark ? darkEmojis : lightEmojis;
        
        const randomEmoji = activeArray[Math.floor(Math.random() * activeArray.length)];
        innerEl.innerText = randomEmoji;
        
        wrapperEl.style.left = Math.random() * 100 + 'vw';
        
        const size = Math.random() * 1.3 + 1.2;
        innerEl.style.fontSize = size + 'rem';
        
        wrapperEl.appendChild(innerEl);
        emojiContainer.appendChild(wrapperEl);
        
        const floatDuration = Math.random() * 12 + 12;
        
        wrapperEl.style.animation = `floatUp ${floatDuration}s linear forwards`;
        innerEl.style.animation = `fadeInOut ${floatDuration}s linear forwards`;
        
        setTimeout(() => {
            wrapperEl.remove();
        }, floatDuration * 1000);
    }

    setInterval(spawnEmoji, 2000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingEmojis);
} else {
    initFloatingEmojis();
}