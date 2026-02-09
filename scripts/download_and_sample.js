import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../server/data');

// URLs
const MENSTRUAL_CSV_URL = 'https://huggingface.co/datasets/gjyotk/Menstrual-Health-Awareness-Dataset/resolve/main/train.csv?download=true';
const WOMEN_HEALTH_JSONL_URL = 'https://huggingface.co/datasets/altaidevorg/women-health-mini/resolve/main/women-health-mini.jsonl?download=true';

// Helper to download file using fetch (handles redirects)
const downloadFile = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
    return res.text();
};

// Helper to parse CSV (simple version)
const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    // First line is header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple comma split handling quotes roughly
        // For this specific dataset, we know it has Q, A structure
        // We'll use a regex for more robust CSV parsing
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];

        if (matches.length >= 2) {
            // Rough mapping assuming first Col is Question, Second is Answer from typical HF dataset structure
            // or we map by index
            const obj = {};
            matches.forEach((val, idx) => {
                if (headers[idx]) {
                    obj[headers[idx]] = val.replace(/^"|"$/g, '').replace(/""/g, '"');
                }
            });
            results.push(obj);
        }
    }
    return results;
};

async function main() {
    console.log('🚀 Starting Dataset Download & Sampling...');

    // 1. Process Menstrual Health CSV
    console.log('Downloading Menstrual Health CSV...');
    try {
        const csvContent = await downloadFile(MENSTRUAL_CSV_URL);
        const qaData = parseCSV(csvContent);

        if (qaData.length > 0) {
            console.log('Example row:', qaData[0]);
            fs.writeFileSync(
                path.join(DATA_DIR, 'menstrual_health_qa.json'),
                JSON.stringify(qaData, null, 2)
            );
            console.log(`✅ Saved ${qaData.length} Q&A pairs to menstrual_health_qa.json`);
        } else {
            console.warn('⚠️ No data parsed from CSV');
        }
    } catch (err) {
        console.error('Failed to process CSV:', err.message);
    }

    // 2. Process Women Health JSONL (Stream & Sample)
    console.log('Downloading & Sampling Women Health JSONL...');
    try {
        const womenHealthPath = path.join(DATA_DIR, 'women_health_sample.json');
        // For the large file, we'll fetch logic but just grab the first chunk text basically
        // Fetch API buffers, so for 35MB it's fine to load in memory for this script
        const jsonlContent = await downloadFile(WOMEN_HEALTH_JSONL_URL);

        const lines = jsonlContent.split('\n');
        const samples = [];
        const MAX_SAMPLES = 200;

        for (const line of lines) {
            if (samples.length >= MAX_SAMPLES) break;
            if (line.trim()) {
                try {
                    samples.push(JSON.parse(line));
                } catch (e) { }
            }
        }

        fs.writeFileSync(womenHealthPath, JSON.stringify(samples, null, 2));
        console.log(`✅ Saved ${samples.length} instruction samples to women_health_sample.json`);

    } catch (err) {
        console.error('Failed to process JSONL:', err.message);
    }
}

main().catch(console.error);
