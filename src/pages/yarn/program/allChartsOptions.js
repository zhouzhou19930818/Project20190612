import update from 'immutability-helper';

const axisColor = '#8E97A2';
const topNColors = ['#DF6E7B', '#f9bc73', '#F6E19E', '#A4E2E9', '#58B3C1', '#6EC3C0', '#36978E', '#38526E', '#5B6C83', '#B6B9BD',];
const topNSeries = {
    name: '',
    type: 'line',
    stack: 'Stack',
    smooth: true,
    lineStyle: {
        normal: {
            width: 1
        }
    },
    data: []
};


const trendOption = {
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(31,31,31,0.9)',
        axisPointer: {
            lineStyle: {
                color: '#555555'
            }
        },
    },
    grid: {
        top: "20%",
        bottom: "30%",
        left: '10%',
        // right: '15%',
    },
    legend: {
        textStyle: { color: axisColor },
        selectedMode: false,//取消图例上的点击事件
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 14,
        data: [],
    },
    xAxis: [
        {
            type: 'category',
            axisLabel: {
                color: axisColor,
                interval: 0,
                padding: [5, 0, 0, 0],
            },
            axisLine: { show: false, },
            axisTick: { show: false },
            data: [],
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '百分比（%）',
            position: 'left',
            nameTextStyle: { color: axisColor },
            min: 0,
            max: 100,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: axisColor },
            splitArea: { show: false },
            splitLine: {
                show: true,
                lineStyle: { color: '#E5E5E5' },
            },
        },
        {
            show: false,
            type: 'value',
            name: '百分比（%）',
            min: 0,
            max: 100,
            position: 'left',
            offset: 80,
        },
        {
            type: 'value',
            name: '程序个数',
            // min: 0,
            // max: 100,
            position: 'right',
            nameTextStyle: { color: axisColor },
            splitLine: { show: false },
            axisLine: { show: false, },
            axisTick: { show: false },
            axisLabel: { color: axisColor },
            splitArea: { show: false },
        },
    ],
    series: [
        {
            name: '正在运行程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#F6BF18',
                barBorderRadius: 11,
            },
            markArea: {
                silent: true, // 需要有tooltip显示则设置为false
                itemStyle: {
                    color: axisColor,
                    shadowColor: '#DAE9FB',
                    shadowBlur: 1,
                    opacity: 0.2,
                },
                data: [
                    [{
                        x: 0, // index
                    }, {
                        x: 0, // index
                    },]
                ],
            },
            data: [],
        },
        {
            name: '分配中程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#AAAAAA',
                barBorderRadius: 11,
            },
            data: [],
        },
        {
            name: '内存使用量占比',
            yAxisIndex: 0,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: [1, 1],
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            itemStyle: {
                normal: {
                    // color: colors1[0],
                    // borderColor: colors1Shadow[1],
                    // borderWidth: 12
                }
            },
            data: [],
        },
        {
            name: '磁盘使用空间占比',
            yAxisIndex: 1,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: [1, 1],
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            itemStyle: {
                normal: {
                    color: '#00AAE5',
                }
            },
            data: [],
        },
    ]
};

const topNTrendOption = {
    color: topNColors,
    tooltip: {
        show: true,
        backgroundColor: 'rgba(31,31,31,0.9)',
    },
    grid: {
        bottom: "10%",
        left: '10%',
        right: '10%'
    },
    legend: {
        textStyle: { color: axisColor },
        // selectedMode: false,//取消图例上的点击事件
        itemWidth: 8,
        itemHeight: 8,
        icon: 'pie',
        data: [],
        formatter: (name) => {
            const start = name.substr(0, 1);
            const end = name.substr(-4);
            return `${ start }...${ end }`;
        },
        tooltip: {
            show: true
        }
    },
    xAxis: [{
        type: "category",
        // boundaryGap: false,
        axisLine: { show: false, },
        axisLabel: {
            color: axisColor,
            align: 'left'
        },
        splitLine: { show: false },
        axisTick: { show: false },
        data: [],
    }],
    yAxis: [{
        type: "value",
        nameTextStyle: { color: axisColor },
        splitLine: { show: false },
        axisLine: { show: false, },
        axisTick: { show: false },
        axisLabel: { color: axisColor },
    }],
    series: [],
};

/***
 * 获取option.series
 * @param i 索引
 * @param name 名称
 * @param data 数据
 */
export function getSeries(i, name, data) {
    return update(topNSeries, {
        name: { $set: name },
        data: { $set: data },
        lineStyle: {
            normal: {
                color: { $set: topNColors[i] }, // 线条颜色
            },
        },
        areaStyle: {
            $set: {
                normal: {
                    opacity: 0.9,
                    color: topNColors[i]
                }
            }
        }
    })
}

/***
 * 获取X轴标签
 * @param time 时间
 * @param index 索引
 * @param interval 时间间隔 ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @param sourceLen 所有数据
 * @param split 长度间隔
 * @param x x轴标签,用于标签过密时做修改
 * @returns {string}
 */
let xIndexTemp = []; // 暂存非空字符X轴标签索引
let crossedTime = ''; // 记录跨点时间
let isCrossedTime = false; // 上一个点是否为跨点

export function getXAxisData(time, index, interval, sourceLen, split, x) {
    if (!time) return '';
    if (index === 0 || index === sourceLen - 1) { // 首尾都显示
        if (index === 0) { // 初始化状态
            xIndexTemp = [0];
            crossedTime = (interval >= 1 && interval <= 2) ? time.slice(0, 10) : time.slice(0, 7);
            isCrossedTime = false;
            xIndexTemp.push(index); // 添加显示点索引
            return getXAxisFormatData(time, interval); // 获取显示点日期格式
        } else { // 重置状态
            xIndexTemp = [];
            crossedTime = '';
            isCrossedTime = false;

            const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
            if (index - lastXIndex < split / 2) {
                return '';
            }
            return getXAxisFormatData(time, interval); // 获取显示点日期格式

        }
    } else if ((interval >= 1 && interval <= 2) && crossedTime !== time.slice(0, 10)) { // 跨年、月、日(interval不是每天)
        isCrossedTime = true;
        // 上一显示点的索引
        const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
        // 下一个显示点与上一显示点的距离小于(split / 2), 把上一个点标签设为空,下一个点标签按格式显示
        if (index - lastXIndex < split / 2) {
            x[lastXIndex] = '';
            xIndexTemp.pop();
        }
        xIndexTemp.push(index);
        if (crossedTime.slice(0, 4) !== time.slice(0, 4)) { //跨年
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'year');
        } else if (crossedTime.slice(5, 7) !== time.slice(5, 7)) { //跨月
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'month');
        } else { // 跨日
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'day');
        }
    } else if (interval >= 3 && crossedTime !== time.slice(0, 7)) {  // 跨年、月(interval是每天，不需处理跨日)
        isCrossedTime = true;
        const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
        if (index - lastXIndex < split / 2) {
            x[lastXIndex] = '';
            xIndexTemp.pop();
        }
        xIndexTemp.push(index);
        if (crossedTime.slice(0, 4) !== time.slice(0, 4)) { //跨年
            crossedTime = time.slice(0, 7);
            return getXAxisExtraFormatData(time, interval, 'year');
        } else { //跨月
            crossedTime = time.slice(0, 7);
            return getXAxisExtraFormatData(time, interval, 'month');
        }
    } else if (index % split === 0) { // 分割点
        if (isCrossedTime) {  // 如果上一个显示点是跨点, 而且下一个显示点与跨点的距离小于(split / 2),则不显示下一个点
            isCrossedTime = false; // 重置状态
            const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
            if (index - lastXIndex < split / 2) {
                xIndexTemp.push(index);
                return ''; // 返回空字符
            }
        }
        xIndexTemp.push(index);
        return getXAxisFormatData(time, interval);
    } else {
        return '';
    }
}

/***
 * 根据时间间隔获取相应日期(不跨年月日)
 * @param time
 * @param interval ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @returns {string}
 */
function getXAxisFormatData(time, interval) {
    switch (interval) {
        case 1:
        case 2:  // 时分
            return `${ time.slice(11, 13) }时${ time.slice(14, 16) }分`;
        case 3:
        case 4:  // 日时
            return `${ time.slice(8, 10) }日${ time.slice(11, 13) }时`;
        case 5:  // 月日
            return `${ time.slice(5, 7) }月${ time.slice(8, 10) }日`;
        default:
            return '';
    }
}

/***
 * 根据跨年月日与时间间隔获取相应日期
 * @param time
 * @param interval ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @param mark
 * @returns {string}
 */
function getXAxisExtraFormatData(time, interval, mark) {
    switch (mark) {
        case 'year':
            return `${ time.slice(0, 4) }年`;
        case 'month':
            return `${ time.slice(5, 7) }月`;
        case 'day':
            switch (interval) {
                case 1:
                case 2:  // 月日
                    return `${ time.slice(5, 7) }月${ time.slice(8, 10) }日`;
                case 3:
                case 4:  // 日
                    return `${ time.slice(8, 10) }日`;
                default:
                    return '';
            }
        default:
            return '';
    }
}


export const memoryTrendOption = update(trendOption, {
    legend: { data: { $set: ['内存使用量占比', '磁盘使用空间占比', '正在运行程序', '分配中程序'] } },
    series: {
        2: {
            name: { $set: '内存使用量占比' },
            itemStyle: { normal: { color: { $set: '#EF5934' } } },
        },
    },
});
export const cpuTrendOption = update(trendOption, {
    legend: { data: { $set: ['CPU使用量占比', '磁盘使用空间占比', '正在运行程序', '分配中程序'] } },
    series: {
        2: {
            name: { $set: 'CPU使用量占比' },
            itemStyle: { normal: { color: { $set: '#0B9F46' } } },
        }
    },

});
export const memoryTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: '内存(GB)' } } }, });
export const cpuTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: 'CPU个数' } } }, });
