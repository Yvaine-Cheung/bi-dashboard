const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
let content = fs.readFileSync(path, 'utf8');

// 直接查找并替换关键部分
const target = "document.getElementById('tab2-daily').textContent = shipDays > 0 ? (filtered.length / shipDays).toFixed(1) : 0;";
const replacement = `// 总处理量：J 列（寄出日期，索引 9）已填写日期的数据条数
    const processedCount = filtered.filter(r => parseDate(r[9]) !== null).length;
    document.getElementById('tab2-processed').textContent = processedCount;
    
    document.getElementById('tab2-daily').textContent = shipDays > 0 ? (processedCount / shipDays).toFixed(1) : 0;`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ app.js 更新成功');
} else {
    console.log(' 未找到目标文本');
}
