# Material Icon Picker Helper

A framework-agnostic helper library containing [Material Symbols](https://fonts.google.com/icons) data, TypeScript types, and metadata.

This package provides everything you need to build your own icon picker or icon component without being tied to a specific framework or bundling heavy font files.

## Features

- **Strict TypeScript**: `IconName` is a union type of all available Material Symbols (over 3,000 icons).
- **Codepoint Mapping**: Access the exact integer codepoints via `iconMap`.
- **Metadata**: Includes `fontFamilyMap` for `outlined`, `rounded`, and `sharp` variants.
- **Lightweight**: Zero runtime dependencies.

## Installation

```bash
npm install material-icon-picker-helper
```

## Setup (Important)

This package **does not** bundle the `.ttf` font files. You must load the fonts in your application.

### Load the Fonts in CSS

Assuming you have the fonts downloaded (e.g., in a `public/fonts/` directory):

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

## Usage

### Using Codepoints

Using codepoints is recommended to prevent rendering "text" during font loading.

```typescript
import { iconMap, fontFamilyMap } from 'material-icon-picker-helper';

const iconName = 'home';
const codepoint = iconMap[iconName]; // 0xe88a

// Example rendering in Vanilla JS:
const el = document.createElement('span');
el.style.fontFamily = fontFamilyMap['outlined'];
el.textContent = String.fromCodePoint(codepoint);
document.body.appendChild(el);
```

### TypeScript Types

```typescript
import { IconName, IconVariant } from 'material-icon-picker-helper';

function getIcon(name: IconName, variant: IconVariant) {
  // name is type-safe: 'home', 'search', 'settings', etc.
}
```

## API

### `iconMap`

A `Record<IconName, number>` mapping icon names to their Unicode codepoints.

### `fontFamilyMap`

A mapping of `IconVariant` to the recommended font family name.

- `outlined`: 'Material Symbols Outlined'
- `rounded`: 'Material Symbols Rounded'
- `sharp`: 'Material Symbols Sharp'

### `iconNames`

An array of all available icon names for searching or listing.

## Development

This package is updated automatically via GitHub Actions whenever the upstream Material Symbols change. The `scripts/generate-types.js` script reads the latest mapping and rebuilds the `IconSet.ts` file.
