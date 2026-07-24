const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
const data = aftersale.data;

// 模拟 extractYearFromOrderNo
function extractYearFromOrderNo(orderNo) {
    if (!orderNo) return null;
    const match = orderNo.match(/^(\d{4})/);
    if (match) {
        const y = parseInt(match[1]);
        if (y >= 2020 && y <= 2030) return y;
    }
    return null;
}

// 模拟 parseDate（带空格支持）
function parseDate(str, year) {
    if (!str) return null;
    const match = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    const match2 = str.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (match2) {
        const y = year || new Date().getFullYear();
        return new Date(y, parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}

// 模拟 filterByDate（昨天 = 2026/07/23）
const now = new Date(2026, 6, 24); // 今天
const startDate = new Date(2026, 6, 23); // 昨天
const endDate = new Date(2026, 6, 23, 23, 59, 59);

const filtered = data.filter(row => {
    const dateStr = row[0];
    if (!dateStr) return false;
    const year = extractYearFromOrderNo(row[2]); // 订单号在第2列
    const date = parseDate(dateStr, year);
    if (!date) return false;
    return date >= startDate && date <= endDate;
});

console.log(`总数据行数: ${data.length}`);
console.log(`筛选"昨天"(2026/07/23): ${filtered.length} 条`);

// 调试：看看哪些7月23日的记录被过滤掉了
let matched2026 = 0;
let matched2025 = 0;
let noYear = 0;
let parseFail = 0;

data.forEach(row => {
    const dateStr = row[0];
    if (!dateStr || !dateStr.match(/7\s*月\s*23\s*日/)) return;
    
    const year = extractYearFromOrderNo(row[2]);
    const date = parseDate(dateStr, year);
    
    if (!date) { parseFail++; return; }
    if (date.getFullYear() === 2026) matched2026++;
    else if (date.getFullYear() === 2025) matched2025++;
    else noYear++;
});

console.log(`\n7月23日记录分布:`);
console.log(`  2026年: ${matched2026} 条`);
console.log(`  2025年: ${matched2025} 条`);
console.log(`  无法解析: ${parseFail} 条`);

// 看看无订单号的记录
let noOrderNo = 0;
data.forEach(row => {
    const dateStr = row[0];
    if (!dateStr || !dateStr.match(/7\s*月\s*23\s*日/)) return;
    if (!row[2] || row[2].trim() === '') noOrderNo++;
});
console.log(`  无订单号: ${noOrderNo} 条`);
