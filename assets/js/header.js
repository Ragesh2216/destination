class StacklyHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<header class="stackly-site-header" style="background-color: #ffffff !important; background: #ffffff !important; box-shadow: 0 2px 15px rgba(0,0,0,0.08) !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 100000;">
        <div class="container">
            <nav class="navbar" style="position: relative;">
                <a href="index.html" class="logo" style="display:flex; align-items:center; text-decoration: none; position: relative; z-index: 100005;">
                    <img src="images/stackly_logo.webp" alt="Aura Destination Management Logo" class="nav-logo-img" style="height: 40px; width: auto; max-width: 170px; object-fit: contain;">
                </a>
                
                <ul class="nav-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="shop.html">Service</a></li>
                    <li><a href="blog.html">Blog</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>

                <div class="nav-icons" style="display:flex; align-items:center; gap: 15px; position: relative; z-index: 100005;">
                    <a href="login.html" class="btn-login-nav"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
                    <button type="button" class="mobile-menu-btn hamburger-icon" aria-expanded="false" aria-label="Toggle navigation menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>
        </div>
    </header>`;
        
        // Immediate, synchronous menu setup & preloader
        this.setupMenu();
        this.setupPreloader();
    }

    setupPreloader() {
        var preloader = document.getElementById('site-preloader');
        if (!preloader && document.body) {
            preloader = document.createElement('div');
            preloader.id = 'site-preloader';
            preloader.className = 'site-preloader';
            preloader.innerHTML = `
                <div class="preloader-inner">
                    <div class="preloader-logo-wrapper">
                        <img src="images/stackly_logo.webp" alt="Aura DMC Loading..." class="preloader-logo-img">
                    </div>
                    <div class="preloader-bar">
                        <div class="preloader-progress"></div>
                    </div>
                    <span class="preloader-text">AURA DESTINATION MANAGEMENT</span>
                </div>
            `;
            document.body.prepend(preloader);
        }

        function hidePreloader() {
            var pl = document.getElementById('site-preloader');
            if (pl && !pl.classList.contains('fade-out')) {
                pl.classList.add('fade-out');
                setTimeout(function() {
                    if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
                }, 600);
            }
        }

        if (document.readyState === 'complete') {
            setTimeout(hidePreloader, 350);
        } else {
            window.addEventListener('load', function() {
                setTimeout(hidePreloader, 350);
            });
            setTimeout(hidePreloader, 2500); // Safety fallback
        }
    }

    setupMenu() {
        var headerEl = this.querySelector('header');
        var path = window.location.pathname.split('/').pop() || 'index.html';
        if (!path || path === '/') path = 'index.html';

        var navAnchors = this.querySelectorAll('.nav-links a');
        navAnchors.forEach(function(a) {
            var href = a.getAttribute('href') || '';
            var targetPage = href.split('/').pop();
            if (targetPage === path && !a.classList.contains('btn-login-nav')) {
                a.classList.add('nav-active');
                a.style.color = '#00A896';
                a.style.fontWeight = '700';
            }
        });

        var btn = this.querySelector('.mobile-menu-btn');
        var menu = this.querySelector('.nav-links');
        if (!btn || !menu) return;

        btn._menuWired = true;

        var overlay = document.querySelector('.menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            if (document.body) {
                document.body.appendChild(overlay);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    if (!document.querySelector('.menu-overlay')) {
                        document.body.appendChild(overlay);
                    }
                });
            }
        }

        function openMenu() {
            menu.classList.add('active');
            if (overlay) overlay.classList.add('active');
            if (headerEl) headerEl.classList.add('menu-open');
            btn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            menu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (headerEl) headerEl.classList.remove('menu-open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleMenu(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (menu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        btn.addEventListener('click', toggleMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);

        var links = menu.querySelectorAll('a');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href') || '';
                if (href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    closeMenu();
                    var target = document.getElementById(href.slice(1));
                    if (target) {
                        setTimeout(function() {
                            var top = target.getBoundingClientRect().top + window.scrollY - 80;
                            window.scrollTo({ top: top, behavior: 'smooth' });
                        }, 200);
                    }
                } else if (href === '#') {
                    e.preventDefault();
                    closeMenu();
                } else {
                    closeMenu();
                }
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
        });
    }
}
customElements.define('stackly-header', StacklyHeader);
