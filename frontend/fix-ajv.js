// Skrypt naprawiający problem z ajv-keywords
const fs = require('fs');
const path = require('path');

// Ścieżki do plików
const ajvKeywordsPath = path.resolve('./node_modules/ajv-keywords/dist/definitions/typeof.js');
const ajvKeywordsDir = path.dirname(ajvKeywordsPath);

// Sprawdzenie czy plik istnieje
if (fs.existsSync(ajvKeywordsPath)) {
  console.log('Plik ajv-keywords/dist/definitions/typeof.js znaleziony, rozpoczynam naprawę...');
  
  // Odczytanie zawartości pliku
  let content = fs.readFileSync(ajvKeywordsPath, 'utf8');
  
  // Zamiana ścieżki importu
  content = content.replace(
    'require("ajv/dist/compile/codegen")', 
    'require("ajv/lib/compile/codegen")'
  );
  
  // Zapisanie zmodyfikowanego pliku
  fs.writeFileSync(ajvKeywordsPath, content, 'utf8');
  console.log('Naprawa zakończona pomyślnie!');
} else {
  console.log('Nie znaleziono pliku ajv-keywords/dist/definitions/typeof.js');
}

// Sprawdzenie innych plików, które mogą wymagać naprawy
const otherFiles = [
  './node_modules/ajv-keywords/dist/keywords/typeof.js',
  './node_modules/ajv-keywords/dist/keywords/index.js',
  './node_modules/ajv-keywords/dist/index.js'
];

otherFiles.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`Sprawdzanie pliku ${filePath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('require("ajv/dist/compile/codegen")')) {
      content = content.replace(
        'require("ajv/dist/compile/codegen")', 
        'require("ajv/lib/compile/codegen")'
      );
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Naprawiono plik ${filePath}`);
    }
  }
});

console.log('Wszystkie naprawy zakończone, aplikacja powinna teraz działać poprawnie.');
