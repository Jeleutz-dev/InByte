// --- 1. THE TOP BAR COMPONENT ---
class AppHeader extends HTMLElement {
    connectedCallback() {
        const isInsidePages = window.location.pathname.includes('/pages/');
        const root = isInsidePages ? '..' : '.';

        this.innerHTML = `
            <nav class="navbar">
                <!-- LEFT: Logo & Title -->
                <a href="${root}/" class="logo-container">
                    <img src="${root}/assets/inbyte.png" alt="InByte Logo" class="nav-logo-img">
                    <div class="logo-text">
                        <span style="color: #f1c1c8;">In</span><span style="color: #8e5968;">Byte</span><span>.date</span>
                    </div>
                </a>

                <!-- HAMBURGER BUTTON (Mobile Only) -->
                <button class="hamburger" id="hamburgerMenu" aria-label="Toggle Menu">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>

                <!-- CENTER & RIGHT: Links and Actions -->
                <div class="nav-menu" id="navMenu">
                    <div class="nav-center">
                        <a href="${root}/pages/about.html">About</a>
                        <a href="${root}/pages/contact.html">Contact</a>
                    </div>
                    <div class="nav-right">
                        <a href="${root}/pages/login.html" class="login-btn">Log In</a>
                        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">🌙</button>
                    </div>
                </div>
            </nav>
        `;

        // --- Hamburger Menu Logic & Click-Outside Fix ---
        const hamburger = this.querySelector('#hamburgerMenu');
        const navMenu = this.querySelector('#navMenu');
        
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevents the click from instantly triggering the document listener
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking anywhere outside of the navbar
        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active')) {
                const isClickInside = this.contains(event.target);
                if (!isClickInside) {
                    navMenu.classList.remove('active');
                }
            }
        });

        // --- Dark Mode Logic ---
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

// --- 2. THE BOTTOM BAR COMPONENT ---
class AppFooter extends HTMLElement {
    connectedCallback() {
        const isInsidePages = window.location.pathname.includes('/pages/');
        const root = isInsidePages ? '..' : '.';

        this.innerHTML = `
            <footer class="footer">
                <div class="footer-links">
                    <a href="${root}/pages/privacy.html">Privacy Notice</a>
                    <a href="${root}/pages/terms.html">Terms and Conditions</a>
                    <a href="${root}/pages/contact.html">Contact Us</a>
                    <a href="${root}/pages/faq.html">FAQ</a>
                </div>
                <p class="footer-copy">&copy; 2026 InByte.date. All rights reserved.</p>
            </footer>
            
            <button id="scrollTopBtn" class="scroll-to-top" aria-label="Scroll to top">
                ↑
            </button>
        `;

        const scrollBtn = this.querySelector('#scrollTopBtn');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Register custom HTML tags
customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);

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