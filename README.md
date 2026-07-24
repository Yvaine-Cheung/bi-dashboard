# 设备售后BI数据面板 - 部署指南

## 📋 项目概述

基于钉钉在线表格《设备售后-规范处理表格》的实时BI数据面板，支持：
- 7个工作表多标签页切换
- 日期筛选（今天/昨天/本月/上月/最近7天/最近30天/全部/自定义）
- 数据可视化（Chart.js）
- 每15分钟自动更新数据

## 📁 项目结构

```
bi-dashboard/
├── index.html          # 主页面
├── app.js              # 前端逻辑
├── server.js           # HTTP服务器
├── sync-data.js        # 数据同步脚本
├── merge-data.js       # 数据合并脚本
├── check-data.js       # 数据检查脚本
├── verify-data.js      # 数据验证脚本
└── data/
    ├── all-data.js     # 合并后的数据（前端使用）
    ├── summary.json    # 数据摘要
    ├── last_sync.txt   # 最后同步时间
    ├── 仓库_质检移交设备.json
    ├── 售后包裹处理表.json
    ├── 争议件和收费表.json
    ├── 滞留库存_无名包裹.json
    ├── 租用服务设备寄回登记.json
    ├── 跟单客服表.json
    └── 顺丰京东理赔.json
```

## 🚀 部署步骤

### 1. 本地测试

```bash
# 启动HTTP服务器
node C:\Users\Administrator\clawork\project\bi-dashboard\server.js

# 访问 http://localhost:8080
```

### 2. 公网部署

#### 方案A：Nginx反向代理（推荐）

```nginx
server {
    listen 80;
    server_name bi.yourcompany.com;
    
    # 基础认证（仅内部员工访问）
    auth_basic "Internal Only";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    root /path/to/bi-dashboard;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 缓存数据文件
    location /data/ {
        expires 1m;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

创建密码文件：
```bash
# 安装htpasswd工具
apt-get install apache2-utils

# 创建用户
htpasswd -c /etc/nginx/.htpasswd username
```

#### 方案B：Node.js服务器 + 认证

修改 `server.js`，添加简单的Token认证：

```javascript
const AUTH_TOKEN = 'your-secret-token';

// 在server创建中添加
if (req.url.includes('/data/') && req.headers.authorization !== `Bearer ${AUTH_TOKEN}`) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
}
```

#### 方案C：使用PM2管理

```bash
# 安装PM2
npm install -g pm2

# 启动服务器
pm2 start C:\Users\Administrator\clawork\project\bi-dashboard\server.js --name bi-dashboard

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 数据同步

#### 手动同步
```bash
# 同步数据
node C:\Users\Administrator\clawork\project\bi-dashboard\sync-data.js

# 合并数据
node C:\Users\Administrator\clawork\project\bi-dashboard\merge-data.js
```

#### 自动同步（已配置）

已设置OpenClaw Cron任务，每15分钟自动执行：
- 任务名称：设备售后BI数据同步
- 任务ID：0cb3c890-5fed-41c3-bddd-60e4e6b4218e
- 执行频率：每15分钟

查看任务状态：
```bash
openclaw cron list
```

### 4. 访问权限控制

#### 方案A：IP白名单（Nginx）
```nginx
location / {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    # ... 其他配置
}
```

#### 方案B：钉钉SSO集成
参考钉钉开放平台文档，实现钉钉扫码登录。

#### 方案C：简单密码保护
在 `index.html` 中添加简单的密码验证：

```javascript
// 在页面加载时检查
const PASSWORD = 'your-password';
const saved = sessionStorage.getItem('auth');
if (saved !== PASSWORD) {
    const input = prompt('请输入访问密码：');
    if (input === PASSWORD) {
        sessionStorage.setItem('auth', PASSWORD);
    } else {
        document.body.innerHTML = '<h1>访问被拒绝</h1>';
    }
}
```

## 🔧 维护

### 查看日志
```bash
# PM2日志
pm2 logs bi-dashboard

# Cron任务日志
openclaw cron runs 0cb3c890-5fed-41c3-bddd-60e4e6b4218e
```

### 手动触发同步
```bash
openclaw cron run 0cb3c890-5fed-41c3-bddd-60e4e6b4218e
```

### 更新数据源
如果钉钉表格结构变化，需要修改：
1. `sync-data.js` 中的 `SHEETS` 配置（表头行号等）
2. `app.js` 中的列索引映射

### 监控
- 检查 `data/last_sync.txt` 确认最后同步时间
- 检查 `data/summary.json` 确认数据行数

## 📊 数据说明

| 工作表 | 数据行数 | 说明 |
|--------|---------|------|
| 仓库&质检移交设备 | ~4700 | 设备移登记 |
| 售后包裹处理表 | ~5100 | 售后包裹处理 |
| 争议件和收费表 | ~85 | 争议件处理 |
| 滞留库存&无名包裹 | ~190 | 滞留库存管理 |
| 租用服务设备寄回登记 | ~970 | 租用设备寄回 |
| 跟单客服表 | ~950 | 客服跟单 |
| 顺丰京东理赔 | ~14 | 物流理赔 |

## 🔐 安全建议

1. **必须设置访问控制**：基础认证、IP白名单或SSO
2. **定期更新密码**：如果使用基础认证
3. **监控访问日志**：发现异常访问及时处理
4. **备份数据**：定期备份 `data/` 目录

## 📞 技术支持

如有问题，请联系开发团队。
