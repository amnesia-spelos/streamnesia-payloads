const fs = require('fs');
const path = require('path');

const payloadsDir = path.join(__dirname, 'streamnesia', 'payloads');
const dataPath = path.join(payloadsDir, 'payloads.json');

let failed = false;

// Read all .payload files in the directory
const existingPayloadFiles = fs.readdirSync(payloadsDir)
    .filter(file => file.endsWith('.payload'));

const referencedFiles = new Set();

try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    data.forEach((item, index) => {
        if (!Array.isArray(item.Sequence)) {
            console.error(`❌ Item at index ${index} has invalid or missing Sequence.`);
            failed = true;
            return;
        }

        item.Sequence.forEach((sequenceItem, seqIndex) => {
            const fileName = sequenceItem.File;
            referencedFiles.add(fileName);

            const filePath = path.join(payloadsDir, fileName);
            if (!fs.existsSync(filePath)) {
                console.error(`❌ Missing file: "${fileName}" in Sequence index ${seqIndex} (Item index ${index})`);
                failed = true;
            }
        });
    });
} catch (err) {
    console.error('❌ Error reading or parsing payloads.json:', err.message);
    process.exit(1);
}

// Check for unreferenced .payload files
const unreferencedFiles = existingPayloadFiles.filter(file => !referencedFiles.has(file));

if (unreferencedFiles.length > 0) {
    console.warn('\n⚠️ Unreferenced payload files found:');
    unreferencedFiles.forEach(file => {
        console.warn(`  - ${file}`);
    });
} else {
    console.log('✅ All .payload files are referenced.');
}

if (failed) {
    process.exit(1);
} else {
    console.log('✅ All referenced files exist.');
}
