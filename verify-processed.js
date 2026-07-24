// 验证总处理量计算
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

// 计算总处理量（J 列已填写日期）
const processedCount = filtered.filter(r => parseDate(r[9]) !== null).length;

console.log(`总登记数量：${filtered.length}`);
console.log(`总处理量：${processedCount}`);

// 计算日均处理量
const shipDates = filtered.map(r => parseDate(r[9])).filter(d => d);
const shipDays = shipDates.length > 0 ? 
    (Math.ceil((Math.max(...shipDates) - Math.min(...shipDates)) / (1000 * 60 * 60 * 24)) + 1) : 1;
const dailyAvg = shipDays > 0 ? (processedCount / shipDays).toFixed(1) : 0;
console.log(`日均处理量：${dailyAvg}`);
