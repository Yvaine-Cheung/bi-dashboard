const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/app.js';
let content = fs.readFileSync(path, 'utf8');

// 使用精确匹配的文本（从调试输出复制）
const oldText = `    // 列索引：0=日期，1=处理人，6=品牌，7=处理方式，9=寄出日期
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[2]);
    
    document.getElementById('tab2-total').textContent = filtered.length;
    const days = calculateDays(filtered, dateColIdx);
    document.getElementById('tab2-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 平均寄出时效（简化计算：假设寄出日期在第 9 列）
    let totalTimeliness = 0;
    let timelinessCount = 0;
    filtered.forEach(row => {
        const regDate = parseDate(row[0]);
        const shipDate = parseDate(row[9]);
        if (regDate && shipDate) {
            const diff = Math.floor((shipDate - regDate) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 30) {
                totalTimeliness += diff;
                timelinessCount++;
            }
        }
    });`;

const newText = `    // 列索引：0=日期，1=处理人，2=订单号（含年份），6=品牌，7=处理方式，9=寄出日期
    const dateColIdx = 0;
    const yearColIdx = 2; // 订单号列，用于提取年份
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[2], yearColIdx);
    
    document.getElementById('tab2-total').textContent = filtered.length;
    const days = calculateDays(filtered, dateColIdx, yearColIdx);
    document.getElementById('tab2-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 平均寄出时效（寄出时效=寄出日期 - 登记日期）
    let totalTimeliness = 0;
    let timelinessCount = 0;
    filtered.forEach(row => {
        const year = extractYearFromOrderNo(row[yearColIdx]);
        const regDate = parseDate(row[0], year);
        const shipDate = parseDate(row[9], year);
        if (regDate && shipDate) {
            const diff = Math.floor((shipDate - regDate) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 30) {
                totalTimeliness += diff;
                timelinessCount++;
            }
        }
    });`;

if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ 替换成功');
} else {
    console.log('❌ 未找到匹配文本');
    // 输出前 50 字符的 hex 以便调试
    const idx = content.indexOf('// 列索引');
    if (idx >= 0) {
        console.log('找到位置:', idx);
        console.log('实际内容 hex:', Buffer.from(content.substring(idx, idx+100)).toString('hex'));
        console.log('期望内容 hex:', Buffer.from(oldText.substring(0, 100)).toString('hex'));
    }
}
