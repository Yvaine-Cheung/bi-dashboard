const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const file = path.join(dataDir, '售后包裹处理表.json');

if (!fs.existsSync(file)) {
    console.log('文件不存在:', file);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log('总行数:', data.data.length);

// 统计7月23日的记录
let july23Count = 0;
const july23Records = [];

data.data.forEach((row, idx) => {
    const dateStr = row[0];
    if (dateStr && dateStr.match(/7\s*月\s*23\s*日/)) {
        july23Count++;
        if (july23Count <= 5) {
            july23Records.push({
                row: idx + 1,
                date: dateStr,
                orderNo: row[2] || '',
                handler: row[1] || ''
            });
        }
    }
});

console.log('7月23日记录数:', july23Count);
console.log('\n前5条记录:');
july23Records.forEach(r => {
    console.log(`  行${r.row}: ${r.date} | 订单号:${r.orderNo} | 处理人:${r.handler}`);
});
