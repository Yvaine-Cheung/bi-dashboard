const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. 移除 extractYearFromOrderNo 函数（不再需要）
content = content.replace(/\/\/ 从订单号提取年份[\s\S]*?return null;\n\}\n/, '');

// 2. 修改 parseDate - 无年份日期统一用当前年份
const oldParseDate = `function parseDate(str, year) {
    if (!str) return null;
    // 处理 "2026/2/25" 格式
    const match = str.match(/(\\d{4})[\\/\\-](\\d{1,2})[\\/\\-](\\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    // 处理 "7 月 23 日" 格式（可能有空格）
    const match2 = str.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
    if (match2) {
        const y = year || new Date().getFullYear();
        return new Date(y, parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}`;

const newParseDate = `function parseDate(str) {
    if (!str) return null;
    // 处理 "2026/2/25" 格式
    const match = str.match(/(\\d{4})[\\/\\-](\\d{1,2})[\\/\\-](\\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    // 处理 "7 月 23 日" 格式（可能有空格），无年份统一用当前年份
    const match2 = str.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
    if (match2) {
        return new Date(new Date().getFullYear(), parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}`;

content = content.replace(oldParseDate, newParseDate);

// 3. 修改 filterByDate - 移除 yearColIdx 参数
content = content.replace(
    /function filterByDate\(data, dateColIdx, range, yearColIdx\)/,
    'function filterByDate(data, dateColIdx, range)'
);
content = content.replace(
    /const year = yearColIdx !== undefined \? extractYearFromOrderNo\(r\[yearColIdx\]\) : null;\n\s*return parseDate\(r\[dateColIdx\], year\);/,
    'return parseDate(r[dateColIdx]);'
);
content = content.replace(
    /const year = extractYearFromOrderNo\(row\[yearColIdx\]\);\n\s*const date = parseDate\(dateStr, year\);/,
    'const date = parseDate(dateStr);'
);

// 4. 修改 calculateDays - 移除 yearColIdx 参数
content = content.replace(
    /function calculateDays\(data, dateColIdx, yearColIdx\)/,
    'function calculateDays(data, dateColIdx)'
);
content = content.replace(
    /const year = yearColIdx !== undefined \? extractYearFromOrderNo\(r\[yearColIdx\]\) : null;\n\s*return parseDate\(r\[dateColIdx\], year\);/,
    'return parseDate(r[dateColIdx]);'
);

// 5. 修改 renderTab2 - 移除 yearColIdx
content = content.replace(
    /const yearColIdx = 2; \/\/ 订单号列，用于提取年份\n\s*/,
    ''
);
content = content.replace(
    /filterByDate\(data\.data, dateColIdx, state\.dateRanges\[2\], yearColIdx\)/,
    'filterByDate(data.data, dateColIdx, state.dateRanges[2])'
);
content = content.replace(
    /calculateDays\(filtered, dateColIdx, yearColIdx\)/,
    'calculateDays(filtered, dateColIdx)'
);
content = content.replace(
    /const year = extractYearFromOrderNo\(row\[yearColIdx\]\);\n\s*const regDate = parseDate\(row\[0\], year\);\n\s*const shipDate = parseDate\(row\[9\], year\);/,
    'const regDate = parseDate(row[0]);\n        const shipDate = parseDate(row[9]);'
);

// 6. 移除 preprocessUnpackData 中的 year 相关（拆包数据也需要同样处理）
// 拆包数据用月份递增推断年份是正确的，保留

fs.writeFileSync(path, content, 'utf8');
console.log('✅ 修复完成');
