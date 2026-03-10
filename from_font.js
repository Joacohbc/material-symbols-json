const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

// Rutas de entrada y salida
const rutaFuente = path.join(__dirname, 'MaterialSymbolsOutlined-VariableFont_FILL,GRAD,opsz,wght.ttf');
const rutaSalida = path.join(__dirname, 'iconos.json');

opentype.load(rutaFuente, (err, font) => {
    if (err) {
        console.error('❌ Error al cargar la fuente:', err);
        return;
    }

    const iconos = {};

    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.get(i);

        // Filtramos para quedarnos solo con glyphs que sean iconos reales:
        // - Tienen nombre
        // - Nombre de más de 1 carácter
        // - No empiezan con '.'
        // - No son codepoints unicode (uXXXX o uniXXXX)
        // - No terminan en .fill
        // - Su unicode está en el rango PUA o alto (>= 0xE000), descartando ASCII/Latin
        if (
            glyph.name &&
            glyph.name.length > 1 &&
            !glyph.name.startsWith('.') &&
            !/^u[0-9A-F]{4,}/i.test(glyph.name) &&
            !/^uni[0-9A-F]{4,}/i.test(glyph.name) &&
            !glyph.name.endsWith('.fill') &&
            glyph.unicode >= 0xE000
        ) {
            iconos[glyph.name.toLowerCase()] = glyph.unicode;
        }
    }

    // Ordenar alfabéticamente por nombre
    const ordenado = {};
    Object.keys(iconos).sort().forEach(key => {
        ordenado[key] = iconos[key];
    });

    fs.writeFileSync(rutaSalida, JSON.stringify(ordenado, null, 2), 'utf-8');

    console.log(`✅ ¡Éxito! Se guardaron ${Object.keys(ordenado).length} íconos en: ${rutaSalida}`);
});