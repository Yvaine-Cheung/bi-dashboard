const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';

// 读取仓库&质检移交设备
const warehouse = JSON.parse(fs.readFileSync(path.join(dataDir, '仓库_质检移交设备.json'), 'utf8'));
console.log('=== 仓库&质检移交设备 ===');
console.log('Headers:', warehouse.headers);
console.log('Row 0:', warehouse.data[0]);
console.log('Row 5:', warehouse.data[5]);

// 读取售后包裹处理表
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
console.log('\n=== 售后包裹处理表 ===');
console.log('Headers:', aftersale.headers);
console.log('Row 0:', aftersale.data[0]);
console.log('Row 5:', aftersale.data[5]);

// 读取跟单客服表
const followup = JSON.parse(fs.readFileSync(path.join(dataDir, '跟单客服表.json'), 'utf8'));
console.log('\n=== 跟单客服表 ===');
console.log('Headers:', followup.headers);
console.log('Row 0:', followup.data[0]);
console.log('Row 5:', followup.data[5]);
console.log('Row 10:', followup.data[10]);
