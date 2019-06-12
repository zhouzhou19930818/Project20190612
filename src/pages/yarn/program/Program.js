import React, { Component, Fragment } from 'react';
import { Form, Icon, Button, DatePicker, Card, Radio, message, Input } from "antd";
import moment from 'moment';
import update from 'immutability-helper';
import api from 'src/tools/api';
import {
    memoryTrendOption,
    cpuTrendOption,
    memoryTopNTrendOption,
    cpuTopNTrendOption,
    getSeries,
    getXAxisData
} from './allChartsOptions';
import { memoryTopNColumns, cpuTopNColumns, historyColumns, overRunningTimeColumns } from './tableColumns';
import SDTable from 'src/components/SDTable';
import Context from '../Context';
import { ControllerChart, LinkChart, LinkTable } from './Block';
import { debounce, downloadFile } from "src/tools/utils";
import { allInterval } from '../commonConst';

const { Item: FormItem } = Form;

const overRunningTime = '180';

export default class Program extends Component {

    static contextType = Context;

    state = {
        timeType: 3,
        historyTimeType: 3,
        memoryTrend: {
            chartOption: memoryTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
            sliderParam: {},
        },
        memoryTopNTrend: {
            chartOption: memoryTopNTrendOption, // 内存TopN趋势
            loading: true,
            interval: '',
            pageIndex: 1,
        },
        memoryTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        memoryTotalSpace: {
            memory: '',
            historyMemory: '',
            disk: '',
        },
        cpuTrend: {
            chartOption: cpuTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
            sliderParam: {},
        },
        cpuTopNTrend: {
            chartOption: cpuTopNTrendOption, // CPU TopN趋势
            loading: true,
            interval: '',
            pageIndex: 1,
        },
        cpuTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        cpuTotalSpace: {
            cpu: '',
            historyCpu: '',
            disk: '',
        },
        historyTable: {
            loading: true,
            dataSource: [],
            pagination: {
                current: 1,
                pageSize: 2,
                total: 0
            },
        },
        historySearchValue: '',
        overRunningTimeTable: {
            dataSource: [],
            loading: false,
        },
        overRunningTime: overRunningTime,
    };

    memoryTrendData = []; // 内存趋势图数据, 用在滑块获取日期
    cpuTrendData = []; // cpu趋势图数据, 用在滑块获取日期
    memoryTopNSeries = []; // 内存 TopN series 数据, 翻页作用
    memoryTopNDetailSource = []; // 内存 TopN 详情表格数据, 翻页与导出的数据作用
    cpuTopNSeries = []; // cpu TopN series 数据, 翻页作用
    cpuTopNDetailSource = []; // cpu TopN 详情表格数据, 翻页与导出的数据作用

    trendStartTime = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss');
    trendEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
    linkStartTime1 = ''; // 内存被联动开始时间
    linkEndTime1 = ''; // 内存被联动结束时间
    linkStartTime2 = ''; // cpu被联动开始时间
    linkEndTime2 = ''; // cpu被联动结束时间
    historyStartTime = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss'); // 程序历史开始时间
    historyEndTime = moment().format('YYYY-MM-DD HH:mm:ss'); // 程序历史结束时间
    customTrendStartTime = ''; // 自定义开始时间
    customTrendEndTime = ''; // 自定义结束时间
    customHistoryStartTime = ''; // 自定义程序历史开始时间
    customHistoryEndTime = ''; // 自定义程序历史结束时间

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextContext.clusterRequestError) { // 请求集群有误
            this.setState(update(this.state, {
                memoryTrend: { loading: { $set: false } },
                memoryTopNTrend: { loading: { $set: false } },
                memoryTopNDetail: { loading: { $set: false } },
                cpuTrend: { loading: { $set: false } },
                cpuTopNTrend: { loading: { $set: false } },
                cpuTopNDetail: { loading: { $set: false } },
                historyTable: { loading: { $set: false } },
                overRunningTimeTable: { loading: { $set: false } },
            }));
        } else if (this.context.clusterValue !== nextContext.clusterValue) {
            this.setState(update(this.state, {
                timeType: { $set: 3 },
                historyTimeType: { $set: 3 },
                overRunningTime: { $set: overRunningTime },
                historySearchValue: { $set: '' },
                memoryTrend: { loading: { $set: true }, },
                memoryTopNTrend: { loading: { $set: true }, },
                memoryTopNDetail: { loading: { $set: true } },
                cpuTrend: { loading: { $set: true }, },
                cpuTopNTrend: { loading: { $set: true }, },
                cpuTopNDetail: { loading: { $set: true } },
                historyTable: { loading: { $set: true } },
                overRunningTimeTable: { loading: { $set: true } },
            }));

            this.getMemoryTrend(nextContext.clusterValue); // 获取内存趋势图数据并加载图表
            this.getCpuTrend(nextContext.clusterValue);
            this.getProgramHistoryDetail(nextContext.clusterValue);
            this.getOverRunningTimeProgram(nextContext.clusterValue, overRunningTime);
        }
    }

    // 集群内存总体情况
    getMemoryTrend = (cluster, startTime, endTime) => {
        const errorHandler = () => {
            this.setState(update(this.state, {
                memoryTrend: {
                    chartOption: { $set: memoryTrendOption }, // 内存总体趋势
                    loading: { $set: false },
                    interval: { $set: '' },
                },
                memoryTopNTrend: {
                    loading: { $set: false },
                    chartOption: { $set: memoryTopNTrendOption },
                    interval: { $set: '' },
                },
                memoryTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false }
                },
            }));
            this.memoryTrendData = [];
        };
        api.getClusterYarnMemoryInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.trendStartTime,
            endTime: endTime || this.trendEndTime,
        })
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取集群内存总体情况失败: ' + response.msg);
                    errorHandler();
                    return;
                }

                const data = response.data;
                this.memoryTrendData = data.pointDTOS;

                const startPosition = 50, endPosition = 100;
                const startIndex = Math.floor(startPosition / 100 * this.memoryTrendData.length - 1);
                const endIndex = Math.floor(endPosition / 100 * this.memoryTrendData.length - 1);
                const startTime = this.memoryTrendData[startIndex].time;
                const endTime = this.memoryTrendData[endIndex].time;

                let x = [], y1 = [], y2 = [], y3 = [], y4 = [], maxY = data.rightYMax;
                const split = Math.round(this.memoryTrendData.length / 3);
                const interval = data.interval;
                this.memoryTrendData && this.memoryTrendData.forEach((d, i) => {
                    x.push(getXAxisData(d.time, i, interval, this.memoryTrendData.length, split, x));
                    y1.push(d.memoryRate * 100);
                    y2.push(d.diskRate * 100);
                    y3.push(d.runningAppCount);
                    y4.push(d.acceptedAppCount);
                    maxY < d.appCount && (maxY = d.appCount);
                });
                this.setState(update(this.state, {
                    memoryTotalSpace: {
                        memory: { $set: data.totalMemorySpace },
                        disk: { $set: data.totalDiskSpace },
                        historyMemory: { $set: data.historyTotalMemorySpace },
                    },
                    memoryTrend: {
                        loading: { $set: false },
                        interval: { $set: allInterval[data.interval] },
                        chartOption: {
                            xAxis: {
                                0: { data: { $set: x } },
                            },
                            yAxis: {
                                2: {
                                    max: { $set: maxY },
                                }
                            },
                            series: {
                                0: { data: { $set: y3 } },
                                1: { data: { $set: y4 } },
                                2: { data: { $set: y1 } },
                                3: { data: { $set: y2 } },
                            },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const index = params[0].dataIndex;
                                        const obj = this.memoryTrendData[index];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                                    内存使用量占比：${ obj.memoryRate * 100 }%<br/>
                                                    内存使用量: ${ obj.memoryUsed }<br/>
                                                    磁盘使用空间占比：${ obj.diskRate ? (obj.diskRate * 100).toFixed(2) : '' }%<br/>
                                                    程序运行中/待分配: ${ obj.runningAppCount }/${ obj.acceptedAppCount }<br/>
                                                    程序个数：${ obj.appCount }<br/>
                                                    CPU个数：${ obj.cpuUsed }`
                                    }
                                }
                            }
                        },
                        sliderParam: {
                            $set: {
                                startPosition,
                                endPosition,
                                startTime: startTime.slice(0, 16),
                                endTime: endTime.slice(0, 16),
                            }
                        }
                    },
                }));
                this.getMemoryTopNTrend(cluster, startTime, endTime);
            })
            .catch(() => errorHandler());
    };

    // 区间内内存TOPN程序趋势图
    getMemoryTopNTrend = (cluster, startTime, endTime) => {
        const errorHandler = () => {
            this.setState({
                memoryTopNTrend: {
                    loading: false,
                    interval: '',
                    chartOption: memoryTopNTrendOption,
                },
                memoryTopNDetail: {
                    dataSource: [],
                    loading: false
                },
            });
            this.memoryTopNSeries = [];
            this.memoryTopNDetailSource = null;
        };
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.linkStartTime1 || this.trendStartTime,
            endTime: endTime || this.linkEndTime1 || this.trendEndTime,
        };
        api.getTopProgramMemory(params)
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取区间内内存TOPN程序趋势失败: ' + response.msg);
                    errorHandler();
                    return;
                }
                this.getMemoryTopNDetail(params);
                const data = response.data || [];
                const groupData = [data.programInfos.slice(0, 10).reverse(), data.programInfos.slice(11, 20).reverse()];
                groupData.forEach((group) => {
                    let xAxis = [], series = [], legend = [];
                    group.forEach((first, i) => {
                        let seriesData = [];
                        first.programInfos && first.programInfos.forEach(d => {
                            // i === 0 && xAxis.push(getXAxisData(d.time, i, data.interval, 10, 5, xAxis));
                            i === 0 && xAxis.push(d.time);
                            seriesData.push(d.allocatedMemoryGB);
                        });
                        legend.push(first.programId);
                        series.push(getSeries(i, first.programId, seriesData))
                    });
                    this.memoryTopNSeries.push({ legend, series, xAxis });
                });
                const top10 = this.memoryTopNSeries[0];
                this.setState({
                    memoryTopNTrend: {
                        loading: false,
                        interval: allInterval[data.interval],
                        chartOption: update(this.state.memoryTopNTrend.chartOption, {
                            legend: { data: { $set: top10.legend.reverse() } },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const dataIndex = params.dataIndex;
                                        const seriesIndex = params.seriesIndex;
                                        const program = data.programInfos[seriesIndex];
                                        if (!program) return '';
                                        const obj = program.programInfos[dataIndex];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                    程序ID：${ obj.programId }<br/>
                                    程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
                                    程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
                                    内存使用量：${ obj.allocatedMemoryGB }GB<br/>
                                    CPU个数：${ obj.allocatedVCores }`
                                    }
                                }
                            },
                            xAxis: {
                                0: { data: { $set: top10.xAxis } },
                            },
                            series: { $set: top10.series },
                        }),
                        pageIndex: 1
                    },
                });
            })
            .catch(() => errorHandler());
    };

    // 各程序内存详情
    getMemoryTopNDetail = (params) => {
        api.getTopProgramMemoryDetail(params).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + response.msg);
                this.setState({
                    memoryTopNDetail: {
                        dataSource: [],
                        loading: false
                    }
                });
                this.memoryTopNDetailSource = null;
                return;
            }
            this.memoryTopNDetailSource = response;
            const data = response.data;
            this.setState({
                memoryTopNDetail: {
                    dataSource: data && data.slice(0, 10).map((d, i) => ({ ...d, index: i + 1 })),
                    loading: false
                }
            });
        });
    };

    // 集群CPU总体趋势图
    getCpuTrend = (cluster, startTime, endTime) => {
        const errorHandler = () => {
            this.setState(update(this.state, {
                cpuTrend: {
                    chartOption: { $set: cpuTrendOption }, // 内存总体趋势
                    loading: { $set: false },
                    interval: { $set: '' },
                },
                cpuTopNTrend: {
                    loading: { $set: false },
                    chartOption: { $set: cpuTopNTrendOption },
                    interval: { $set: '' },
                },
                cpuTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false }
                },
            }));
            this.cpuTrendData = [];
        };
        api.getClusterYarnCpuInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.trendStartTime,
            endTime: endTime || this.trendEndTime,
        })
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取集群CPU总体情况失败: ' + response.msg);
                    errorHandler();
                    return;
                }
                const data = response.data;
                this.cpuTrendData = data.pointDTOS;

                const startPosition = 50, endPosition = 100;
                const startIndex = Math.floor(startPosition / 100 * this.cpuTrendData.length - 1);
                const endIndex = Math.floor(endPosition / 100 * this.cpuTrendData.length - 1);
                const startTime = this.cpuTrendData[startIndex].time;
                const endTime = this.cpuTrendData[endIndex].time;

                let x = [], y1 = [], y2 = [], y3 = [], y4 = [];
                const split = Math.round(this.cpuTrendData.length / 3);
                const interval = data.interval;
                this.cpuTrendData && this.cpuTrendData.forEach((d, i) => {
                    x.push(getXAxisData(d.time, i, interval, this.cpuTrendData.length, split, x));
                    y1.push(d.cpuRate * 100);
                    y2.push(d.diskRate * 100);
                    y3.push(d.runningAppCount);
                    y4.push(d.acceptedAppCount);
                });

                this.setState(update(this.state, {
                    cpuTotalSpace: {
                        cpu: { $set: data.totalCpuNum },
                        historyCpu: { $set: data.historyTotalCpuNum },
                        disk: { $set: data.totalDiskSpace },
                    },
                    cpuTrend: {
                        loading: { $set: false },
                        interval: { $set: allInterval[data.interval] },
                        chartOption: {
                            xAxis: {
                                0: { data: { $set: x } },
                            },
                            yAxis: {
                                2: {
                                    max: { $set: 4 },
                                }
                            },
                            series: {
                                0: { data: { $set: y3 } },
                                1: { data: { $set: y4 } },
                                2: { data: { $set: y1 } },
                                3: { data: { $set: y2 } },
                            },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const index = params[0].dataIndex;
                                        const obj = this.memoryTrendData[index];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                    CPU使用量占比：${ obj.cpuRate * 100 }%<br/>
                                    CPU个数：${ obj.cpuUsed }<br/>
                                    磁盘使用空间占比：${ obj.diskRate * 100 }%<br/>
                                    程序运行中/待分配: ${ obj.runningAppCount }/${ obj.acceptedAppCount }<br/>
                                    程序个数：${ obj.appCount }<br/>
                                    内存使用量：${ obj.memoryUsed }`
                                    }
                                }
                            }
                        },
                        sliderParam: {
                            $set: {
                                startPosition,
                                endPosition,
                                startTime: startTime.slice(0, 16),
                                endTime: endTime.slice(0, 16),
                            }
                        }
                    },
                }));
                this.getCpuTopNTrend(cluster, this.cpuTrendData[startIndex].time, this.cpuTrendData[endIndex].time);
            })
            .catch(() => errorHandler());
    };

    // 区间内TOPN程序CPU趋势图
    getCpuTopNTrend = (cluster, startTime, endTime) => {
        const errorHandler = () => {
            this.setState({
                cpuTopNTrend: {
                    loading: false,
                    interval: '',
                    chartOption: cpuTopNTrendOption,
                },
                cpuTopNDetail: {
                    dataSource: [],
                    loading: false
                },
            });
            this.cpuTopNSeries = [];
            this.cpuTopNDetailSource = null;
        };
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.linkStartTime2 || this.trendStartTime,
            endTime: endTime || this.linkEndTime2 || this.trendEndTime,
        };
        api.getTopProgramCpu(params)
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取区间内内存TOPN程序趋势失败: ' + response.msg);
                    errorHandler();
                    return;
                }
                this.getCpuTopNDetail(params);

                const data = response.data || [];
                const groupData = [data.programInfos.slice(0, 10).reverse(), data.programInfos.slice(11, 20).reverse()];
                groupData.forEach((group) => {
                    let xAxis = [], series = [], legend = [];
                    group.forEach((first, i) => {
                        let seriesData = [];
                        first.programInfos && first.programInfos.forEach(d => {
                            // i === 0 && xAxis.push(getXAxisData(d.time, i, data.interval, 10, 1, xAxis));
                            i === 0 && xAxis.push(d.time);
                            seriesData.push(d.allocatedVCores);
                        });
                        legend.push(first.programId);
                        series.push(getSeries(i, first.programId, seriesData))
                    });
                    this.cpuTopNSeries.push({ legend, series, xAxis });
                });
                const top10 = this.cpuTopNSeries[0];
                this.setState({
                    cpuTopNTrend: {
                        loading: false,
                        interval: allInterval[data.interval],
                        chartOption: update(this.state.cpuTopNTrend.chartOption, {
                            legend: { data: { $set: top10.legend.reverse() } },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const dataIndex = params.dataIndex;
                                        const seriesIndex = params.seriesIndex;
                                        const program = data.programInfos[seriesIndex];
                                        if (!program) return '';
                                        const obj = program.programInfos[dataIndex];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                    程序ID：${ obj.programId }<br/>
                                    程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
                                    程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
                                    CPU个数：${ obj.allocatedVCores }<br/>
                                    内存使用量：${ obj.allocatedMemoryGB }GB`
                                    }
                                }
                            },
                            xAxis: {
                                0: { data: { $set: top10.xAxis } },
                            },
                            series: { $set: top10.series },
                        }),
                        pageIndex: 1
                    },
                });
            })
            .catch(() => errorHandler());
    };

    // 区间内TOPN程序CPU详情
    getCpuTopNDetail = (params) => {
        api.getTopProgramCpuDetail(params).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + response.msg);
                this.setState({
                    cpuTopNDetail: {
                        dataSource: [],
                        loading: false
                    }
                });
                this.cpuTopNDetailSource = null;
                return;
            }
            this.cpuTopNDetailSource = response;
            const data = response.data;
            this.setState({
                cpuTopNDetail: {
                    dataSource: data && data.slice(0, 10).map((d, i) => ({ ...d, index: i + 1 })),
                    loading: false
                }
            });
        });
    };

    // 获取程序历史详情
    getProgramHistoryDetail = (cluster, startTime, endTime, programName, currentPage) => {
        api.getProgramHistoryDetail({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.historyStartTime,
            endTime: endTime || this.historyEndTime,
            programName: programName || this.state.historySearchValue,
            currentPage: currentPage || 1,
            pageSize: 2,
        }).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取程序历史详情失败: ' + response.msg);
                this.setState(update(this.state, {
                    historyTable: {
                        loading: { $set: false },
                        dataSource: { $set: [] },
                        pagination: {
                            total: { $set: 0 }
                        },
                    }
                }));
                return;
            }
            const data = response.data;
            this.setState(update(this.state, {
                historyTable: {
                    loading: { $set: false },
                    dataSource: { $set: data ? data.items.map((d, i) => ({ ...d, index: i + 1 })) : [] },
                    pagination: {
                        total: { $set: data ? data.total : 0 }
                    }
                }
            }));

        });
    };

    // 程序运行时长
    getOverRunningTimeProgram = (cluster, overRunningTime) => {
        api.getOverRunningTimeProgram({
            clusterName: cluster || this.context.clusterValue,
            overRunningTime: overRunningTime || 0,
            limit: '100',
        }).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取程序运行时长失败: ' + response.msg);
                this.setState(update(this.state, {
                    overRunningTimeTable: {
                        loading: { $set: false },
                        dataSource: { $set: [] },
                    }
                }));
                return;
            }
            this.setState(update(this.state, {
                overRunningTimeTable: {
                    loading: { $set: false },
                    dataSource: { $set: response.data },
                }
            }));

        });
    };

    // 刷新
    refresh = () => {
        this.setState(update(this.state, {
            memoryTrend: {
                loading: { $set: true },
            },
            memoryTopNTrend: {
                loading: { $set: true },
            },
            memoryTopNDetail: {
                loading: { $set: true }
            },
            cpuTrend: {
                loading: { $set: true },
            },
            cpuTopNTrend: {
                loading: { $set: true },
            },
            cpuTopNDetail: {
                loading: { $set: true }
            },
        }), () => {
            this.getMemoryTrend(undefined, this.trendStartTime, this.trendEndTime);
            this.getCpuTrend(undefined, this.trendStartTime, this.trendEndTime);
        });
    };

    // 开始时间结束时间获取
    getTime = (e) => {
        const formatter = 'YYYY-MM-DD HH:mm:ss';
        let endTime = moment().format(formatter); //当前时间
        let startTime;
        switch (e) {
            case 1:
                startTime = moment(endTime).subtract(6, "hours").format(formatter); // 6小时
                break;
            case 2:
                startTime = moment(endTime).subtract(12, "hours").format(formatter); // 12小时
                break;
            case 3:
                startTime = moment(endTime).subtract(24, "hours").format(formatter); // 24小时
                break;
            case 4:
                startTime = moment(endTime).subtract(7, "days").format(formatter); // 7天
                break;
            default:
                break;
        }
        return { startTime, endTime };
    };

    //时间筛选(第一个筛选组)
    onTimeTypeChange = (e) => {
        const type = e.target.value;
        let startTime = '', endTime = '';
        if (!type) { // type为自定义
            if (this.customTrendStartTime && this.customTrendEndTime) {
                startTime = this.customTrendStartTime;
                endTime = this.customTrendEndTime;
            }
        } else {
            const time = this.getTime(type);
            startTime = time.startTime;
            endTime = time.endTime;
        }
        this.trendStartTime = startTime;
        this.trendEndTime = endTime;
        this.setState({ timeType: e.target.value }, () => startTime && endTime && this.refresh());
    };

    // 历史详情时间筛选
    onHistoryTimeChange = (e) => {
        const type = e.target.value;
        let startTime = '', endTime = '';
        if (!type) { // type为自定义
            if (this.customHistoryStartTime && this.customHistoryEndTime) {
                startTime = this.customHistoryStartTime;
                endTime = this.customHistoryEndTime;
            }
        } else {
            const time = this.getTime(type);
            startTime = time.startTime;
            endTime = time.endTime;
        }
        this.historyStartTime = startTime;
        this.historyEndTime = endTime;
        this.setState(update(this.state, {
            historyTimeType: { $set: type },
        }), () => {
            if (!(startTime && endTime)) return;
            this.setState(update(this.state, {
                historyTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    }
                },
            }));
            this.getProgramHistoryDetail('', this.historyStartTime, this.historyEndTime);
        });
    };

    //DatePicker 自定义时间(第一个筛选组)
    onTrendDatePickerChange = (attr) => (obj, time) => {
        this[attr] = time;
        if (this.customTrendStartTime && this.customTrendEndTime) {
            if (this.customTrendStartTime >= this.customTrendEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }
            this.getMemoryTrend(undefined, this.customTrendStartTime, this.customTrendEndTime);
            this.getCpuTrend(undefined, this.customTrendStartTime, this.customTrendEndTime);
        }
    };

    // DatePicker 自定义时间(历史详情)
    onHistoryDatePickerChange = (attr) => (obj, time) => {
        this[attr] = time;
        if (this.customHistoryStartTime && this.customHistoryEndTime) {
            if (this.customHistoryStartTime >= this.customHistoryEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }

            this.setState(update(this.state, {
                historyTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    }
                }
            }));
            this.getProgramHistoryDetail(undefined, this.customHistoryStartTime, this.customHistoryEndTime, '', 1);
        }
    };


    // 导出内存TopN数据
    exportTopNDetail = (type) => () => {
        let data, url;
        switch (type) {
            case 'memory':
                data = this.memoryTopNDetailSource;
                url = 'exportMemoryExcel';
                break;
            case 'cpu':
                data = this.cpuTopNDetailSource;
                url = 'exportCpuExcel';
                break;

            default:
                return;
        }
        if (!data) {
            message.error('无可导出数据');
            return;
        }
        api[url](data).then(res => downloadFile(res));
    };


    // 趋势图滑块拖动
    trendSliderEvent = (start, end) => {
        const len = this.memoryTrendData.length;
        if (!len) return;

        const startIndex = Math.floor(start * len - 1);
        const endIndex = Math.floor(end * len - 1);
        const startTime = this.memoryTrendData[startIndex < 0 ? 0 : startIndex].time;
        const endTime = this.memoryTrendData[endIndex > len - 1 ? len - 1 : endIndex].time;
        if (startTime === this.linkStartTime1 && endTime === this.linkEndTime1) return;
        this.linkStartTime1 = startTime;
        this.linkEndTime1 = endTime;
        this.setState(update(this.state, {
            memoryTrend: {
                sliderParam: {
                    $set: {
                        startTime: startTime.slice(0, 16),
                        endTime: endTime.slice(0, 16),
                    }
                }
            },
            memoryTopNTrend: {
                loading: { $set: true },
            },
            memoryTopNDetail: {
                loading: { $set: true }
            },
        }), () => {
            this.getMemoryTopNTrend('', startTime, endTime);
        });

    };

    // cpu图滑块拖动
    cpuSliderEvent = (start, end) => {
        const len = this.cpuTrendData.length;
        if (!len) return;

        const startIndex = Math.floor(start * len - 1);
        const endIndex = Math.floor(end * len - 1);
        const startTime = this.cpuTrendData[startIndex < 0 ? 0 : startIndex].time;
        const endTime = this.cpuTrendData[endIndex > len - 1 ? len - 1 : endIndex].time;
        if (startTime === this.linkStartTime2 && endTime === this.linkEndTime2) return;
        this.linkStartTime2 = startTime;
        this.linkEndTime2 = endTime;
        this.setState(update(this.state, {
            cpuTrend: {
                sliderParam: {
                    $set: {
                        startTime: startTime.slice(0, 16),
                        endTime: endTime.slice(0, 16),
                    }
                }
            },
            cpuTopNTrend: {
                loading: { $set: true },
            },
            cpuTopNDetail: {
                loading: { $set: true }
            },
        }), () => {
            this.getCpuTopNTrend('', startTime, endTime);
        });
    };

    // TopN图翻页
    onTopNPageChange = (type) => (page) => {
        let trendAttr, trendSeriesAttr, detailAttr, detailSourceAttr;
        switch (type) {
            case 'memory':
                trendAttr = 'memoryTopNTrend';
                trendSeriesAttr = 'memoryTopNSeries';
                detailAttr = 'memoryTopNDetail';
                detailSourceAttr = 'memoryTopNDetailSource';
                break;
            case 'cpu':
                trendAttr = 'cpuTopNTrend';
                trendSeriesAttr = 'cpuTopNSeries';
                detailAttr = 'cpuTopNDetail';
                detailSourceAttr = 'cpuTopNDetailSource';
                break;
            default:
                return;
        }
        this.setState(update(this.state, {
            [trendAttr]: {
                loading: { $set: true },
            },
            [detailAttr]: {
                loading: { $set: true },
            },
        }), () => {
            const exportData = this[detailSourceAttr].data;
            const currentData = this[trendSeriesAttr][page - 1] || [];
            this.setState(update(this.state, {
                [trendAttr]: {
                    loading: { $set: false },
                    pageIndex: { $set: page },
                    chartOption: {
                        series: { $set: currentData.series },
                        legend: { $set: currentData.legend.reverse() },
                        xAxis: { $set: currentData.xAxis },
                    },
                },
                [detailAttr]: {
                    loading: { $set: false },
                    dataSource: { $set: page === 1 ? exportData.slice(0, 10) : exportData.slice(10, 20) },
                }
            }));
        });
    };

    // 分页、排序、筛选变化时触发
    historyTableChange = (pagination) => {
        if (pagination && pagination.current) {
            this.setState(update(this.state, {
                    historyTable: {
                        pagination: { $set: pagination },
                        loading: { $set: true }
                    }
                }
            ), () => {
                this.getProgramHistoryDetail(undefined, undefined, undefined, '', pagination.current);
            });
        }
    };

    // 历史详情搜索框
    onHistorySearchChange = (e) => {
        this.setState(update(this.state, {
                historyTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    },
                },
                historySearchValue: { $set: e.target.value },
            }
        ));
        const fn = (value) => () =>
            this.getProgramHistoryDetail(undefined, undefined, undefined, value, 1);
        debounce(fn(e.target.value));
    };

    // 运行时长input change
    onOverTimeInputChange = (e) => {
        const value = e.target.value;
        if (/^\d+$/g.test(value) || value === '') {
            this.setState({ overRunningTime: value });
        } else {
            message.destroy();
            message.warning('只允许输入正整数')
        }
    };

    // 运行时长刷新
    onOverTimeRefresh = () => {
        this.setState(update(this.state, {
            overRunningTimeTable: {
                loading: { $set: true },
            }
        }));
        this.getOverRunningTimeProgram(undefined, Number(this.state.overRunningTime));
    };

    render() {
        const state = this.state;

        return (
            <Fragment>
                <Form layout="inline">
                    <FormItem label="时间选择" colon={ false }>
                        <Radio.Group
                            className="radio-button"
                            onChange={ this.onTimeTypeChange }
                            value={ state.timeType }>
                            <Radio.Button key={ 'time_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 4 } value={ 4 }>最近7天</Radio.Button>
                            <Radio.Button key={ 'time_' + 0 } value={ 0 }>自定义</Radio.Button>
                        </Radio.Group>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="开始时间"
                            disabled={ state.timeType !== 0 }
                            style={ { width: '160px', marginRight: '12px' } }
                            onChange={ this.onTrendDatePickerChange('customTrendStartTime') }
                        />
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="结束时间"
                            disabled={ state.timeType !== 0 }
                            style={ { width: '160px', marginRight: '12px' } }
                            onChange={ this.onTrendDatePickerChange('customTrendEndTime') }
                        />

                        <Button htmlType="button"
                                type="primary"
                                className="sd-minor no-gradient"
                                onClick={ this.refresh }
                                style={ { height: '30px', lineHeight: '30px', fontSize: '13px' } }
                        >刷新</Button>
                    </FormItem>
                </Form>

                <div className="part" style={ { height: '1020px' } }>
                    <Card
                        size="small"
                        className="grey-card-title left"
                        title={ <span><Icon type="dashboard"/>内存</span> }
                        extra={
                            <span>总内存： { state.memoryTotalSpace.memory } | 上个月最大内存: { state.memoryTotalSpace.historyMemory } | 总磁盘空间： { state.memoryTotalSpace.disk }</span> }
                    >
                        <div className="block-wrapper">
                            <ControllerChart
                                id='programMemoryTrend'
                                title='集群内存总体趋势图'
                                sliderEvent={ this.trendSliderEvent }
                                { ...state.memoryTrend }/>
                            <LinkChart
                                id='programMemoryTopNTrend'
                                title='区间内TOPN程序内存趋势图'
                                onPageChange={ this.onTopNPageChange('memory') }
                                { ...state.memoryTopNTrend }/>
                            <LinkTable
                                title='区间内TOPN程序内存详情'
                                exportExcel={ this.exportTopNDetail('memory') }
                                options={ {
                                    id: 'programMemoryDetail',
                                    rowKey: 'index',
                                    columns: memoryTopNColumns,
                                    ...state.memoryTopNDetail,
                                } }/>
                        </div>
                    </Card>

                    <Card
                        size="small"
                        className="grey-card-title right"
                        title={ <span><Icon type="stock"/>CPU</span> }
                        extra={
                            <span>总CPU：{ state.cpuTotalSpace.cpu } | 上个月最大总CPU:{ state.cpuTotalSpace.historyCpu }个 | 总磁盘空间：{ state.cpuTotalSpace.disk }</span> }
                    >
                        <div className="block-wrapper">
                            <ControllerChart
                                id='programCpuTrend'
                                title='集群CPU总体趋势图'
                                sliderEvent={ this.cpuSliderEvent }
                                { ...state.cpuTrend }/>
                            <LinkChart
                                id='programCpuTopNTrend'
                                title='区间内TOPN程序CPU趋势图'
                                onPageChange={ this.onTopNPageChange('cpu') }
                                { ...state.cpuTopNTrend }/>
                            <LinkTable
                                title='区间内TOPN程序CPU详情'
                                exportExcel={ this.exportTopNDetail('cpu') }
                                options={ {
                                    id: 'programCpuDetail',
                                    rowKey: 'index',
                                    columns: cpuTopNColumns,
                                    ...state.cpuTopNDetail,
                                } }/>
                        </div>
                    </Card>
                </div>

                <div className="program-history">
                    <Card
                        size="small"
                        style={ { width: '100%' } }
                        className="grey-card-title"
                        title={ <span><Icon type="dashboard"/>程序历史详情</span> }
                    >
                        <div className="sd-filter-form">
                            <Input.Search
                                allowClear
                                value={ state.historySearchValue }
                                placeholder="请输入程序名称"
                                style={ { width: '150px' } }
                                onChange={ this.onHistorySearchChange }/>
                            <Radio.Group
                                className="radio-button" onChange={ this.onHistoryTimeChange }
                                value={ state.historyTimeType }>
                                <Radio.Button key={ 'time_running_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 4 } value={ 4 }>最近7天</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 0 } value={ 0 }>自定义</Radio.Button>
                            </Radio.Group>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="开始时间"
                                disabled={ state.historyTimeType !== 0 }
                                style={ { width: '160px', marginRight: '12px' } }
                                onChange={ this.onHistoryDatePickerChange('customHistoryStartTime') }/>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="结束时间"
                                disabled={ state.historyTimeType !== 0 }
                                style={ { width: '160px' } }
                                onChange={ this.onHistoryDatePickerChange('customHistoryEndTime') }/>
                        </div>
                        <SDTable
                            id="historyTable"
                            rowKey="index"
                            columns={ historyColumns }
                            onChange={ this.historyTableChange }
                            className="sd-table-simple tr-color-interval"
                            scroll={ { x: '130%' } }
                            { ...state.historyTable }
                        />
                    </Card>
                </div>

                <div className="program-running">
                    <Card
                        size="small"
                        style={ { width: '100%' } }
                        className="grey-card-title"
                        title={ <span><Icon type="dashboard"/>程序运行时长</span> }
                    >
                        <div className="sd-filter-form">
                        <span style={ { color: '#404040' } }>
                            运行时长超过
                                <Input
                                    value={ state.overRunningTime }
                                    style={ { width: '80px', margin: '0 5px' } }
                                    onChange={ this.onOverTimeInputChange }
                                />
                            分钟
                            </span>
                            <Button
                                htmlType="button"
                                type="primary"
                                className="sd-minor no-gradient"
                                style={ { margin: '0 6px 0 8px' } }
                                onClick={ this.onOverTimeRefresh }
                            >刷新</Button>
                        </div>
                        <SDTable
                            id='overRunningTimeTable'
                            rowKey="programId"
                            columns={ overRunningTimeColumns }
                            className="sd-table-simple tr-color-interval"
                            pagination={ { pageSize: 5 } }
                            { ...state.overRunningTimeTable }
                        />
                    </Card>
                </div>
            </Fragment>
        )
    }
}