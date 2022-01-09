const fs = require('fs');
const words = fs.readFileSync('mots.txt').toString().split('\n');
const fiveLetterWords = words.filter(word => word.length === 5);
fs.writeFileSync('words.json', JSON.stringify(fiveLetterWords));