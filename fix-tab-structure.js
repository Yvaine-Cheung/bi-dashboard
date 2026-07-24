const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/index.html';
let content = fs.readFileSync(path, 'utf8');

// 使用更灵活的正则表达式
// 查找：平均寄出时效 (天)</div> 后面跟着重复的 metric-label
const regex = /平均寄出时效 \(天\)<\/div>\s*<\/div>\s*<\/div>\s*<div class="metric-label">平均寄出时效/;

if (regex.test(content)) {
    // 替换：删除重复的部分
    content = content.replace(/(平均寄出时效 \(天\)<\/div>\s*<\/div>\s*<\/div>)\s*<div class="metric-label">平均寄出时效 \(天\)<\/div>\s*<\/div>\s*<\/div>/, '$1');
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ HTML 结构修复成功');
} else {
    console.log(' 未找到匹配文本');
    // 输出实际内容以便调试
    const idx = content.indexOf('平均寄出时效 (天)');
    if (idx >= 0) {
        console.log('实际内容:');
        console.log(content.substring(idx, idx + 300));
    }
}
