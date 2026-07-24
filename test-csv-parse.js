const { execSync } = require('child_process');

// 测试读取6月份的数据
const cmd = `node "D:/Clawork/node_modules/dingtalk-workspace-cli/bin/dws.js" sheet csv-get --node "qnYMoO1rWxDGAZOgsQBRKnreW47Z3je9" --sheet-id "kgqie6hm" --range "A3500:AQ3700" --max-chars 500000 --format json`;

try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    const result = JSON.parse(output);
    
    if (result.success && result.csv) {
        const lines = result.csv.split('\n').filter(l => l.trim());
        console.log(`CSV总行数: ${lines.length}`);
        
        // 统计6月份的记录
        let juneCount = 0;
        lines.forEach(line => {
            if (line.includes('6月')) {
                juneCount++;
            }
        });
        
        console.log(`6月份记录数: ${juneCount}`);
        
        // 显示前5行
        console.log('\n前5行:');
        lines.slice(0, 5).forEach(l => console.log(l.substring(0, 100)));
    } else {
        console.log('读取失败:', result);
    }
} catch (err) {
    console.error('错误:', err.message);
}
