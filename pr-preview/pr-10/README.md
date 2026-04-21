# material-symbols-json

JSON mappings of all [Material Symbols](https://fonts.google.com/icons) icons extracted directly from the variable TTF fonts (Outlined, Rounded, Sharp). Each file maps icon name → Unicode codepoint.

## Files

| File | Font source | Description |
|------|-------------|-------------|
| `icons-outlined.json` | `MaterialSymbolsOutlined.ttf` | Outlined variant |
| `icons-rounded.json` | `MaterialSymbolsRounded.ttf` | Rounded variant |
| `icons-sharp.json` | `MaterialSymbolsSharp.ttf` | Sharp variant |

Each entry:

```json
{
  "home": 57520,
  "search": 59574,
  ...
}
```

~3900 icons per variant, auto-updated weekly from [google/material-design-icons](https://github.com/google/material-design-icons).

## Install

```bash
npm install material-icon-picker-helper
```

## Usage

```js
import { outlined, rounded, sharp } from 'material-icon-picker-helper';

const codepoint = outlined['home']; // 57520
String.fromCodePoint(codepoint);    // renders the icon glyph
```

## Use the Fonts

Load the TTF fonts with `@font-face` (e.g. from a `public/fonts/` directory):

```css
@font-face {
  font-family: 'Material Symbols Outlined';
  src: url('/fonts/MaterialSymbolsOutlined.ttf') format('truetype');
  font-weight: 100 700;
  font-style: normal;
}

@font-face {
  font-family: 'Material Symbols Rounded';
  src: url('/fonts/MaterialSymbolsRounded.ttf') format('truetype');
  font-weight: 100 700;
  font-style: normal;
}

@font-face {
  font-family: 'Material Symbols Sharp';
  src: url('/fonts/MaterialSymbolsSharp.ttf') format('truetype');
  font-weight: 100 700;
  font-style: normal;
}
```

Then render an icon by applying the codepoint as text content:

```css
.icon {
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
}
```

```html
<span class="icon">&#x57520;</span>
```

## How it works

Icons are extracted from the TTF variable fonts using [opentype.js](https://github.com/opentypejs/opentype.js). Only glyphs in the Unicode PUA range (≥ U+E000) with a valid name are included. The fonts and JSON files are auto-updated weekly via GitHub Actions.
