const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'summary.json');

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    console.log(`\n=== ${data.sheetName} ===`);
    console.log(`行数: ${data.rowCount}`);
    console.log(`表头: ${data.headers.slice(0, 15).join(' | ')}`);
    if (data.data.length > 2) {
        console.log(`示例数据: ${data.data[2].slice(0, 10).join(' | ')}`);
    }
}
