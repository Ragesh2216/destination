const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');
const headerMatch = indexContent.match(/<header>[\s\S]*?<\/header>/);

if (headerMatch) {
    const headerHtml = '\n    ' + headerMatch[0] + '\n';
    
    ['signup.html', '404.html'].forEach(file => {
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            if (!content.includes('<header>')) {
                // Insert after <body> or <div id="particles-js"></div>
                if (content.includes('<div id="particles-js"></div>')) {
                    content = content.replace('<div id="particles-js"></div>', '<div id="particles-js"></div>' + headerHtml);
                } else if (content.includes('<body>')) {
                    content = content.replace('<body>', '<body>' + headerHtml);
                }
                
                // Add header override css if not exists
                if (!content.includes('/* Header Overrides */') && file === 'signup.html') {
                    const css = `
        /* Header Overrides */
        header {
            background: transparent;
            position: absolute;
            width: 100%;
            z-index: 100;
            top: 0;
            left: 0;
        }
        header.scrolled {
            background: rgba(255,255,255,0.95);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: fixed;
        }
        header .nav-links li a, header .nav-icons span {
            color: #fff;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        header.scrolled .nav-links li a, header.scrolled .nav-icons span {
            color: var(--color-black);
            text-shadow: none;
        }
        header .nav-links li a.active {
            color: var(--color-rose-gold);
        }
`;
                    content = content.replace('</style>', css + '</style>');
                }
                
                fs.writeFileSync(file, content);
                console.log('Forced header in ' + file);
            } else {
                console.log('Header already exists in ' + file);
            }
        }
    });
}
