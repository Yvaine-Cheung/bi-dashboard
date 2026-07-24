const { execSync } = require('child_process');

// 模拟同步脚本的逻辑
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result;
}

const cmd = `node "D:/Clawork/node_modules/dingtalk-workspace-cli/bin/dws.js" sheet csv-get --node "qnYMoO1rWxDGAZOgsQBRKnreW47Z3je9" --sheet-id "st-edff09df-37873" --range "A6601:AW6777" --max-chars 500000 --format json`;

try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    const result = JSON.parse(output);
    
    if (result.success && result.csv) {
        const lines = result.csv.split('\n').filter(l => l.trim());
        console.log(`CSV总行数: ${lines.length}`);
        
        const allRows = [];
        const headerRow = 2;
        
        for (const line of lines) {
            const match = line.match(/^\[row=(\d+)\]\s*(.*)$/);
            if (match) {
                const rowNum = parseInt(match[1]);
                const csvLine = match[2];
                const parsed = parseCSVLine(csvLine);
                
                if (rowNum > headerRow) {
                    allRows.push(parsed);
                }
            } else {
                console.log('未匹配的行:', line.substring(0, 50));
            }
        }
        
        console.log(`解析后行数: ${allRows.length}`);
        
        // 统计7月23日的记录
        let july23Count = 0;
        allRows.forEach(row => {
            const dateStr = row[0];
            if (dateStr && dateStr.match(/7\s*月\s*23\s*日/)) {
                july23Count++;
            }
        });
        
        console.log(`7月23日记录数: ${july23Count}`);
    } else {
        console.log('读取失败:', result);
    }
} catch (err) {
    console.error('错误:', err.message);
}
