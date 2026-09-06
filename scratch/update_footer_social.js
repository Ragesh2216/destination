const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    const regex = /<div\s+class="footer-social-icons"[^>]*>([\s\S]*?)<\/div>/gi;
    content = content.replace(regex, (match, inner) => {
        const updatedInner = inner.replace(/href="[^"]*"/g, 'href="404.html"')
                                  .replace(/\s*target="_blank"/g, '');
        if (updatedInner !== inner) modified = true;
        return match.replace(inner, updatedInner);
    });

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Updated footer social icons in:', file);
    }
});
