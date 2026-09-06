/* =========================================
   Stackly - Shared Dashboard JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
    }

    // 2. Dark/Light Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    // Check local storage for theme
    const savedTheme = localStorage.getItem('stackly_theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (root.getAttribute('data-theme') === 'dark') {
                root.removeAttribute('data-theme');
                localStorage.setItem('stackly_theme', 'light');
                themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('stackly_theme', 'dark');
                themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    }

    // 3. Tab Navigation Logic
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class
            item.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
            
            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });

    // 4. Dynamic Username Display
    const storedName = localStorage.getItem('stackly_username') || 'Jane';
    const nameDisplays = document.querySelectorAll('.display-username');
    nameDisplays.forEach(el => el.textContent = storedName);

    const greetingDisplays = document.querySelectorAll('.display-greeting');
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    greetingDisplays.forEach(el => el.textContent = 'Good ' + timeOfDay + ', ' + storedName + '!');

    // 5. GSAP Floating Background Shapes
    if (typeof gsap !== 'undefined') {
        gsap.to('.shape-1', {
            y: "30px", x: "20px", rotation: 10,
            duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1
        });
        gsap.to('.shape-2', {
            y: "-40px", x: "-20px", rotation: -15,
            duration: 10, ease: "sine.inOut", yoyo: true, repeat: -1
        });
        gsap.to('.shape-3', {
            y: "50px", x: "30px", scale: 1.1,
            duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1
        });
    }

    // 6. AOS Initialization
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            once: true,
            offset: 50
        });
    }

    // 7. Generic Button Routing
    document.body.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (btn) {
            // Ignore structural buttons with specific IDs (themeToggle, sidebarToggle)
            if (btn.id === 'themeToggle' || btn.id === 'sidebarToggle') return;
            
            // Ignore tab buttons or navigation elements if any
            if (btn.classList.contains('nav-item')) return;

            const text = btn.innerText.toLowerCase();
            
            // Route based on button text
            if (text.includes('cart') || text.includes('buy') || text.includes('restock')) {
                window.location.href = 'cart.html';
            } else if (text.includes('details') || text.includes('view') || text.includes('track') || text.includes('review')) {
                window.location.href = 'product.html';
            } else if (text.includes('invoice') || text.includes('copy code') || text.includes('edit') || text.includes('delete') || text.includes('save') || text.includes('add') || text.includes('browse') || text.includes('submit')) {
                window.location.href = '404.html';
            } else if (!btn.querySelector('i')) { // If it's a text button without specific keywords
                window.location.href = '404.html';
            } else if (btn.classList.contains('table-action-btn') || btn.classList.contains('icon-btn')) {
                // Catch all small icon buttons in tables or headers that aren't functional
                window.location.href = '404.html';
            } else {
                window.location.href = '404.html';
            }
        }
    });

    // 8. Count-up Animation for Numbers
    const counters = document.querySelectorAll('.count-up');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        // Use IntersectionObserver to start animation when visible
        const observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting) {
                updateCounter();
                observer.disconnect();
            }
        });
        observer.observe(counter);
    });

});
