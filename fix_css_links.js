const fs = require('fs');

const files = fs.readdirSync('.');
files.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html') {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        if (!content.includes('candy.css')) {
            content = content.replace('</head>', '    <link rel="stylesheet" href="assets/css/candy.css">\n</head>');
            modified = true;
        }

        // Also ensure style.css and animations.css have ?v=2 for consistency if they don't
        if (content.includes('style.css"') && !content.includes('style.css?v=2"')) {
            content = content.replace('style.css"', 'style.css?v=2"');
            modified = true;
        }
        if (content.includes('animations.css"') && !content.includes('animations.css?v=2"')) {
            content = content.replace('animations.css"', 'animations.css?v=2"');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(file, content);
            console.log('Injected missing CSS links into ' + file);
        }
    }
});
