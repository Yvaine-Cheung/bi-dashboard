const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
const content = fs.readFileSync(path, 'utf8');

// 查找所有"列索引"的位置
let idx = 0;
let count = 0;
while ((idx = content.indexOf('列索引', idx)) !== -1) {
    count++;
    const lineStart = content.lastIndexOf('\n', idx) + 1;
    const lineEnd = content.indexOf('\n', idx);
    console.log(`位置${count} (${idx}): ${content.substring(lineStart, lineEnd)}`);
    idx = lineEnd + 1;
}
