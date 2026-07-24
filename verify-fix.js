const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
const data = aftersale.data;

// 模拟 parseDate（无年份统一用当前年份）
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

// 模拟 filterByDate（昨天 = 2026/07/23）
const startDate = new Date(2026, 6, 23);
const endDate = new Date(2026, 6, 23, 23, 59, 59);

const filtered = data.filter(row => {
    const dateStr = row[0];
    if (!dateStr) return false;
    const date = parseDate(dateStr);
    if (!date) return false;
    return date >= startDate && date <= endDate;
});

console.log(`总数据行数: ${data.length}`);
console.log(`筛选"昨天"(2026/07/23): ${filtered.length} 条`);

// 验证：所有7月23日的记录都应该被匹配
let july23Total = 0;
data.forEach(row => {
    const dateStr = row[0];
    if (dateStr && dateStr.match(/7\s*月\s*23\s*日/)) {
        july23Total++;
    }
});
console.log(`7月23日总记录数: ${july23Total} 条`);
