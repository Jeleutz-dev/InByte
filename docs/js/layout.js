// --- 1. THE PUBLIC TOP BAR (Home & General Pages) ---
class AppHeader extends HTMLElement {
    connectedCallback() {
        const isInsidePages = window.location.pathname.includes('/pages/');
        const root = isInsidePages ? '..' : '.'; 

        this.innerHTML = `
            <style>
                /* Dropdown & Avatar Styles */
                .user-dropdown-container { position: relative; display: inline-block; margin-left: 15px; }
                .user-avatar-btn {
                    background: #E23636; color: white; border: none; border-radius: 50%; 
                    width: 42px; height: 42px; display: flex; align-items: center; 
                    justify-content: center; cursor: pointer; transition: transform 0.2s;
                    box-shadow: 0 4px 10px rgba(226, 54, 54, 0.3);
                }
                .user-avatar-btn:hover { transform: scale(1.08); }
                .user-dropdown-menu {
                    position: absolute; right: 0; top: 55px; background: #ffffff; 
                    border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    min-width: 180px; display: none; flex-direction: column; overflow: hidden; z-index: 100;
                }
                .dark-mode .user-dropdown-menu { background: #1a1a2e; border-color: #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .user-dropdown-menu.active { display: flex; }
                
                .dropdown-item {
                    background: transparent; border: none; padding: 14px 20px;
                    text-align: left; cursor: pointer; color: #333; text-decoration: none; display: block;
                    font-family: inherit; font-size: 0.95rem; font-weight: 500;
                    border-bottom: 1px solid #eee; transition: background 0.2s;
                }
                .dark-mode .dropdown-item { color: #fff; border-bottom-color: #333; }
                .dropdown-item:last-child { border-bottom: none; }
                .dropdown-item:hover { background: rgba(226, 54, 54, 0.1); color: #E23636; }

                /* Mobile Menu Adjustments */
                .mobile-only-actions { display: none; width: 100%; flex-direction: column; gap: 10px; margin-top: 5px; }
                .mobile-divider { border-top: 1px solid #eee; margin: 5px 0; width: 100%; }
                .dark-mode .mobile-divider { border-top-color: #333; }

                @media (max-width: 768px) {
                    .nav-center, .nav-right { display: none !important; } /* Hide desktop blocks */
                    .mobile-only-actions { display: flex; }
                    .mobile-only-actions .dropdown-item {
                        border: 1px solid #ddd; border-radius: 8px; text-align: center;
                        padding: 14px 20px; width: 100%; box-sizing: border-box;
                    }
                    .dark-mode .mobile-only-actions .dropdown-item { border-color: #333; }
                }
            </style>

            <nav class="navbar">
                <a href="${root}/" class="logo-container">
                    <img src="${root}/assets/inbyte.png" alt="InByte Logo" class="nav-logo-img">
                    <div class="logo-text">
                        <span style="color: #f1c1c8;">In</span><span style="color: #8e5968;">Byte</span><span>.date</span>
                    </div>
                </a>

                <button class="hamburger" id="hamburgerMenu" aria-label="Toggle Menu">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>

                <div class="nav-menu" id="navMenu">
                    <!-- DESKTOP LINKS (Original clean style) -->
                    <div class="nav-center">
                        <a href="${root}/pages/about.html">About</a>
                        <a href="${root}/pages/contact.html">Contact</a>
                    </div>
                    
                    <!-- DESKTOP AVATAR (Right side) -->
                    <div class="nav-right">
                        <div class="user-dropdown-container">
                            <button class="user-avatar-btn" id="publicDropdownBtn" aria-label="User Menu">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </button>
                            <div class="user-dropdown-menu" id="publicDropdownMenu">
                                <button class="dropdown-item public-theme-toggle">🌙 Dark Mode</button>
                                <a href="${root}/pages/login.html" class="dropdown-item">👤 Login</a>
                            </div>
                        </div>
                    </div>

                    <!-- MOBILE ACTIONS (Outlined in Hamburger) -->
                    <div class="mobile-only-actions">
                        <a href="${root}/pages/about.html" class="dropdown-item">About</a>
                        <a href="${root}/pages/contact.html" class="dropdown-item">Contact</a>
                        
                        <div class="mobile-divider"></div>
                        
                        <button class="dropdown-item public-theme-toggle">🌙 Dark Mode</button>
                        <a href="${root}/pages/login.html" class="dropdown-item">👤 Login</a>
                    </div>
                </div>
            </nav>
        `;

        // Hamburger Menu Logic
        const hamburger = this.querySelector('#hamburgerMenu');
        const navMenu = this.querySelector('#navMenu');
        
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); 
            navMenu.classList.toggle('active');
        });

        // Dropdown Logic
        const publicDropdownBtn = this.querySelector('#publicDropdownBtn');
        const publicDropdownMenu = this.querySelector('#publicDropdownMenu');
        
        if (publicDropdownBtn && publicDropdownMenu) {
            publicDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                publicDropdownMenu.classList.toggle('active');
            });
        }

        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active') && !this.contains(event.target)) {
                navMenu.classList.remove('active');
            }
            if (publicDropdownMenu && publicDropdownMenu.classList.contains('active') && !publicDropdownBtn.contains(event.target) && !publicDropdownMenu.contains(event.target)) {
                publicDropdownMenu.classList.remove('active');
            }
        });

        // Theme Toggle Logic
        const themeToggles = this.querySelectorAll('.public-theme-toggle');
        const html = document.documentElement; 
        const body = document.body;            

        const updateThemeUI = (isDark) => {
            themeToggles.forEach(btn => {
                btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            });
        };

        if (localStorage.getItem('theme') === 'dark') {
            html.classList.add('dark-mode');
            body.classList.add('dark-mode');
            updateThemeUI(true);
        } else {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
            updateThemeUI(false);
        }

        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                html.classList.toggle('dark-mode');
                body.classList.toggle('dark-mode');
                
                const isDark = body.classList.contains('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeUI(isDark);
            });
        });
    }
}

// --- 2. THE PUBLIC BOTTOM BAR COMPONENT ---
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

// --- 3. THE PRIVATE TOP BAR (Dashboard & Generator) ---
class PrivateHeader extends HTMLElement {
    connectedCallback() {
        const path = window.location.pathname;
        const isSubfolder = path.includes('/pages/') || path.includes('/web-generator/') || path.includes('/invite/');
        const root = isSubfolder ? '..' : '.';

        const isDashboard = path.includes('dashboard.html');
        const logoHref = isDashboard ? '#' : `${root}/pages/dashboard.html`;
        const logoAction = isDashboard ? 'onclick="window.location.reload()"' : '';

        this.innerHTML = `
            <style>
                .dashboard-nav-link {
                    text-decoration: none; text-align: center; font-family: inherit;
                    font-size: 1rem; font-weight: 1000; background: transparent;
                    border: none; padding: 8px 12px; cursor: pointer; color: #2b2b2b;
                    transition: color 0.3s ease;
                }
                .dark-mode .dashboard-nav-link { color: #fff; }

                /* Dropdown & Avatar Styles */
                .user-dropdown-container { position: relative; display: inline-block; margin-left: 15px; }
                .user-avatar-btn {
                    background: #E23636; color: white; border: none; border-radius: 50%; 
                    width: 42px; height: 42px; display: flex; align-items: center; 
                    justify-content: center; cursor: pointer; transition: transform 0.2s;
                    box-shadow: 0 4px 10px rgba(226, 54, 54, 0.3);
                }
                .user-avatar-btn:hover { transform: scale(1.08); }
                .user-dropdown-menu {
                    position: absolute; right: 0; top: 55px; background: #ffffff; 
                    border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    min-width: 180px; display: none; flex-direction: column; overflow: hidden; z-index: 100;
                }
                .dark-mode .user-dropdown-menu { background: #1a1a2e; border-color: #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .user-dropdown-menu.active { display: flex; }
                
                .dropdown-item {
                    background: transparent; border: none; padding: 14px 20px; text-decoration: none; display: block;
                    text-align: left; cursor: pointer; color: #333;
                    font-family: inherit; font-size: 0.95rem; font-weight: 500;
                    border-bottom: 1px solid #eee; transition: background 0.2s;
                }
                .dark-mode .dropdown-item { color: #fff; border-bottom-color: #333; }
                .dropdown-item:last-child { border-bottom: none; }
                .dropdown-item:hover { background: rgba(226, 54, 54, 0.1); color: #E23636; }

                /* Mobile Menu Adjustments */
                .mobile-only-actions { display: none; width: 100%; flex-direction: column; gap: 10px; margin-top: 5px; }
                .mobile-divider { border-top: 1px solid #eee; margin: 5px 0; width: 100%; }
                .dark-mode .mobile-divider { border-top-color: #333; }

                @media (max-width: 768px) {
                    .desktop-nav-link, .nav-right { display: none !important; } /* Hide desktop blocks */
                    .mobile-only-actions { display: flex; }
                    
                    .mobile-only-actions .dropdown-item {
                        border: 1px solid #ddd; border-radius: 8px; text-align: center;
                        padding: 14px 20px; width: 100%; box-sizing: border-box;
                    }
                    .dark-mode .mobile-only-actions .dropdown-item { border-color: #333; }
                }
            </style>
            
            <nav class="navbar" style="justify-content: space-between;">
                <a href="${logoHref}" ${logoAction} class="logo-container">
                    <img src="${root}/assets/inbyte.png" alt="InByte Logo" class="nav-logo-img">
                    <div class="logo-text">
                        <span style="color: #f1c1c8;">In</span><span style="color: #8e5968;">Byte</span><span>.date</span>
                    </div>
                </a>
                
                <button class="hamburger" id="privateHamburgerMenu" aria-label="Toggle Menu">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>

                <div class="nav-menu" id="privateNavMenu" style="gap: 20px;">
                    <!-- DESKTOP LINK (Original style) -->
                    <a href="${root}/pages/dashboard.html" class="dashboard-nav-link desktop-nav-link">Dashboard</a>
                    
                    <!-- DESKTOP AVATAR (Right side) -->
                    <div class="nav-right">
                        <div class="user-dropdown-container">
                            <button class="user-avatar-btn" id="userDropdownBtn" aria-label="User Menu">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </button>
                            <div class="user-dropdown-menu" id="userDropdownMenu">
                                <button class="dropdown-item global-theme-toggle">🌙 Dark Mode</button>
                                <button class="dropdown-item global-logout-trigger">👤 Log Out</button>
                            </div>
                        </div>
                    </div>

                    <!-- MOBILE ACTIONS (Outlined in Hamburger) -->
                    <div class="mobile-only-actions">
                        <a href="${root}/pages/dashboard.html" class="dropdown-item">📊 Dashboard</a>
                        
                        <div class="mobile-divider"></div>
                        
                        <button class="dropdown-item global-theme-toggle">🌙 Dark Mode</button>
                        <button class="dropdown-item global-logout-trigger">👤 Log Out</button>
                    </div>
                </div>

                <button id="privateLogoutBtn" style="display: none;"></button>
            </nav>
        `;

        // Hamburger Menu Logic
        const hamburger = this.querySelector('#privateHamburgerMenu');
        const navMenu = this.querySelector('#privateNavMenu');
        
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); 
            navMenu.classList.toggle('active');
        });

        // Dropdown Logic
        const userDropdownBtn = this.querySelector('#userDropdownBtn');
        const userDropdownMenu = this.querySelector('#userDropdownMenu');
        
        if (userDropdownBtn && userDropdownMenu) {
            userDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdownMenu.classList.toggle('active');
            });
        }

        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active') && !this.contains(event.target)) {
                navMenu.classList.remove('active');
            }
            if (userDropdownMenu && userDropdownMenu.classList.contains('active') && !userDropdownBtn.contains(event.target) && !userDropdownMenu.contains(event.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });

        // Theme Toggle Logic
        const themeToggles = this.querySelectorAll('.global-theme-toggle');
        const html = document.documentElement; 
        const body = document.body;            

        const updateThemeUI = (isDark) => {
            themeToggles.forEach(btn => {
                btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            });
        };

        if (localStorage.getItem('theme') === 'dark') {
            html.classList.add('dark-mode');
            body.classList.add('dark-mode');
            updateThemeUI(true);
        } else {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
            updateThemeUI(false);
        }

        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                html.classList.toggle('dark-mode');
                body.classList.toggle('dark-mode');
                
                const isDark = body.classList.contains('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeUI(isDark);
            });
        });

        // Logout Routing
        const logoutTriggers = this.querySelectorAll('.global-logout-trigger');
        const hiddenLogoutBtn = this.querySelector('#privateLogoutBtn');
        
        logoutTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                if (hiddenLogoutBtn) hiddenLogoutBtn.click();
            });
        });
    }
}

// --- 4. THE PRIVATE BOTTOM BAR ---
class PrivateFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer" style="padding-top: 20px;">
                <p class="footer-copy">&copy; 2026 InByte.date. All rights reserved.</p>
            </footer>
        `;
    }
}

customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);
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