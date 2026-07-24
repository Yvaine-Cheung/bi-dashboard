const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
let content = fs.readFileSync(path, 'utf8');

// 查找函数开始和结束位置
const funcStart = content.indexOf('function preprocessUnpackData(data) {');
if (funcStart === -1) {
    console.log('未找到函数');
    process.exit(1);
}

// 找到函数结束位置（下一个函数或文件末尾）
const nextFunc = content.indexOf('\n// 全局缓存', funcStart);
if (nextFunc === -1) {
    console.log('未找到函数结束位置');
    process.exit(1);
}

const oldFunc = content.substring(funcStart, nextFunc);
console.log('旧函数长度:', oldFunc.length);

const newFunc = `function preprocessUnpackData(data) {
    if (!data || data.length === 0) return [];
    
    // 找到第一个有日期的行，确定起始年份
    let startYear = 2025;
    for (const row of data) {
        const dateStr = row[0];
        if (dateStr) {
            const match = dateStr.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
            if (match) {
                const month = parseInt(match[1]);
                startYear = month >= 7 ? 2025 : 2026;
                break;
            }
        }
    }
    
    let currentYear = startYear;
    let lastMonth = 0;
    
    return data.map(row => {
        const dateStr = row[0];
        if (!dateStr) return { ...row, year: currentYear, month: 0, day: 0 };
        
        const match = dateStr.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
        if (match) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            
            // 检测跨年：月份从 12 跳到 1 时，年份 +1
            if (lastMonth === 12 && month === 1) {
                currentYear++;
            }
            lastMonth = month;
            
            return { ...row, year: currentYear, month, day };
        }
        
        return { ...row, year: currentYear, month: 0, day: 0 };
    });
}
`;

const newContent = content.substring(0, funcStart) + newFunc + content.substring(nextFunc);
fs.writeFileSync(path, newContent, 'utf8');
console.log('✅ 修复成功');
