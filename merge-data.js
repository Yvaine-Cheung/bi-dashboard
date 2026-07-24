/**
 * 数据合并脚本
 * 将各个JSON数据文件合并为all-data.js供HTML面板使用
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = [
    { file: '仓库_质检移交设备.json', key: 'warehouse' },
    { file: '售后包裹处理表.json', key: 'aftersale' },
    { file: '争议件和收费表.json', key: 'dispute' },
    { file: '滞留库存_无名包裹.json', key: 'retained' },
    { file: '租用服务设备寄回登记.json', key: 'rental' },
    { file: '跟单客服表.json', key: 'followup' },
    { file: '顺丰京东理赔.json', key: 'claim' },
    { file: '拆包_打包.json', key: 'unpackpack' }
];

const allData = {};

for (const { file, key } of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allData[key] = {
            sheetName: data.sheetName,
            headers: data.headers,
            data: data.data,
            rowCount: data.rowCount,
            lastSync: data.lastSync
        };
    }
}

// 写入all-data.js
const output = `// 自动生成 - 请勿手动编辑
// 生成时间: ${new Date().toISOString()}
window.BI_DATA = ${JSON.stringify(allData, null, 2)};
`;

fs.writeFileSync(path.join(dataDir, 'all-data.js'), output, 'utf8');
console.log('数据合并完成: data/all-data.js');
console.log(`总数据量: ${Object.values(allData).reduce((sum, d) => sum + d.rowCount, 0)} 行`);
