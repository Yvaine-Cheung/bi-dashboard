const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));

// 统计所有日期格式
const dateFormats = {};
const july23Count = { 2025: 0, 2026: 0, total: 0 };

aftersale.data.forEach((row, idx) => {
    const dateStr = row[0];
    if (!dateStr) return;
    
    // 统计格式
    if (!dateFormats[dateStr]) dateFormats[dateStr] = 0;
    dateFormats[dateStr]++;
    
    // 特别统计7月23日
    if (dateStr.includes('7月23日')) {
        july23Count.total++;
        // 尝试从订单号判断年份
        const orderNo = row[2] || '';
        if (orderNo.startsWith('2025')) july23Count[2025]++;
        else if (orderNo.startsWith('2026')) july23Count[2026]++;
    }
});

console.log('=== 日期格式统计 ===');
const sortedFormats = Object.entries(dateFormats).sort((a, b) => b[1] - a[1]);
sortedFormats.slice(0, 20).forEach(([format, count]) => {
    console.log(`${format}: ${count} 条`);
});

console.log(`\n=== 7月23日统计 ===`);
console.log(`总计: ${july23Count.total}`);
console.log(`2025年: ${july23Count[2025]}`);
console.log(`2026年: ${july23Count[2026]}`);
console.log(`未识别: ${july23Count.total - july23Count[2025] - july23Count[2026]}`);
