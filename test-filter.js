// 测试日期筛选
const fs = require('fs');
const pathModule = require('path');
const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';

const aftersaleFile = pathModule.join(dataDir, '售后包裹处理表.json');
const aftersale = JSON.parse(fs.readFileSync(aftersaleFile, 'utf8'));
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

// 模拟 parseDate（更新后的版本）
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

// 统计 7 月 23 日的记录，按年份分组
const july23Records = { 2025: 0, 2026: 0, unknown: 0 };

data.forEach(row => {
    const dateStr = row[0];
    if (!dateStr) return;
    
    // 检查是否包含 7 月 23 日（可能有空格）
    if (!dateStr.match(/7\s*月\s*23\s*日/)) return;
    
    const year = extractYearFromOrderNo(row[2]); // 订单号在第 2 列
    const date = parseDate(dateStr, year);
    
    if (date) {
        if (date.getFullYear() === 2025) july23Records[2025]++;
        else if (date.getFullYear() === 2026) july23Records[2026]++;
        else july23Records.unknown++;
    }
});

console.log('=== 7 月 23 日记录统计 ===');
console.log(`2025 年：${july23Records[2025]} 条`);
console.log(`2026 年：${july23Records[2026]} 条`);
console.log(`未知年份：${july23Records.unknown} 条`);
console.log(`总计：${july23Records[2025] + july23Records[2026] + july23Records.unknown} 条`);

// 测试筛选"昨天"（2026/07/23）
const filtered = data.filter(row => {
    const dateStr = row[0];
    if (!dateStr) return false;
    const year = extractYearFromOrderNo(row[2]);
    const date = parseDate(dateStr, year);
    if (!date) return false;
    return date.getFullYear() === 2026 && date.getMonth() === 6 && date.getDate() === 23;
});

console.log(`\n=== 筛选 2026/07/23（昨天）===`);
console.log(`结果：${filtered.length} 条`);
