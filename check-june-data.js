const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const file = path.join(dataDir, '仓库_质检移交设备.json');

if (!fs.existsSync(file)) {
    console.log('文件不存在:', file);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log('总行数:', data.data.length);

// 统计6月份的记录
let juneCount = 0;
let juneWarrantyCount = 0;

data.data.forEach((row, idx) => {
    const dateStr = row[0];
    if (dateStr && dateStr.includes('6月')) {
        juneCount++;
        
        // 检查原设备处理方式（第22列）
        const handling = row[22] || '';
        if (handling.includes('质保期外质检回收兜底处理')) {
            juneWarrantyCount++;
        }
    }
});

console.log('6月份总记录数:', juneCount);
console.log('6月份质保期外质检回收兜底处理:', juneWarrantyCount);

// 显示前5条6月份的记录
console.log('\n前5条6月份记录:');
let count = 0;
data.data.forEach((row, idx) => {
    const dateStr = row[0];
    if (dateStr && dateStr.includes('6月') && count < 5) {
        console.log(`行${idx + 1}: 日期=${dateStr}, 处理方式=${row[22] || ''}`);
        count++;
    }
});
