#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR="$SCRIPT_DIR/.fonts_tmp"
BASE_URL="https://github.com/google/material-design-icons/raw/master/variablefont"

# Map: variant name -> font filename on GitHub
declare -A VARIANTS=(
    ["outlined"]="MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.ttf"
    ["rounded"]="MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.ttf"
    ["sharp"]="MaterialSymbolsSharp%5BFILL%2CGRAD%2Copsz%2Cwght%5D.ttf"
)

mkdir -p "$TEMP_DIR"

for variant in "${!VARIANTS[@]}"; do
    filename="${VARIANTS[$variant]}"
    url="${BASE_URL}/${filename}"
    ttf_file="$TEMP_DIR/${variant}.ttf"

    echo "📥 Downloading ${variant} font..."
    curl -L -o "$ttf_file" "$url"

    output_file="$SCRIPT_DIR/icons-${variant}.json"
    echo "⚙️  Processing ${variant} → $(basename "$output_file")"
    node "$SCRIPT_DIR/from_font.js" "$ttf_file" "$output_file"
    echo ""
done

echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Done! Generated JSON files:"
ls -lh "$SCRIPT_DIR"/icons-*.json 2>/dev/null || echo "   (none found)"
