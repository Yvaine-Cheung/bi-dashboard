const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';

// 1. 检查售后包裹处理表
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
console.log('=== 售后包裹处理表 ===');
console.log(`总行数: ${aftersale.rowCount}`);

// 统计7月29日和7月30日的记录
let july29Count = 0;
let july30Count = 0;
aftersale.data.forEach(row => {
    const dateStr = row[0];
    if (dateStr && (dateStr.includes('7月29日') || dateStr.includes('2026年7月29日'))) {
        july29Count++;
    }
    if (dateStr && (dateStr.includes('7月30日') || dateStr.includes('2026年7月30日'))) {
        july30Count++;
    }
});
console.log(`7月29日记录数: ${july29Count}`);
console.log(`7月30日记录数: ${july30Count}`);

// 2. 检查拆包&打包表
const unpack = JSON.parse(fs.readFileSync(path.join(dataDir, '拆包_打包.json'), 'utf8'));
console.log('\n=== 拆包&打包表 ===');
console.log(`总行数: ${unpack.rowCount}`);

// 找到最新的有数据的行
let latestRow = null;
for (let i = unpack.data.length - 1; i >= 0; i--) {
    const row = unpack.data[i];
    if (row[0] && row[0].trim() !== '') {
        latestRow = row;
        break;
    }
}

if (latestRow) {
    console.log(`最新日期: ${latestRow[0]}`);
    console.log(`当日拆包登记: ${latestRow[1]}`);
    console.log(`当日剩余未拆包设备: ${latestRow[2]}`);
    console.log(`当日打包寄出: ${latestRow[3]}`);
    console.log(`当日剩余已拆但未处理量: ${latestRow[4]}`);
    console.log(`总剩余待寄出设备: ${latestRow[5]}`);
}

// 3. 检查仓库&质检移交设备表
const warehouse = JSON.parse(fs.readFileSync(path.join(dataDir, '仓库_质检移交设备.json'), 'utf8'));
console.log('\n=== 仓库&质检移交设备表 ===');
console.log(`总行数: ${warehouse.rowCount}`);

// 统计7月29日和7月30日的记录
let warehouseJuly29 = 0;
let warehouseJuly30 = 0;
warehouse.data.forEach(row => {
    const dateStr = row[0];
    if (dateStr && (dateStr.includes('7月29日') || dateStr.includes('2026年7月29日'))) {
        warehouseJuly29++;
    }
    if (dateStr && (dateStr.includes('7月30日') || dateStr.includes('2026年7月30日'))) {
        warehouseJuly30++;
    }
});
console.log(`7月29日记录数: ${warehouseJuly29}`);
console.log(`7月30日记录数: ${warehouseJuly30}`);
