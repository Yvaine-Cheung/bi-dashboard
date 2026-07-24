const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
const content = fs.readFileSync(path, 'utf8');

// 查找 tab2-total 的位置
const idx = content.indexOf("document.getElementById('tab2-total').textContent = filtered.length;");
if (idx >= 0) {
    // 输出后面的内容
    console.log('找到位置:', idx);
    console.log('实际内容:');
    console.log(JSON.stringify(content.substring(idx, idx + 500)));
} else {
    console.log('未找到目标文本');
}
