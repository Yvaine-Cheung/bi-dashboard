// 测试平均寄出时效计算
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

// 筛选昨天
const now = new Date();
const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

const filtered = data.filter(row => {
    const dateStr = row[0];
    if (!dateStr) return false;
    const date = parseDate(dateStr);
    if (!date) return false;
    return date >= startDate && date <= endDate;
});

console.log(`昨天数据: ${filtered.length} 条`);

// 计算平均寄出时效
let totalTimeliness = 0;
let timelinessCount = 0;
let noShipDate = 0;
let invalidDiff = 0;

filtered.forEach(row => {
    const regDate = parseDate(row[0]); // 登记日期
    const shipDate = parseDate(row[9]); // 寄出日期（第9列）
    
    if (!regDate) return;
    
    if (!shipDate) {
        noShipDate++;
        return;
    }
    
    const diff = Math.floor((shipDate - regDate) / (1000 * 60 * 60 * 24));
    
    if (diff >= 0 && diff <= 30) {
        totalTimeliness += diff;
        timelinessCount++;
    } else {
        invalidDiff++;
    }
});

console.log(`\n寄出时效统计:`);
console.log(`  有效记录: ${timelinessCount} 条`);
console.log(`  无寄出日期: ${noShipDate} 条`);
console.log(`  无效差值: ${invalidDiff} 条`);
console.log(`  平均时效: ${timelinessCount > 0 ? (totalTimeliness / timelinessCount).toFixed(1) : '-'} 天`);

// 显示前5条有寄出日期的记录
console.log(`\n前5条有寄出日期的记录:`);
let count = 0;
filtered.forEach(row => {
    const regDate = parseDate(row[0]);
    const shipDate = parseDate(row[9]);
    if (regDate && shipDate) {
        const diff = Math.floor((shipDate - regDate) / (1000 * 60 * 60 * 24));
        console.log(`  登记:${row[0]} | 寄出:${row[9]} | 时效:${diff}天`);
        count++;
        if (count >= 5) return;
    }
});
