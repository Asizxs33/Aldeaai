import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/Admin/OneDrive/Рабочий стол/Новая папка (5)/src/data/textbooks.js';
const content = fs.readFileSync(filePath, 'utf8');

// Extract the array from the export
const arrayMatch = content.match(/export const textbooks = (\[[\s\S]*\]);/);
if (!arrayMatch) {
    console.error('Could not find textbooks array');
    process.exit(1);
}

let textbooks = JSON.parse(arrayMatch[1]);
let changedCount = 0;

textbooks.forEach(book => {
    const title = book.title.toLowerCase();
    const oldLang = book.language;

    if (title.includes('казахский')) {
        book.language = 'kk';
    } else if (title.includes('русский')) {
        book.language = 'ru';
    } else if (title.includes('уйгурский')) {
        book.language = 'ug';
    } else if (title.includes('английский')) {
        book.language = 'en';
    }

    if (oldLang !== book.language) {
        changedCount++;
    }
});

const newContent = `export const textbooks = ${JSON.stringify(textbooks, null, 4)};\n`;
fs.writeFileSync(filePath, newContent);

console.log(`Updated ${changedCount} textbooks.`);
