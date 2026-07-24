#!/usr/bin/env node
/**
 * 钉钉表格数据同步脚本 - 修复版
 * 正确处理合并标题行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DWS_PATH = 'D:/Clawork/node_modules/dingtalk-workspace-cli/bin/dws.js';
const NODE_ID = 'qnYMoO1rWxDGAZOgsQBRKnreW47Z3je9';
const DATA_DIR = path.join(__dirname, 'data');

// 工作表配置 - 包含表头行信息
const SHEETS = [
    { id: 'kgqie6hm', name: '仓库&质检移交设备', lastRow: 4930, lastCol: 'AQ', headerRow: 2 },
    { id: 'st-edff09df-37873', name: '售后包裹处理表', lastRow: 6777, lastCol: 'AW', headerRow: 2 },
    { id: 'st-81e44a55-83006', name: '争议件和收费表', lastRow: 283, lastCol: 'P', headerRow: 2 },
    { id: 'st-edff09df-36753', name: '滞留库存&无名包裹', lastRow: 194, lastCol: 'R', headerRow: 3 },
    { id: 'st-76c29fa1-76757', name: '租用服务设备寄回登记', lastRow: 1001, lastCol: 'I', headerRow: 1 },
    { id: 'st-edff09df-36459', name: '跟单客服表', lastRow: 952, lastCol: 'P', headerRow: 2 },
    { id: 'st-7fb09d42-27398', name: '顺丰京东理赔', lastRow: 16, lastCol: 'L', headerRow: 2 }
];

// 拆包&打包数据源（来自《设备售后处理进度表》）
const UNPACK_PACK_SHEET = {
    nodeId: 'X6GRezwJlAYqLEZAsQ0mwG348dqbropQ',
    id: 's1',
    name: '拆包&打包',
    lastRow: 369,
    lastCol: 'L',
    headerRow: 1
};

// 解析CSV行（正确处理多行字段）
function parseCSVLines(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < csvText.length) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // 转义的引号
                currentField += '"';
                i += 2;
            } else {
                // 切换引号状态
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // 字段分隔符
            currentRow.push(currentField.trim());
            currentField = '';
            i++;
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // 行分隔符
            if (char === '\r' && nextChar === '\n') {
                i += 2;
            } else {
                i++;
            }
            
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                if (currentRow.length > 1 || currentRow[0]) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
            }
        } else {
            currentField += char;
            i++;
        }
    }
    
    // 处理最后一行
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || currentRow[0]) {
            rows.push(currentRow);
        }
    }
    
    return rows;
}

// 读取工作表数据
function readSheetData(sheet, nodeId) {
    const actualNodeId = nodeId || NODE_ID;
    console.log(`\n正在读取: ${sheet.name} (共 ${sheet.lastRow} 行, 表头行: ${sheet.headerRow})...`);
    
    const allRows = [];
    const batchSize = 200;  // 减小批次大小以确保数据完整性
    let startRow = 1;
    let headers = null;
    
    while (startRow <= sheet.lastRow) {
        const endRow = Math.min(startRow + batchSize - 1, sheet.lastRow);
        const range = `A${startRow}:${sheet.lastCol}${endRow}`;
        
        console.log(`  读取范围: ${range}`);
        
        try {
            const cmd = `node "${DWS_PATH}" sheet csv-get --node "${actualNodeId}" --sheet-id "${sheet.id}" --range "${range}" --max-chars 500000 --format json`;
            const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, windowsHide: true });
            const result = JSON.parse(output);
            
            if (result.success && result.csv) {
                // 移除行号前缀，保留原始CSV内容
                const csvContent = result.csv.replace(/^\[row=\d+\]\s*/gm, '');
                const rows = parseCSVLines(csvContent);
                
                for (let i = 0; i < rows.length; i++) {
                    const parsed = rows[i];
                    const rowNum = i + 1; // 行号从1开始
                    
                    // 表头行
                    if (rowNum === sheet.headerRow) {
                        headers = parsed;
                    }
                    
                    // 数据行（跳过表头之前的行）
                    if (rowNum > sheet.headerRow) {
                        allRows.push(parsed);
                    }
                }
            } else {
                console.warn(`  读取失败: ${range}`);
            }
        } catch (err) {
            console.warn(`  异常: ${err.message}`);
        }
        
        startRow = endRow + 1;
        
        // 避免API限流
        if (startRow <= sheet.lastRow) {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
        }
    }
    
    console.log(`  读取完成: ${allRows.length} 行数据`);
    if (headers) {
        console.log(`  表头: ${headers.slice(0, 10).join(' | ')}`);
    }
    
    return { headers: headers || [], rows: allRows };
}

// 主流程
console.log('========================================');
console.log('钉钉表格数据同步开始（修复版）');
console.log(`时间: ${new Date().toISOString()}`);
console.log('========================================');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const summary = {
    syncTime: new Date().toISOString(),
    sheets: []
};

for (const sheet of SHEETS) {
    const data = readSheetData(sheet);
    
    const safeFileName = sheet.name.replace(/[&\s]/g, '_');
    const outputFile = path.join(DATA_DIR, `${safeFileName}.json`);
    
    const jsonData = {
        sheetName: sheet.name,
        sheetId: sheet.id,
        headers: data.headers,
        data: data.rows,
        rowCount: data.rows.length,
        lastSync: new Date().toISOString()
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`已保存: ${outputFile}`);
    
    summary.sheets.push({
        name: sheet.name,
        id: sheet.id,
        rowCount: data.rows.length,
        file: `${safeFileName}.json`
    });
}

// 读取拆包&打包数据
console.log('\n正在读取: 拆包&打包 (来自《设备售后处理进度表》)...');
const unpackData = readSheetData(UNPACK_PACK_SHEET, UNPACK_PACK_SHEET.nodeId);
const unpackFile = path.join(DATA_DIR, '拆包_打包.json');
const unpackJsonData = {
    sheetName: UNPACK_PACK_SHEET.name,
    sheetId: UNPACK_PACK_SHEET.id,
    headers: unpackData.headers,
    data: unpackData.rows,
    rowCount: unpackData.rows.length,
    lastSync: new Date().toISOString()
};
fs.writeFileSync(unpackFile, JSON.stringify(unpackJsonData, null, 2), 'utf8');
console.log(`已保存: ${unpackFile}`);
summary.sheets.push({
    name: UNPACK_PACK_SHEET.name,
    id: UNPACK_PACK_SHEET.id,
    rowCount: unpackData.rows.length,
    file: '拆包_打包.json'
});

const summaryFile = path.join(DATA_DIR, 'summary.json');
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

const timestampFile = path.join(DATA_DIR, 'last_sync.txt');
fs.writeFileSync(timestampFile, new Date().toISOString(), 'utf8');

console.log('\n========================================');
console.log('数据同步完成!');
console.log('========================================');
