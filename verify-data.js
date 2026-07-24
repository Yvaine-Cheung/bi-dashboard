const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const files = [
    '仓库_质检移交设备.json',
    '售后包裹处理表.json',
    '争议件和收费表.json',
    '滞留库存_无名包裹.json',
    '租用服务设备寄回登记.json',
    '跟单客服表.json',
    '顺丰京东理赔.json'
];

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    console.log(`\n=== ${data.sheetName} ===`);
    console.log(`Headers: ${JSON.stringify(data.headers.slice(0, 10))}`);
    console.log(`Row 1: ${JSON.stringify(data.data[0]?.slice(0, 10))}`);
    console.log(`Row 2: ${JSON.stringify(data.data[1]?.slice(0, 10))}`);
    console.log(`Total rows: ${data.data.length}`);
}
