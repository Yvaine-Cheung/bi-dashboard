const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/index.html';
const content = fs.readFileSync(path, 'utf8');

// 查找重复内容的位置
const idx = content.indexOf('平均寄出时效 (天)');
if (idx >= 0) {
    // 输出周围的内容
    console.log('找到位置:', idx);
    console.log('周围内容:');
    console.log(JSON.stringify(content.substring(idx - 200, idx + 300)));
} else {
    console.log('未找到目标文本');
}
