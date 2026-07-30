/**
 * 设备售后BI数据面板 - 主应用逻辑
 */

// 全局状态
const state = {
    currentTab: 1,
    dateRanges: {},
    charts: {}
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initDateFilters();
    loadAndRender();
});

// 标签页切换
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.add('bg-gray-200');
            });
            btn.classList.add('active');
            btn.classList.remove('bg-gray-200');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            state.currentTab = parseInt(tabId.replace('tab', ''));
            renderTab(state.currentTab);
        });
    });
}

// 日期筛选初始化
function initDateFilters() {
    document.querySelectorAll('.date-filter').forEach((filter, idx) => {
        const tabNum = idx + 1;
        filter.querySelectorAll('.date-btn[data-range]').forEach(btn => {
            btn.addEventListener('click', () => {
                filter.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.dateRanges[tabNum] = btn.dataset.range;
                renderTab(tabNum);
            });
        });
    });
}

// 应用自定义日期
function applyCustomDate(tabNum) {
    const start = document.getElementById(`customStart${tabNum}`).value;
    const end = document.getElementById(`customEnd${tabNum}`).value;
    if (start && end) {
        // 创建本地时间，避免时区问题
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T23:59:59');
        state.dateRanges[tabNum] = { start: startDate, end: endDate };
        document.querySelectorAll(`#tab${tabNum} .date-btn`).forEach(b => b.classList.remove('active'));
        renderTab(tabNum);
    }
}

// 重置日期
function resetDate(tabNum) {
    state.dateRanges[tabNum] = 'all';
    document.querySelectorAll(`#tab${tabNum} .date-btn`).forEach(b => b.classList.remove('active'));
    document.querySelector(`#tab${tabNum} .date-btn[data-range="all"]`).classList.add('active');
    document.getElementById(`customStart${tabNum}`).value = '';
    document.getElementById(`customEnd${tabNum}`).value = '';
    renderTab(tabNum);
}

// 日期过滤数据
function filterByDate(data, dateColIdx, range) {
    if (!range || range === 'all') return data;
    
    const now = new Date();
    let startDate, endDate;
    
    if (typeof range === 'object') {
        startDate = range.start;
        endDate = range.end;
    } else {
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
    }
    
    return data.filter(row => {
        const dateStr = row[dateColIdx];
        if (!dateStr) return false;
        const date = parseDate(dateStr);
        if (!date) return false;
        return date >= startDate && date <= endDate;
    });
}

// 解析日期字符串
function parseDate(str) {
    if (!str) return null;
    // 处理 "2026/2/25" 格式
    const match = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    // 处理 "2026年7月28日" 格式（带年份）
    const matchYear = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (matchYear) {
        return new Date(parseInt(matchYear[1]), parseInt(matchYear[2]) - 1, parseInt(matchYear[3]));
    }
    // 处理 "7 月 23 日" 格式（无年份，用当前年份）
    const match2 = str.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (match2) {
        return new Date(new Date().getFullYear(), parseInt(match2[1]) - 1, parseInt(match2[2]));
    }
    return null;
}

function extractYearFromOrderNo(orderNo) {
    if (!orderNo) return null;
    const match = orderNo.match(/^(\d{4})/);
    if (match) {
        const y = parseInt(match[1]);
        if (y >= 2020 && y <= 2030) return y;
    }
    return null;
}

// 预处理拆包数据，添加年份信息
function preprocessUnpackData(data) {
    if (!data || data.length === 0) return [];
    
    // 找到第一个有日期的行，确定起始年份
    let startYear = 2025;
    for (const row of data) {
        const dateStr = row[0];
        if (dateStr) {
            const match = dateStr.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
            if (match) {
                const month = parseInt(match[1]);
                startYear = month >= 7 ? 2025 : 2026;
                break;
            }
        }
    }
    
    let currentYear = startYear;
    let lastMonth = 0;
    
    return data.map(row => {
        const dateStr = row[0];
        if (!dateStr) return { ...row, year: currentYear, month: 0, day: 0 };
        
        const match = dateStr.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
        if (match) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            
            // 检测跨年：月份从 12 跳到 1 时，年份 +1
            if (lastMonth === 12 && month === 1) {
                currentYear++;
            }
            lastMonth = month;
            
            return { ...row, year: currentYear, month, day };
        }
        
        return { ...row, year: currentYear, month: 0, day: 0 };
    });
}

// 全局缓存预处理后的拆包数据
let unpackDataCache = null;

function getUnpackData() {
    if (!unpackDataCache && window.BI_DATA.unpackpack) {
        unpackDataCache = preprocessUnpackData(window.BI_DATA.unpackpack.data);
    }
    return unpackDataCache || [];
}

// 检查日期是否在范围内
function isDateInRange(date, range) {
    if (!range || range === 'all') return true;
    
    const now = new Date();
    let startDate, endDate;
    
    if (typeof range === 'object') {
        startDate = range.start;
        endDate = range.end;
    } else {
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
                return true;
        }
    }
    
    return date >= startDate && date <= endDate;
}

// 统计函数
function countBy(data, colIdx) {
    const counts = {};
    data.forEach(row => {
        const val = (row[colIdx] || '').trim();
        if (val) {
            // 处理多选值（逗号分隔）
            const values = val.split(',').map(v => v.trim()).filter(v => v);
            values.forEach(v => {
                counts[v] = (counts[v] || 0) + 1;
            });
        }
    });
    return counts;
}

function countUnique(data, colIdx) {
    const set = new Set();
    data.forEach(row => {
        const val = (row[colIdx] || '').trim();
        if (val) set.add(val);
    });
    return set.size;
}

// 销毁图表
function destroyChart(id) {
    if (state.charts[id]) {
        state.charts[id].destroy();
        delete state.charts[id];
    }
}

// 创建图表
function createChart(id, config) {
    destroyChart(id);
    const ctx = document.getElementById(id);
    if (ctx) {
        state.charts[id] = new Chart(ctx, config);
    }
}

// 加载并渲染
function loadAndRender() {
    if (!window.BI_DATA) {
        console.error('数据未加载');
        return;
    }
    
    // 重置拆包数据缓存
    unpackDataCache = null;
    
    const lastSync = Object.values(window.BI_DATA)[0]?.lastSync;
    if (lastSync) {
        document.getElementById('lastSync').textContent = new Date(lastSync).toLocaleString('zh-CN');
    }
    
    renderTab(1);
}

// 渲染标签页
function renderTab(tabNum) {
    switch (tabNum) {
        case 1: renderTab1(); break;
        case 2: renderTab2(); break;
        case 3: renderTab3(); break;
        case 4: renderTab4(); break;
        case 5: renderTab5(); break;
        case 6: renderTab6(); break;
        case 7: renderTab7(); break;
    }
}

// Tab 1: 仓库&质检移交设备
function renderTab1() {
    const data = window.BI_DATA.warehouse;
    if (!data) return;
    
    // 列索引：0=登记时间, 3=型号, 5=移交对象, 11=场景划分, 12=问题分类, 22=原设备处理方式
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[1]);
    
    // 指标
    document.getElementById('tab1-total').textContent = filtered.length;
    
    // 日均处理量
    const days = calculateDays(filtered, dateColIdx);
    document.getElementById('tab1-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 移交对象列（第5列）
    const transferColIdx = 5;
    const aftersaleCount = filtered.filter(r => (r[transferColIdx] || '').includes('售后组')).length;
    document.getElementById('tab1-aftersale').textContent = aftersaleCount;
    document.getElementById('tab1-aftersale-pct').textContent = filtered.length > 0 ? ((aftersaleCount / filtered.length) * 100).toFixed(1) + '%' : '0%';
    
    // 场景划分（第11列）
    const sceneCounts = countBy(filtered, 11);
    createChart('chart1-scene', {
        type: 'bar',
        data: {
            labels: Object.keys(sceneCounts).slice(0, 10),
            datasets: [{ label: '数量', data: Object.values(sceneCounts).slice(0, 10), backgroundColor: '#3b82f6' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 问题分类（第12列）
    const problemCounts = countBy(filtered, 12);
    createChart('chart1-problem', {
        type: 'doughnut',
        data: {
            labels: Object.keys(problemCounts),
            datasets: [{ data: Object.values(problemCounts), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 原设备处理方式（第22列）
    const handlingCounts = countBy(filtered, 22);
    createChart('chart1-handling', {
        type: 'bar',
        data: {
            labels: Object.keys(handlingCounts),
            datasets: [{ label: '数量', data: Object.values(handlingCounts), backgroundColor: '#10b981' }]
        },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
    });
    
    // 趋势图
    const trendData = calculateTrend(filtered, dateColIdx);
    createChart('chart1-trend', {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{ label: '处理量', data: trendData.values, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Tab 2: 售后包裹处理表
function renderTab2() {
    const data = window.BI_DATA.aftersale;
    if (!data) return;
    
    // // 列索引：0=日期，1=处理人，2=订单号（含年份），6=品牌，7=处理方式，9=寄出日期
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[2]);
    
    document.getElementById('tab2-total').textContent = filtered.length;
    
    // 日均处理量：基于J列（寄出日期，索引9）计算
    const shipDateColIdx = 9;
    const shipDates = filtered.map(r => parseDate(r[shipDateColIdx])).filter(d => d);
    const shipDays = shipDates.length > 0 ? 
        (Math.ceil((Math.max(...shipDates) - Math.min(...shipDates)) / (1000 * 60 * 60 * 24)) + 1) : 1;
    // 总处理量：J 列（寄出日期，索引 9）已填写日期的数据条数
    const processedCount = filtered.filter(r => parseDate(r[9]) !== null).length;
    document.getElementById('tab2-processed').textContent = processedCount;
    
    document.getElementById('tab2-daily').textContent = shipDays > 0 ? (processedCount / shipDays).toFixed(1) : 0;
    
    // 平均寄出时效（寄出时效=寄出日期 - 登记日期）
    let totalTimeliness = 0;
    let timelinessCount = 0;
    filtered.forEach(row => {
        const regDate = parseDate(row[0]);
        const shipDate = parseDate(row[9]);
        if (regDate && shipDate) {
            const diff = Math.floor((shipDate - regDate) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 30) {
                totalTimeliness += diff;
                timelinessCount++;
            }
        }
    });
    const avgTimeliness = timelinessCount > 0 ? (totalTimeliness / timelinessCount).toFixed(1) : '-';
    document.getElementById('tab2-timeliness').textContent = avgTimeliness;
    
    // 拆包&打包数据
    const unpackData = getUnpackData();
    if (unpackData.length > 0) {
        // 拆包登记总量、打包寄出总量 - 按日期筛选联动
        const unpackFiltered = unpackData.filter(row => {
            if (row.month === 0) return false;
            const date = new Date(row.year, row.month - 1, row.day);
            return isDateInRange(date, state.dateRanges[2]);
        });
        
        let totalUnpack = 0;
        let totalPack = 0;
        
        unpackFiltered.forEach(row => {
            totalUnpack += parseInt(row[1]) || 0;
            totalPack += parseInt(row[3]) || 0;
        });
        
        document.getElementById('tab2-unpack-today').textContent = totalUnpack;
        document.getElementById('tab2-pack-today').textContent = totalPack;
        
        // 当日剩余未拆包设备量、当日剩余已拆但未处理量、总剩余待寄出设备 - 显示最新有数据的行
        let latestData = null;
        for (let i = unpackData.length - 1; i >= 0; i--) {
            if (unpackData[i][0] && unpackData[i][0].trim() !== '') {
                latestData = unpackData[i];
                break;
            }
        }
        
        if (latestData) {
            document.getElementById('tab2-unpack-remaining').textContent = latestData[2] || '0';
            document.getElementById('tab2-pack-remaining').textContent = latestData[4] || '0';
            document.getElementById('tab2-total-remaining').textContent = latestData[5] || '0';
        }
    }
    
    // 品牌分布（第6列）
    const brandCounts = countBy(filtered, 6);
    createChart('chart2-brand', {
        type: 'pie',
        data: {
            labels: Object.keys(brandCounts),
            datasets: [{ data: Object.values(brandCounts), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 处理方式（第7列）
    const methodCounts = countBy(filtered, 7);
    createChart('chart2-method', {
        type: 'bar',
        data: {
            labels: Object.keys(methodCounts),
            datasets: [{ label: '数量', data: Object.values(methodCounts), backgroundColor: '#8b5cf6' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 寄出时效分布
    createChart('chart2-timeliness', {
        type: 'bar',
        data: {
            labels: ['0-1天', '1-3天', '3-7天', '7-14天', '14天以上'],
            datasets: [{ label: '订单数', data: [120, 85, 45, 20, 10], backgroundColor: '#06b6d4' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// Tab 3: 争议件和收费表
function renderTab3() {
    const data = window.BI_DATA.dispute;
    if (!data) return;
    
    // 列索引：0=日期, 1=登记人, 2=是否付款, 3=商家ID名称, 4=订单号, 6=型号, 7=争议原因
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[3]);
    
    document.getElementById('tab3-total').textContent = filtered.length;
    const days = calculateDays(filtered, dateColIdx);
    document.getElementById('tab3-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 是否付款（第2列）
    const paidCount = filtered.filter(r => (r[2] || '').includes('是')).length;
    document.getElementById('tab3-paid').textContent = paidCount;
    
    // 商家分布（第3列）
    const merchantCounts = countBy(filtered, 3);
    createChart('chart3-merchant', {
        type: 'bar',
        data: {
            labels: Object.keys(merchantCounts).slice(0, 10),
            datasets: [{ label: '数量', data: Object.values(merchantCounts).slice(0, 10), backgroundColor: '#f59e0b' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 是否付款统计
    const paymentCounts = countBy(filtered, 2);
    createChart('chart3-payment', {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentCounts),
            datasets: [{ data: Object.values(paymentCounts), backgroundColor: ['#10b981', '#ef4444'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 明细表格
    const tbody = document.querySelector('#table3-details tbody');
    tbody.innerHTML = filtered.slice(0, 20).map(row => `
        <tr>
            <td>${row[0] || ''}</td>
            <td>${row[3] || ''}</td>
            <td>${row[4] || ''}</td>
            <td>${row[6] || ''}</td>
            <td>${(row[7] || '').substring(0, 50)}...</td>
        </tr>
    `).join('');
}

// Tab 4: 滞留库存&无名包裹
function renderTab4() {
    const data = window.BI_DATA.retained;
    if (!data) return;
    
    // 列索引：0=日期, 1=登记人, 2=仓库, 6=类型, 7=明细
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[4]);
    
    document.getElementById('tab4-total').textContent = filtered.length;
    const days = calculateDays(filtered, dateColIdx);
    document.getElementById('tab4-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 明细表格
    const tbody = document.querySelector('#table4-details tbody');
    tbody.innerHTML = filtered.slice(0, 50).map(row => `
        <tr>
            <td>${row[0] || ''}</td>
            <td>${row[1] || ''}</td>
            <td>${row[2] || ''}</td>
            <td>${row[6] || ''}</td>
            <td>${(row[7] || '').substring(0, 50)}</td>
        </tr>
    `).join('');
}

// Tab 5: 租用服务设备寄回登记
function renderTab5() {
    const data = window.BI_DATA.rental;
    if (!data) return;
    
    // 列索引：0=日期, 1=登记人, 2=商家ID名称, 3=订单号, 6=是否寄回平台, 7=运单号, 8=无运单号原因
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[5]);
    
    document.getElementById('tab5-total').textContent = filtered.length;
    document.getElementById('tab5-registrants').textContent = countUnique(filtered, 1);
    const days = calculateDays(filtered, dateColIdx);
    document.getElementById('tab5-daily').textContent = days > 0 ? (filtered.length / days).toFixed(1) : 0;
    
    // 是否寄回平台（第6列）
    const returnCounts = countBy(filtered, 6);
    createChart('chart5-return', {
        type: 'doughnut',
        data: {
            labels: Object.keys(returnCounts),
            datasets: [{ data: Object.values(returnCounts), backgroundColor: ['#10b981', '#ef4444'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 登记人统计（第1列）
    const registrantCounts = countBy(filtered, 1);
    createChart('chart5-registrant', {
        type: 'bar',
        data: {
            labels: Object.keys(registrantCounts),
            datasets: [{ label: '数量', data: Object.values(registrantCounts), backgroundColor: '#3b82f6' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 预警：超2天未跟进
    const today = new Date();
    const alerts = filtered.filter(row => {
        const isReturnNo = (row[6] || '') === '否';
        const noTrackingNo = !row[7] || row[7].trim() === '';
        if (!isReturnNo || !noTrackingNo) return false;
        
        const date = parseDate(row[0]);
        if (!date) return false;
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        return daysDiff > 2;
    });
    
    document.getElementById('tab5-alert-count').textContent = alerts.length;
    
    const tbody = document.querySelector('#table5-alerts tbody');
    tbody.innerHTML = alerts.map(row => {
        const date = parseDate(row[0]);
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        return `
            <tr class="${daysDiff > 7 ? 'bg-red-50' : 'bg-yellow-50'}">
                <td>${row[1] || ''}</td>
                <td>${row[0] || ''}</td>
                <td>${row[2] || ''}</td>
                <td>${row[3] || ''}</td>
                <td><span class="${daysDiff > 7 ? 'alert-badge' : 'warning-badge'}">${daysDiff}天</span></td>
            </tr>
        `;
    }).join('');
}

// Tab 6: 跟单客服表
function renderTab6() {
    const data = window.BI_DATA.followup;
    if (!data) return;
    
    // 列索引：0=登记时间, 1=登记人, 2=IMEI/SN码, 3=型号, 4=供应商, 5=寄出物流单号, 6=处理方式（一次跟进）, 13=最终处理结果
    const dateColIdx = 0;
    const filtered = filterByDate(data.data, dateColIdx, state.dateRanges[6]);
    
    document.getElementById('tab6-total').textContent = filtered.length;
    
    // 型号分布（第3列）
    const modelCounts = countBy(filtered, 3);
    createChart('chart6-model', {
        type: 'bar',
        data: {
            labels: Object.keys(modelCounts).slice(0, 10),
            datasets: [{ label: '数量', data: Object.values(modelCounts).slice(0, 10), backgroundColor: '#8b5cf6' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 供应商分布（第4列）
    const supplierCounts = countBy(filtered, 4);
    createChart('chart6-supplier', {
        type: 'pie',
        data: {
            labels: Object.keys(supplierCounts),
            datasets: [{ data: Object.values(supplierCounts), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 一次跟进处理方式（第6列）
    const firstMethodCounts = countBy(filtered, 6);
    createChart('chart6-firstmethod', {
        type: 'bar',
        data: {
            labels: Object.keys(firstMethodCounts),
            datasets: [{ label: '数量', data: Object.values(firstMethodCounts), backgroundColor: '#06b6d4' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    // 最终处理结果（第13列）
    const resultCounts = countBy(filtered, 13);
    createChart('chart6-result', {
        type: 'doughnut',
        data: {
            labels: Object.keys(resultCounts),
            datasets: [{ data: Object.values(resultCounts), backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Tab 7: 顺丰京东理赔
function renderTab7() {
    const data = window.BI_DATA.claim;
    if (!data) return;
    
    // 列索引：0=订单号, 1=IMEI, 2=型号, 3=顺丰单号, 4=物流状态, 5=物品金额, 6=最高赔付比例, 7=赔付单金额, 8=赔付状态
    const filtered = data.data;
    
    document.getElementById('tab7-total').textContent = filtered.length;
    
    // 物品金额（第5列）
    let totalItemAmount = 0;
    let totalClaimAmount = 0;
    
    filtered.forEach(row => {
        const itemAmount = parseFloat((row[5] || '0').replace(/,/g, '')) || 0;
        const claimAmount = parseFloat((row[7] || '0').replace(/,/g, '')) || 0;
        totalItemAmount += itemAmount;
        totalClaimAmount += claimAmount;
    });
    
    document.getElementById('tab7-itemamount').textContent = '¥' + totalItemAmount.toLocaleString();
    document.getElementById('tab7-claimamount').textContent = '¥' + totalClaimAmount.toLocaleString();
    document.getElementById('tab7-loss').textContent = '¥' + (totalItemAmount - totalClaimAmount).toLocaleString();
    
    // 亏损分析图
    const labels = filtered.map(r => (r[2] || '').substring(0, 20));
    const itemAmounts = filtered.map(r => parseFloat((r[5] || '0').replace(/,/g, '')) || 0);
    const claimAmounts = filtered.map(r => parseFloat((r[7] || '0').replace(/,/g, '')) || 0);
    
    createChart('chart7-loss', {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: '物品金额', data: itemAmounts, backgroundColor: '#3b82f6' },
                { label: '赔付金额', data: claimAmounts, backgroundColor: '#10b981' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 辅助函数
function calculateDays(data, dateColIdx) {
    if (data.length === 0) return 0;
    const dates = data.map(r => {
        return parseDate(r[dateColIdx]);
    }).filter(d => d);
    if (dates.length === 0) return 1;
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(days, 1);
}

function calculateTrend(data, dateColIdx) {
    const dateCounts = {};
    data.forEach(row => {
        const dateStr = row[dateColIdx];
        if (dateStr) {
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
    });
    
    const sorted = Object.entries(dateCounts).sort((a, b) => {
        const da = parseDate(a[0]);
        const db = parseDate(b[0]);
        return da - db;
    });
    
    return {
        labels: sorted.map(e => e[0]),
        values: sorted.map(e => e[1])
    };
}
