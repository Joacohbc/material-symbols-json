const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'google';
const REPO_NAME = 'material-design-icons';
const SYMBOLS_PATH = 'symbols/web';
const BRANCH = 'master';

// Usamos la API de Git Trees para evitar el límite de 1000 elementos de la API de contents
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}:${SYMBOLS_PATH}`;
const WEB_API_URL = 'https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true';

const REPO_JSON_PATH = path.join(__dirname, 'symbols-repo.json');
const WEB_JSON_PATH = path.join(__dirname, 'symbols-web.json');

async function checkAndUpdateRepoSymbols() {
  console.log(`Buscando carpetas de repositorio en ${SYMBOLS_PATH}...`);
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

    console.log(`Se encontraron ${folders.length} carpetas en el repositorio.`);

    let currentSymbols = [];
    let fileExists = false;

    // Verificar si el archivo local existe y leerlo
    if (fs.existsSync(REPO_JSON_PATH)) {
      fileExists = true;
      try {
        const fileContent = fs.readFileSync(REPO_JSON_PATH, 'utf-8');
        currentSymbols = JSON.parse(fileContent);
      } catch (e) {
        console.warn('El archivo symbols-repo.json local es inválido. Se sobreescribirá.');
      }
    }

    const newSymbolsStr = JSON.stringify(folders, null, 2);
    const currentSymbolsStr = JSON.stringify(currentSymbols, null, 2);

    if (!fileExists || newSymbolsStr !== currentSymbolsStr) {
      console.log('Se detectaron cambios. Actualizando symbols-repo.json...');
      fs.writeFileSync(REPO_JSON_PATH, newSymbolsStr, 'utf-8');
      console.log('¡symbols-repo.json actualizado con éxito!');
    } else {
      console.log('No se detectaron cambios. symbols-repo.json está al día.');
    }
    return folders;
  } catch (error) {
    console.error('Error procesando el repo JSON:', error.message);
    process.exit(1);
  }
}

async function validateIconExists(iconName) {
  const url = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${iconName}`;
  const res = await fetch(url);
  const text = await res.text();
  return text.includes('/l/font?kit=');
}

async function checkAndUpdateWebSymbols(repoFolders) {
  console.log(`Obteniendo metadata web de Google Fonts...`);
  try {
    const response = await fetch(WEB_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching from Web API: ${response.status} ${response.statusText}`);
    }

    let text = await response.text();
    // Remover el prefijo de seguridad )]}'
    text = text.replace(/^\)\]\}'\n/, '');

    const data = JSON.parse(text);

    // Categorizar íconos
    const categorizedIcons = {};

    data.icons.forEach(icon => {
      icon.categories.forEach(cat => {
        if (!categorizedIcons[cat]) {
          categorizedIcons[cat] = [];
        }
        categorizedIcons[cat].push(icon.name);
      });
    });

    // Validar iconos que están en el repo pero no en la metadata web
    if (repoFolders && repoFolders.length > 0) {
      const webIconsSet = new Set(data.icons.map(i => i.name));
      const missingInWeb = repoFolders.filter(name => !webIconsSet.has(name));

      if (missingInWeb.length > 0) {
        console.log(`Verificando ${missingInWeb.length} iconos del repo que faltan en la metadata JSON web...`);
        const validMissingIcons = [];
        const BATCH_SIZE = 10;

        for (let i = 0; i < missingInWeb.length; i += BATCH_SIZE) {
          const batch = missingInWeb.slice(i, i + BATCH_SIZE);
          await Promise.all(batch.map(async (iconName) => {
            const isValid = await validateIconExists(iconName);
            if (isValid) {
              validMissingIcons.push(iconName);
            }
          }));
        }

        if (validMissingIcons.length > 0) {
          console.log(`Se validaron ${validMissingIcons.length} iconos ocultos existentes. Agregándolos a la categoría 'Others'.`);
          if (!categorizedIcons['Others']) {
            categorizedIcons['Others'] = [];
          }
          categorizedIcons['Others'].push(...validMissingIcons);
        }
      }
    }

    // Ordenar alfabéticamente
    const sortedResult = {};
    Object.keys(categorizedIcons).sort().forEach(cat => {
      sortedResult[cat] = [...new Set(categorizedIcons[cat])].sort();
    });

    let currentWebSymbols = {};
    let fileExists = false;

    if (fs.existsSync(WEB_JSON_PATH)) {
      fileExists = true;
      try {
        currentWebSymbols = JSON.parse(fs.readFileSync(WEB_JSON_PATH, 'utf-8'));
      } catch (e) {
        console.warn('El archivo symbols-web.json local es inválido. Se sobreescribirá.');
      }
    }

    const newWebSymbolsStr = JSON.stringify(sortedResult, null, 2);
    const currentWebSymbolsStr = JSON.stringify(currentWebSymbols, null, 2);

    if (!fileExists || newWebSymbolsStr !== currentWebSymbolsStr) {
      console.log('Se detectaron cambios. Actualizando symbols-web.json...');
      fs.writeFileSync(WEB_JSON_PATH, newWebSymbolsStr, 'utf-8');
      console.log('¡symbols-web.json actualizado con éxito!');
    } else {
      console.log('No hay cambios en symbols-web.json. El archivo está al día.');
    }

  } catch (error) {
    console.error('Error procesando el web JSON:', error.message);
    process.exit(1);
  }
}

async function main() {
  const repoFolders = await checkAndUpdateRepoSymbols();
  await checkAndUpdateWebSymbols(repoFolders);
}

main();
