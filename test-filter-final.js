// 测试日期筛选逻辑
const fs = require('fs');
const path = require('path');

const dataDir = 'C:/Users/Administrator/clawork/project/bi-dashboard/data';
const aftersale = JSON.parse(fs.readFileSync(path.join(dataDir, '售后包裹处理表.json'), 'utf8'));
const data = aftersale.data;

// 模拟 parseDate（无年份统一用当前年份）
function parseDate(str) {
    if (!str) return null;
    const match = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    const match2 = str.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (match2) {
        return new Date(new Date().getFullYear(), parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}

// 模拟 filterByDate
function filterByDate(data, dateColIdx, range) {
    if (!range || range === 'all') return data;
    
    const now = new Date();
    let startDate, endDate;
    
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (range) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
            break;
        case '7days':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            break;
        case '30days':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'lastmonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            break;
        default:
            return data;
    }
    
    return data.filter(row => {
        const dateStr = row[dateColIdx];
        if (!dateStr) return false;
        const date = parseDate(dateStr);
        if (!date) return false;
        return date >= startDate && date <= endDate;
    });
}

// 测试"昨天"筛选
const filtered = filterByDate(data, 0, 'yesterday');
console.log(`总数据行数: ${data.length}`);
console.log(`筛选"昨天": ${filtered.length} 条`);

// 测试"今天"筛选
const todayFiltered = filterByDate(data, 0, 'today');
console.log(`筛选"今天": ${todayFiltered.length} 条`);

// 测试"全部时间"
const allFiltered = filterByDate(data, 0, 'all');
console.log(`筛选"全部时间": ${allFiltered.length} 条`);
