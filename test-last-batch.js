const { execSync } = require('child_process');

const cmd = `node "D:/Clawork/node_modules/dingtalk-workspace-cli/bin/dws.js" sheet csv-get --node "qnYMoO1rWxDGAZOgsQBRKnreW47Z3je9" --sheet-id "st-edff09df-37873" --range "A6601:AW6777" --max-chars 500000 --format json`;

try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    const result = JSON.parse(output);
    
    if (result.success && result.csv) {
        const lines = result.csv.split('\n').filter(l => l.trim());
        console.log(`总行数: ${lines.length}`);
        
        // 统计7月23日的记录
        let july23Count = 0;
        lines.forEach(line => {
            const match = line.match(/^\[row=(\d+)\]\s*(.*)$/);
            if (match) {
                const rowNum = parseInt(match[1]);
                const csvLine = match[2];
                if (csvLine.includes('7月23日') || csvLine.match(/7\s*月\s*23\s*日/)) {
                    july23Count++;
                }
            }
        });
        
        console.log(`7月23日记录数: ${july23Count}`);
        
        // 显示前3行和后3行
        console.log('\n前3行:');
        lines.slice(0, 3).forEach(l => console.log(l.substring(0, 100)));
        
        console.log('\n后3行:');
        lines.slice(-3).forEach(l => console.log(l.substring(0, 100)));
    } else {
        console.log('读取失败:', result);
    }
} catch (err) {
    console.error('错误:', err.message);
}
