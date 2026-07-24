// 检查实际数据格式
const fs = require('fs');
const pathModule = require('path');
const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';

const aftersaleFile = pathModule.join(dataDir, '售后包裹处理表.json');
const aftersale = JSON.parse(fs.readFileSync(aftersaleFile, 'utf8'));
const data = aftersale.data;

// 查找包含"7 月 23 日"的记录
console.log('=== 查找 7 月 23 日相关记录 ===');
let count = 0;
data.forEach((row, idx) => {
    const dateStr = row[0];
    if (dateStr && dateStr.includes('7 月 23 日')) {
        count++;
        if (count <= 3) {
            console.log(`行${idx}: 日期="${dateStr}", 订单号="${row[2] || ''}"`);
            // 显示日期字符串的每个字符
            console.log('  字符:', Array.from(dateStr).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
        }
    }
});
console.log(`总计：${count} 条`);

// 测试正则匹配
console.log('\n=== 正则测试 ===');
const testStr = '7 月 23 日';
const match = testStr.match(/(\d{1,2})月(\d{1,2})日/);
console.log(`测试字符串："${testStr}"`);
console.log(`匹配结果:`, match);

// 测试带空格的版本
const match2 = testStr.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
console.log(`带空格匹配:`, match2);
