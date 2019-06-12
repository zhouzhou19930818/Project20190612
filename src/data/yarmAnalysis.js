// const randomDataList = (max = 100, min = 0, count = 100) => {
//     let res = [];
//     for (let i = 0; i < count; i++) {
//         res.push(min + (Math.random() * (max - min)).toFixed(0))
//     }
//     return res;
// };

const randomData = (max = 100, min = 0) => min + (Math.random() * (max - min)).toFixed(0);


// 根据chart1的显示(框选)时间获取程序列表 返回
/***
 *  {
 *      name:
 *      memory:
 *      cpu:
 *      time:
 *  }
 * @type {*[]}
 */


// 获取某时间段内所有内存数据, 返回格式
/***
 * {
 *     time:
 *     memory:
 *     process:
 * }
 */

// 根据chart1的显示(框选)时间获取CPU列表 返回
/***
 *  {
 *      name:
 *      memory:
 *      cpu:
 *      time:
 *  }
 * @type {*[]}
 */

// 获取某时间段内所有内存数据, 返回格式
/***
 * {
 *     time:
 *     memory:
 *     process:
 * }
 */

export const chart2Data = [
    {
        name: '进程1',
        memory: randomData(10, 0, 12),
        cpu: randomData(10, 0, 12),
        time: '2019-01-02 13:00'
    }, {
        name: '进程2',
        memory: randomData(20, 10, 12),
        cpu: randomData(20, 10, 12),
        time: '2019-01-02 13:10',
    }, {
        name: '进程3',
        memory: randomData(30, 20, 12),
        cpu: randomData(30, 20, 12),
        time: '2019-01-02 13:30',
    }, {
        name: '进程4',
        memory: randomData(40, 30, 12),
        cpu: randomData(40, 30, 12),
        time: '2019-01-02 13:50',
    },
];


const chart1XData = ['13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'];
const chart1Y1Data = [220, 182, 191, 134, 150, 120, 110, 125, 145, 122, 165, 122];
const chart1Y2Data = [200, 102, 151, 134, 150, 140, 140, 55, 155, 102, 105, 102];

export const chart1Data = chart1XData.map((d, i) => {
    return {
        time: d,
        memory: chart1Y1Data[i],
        process: chart1Y2Data[i],
    }
});


