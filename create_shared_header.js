const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');
const headerMatch = indexContent.match(/<header\b[^>]*>[\s\S]*?<\/header>/);

if (headerMatch) {
    const headerHtml = headerMatch[0].replace(/`/g, '\\`');

    const jsContent = `
class StacklyHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = \`${headerHtml}\`;
        
        // Mobile menu wiring
        setTimeout(() => {
            var btn = this.querySelector('.mobile-menu-btn');
            var menu = this.querySelector('.nav-links');
            if (!btn || !menu) return;
            if (btn._menuWired) return;
            btn._menuWired = true;

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
        }, 0);
    }
}
customElements.define('stackly-header', StacklyHeader);
`;
    
    // Ensure assets/js folder exists
    if (!fs.existsSync('assets/js')) {
        fs.mkdirSync('assets/js', { recursive: true });
    }
    fs.writeFileSync('assets/js/header.js', jsContent);
    console.log('Created assets/js/header.js');

    const files = fs.readdirSync('.');
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;

            // Replace <header>...</header> with <stackly-header></stackly-header>
            if (/<header\b[^>]*>[\s\S]*?<\/header>/.test(content)) {
                content = content.replace(/<header\b[^>]*>[\s\S]*?<\/header>/, '<stackly-header></stackly-header>');
                modified = true;
            }

            // Ensure <script src="assets/js/header.js"></script> is in <head>
            if (!content.includes('assets/js/header.js')) {
                // Add right before </head>
                content = content.replace('</head>', '    <script src="assets/js/header.js"></script>\n</head>');
                modified = true;
            }

            // Remove the old inline direct mobile menu wiring script if it exists
            const mobileScriptRegex = /<script>\s*\/\/\s*Direct hamburger menu wiring[\s\S]*?<\/script>/;
            if (mobileScriptRegex.test(content)) {
                content = content.replace(mobileScriptRegex, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(file, content);
                console.log('Updated ' + file + ' to use shared header component');
            }
        }
    });
} else {
    console.log("No header found in index.html");
}
