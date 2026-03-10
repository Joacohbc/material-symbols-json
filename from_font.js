const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

// Input and output paths (overridable via CLI arguments)
const fontPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, 'MaterialSymbolsOutlined-VariableFont_FILL,GRAD,opsz,wght.ttf');

const outputPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(__dirname, 'icons.json');

opentype.load(fontPath, (err, font) => {
    if (err) {
        console.error('❌ Error loading font:', err);
        process.exit(1);
    }

    const icons = {};

    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.get(i);

        // Filter to keep only real icon glyphs:
        // - Has a name
        // - Name is longer than 1 character
        // - Doesn't start with '.'
        // - Is not a unicode codepoint name (uXXXX or uniXXXX)
        // - Doesn't end with .fill
        // - Unicode is in the PUA range or higher (>= 0xE000), discarding ASCII/Latin
        if (
            glyph.name &&
            glyph.name.length > 1 &&
            !glyph.name.startsWith('.') &&
            !/^u[0-9A-F]{4,}/i.test(glyph.name) &&
            !/^uni[0-9A-F]{4,}/i.test(glyph.name) &&
            !glyph.name.endsWith('.fill') &&
            glyph.unicode >= 0xE000
        ) {
            icons[glyph.name.toLowerCase()] = glyph.unicode;
        }
    }

    // Sort alphabetically by name
    const sorted = {};
    Object.keys(icons).sort().forEach(key => {
        sorted[key] = icons[key];
    });

    fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2), 'utf-8');

    console.log(`✅ Success! Saved ${Object.keys(sorted).length} icons to: ${outputPath}`);
});