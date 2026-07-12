import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd(), '..');
const expoRoot = process.cwd();

const htmlPath = path.join(projectRoot, 'index.html');
const cssPath = path.join(projectRoot, 'CSS', 'style.css');
const outPath = path.join(expoRoot, 'app', 'webContent.js');

// Mesmos scripts, na mesma ordem, que o index.html carrega
const jsFiles = [
  path.join(projectRoot, 'JS', 'utils.js'),
  path.join(projectRoot, 'JS', 'data', 'categorias.js'),
  path.join(projectRoot, 'JS', 'data', 'produtos.js'),
  path.join(projectRoot, 'JS', 'data', 'apps-catalogo.js'),
  path.join(projectRoot, 'JS', 'data', 'lojas.js'),
  path.join(projectRoot, 'JS', 'script.js'),
  path.join(projectRoot, 'JS', 'apps.js'),
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const htmlRaw = readUtf8(htmlPath);
const cssRaw = readUtf8(cssPath);
const jsRaw = jsFiles.map(readUtf8).join('\n;\n');

const bodyMatch = htmlRaw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : htmlRaw;

bodyContent = bodyContent
  .replace(/<script[^>]+src=["'][^"']+["'][^>]*>\s*<\/script>/gi, '')
  .replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');

const inlinedHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mage Express</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <style>
${cssRaw}
  </style>
</head>
<body>
${bodyContent}
  <script>
${jsRaw}
  <\/script>
</body>
</html>`;

const output = `export const htmlContent = ${JSON.stringify(inlinedHtml)};\n`;
fs.writeFileSync(outPath, output, 'utf8');

console.log('webContent.js atualizado com sucesso.');
