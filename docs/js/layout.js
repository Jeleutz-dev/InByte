// --- 1. THE TOP BAR COMPONENT ---
class AppHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar">
                <!-- LEFT: Logo & Title -->
                <a href="/InByte/" class="logo-container">
                    <img src="/InByte/assets/InByte.png" alt="InByte Logo" class="nav-logo-img">
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

                <!-- CENTER & RIGHT: Links and Actions (Collapsible on Mobile) -->
                <div class="nav-menu" id="navMenu">
                    <div class="nav-center">
                        <a href="/InByte/pages/about.html">About</a>
                        <a href="/InByte/pages/contact.html">Contact</a>
                    </div>
                    <div class="nav-right">
                        <a href="/InByte/pages/login.html" class="login-btn">Log In</a>
                        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">🌙</button>
                    </div>
                </div>
            </nav>
        `;

        // --- Hamburger Menu Logic ---
        const hamburger = this.querySelector('#hamburgerMenu');
        const navMenu = this.querySelector('#navMenu');
        
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
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
        this.innerHTML = `
            <footer class="footer">
                <div class="footer-links">
                    <a href="/InByte/pages/privacy.html">Privacy Notice</a>
                    <a href="/InByte/pages/terms.html">Terms and Conditions</a>
                    <a href="/InByte/pages/contact.html">Contact Us</a>
                    <a href="/InByte/pages/faq.html">FAQ</a>
                </div>
                <p class="footer-copy">&copy; 2026 InByte.date. All rights reserved.</p>
            </footer>
            
            <!-- THE NEW SCROLL TO TOP BUTTON -->
            <button id="scrollTopBtn" class="scroll-to-top" aria-label="Scroll to top">
                ↑
            </button>
        `;

        // --- SCROLL TO TOP LOGIC ---
        const scrollBtn = this.querySelector('#scrollTopBtn');
        
        // Listen for scroll events on the entire window
        window.addEventListener('scroll', () => {
            // If scrolled down more than 300 pixels, show the button
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });

        // When clicked, smoothly scroll back to the top
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Register the custom HTML tags
customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);

