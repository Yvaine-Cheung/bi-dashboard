// 测试自定义日期筛选
const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
const data = aftersale.data;

// 模拟 parseDate
function parseDate(str) {
    if (!str) return null;
    const match = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    const match2 = str.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (match2) {
        return new Date(new Date().getFullYear(), parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}

// 模拟自定义日期筛选（2026/07/22 至 2026/07/22）
const startDate = new Date('2026-07-22T00:00:00');
const endDate = new Date('2026-07-22T23:59:59');

console.log('筛选范围:', startDate.toLocaleString(), '至', endDate.toLocaleString());

const matched = [];
const filtered = data.filter(row => {
    const dateStr = row[0];
    if (!dateStr) return false;
    const date = parseDate(dateStr);
    if (!date) return false;
    
    const match = date >= startDate && date <= endDate;
    if (match) {
        matched.push({ dateStr, date: date.toLocaleString() });
    }
    return match;
});

console.log(`\n筛选结果: ${filtered.length} 条`);
console.log('前 5 条匹配记录:');
matched.slice(0, 5).forEach(m => {
    console.log(`  ${m.dateStr} -> ${m.date}`);
});

// 检查 7 月 22 日的记录
let july22Count = 0;
data.forEach(row => {
    const dateStr = row[0];
    if (dateStr && dateStr.match(/7\s*月\s*22\s*日/)) {
        july22Count++;
    }
});
console.log(`\n7 月 22 日总记录数: ${july22Count} 条`);
