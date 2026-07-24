const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
let content = fs.readFileSync(path, 'utf8');

// 查找 parseDate 函数的位置
const funcStart = content.indexOf('function parseDate(str, year)');
if (funcStart === -1) {
    console.log('❌ 未找到 parseDate 函数');
    process.exit(1);
}

// 找到函数结束位置（下一个 function 或文件末尾）
const nextFunc = content.indexOf('\nfunction ', funcStart + 1);
const funcEnd = nextFunc === -1 ? content.length : nextFunc;

const oldFunc = content.substring(funcStart, funcEnd);
console.log('旧函数:');
console.log(oldFunc.substring(0, 200) + '...');

const newFunc = `function parseDate(str, year) {
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
}
`;

const newContent = content.substring(0, funcStart) + newFunc + content.substring(funcEnd);
fs.writeFileSync(path, newContent, 'utf8');
console.log('✅ parseDate 函数更新成功');
