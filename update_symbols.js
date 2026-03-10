const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'google';
const REPO_NAME = 'material-design-icons';
const SYMBOLS_PATH = 'symbols/web';
const BRANCH = 'master';

// Usamos la API de Git Trees para evitar el límite de 1000 elementos de la API de contents
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}:${SYMBOLS_PATH}`;
const LOCAL_JSON_PATH = path.join(__dirname, 'symbols.json');

async function checkAndUpdateSymbols() {
  console.log(`Buscando las carpetas de la ruta: ${SYMBOLS_PATH} en el repositorio ${REPO_OWNER}/${REPO_NAME}...`);

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Material-Symbols-Fetcher'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching from GitHub API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.truncated) {
      console.warn('Advertencia: El resultado de la API fue truncado.');
    }

    // Filtrar sólo aquellos elementos que son carpetas (tree) y obtener sus nombres
    const folders = data.tree
      .filter(item => item.type === 'tree')
      .map(item => item.path)
      .sort();

    console.log(`Se encontraron ${folders.length} carpetas.`);

    let currentSymbols = [];
    let fileExists = false;

    // Verificar si el archivo local existe y leerlo
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      fileExists = true;
      try {
        const fileContent = fs.readFileSync(LOCAL_JSON_PATH, 'utf-8');
        currentSymbols = JSON.parse(fileContent);
      } catch (e) {
        console.warn('El archivo JSON local existe pero es inválido. Se sobreescribirá.');
      }
    }

    const newSymbolsStr = JSON.stringify(folders, null, 2);
    const currentSymbolsStr = JSON.stringify(currentSymbols, null, 2);

    if (!fileExists || newSymbolsStr !== currentSymbolsStr) {
      console.log('Se detectaron cambios (o es la primera vez que se ejecuta). Actualizando symbols.json...');
      fs.writeFileSync(LOCAL_JSON_PATH, newSymbolsStr, 'utf-8');
      console.log('¡Actualización completada con éxito!');
    } else {
      console.log('No se detectaron cambios. El JSON actual está al día.');
    }
  } catch (error) {
    console.error('Ocurrió un error al procesar la solicitud:', error.message);
    process.exit(1);
  }
}

checkAndUpdateSymbols();
