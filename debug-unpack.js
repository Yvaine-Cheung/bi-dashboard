const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
const content = fs.readFileSync(path, 'utf8');

// 找到函数位置
const idx = content.indexOf('function preprocessUnpackData');
if (idx >= 0) {
    // 输出函数的实际内容（前 500 字符）
    const funcContent = content.substring(idx, idx + 800);
    console.log('实际内容:');
    console.log(JSON.stringify(funcContent));
} else {
    console.log('未找到函数');
}
