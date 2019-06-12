import moment from "moment";

export const memoryTopNColumns = [
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 180,
    },
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 180,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 180,
    },
    {
        title: '区间内最大内存',
        dataIndex: 'allocatedMaxMemory',
        sorter: (a, b) => a.allocatedMaxMemory.localeCompare(b.allocatedMaxMemory),
        width: 180,
    },
    {
        title: '区间内最大CPU',
        dataIndex: 'allocatedMaxVcore',
        sorter: (a, b) => a.allocatedMaxVcore - b.allocatedMaxVcore,
        width: 180,
    },
    {
        title: '总运行时长(分钟)',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 180,
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.startTime.localeCompare(b.startTime),
        width: 180,
    },
    {
        title: '队列',
        dataIndex: 'pool',
        width: 180,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 180,
    },
    {
        title: '应用',
        dataIndex: 'applicationName',
        width: 180,
    },
]; // 内存应用详情
export const cpuTopNColumns = [
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 180,
    },
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 180,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 180,
    },
    {
        title: '区间内最大CPU(个数)',
        dataIndex: 'allocatedMaxVcore',
        sorter: (a, b) => a.allocatedMaxVcore - b.allocatedMaxVcore,
        width: 200,
    },
    {
        title: '区间内最大内存',
        dataIndex: 'allocatedMaxMemory',
        sorter: (a, b) => (a.allocatedMaxMemory).localeCompare(b.allocatedMaxMemory),
        width: 180,
    },
    {
        title: '总运行时长(分钟)',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 180,
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => (a.startTime).localeCompare(b.startTime),
        width: 180,
    },
    {
        title: '队列',
        dataIndex: 'pool',
        width: 180,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 180,
    },
    {
        title: '应用',
        dataIndex: 'applicationName',
        width: 180,
    },
]; // cpu应用详情
export const historyColumns = [
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 250,
    },
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 120,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 120,
    },
    {
        title: '已分配的内存量',
        dataIndex: 'allocatedMemorySeconds',
        sorter: (a, b) => (a.allocatedMemorySeconds).localeCompare(b.allocatedMemorySeconds),
        width: 200,
    },
    {
        title: '已分配的CPU资源量',
        dataIndex: 'allocatedVcoreSeconds',
        sorter: (a, b) => a.allocatedVcoreSeconds - b.allocatedVcoreSeconds,
        width: 220,
    },
    {
        title: '总运行时长(分钟)',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 200,
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.startTime.localeCompare(b.startTime),
        width: 200,
    },
    {
        title: '所在队列',
        dataIndex: 'pool',
        width: 150,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 120,
    },
    {
        title: '所属应用',
        dataIndex: 'applicationName',
        width: 120,
    },
];
export const overRunningTimeColumns = [
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 250,
    },
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 120,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 120,
    },
    {
        title: '总运行时长(分钟)',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 180,
    },
    {
        title: '所在队列',
        dataIndex: 'pool',
        width: 180,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 120,
    },
    {
        title: '所属应用',
        dataIndex: 'applicationName',
        width: 120,
    },
];