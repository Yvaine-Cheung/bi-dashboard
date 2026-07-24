const fs = require('fs');
const path = 'C:/Users/Administrator/clawork/project/bi-dashboard/index.html';
const content = fs.readFileSync(path, 'utf8');

// 解码 hex 查看实际内容
const hex = '677269642d636f6c732d31206d643a677269642d636f6c732d33206761702d34206d622d36223e0a202020202020202020202020202020203c64697620636c6173733d2263617264206d65747269632d63617264223e0a20202020202020202020202020202020202020203c64697620636c6173733d226d65747269632d76616c7565222069643d22746162322d746f74616c223e303c2f6469763e0a20202020202020202020202020202020202020203c64697620636c6173733d226d65747269632d6c616265';
console.log('解码:', Buffer.from(hex, 'hex').toString('utf8'));

// 直接查找并替换
const idx = content.indexOf('grid-cols-1 md:grid-cols-3 gap-4 mb-6');
if (idx >= 0) {
    // 找到前面的<div class="
    const divStart = content.lastIndexOf('<div class="', idx);
    const divEnd = content.indexOf('</div>', idx + 500) + 6;
    
    const oldDiv = content.substring(divStart, divEnd);
    console.log('旧 div:', oldDiv.substring(0, 200));
    
    const newDiv = `            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="card metric-card">
                    <div class="metric-value" id="tab2-total">0</div>
                    <div class="metric-label">总登记数量</div>
                </div>
                <div class="card metric-card">
                    <div class="metric-value" id="tab2-processed">0</div>
                    <div class="metric-label">总处理量</div>
                </div>
                <div class="card metric-card">
                    <div class="metric-value" id="tab2-daily">0</div>
                    <div class="metric-label">日均处理量</div>
                </div>
                <div class="card metric-card">
                    <div class="metric-value" id="tab2-timeliness">-</div>
                    <div class="metric-label">平均寄出时效 (天)</div>
                </div>
            </div>`;
    
    const newContent = content.substring(0, divStart) + newDiv + content.substring(divEnd);
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('✅ HTML 更新成功');
} else {
    console.log(' 未找到目标文本');
}
