import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../public/models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1'
];

if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const downloadFile = (file) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(MODELS_DIR, file);
        const fileStream = fs.createWriteStream(filePath);

        console.log(`Downloading ${file}...`);

        https.get(`${BASE_URL}/${file}`, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${file}: Status ${response.statusCode}`));
                return;
            }

            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✓ ${file} downloaded`);
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filePath, () => { }); // Delete failed file
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            reject(err);
        });
    });
};

const downloadAll = async () => {
    try {
        for (const file of files) {
            await downloadFile(file);
        }
        console.log('All models downloaded successfully! 🤖');
    } catch (error) {
        console.error('Download failed:', error.message);
        process.exit(1);
    }
};

downloadAll();
