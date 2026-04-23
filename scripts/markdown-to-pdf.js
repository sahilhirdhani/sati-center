const fs = require('fs');
const path = require('path');

function createPdf(inputText, outputPath) {
    // Basic markdown stripping
    let text = inputText
        .replace(/^#+\s+/gm, '') // titles
        .replace(/\*\*/g, '')    // bold
        .replace(/`/g, '')       // inline code
        .replace(/^\s*[-*+]\s+/gm, '  - ') // list items
        .replace(/^>\s+/gm, '  ') // blockquotes
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)'); // links

    // Line wrapping (~95 chars)
    const wrap = (str, width) => {
        const regex = new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g');
        return str.replace(regex, '$1\n');
    };
    text = wrap(text, 95);

    const lines = text.split('\n');
    const linesPerPage = 52;
    const pages = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
        pages.push(lines.slice(i, i + linesPerPage));
    }

    // PDF Generation (Very minimal PDF 1.4)
    // We'll build the catalog, pages tree, and page objects manually.
    let pdf = "%PDF-1.4\n";
    const objects = [];

    const addObject = (content) => {
        objects.push(content);
        return objects.length;
    };

    // 1: Catalog
    // 2: Parent Pages
    // 3+: Individual Page Objects
    // Content Objects
    // Font Object

    const fontObjIdx = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    
    const pageIndices = [];
    const contentIndices = [];

    pages.forEach(pageLines => {
        const content = "BT /F1 12 Tf 50 750 Td 15 TL\n" + 
            pageLines.map(line => `(${line.replace(/[()\\]/g, '\\$&')}) '`).join('\n') + 
            "\nET";
        const streamIdx = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
        contentIndices.push(streamIdx);
    });

    const pagesIdx = objects.length + 1;
    contentIndices.forEach((cIdx, i) => {
        pageIndices.push(addObject(`<< /Type /Page /Parent ${pagesIdx} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjIdx} 0 R >> >> /Contents ${cIdx} 0 R >>`));
    });

    // Pages Tree
    const pagesTreeIdx = addObject(`<< /Type /Pages /Kids [${pageIndices.map(i => `${i} 0 R`).join(' ')}] /Count ${pageIndices.length} >>`);
    
    // Catalog
    const catalogIdx = addObject(`<< /Type /Catalog /Pages ${pagesTreeIdx} 0 R >>`);

    // Final Assembly
    let output = "%PDF-1.4\n";
    const xref = [];
    objects.forEach((obj, i) => {
        xref.push(output.length);
        output += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });

    const xrefOffset = output.length;
    output += "xref\n";
    output += `0 ${objects.length + 1}\n`;
    output += "0000000000 65535 f \n";
    xref.forEach(offset => {
        output += ("0000000000" + offset).slice(-10) + " 00000 n \n";
    });

    output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogIdx} 0 R >>\n`;
    output += "startxref\n" + xrefOffset + "\n%%EOF";

    fs.writeFileSync(outputPath, output, 'binary');
}

const inputPath = path.join(__dirname, '..', 'documentation.md');
const outputPath = path.join(__dirname, '..', 'documentation.pdf');

if (fs.existsSync(inputPath)) {
    const content = fs.readFileSync(inputPath, 'utf8');
    createPdf(content, outputPath);
    console.log('PDF created successfully.');
} else {
    console.error('documentation.md not found.');
    process.exit(1);
}
