# 钉钉表格数据同步脚本
# 从《设备售后-规范处理表格》读取数据并生成JSON文件

$ErrorActionPreference = "Stop"
$nodePath = "D:\Clawork\node.exe"
$dwsPath = "D:\Clawork\node_modules\dingtalk-workspace-cli\bin\dws.js"
$nodeId = "qnYMoO1rWxDGAZOgsQBRKnreW47Z3je9"
$dataDir = "C:\Users\Administrator\clawork\project\bi-dashboard\data"

# 工作表配置
$sheets = @(
    @{ id = "kgqie6hm"; name = "仓库&质检移交设备"; lastRow = 4930; lastCol = "AQ" },
    @{ id = "st-edff09df-37873"; name = "售后包裹处理表"; lastRow = 6777; lastCol = "AW" },
    @{ id = "st-81e44a55-83006"; name = "争议件和收费表"; lastRow = 283; lastCol = "P" },
    @{ id = "st-edff09df-36753"; name = "滞留库存&无名包裹"; lastRow = 194; lastCol = "R" },
    @{ id = "st-76c29fa1-76757"; name = "租用服务设备寄回登记"; lastRow = 1001; lastCol = "I" },
    @{ id = "st-edff09df-36459"; name = "跟单客服表"; lastRow = 952; lastCol = "P" },
    @{ id = "st-7fb09d42-27398"; name = "顺丰京东理赔"; lastRow = 16; lastCol = "L" }
)

function Read-SheetData {
    param(
        [string]$sheetId,
        [string]$sheetName,
        [int]$lastRow,
        [string]$lastCol
    )
    
    Write-Host "正在读取: $sheetName (共 $lastRow 行)..."
    
    $allData = @()
    $batchSize = 500  # 每批读取500行
    $startRow = 1
    
    while ($startRow -le $lastRow) {
        $endRow = [Math]::Min($startRow + $batchSize - 1, $lastRow)
        $range = "A${startRow}:${lastCol}${endRow}"
        
        Write-Host "  读取范围: $range"
        
        try {
            $result = & $nodePath $dwsPath sheet csv-get --node $nodeId --sheet-id $sheetId --range $range --format raw 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $csvContent = $result -join "`n"
                $allData += $csvContent
                if ($startRow -eq 1) {
                    # 第一批包含表头，后续批次跳过表头
                } else {
                    # 移除表头行
                    $lines = $csvContent -split "`n"
                    if ($lines.Count -gt 1) {
                        $allData += ($lines[1..($lines.Count-1)] -join "`n")
                    }
                }
            } else {
                Write-Warning "读取失败: $range"
                Write-Host $result
            }
        }
        catch {
            Write-Warning "异常: $_"
        }
        
        $startRow = $endRow + 1
        Start-Sleep -Milliseconds 500  # 避免API限流
    }
    
    return $allData
}

# 主流程
Write-Host "========================================"
Write-Host "钉钉表格数据同步开始"
Write-Host "时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================"

foreach ($sheet in $sheets) {
    $sheetId = $sheet.id
    $sheetName = $sheet.name
    $lastRow = $sheet.lastRow
    $lastCol = $sheet.lastCol
    
    # 生成安全的文件名
    $safeFileName = $sheetName -replace '[&\s]', '_'
    $outputFile = Join-Path $dataDir "$safeFileName.csv"
    
    Write-Host "`n处理工作表: $sheetName"
    
    # 读取数据
    $data = Read-SheetData -sheetId $sheetId -sheetName $sheetName -lastRow $lastRow -lastCol $lastCol
    
    # 保存CSV
    $data | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "已保存: $outputFile"
}

# 生成时间戳文件
$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
$timestamp | Out-File -FilePath (Join-Path $dataDir "last_sync.txt") -Encoding UTF8

Write-Host "`n========================================"
Write-Host "数据同步完成!"
Write-Host "========================================"
