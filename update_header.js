const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');
const headerMatch = indexContent.match(/<header\b[^>]*>[\s\S]*?<\/header>/);

if (headerMatch) {
    const headerHtml = headerMatch[0];
    const files = fs.readdirSync('.');
    
    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
            let content = fs.readFileSync(file, 'utf8');
            if (/<header\b[^>]*>/.test(content)) {
                content = content.replace(/<header\b[^>]*>[\s\S]*?<\/header>/, headerHtml);
                fs.writeFileSync(file, content);
                console.log('Updated ' + file);
            } else {
                console.log('No header found in ' + file);
            }
        }
    });
} else {
    console.log("No header found in index.html");
}
