import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const BASE_URL = 'https://okulyk.kz/';
const OUTPUT_FILE = path.join(__dirname, '../src/data/textbooks.js');

// Subject Mapping (Russian/Kazakh -> English keys)
const SUBJECT_MAP = {
    'алгебра': 'algebra',
    'геометрия': 'geometry',
    'физика': 'physics',
    'химия': 'chemistry',
    'биология': 'biology',
    'география': 'geography',
    'информатика': 'informatics',
    'история казахстана': 'history_kaz',
    'қазақстан тарихы': 'history_kaz',
    'всемирная история': 'history_world',
    'дүниежүзі тарихы': 'history_world',
    'английский язык': 'english',
    'ағылшын тілі': 'english',
    'казахский язык': 'kazakh_language',
    'қазақ тілі': 'kazakh_language',
    'казахская литература': 'kazakh_literature',
    'қазақ әдебиеті': 'kazakh_literature',
    'русский язык': 'russian_language',
    'орыс тілі': 'russian_language',
    'русская литература': 'russian_literature',
    'орыс әдебиеті': 'russian_literature',
    'естествознание': 'science',
    'жаратылыстану': 'science',
    'познание мира': 'world_knowledge',
    'дүниені тану': 'world_knowledge',
    'самопознание': 'self_knowledge',
    'өзін-өзі тану': 'self_knowledge',
    'музыка': 'music',
    'художественный труд': 'art',
    'көркем еңбек': 'art',
    'графика и проектирование': 'graphics',
    'право': 'law',
    'құқық': 'law',
    'начальная военная': 'mititary',
    'алғашқы әскери': 'military'
};

const processedBooks = [];

// Helper to download page content
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Scrape a specific grade
async function scrapeGrade(grade) {
    console.log(`Scraping Grade ${grade}...`);
    const url = `${BASE_URL}${grade}-class/`;

    try {
        const html = await fetchPage(url);

        // Regex to find book blocks
        const linkRegex = /<a[^>]+href=["'](https:\/\/okulyk\.kz\/[^"']+\/\d+\/)["'][^>]*>(.*?)<\/a>/gs;
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
            const [fullTag, link, content] = match;

            // Clean content (remove HTML tags inside if any)
            const textContent = content.replace(/<[^>]+>/g, '').trim();
            if (!textContent) continue;

            // Try to detect subject from URL or text
            let subject = 'other';
            let language = 'ru'; // default

            // Detect Language
            if (textContent.toLowerCase().includes('қазақ') || textContent.includes('kz')) language = 'kk';
            else if (textContent.toLowerCase().includes('english') || textContent.includes('en')) language = 'en';
            else if (textContent.toLowerCase().includes('уйгур')) language = 'ug';
            else if (textContent.toLowerCase().includes('узбек')) language = 'uz';

            // Detect Subject
            const lowerText = textContent.toLowerCase();
            for (const [key, value] of Object.entries(SUBJECT_MAP)) {
                if (lowerText.includes(key) || link.includes(key)) {
                    subject = value;
                    break;
                }
            }

            // Generate ID
            const id = `${subject}-${grade}-${path.basename(link).replace(/\/$/, '')}`;

            let coverUrl = `https://placehold.co/400x533/2563eb/FFF?text=${encodeURIComponent(textContent.substring(0, 20))}`;

            // Check if <img> was inside the anchor (content)
            const imgMatch = content.match(/src=["']([^"']+)["']/);
            if (imgMatch) {
                coverUrl = imgMatch[1];
            }

            // Avoid duplicates
            if (!processedBooks.find(b => b.id === id)) {
                processedBooks.push({
                    id,
                    title: textContent,
                    author: '',
                    grade: String(grade),
                    subject,
                    language,
                    coverUrl,
                    fileUrl: link,
                    source: 'Okulyk.kz'
                });
            }
        }

    } catch (e) {
        console.error(`Error scraping Grade ${grade}:`, e.message);
    }
}

async function main() {
    console.log('Starting textbook scrape...');

    for (const grade of GRADES) {
        await scrapeGrade(grade);
    }

    console.log(`Found ${processedBooks.length} textbooks.`);

    const fileContent = `export const textbooks = ${JSON.stringify(processedBooks, null, 4)};\n`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Successfully wrote to ${OUTPUT_FILE}`);
}

main();
