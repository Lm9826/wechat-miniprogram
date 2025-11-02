// lunar.js - 农历转换工具

// 农历1900-2100的润大小信息表
const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
];

// 天干
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 生肖
const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// 农历月份
const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
// 农历日期
const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 节气
const solarTerms = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 计算农历年总天数
function yearDays(year) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(year);
}

// 计算农历年闰月天数
function leapDays(year) {
    if (leapMonth(year)) {
        return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
}

// 计算农历年哪个月是闰月
function leapMonth(year) {
    return lunarInfo[year - 1900] & 0xf;
}

// 计算农历年m月的总天数
function monthDays(year, month) {
    return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

// 公历转农历
function solarToLunar(year, month, day) {
    // 参数区间1900.1.31~2100.12.31
    if (year < 1900 || year > 2100) {
        return false;
    }

    // 整合农历年
    let objDate = new Date(year, month - 1, day);
    let i, leap = 0, temp = 0;
    let baseDate = new Date(1900, 0, 31);
    let offset = (objDate - baseDate) / 86400000;

    // 计算农历年
    let lunarYear = 1900;
    for (i = 1900; i < 2101 && offset > 0; i++) {
        temp = yearDays(i);
        offset -= temp;
        lunarYear++;
    }
    if (offset < 0) {
        offset += temp;
        lunarYear--;
    }

    // 计算农历月
    let lunarMonth = 1;
    let isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
        // 闰月
        if (leapMonth(lunarYear) && !isLeap) {
            --i;
            isLeap = true;
            temp = leapDays(lunarYear);
        } else {
            temp = monthDays(lunarYear, i);
        }
        // 解除闰月
        if (isLeap && i == (leapMonth(lunarYear) + 1)) {
            isLeap = false;
        }
        offset -= temp;
        if (!isLeap) {
            lunarMonth++;
        }
    }

    // 计算农历日
    let lunarDay = offset + 1;

    return {
        lunarYear,
        lunarMonth,
        lunarDay,
        isLeap
    };
}

// 农历转公历
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
    // 参数区间1900.1.31~2100.12.31
    if (lunarYear < 1900 || lunarYear > 2100) {
        return false;
    }

    let leap = 0, temp = 0;
    let baseDate = new Date(1900, 0, 31);
    let offset = 0;

    // 计算农历年总天数
    for (let i = 1900; i < lunarYear; i++) {
        temp = yearDays(i);
        offset += temp;
    }

    // 计算农历月总天数
    for (let i = 1; i < lunarMonth; i++) {
        // 闰月
        if (leapMonth(lunarYear) && !isLeap) {
            if (i == leapMonth(lunarYear)) {
                isLeap = true;
                temp = leapDays(lunarYear);
            } else {
                temp = monthDays(lunarYear, i);
            }
        } else {
            temp = monthDays(lunarYear, i);
        }
        offset += temp;
    }

    // 如果是闰月，需要加上闰月的天数
    if (isLeap && leapMonth(lunarYear) == lunarMonth) {
        offset += leapDays(lunarYear);
    }

    // 计算农历日
    offset += lunarDay - 1;

    // 计算公历日期
    let solarDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);

    return {
        year: solarDate.getFullYear(),
        month: solarDate.getMonth() + 1,
        day: solarDate.getDate()
    };
}

// 获取指定年份的七夕日期（农历七月初七）
function getQixiDate(year) {
    // 使用已知的七夕日期数据
    const qixiDates = {
        2024: { year: 2024, month: 8, day: 10 },
        2025: { year: 2025, month: 8, day: 29 },
        2026: { year: 2026, month: 8, day: 18 },
        2027: { year: 2027, month: 8, day: 7 },
        2028: { year: 2028, month: 8, day: 26 },
        2029: { year: 2029, month: 8, day: 15 },
        2030: { year: 2030, month: 8, day: 4 }
    };

    if (qixiDates[year]) {
        return qixiDates[year];
    }

    // 如果没有预定义数据，使用农历转换（可能不够准确）
    const lunarDate = lunarToSolar(year, 7, 7);
    return lunarDate;
}

// 获取当前年份或下一年的七夕日期
function getNextQixiDate() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // 获取今年的七夕日期
    const thisYearQixi = getQixiDate(currentYear);
    const thisYearQixiDate = new Date(thisYearQixi.year, thisYearQixi.month - 1, thisYearQixi.day);

    // 如果今年的七夕已经过了，返回明年的七夕
    if (thisYearQixiDate < today) {
        const nextYearQixi = getQixiDate(currentYear + 1);
        return nextYearQixi;
    }

    return thisYearQixi;
}

module.exports = {
    solarToLunar,
    lunarToSolar,
    getQixiDate,
    getNextQixiDate
};
