const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const unpackData = JSON.parse(fs.readFileSync(path.join(dataDir, '拆包_打包.json'), 'utf8'));

console.log('总行数:', unpackData.data.length);
console.log('前5行日期格式:');
unpackData.data.slice(0, 5).forEach((row, idx) => {
    console.log(`行${idx + 1}: "${row[0]}"`);
});

// 测试正则匹配
const testStr = unpackData.data[0][0];
console.log('\n测试正则匹配:');
console.log('字符串:', JSON.stringify(testStr));
const match = testStr.match(/(\d{1,2})月(\d{1,2})日/);
console.log('匹配结果:', match);

// 测试带空格的版本
const match2 = testStr.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
console.log('带空格匹配:', match2);
