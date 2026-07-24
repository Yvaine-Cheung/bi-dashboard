const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));

console.log(`总行数: ${aftersale.data.length}`);
console.log(`第一行: ${aftersale.data[0]?.[0]}`);
console.log(`最后一行: ${aftersale.data[aftersale.data.length - 1]?.[0]}`);

// 统计7月23日的数量
const july23Rows = aftersale.data.filter(row => row[0] && row[0].includes('7月23日'));
console.log(`\n7月23日行数: ${july23Rows.length}`);

// 检查是否有空行被过滤
let emptyRows = 0;
aftersale.data.forEach((row, idx) => {
    if (!row[0] || row[0].trim() === '') {
        emptyRows++;
    }
});
console.log(`空日期行数: ${emptyRows}`);
