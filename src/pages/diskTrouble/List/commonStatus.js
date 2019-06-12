const statusText = {
    0: '未处理', 1: '卸载中', 2: '卸载失败', 3: '卸载成功',
    4: '等待换盘', 5: '换盘中', 6: '换盘失败', 7: '换盘成功',
    8: '未加载', 9: '加载中', 10: '加载失败', 11: '加载成功',
    12: '未平衡', 13: '平衡中', 14: '平衡失败', 15: '平衡成功',
};


const statusColor = {
    0: {  className: 'grey', },
    1: {  className: 'blue', },
    2: {  className: 'red', },
    3: {  className: 'green', }
};

export const getStatus = (status, maxStatus) => {
    const minStatus = maxStatus - 3;
    const text = status === undefined ? statusText[minStatus] : (status <= maxStatus ? statusText[status] : statusText[maxStatus]);
    const style = status === undefined ? statusColor[minStatus % 4] : (status <= maxStatus ? statusColor[status % 4] : statusColor[maxStatus % 4]);
    return {
        text: text,
        ...style,
    }
};

export const logStatus = { 0: '运行中', 1: '成功', 2: '失败', };