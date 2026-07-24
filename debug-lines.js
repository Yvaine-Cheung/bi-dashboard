const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// 输出 385-406 行的精确内容
for (let i = 384; i < 406; i++) {
    console.log(`Line ${i+1}: [${lines[i]}]`);
}
