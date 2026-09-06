const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');

// The mobile menu script block from index.html
const scriptToInject = `
    <script>
        // Direct hamburger menu wiring — guaranteed to run after all other scripts
        (function() {
            var btn = document.querySelector('.mobile-menu-btn');
            var menu = document.querySelector('.nav-links');
            if (!btn || !menu) return;
            if (btn._menuWired) return; // prevent double wiring
            btn._menuWired = true;

            // Create overlay
            var overlay = document.querySelector('.menu-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'menu-overlay';
                document.body.appendChild(overlay);
            }

            function openMenu() {
                menu.classList.add('active');
                overlay.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }

            function closeMenu() {
                menu.classList.remove('active');
                overlay.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (menu.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            overlay.addEventListener('click', closeMenu);

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
            });
        })();
    </script>
`;

const files = fs.readdirSync('.');
files.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html') {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Check if this specific script is already there by looking for a unique comment
        if (!content.includes('// Direct hamburger menu wiring')) {
            content = content.replace('</body>', scriptToInject + '</body>');
            modified = true;
        }
        
        // Let's also check if `.mobile-only` CSS is missing from style.css or responsive-fixes.css 
        // Not checking for now since we injected responsive-fixes.css

        if (modified) {
            fs.writeFileSync(file, content);
            console.log('Injected mobile menu script into ' + file);
        }
    }
});
