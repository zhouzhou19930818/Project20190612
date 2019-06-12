
export const baseColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: 180,
    },
    {
        title: '队列名称',
        dataIndex: 'queueName',
        width: 180,
    },
    {
        title: '最大内存使用量',
        dataIndex: 'maxVCores',
        sorter: (a, b) => a.maxVCores.localeCompare(b.maxVCores),
        width: 180,
    },
    {
        title: '最小内存使用量',
        dataIndex: 'minVCores',
        sorter: (a, b) => a.minVCores.localeCompare(b.minVCores),
        width: 180,
    },
    {
        title: '最大CPU个数',
        dataIndex: 'maxCpuNum',
        sorter: (a, b) => a.maxCpuNum.localeCompare(b.maxCpuNum),
        width: 180,
    },
    {
        title: '最小CPU个数',
        dataIndex: 'minCpuNum',
        sorter: (a, b) => a.minCpuNum - b.minCpuNum,
        width: 180,
    },
];