const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const unpackData = JSON.parse(fs.readFileSync(path.join(dataDir, '拆包_打包.json'), 'utf8'));

console.log('=== 拆包&打包数据 ===');
console.log(`总行数: ${unpackData.rowCount}`);
console.log(`表头: ${unpackData.headers.join(' | ')}`);
console.log(`最新数据 (最后一行): ${unpackData.data[unpackData.data.length - 1].join(' | ')}`);
console.log(`倒数第二行: ${unpackData.data[unpackData.data.length - 2].join(' | ')}`);
