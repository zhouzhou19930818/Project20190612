import React, { Fragment } from 'react';
import { DatePicker, Input, message, Radio, Select } from "antd";
import update from 'immutability-helper';
import Context from "../Context";
import api from 'src/tools/api';
import {
    memoryTrendOption,
    cpuTrendOption,
    memoryTopNTrendOption,
    cpuTopNTrendOption, getXAxisData, getSeries,
} from "../program/allChartsOptions";
import { debounce, downloadFile } from "src/tools/utils";
import moment from "moment";
import SDTable from "../../../components/SDTable";
import { baseColumns } from "./tableColumns";
import { ControllerChart } from "./Block";
import { allInterval } from '../commonConst';
import { LinkChart, LinkTable } from "../program/Block";
import { memoryTopNColumns } from "../program/tableColumns";

const Option = Select.Option;

export default class Queue extends React.Component {
    static contextType = Context;

    state = {
        baseTimeType: 3,
        baseSearchValue: '',
        baseTable: {
            loading: false,
            dataSource: [],
            pagination: {
                current: 1,
                pageSize: 2,
                total: 0
            },
        },
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
            disk: '',
        },
        queueList: [], // 队列Select Option
        queueValue: '' // 队列Select value
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
    // 内存应用详情表格columns

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextContext.clusterRequestError) { // 请求集群有误
            this.setState(update(this.state, {
                memoryTrend: { loading: { $set: false } },
                memoryTopNTrend: { loading: { $set: false } },
                memoryTopNDetail: { loading: { $set: false } },
                cpuTrend: { loading: { $set: false } },
                cpuTopNTrend: { loading: { $set: false } },
                cpuTopNDetail: { loading: { $set: false } },
            }));
        } else if (this.context.clusterValue !== nextContext.clusterValue) {
            this.setState(update(this.state, {
                baseTimeType: { $set: 3 },
                baseSearchValue: { $set: '' },
                baseTable: { loading: { $set: true } },
                memoryTrend: { loading: { $set: true }, },
                memoryTopNTrend: { loading: { $set: true }, },
                memoryTopNDetail: { loading: { $set: true } },
                cpuTrend: { loading: { $set: true }, },
                cpuTopNTrend: { loading: { $set: true }, },
                cpuTopNDetail: { loading: { $set: true } },
            }));

            this.getBaseList(nextContext.clusterValue);
            this.getQueueList(nextContext.clusterValue);
            this.getMemoryTrend(nextContext.clusterValue); // 获取内存趋势图数据并加载图表
            this.getCpuTrend(nextContext.clusterValue);
        }
    }

    refresh = () => {
        this.getBaseList();
    };

    // 获取队列基本信息 todo: 对接接口
    getBaseList = (cluster) => {
        // api.getProgramHistoryDetail({
        //     clusterName: cluster || this.context.clusterValue,
        // }).then(res => {
        //     const response = res.data;
        //     if (response.success !== 'true') {
        //         message.error('获取程序历史详情失败: ' + response.msg);
        //         this.setState(update(this.state, {
        //             baseTable: {
        //                 loading: { $set: false },
        //                 dataSource: { $set: [] },
        //                 pagination: {
        //                     total: { $set: 0 }
        //                 },
        //             }
        //         }));
        //         return;
        //     }
        //     const data = response.data;
        //     this.setState(update(this.state, {
        //         baseTable: {
        //             loading: { $set: false },
        //             dataSource: { $set: data ? data.items.map((d, i) => ({ ...d, index: i + 1 })) : [] },
        //             pagination: {
        //                 total: { $set: data ? data.total : 0 }
        //             }
        //         }
        //     }));
        // });
    };

    // 获取队列列表
    getQueueList = (cluster) => {
        api.getProgramHistoryDetail({
            clusterName: cluster || this.context.clusterValue,
        }).then(res => {
            const response = res.data || [];
            if (response.success !== 'true') {
                message.error('获取队列失败: ' + response.msg);
                this.setState({
                    queueList: response.data || [],
                    // queueValue: response.data[0].id, // todo: 设置默认值
                });
                return;
            }
            const data = response.data;
            this.setState(update(this.state, {
                baseTable: {
                    loading: { $set: false },
                    dataSource: { $set: data ? data.items.map((d, i) => ({ ...d, index: i + 1 })) : [] },
                    pagination: {
                        total: { $set: data ? data.total : 0 }
                    }
                }
            }));
        });
    };

    // 切换队列值
    onQueueChange = (value) => {
        this.setState({ queueValue: value });
        // this.getMemoryTopNTrend(); // todo: 传参
        // this.getCpuTopNTrend();
    };

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
                                                    内存使用量: ${ obj.memoryUsed ? Number(obj.memoryUsed) : '' }<br/>
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

    // 历史详情搜索框
    onBaseSearchChange = (e) => {
        this.setState(update(this.state, {
                baseTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    },
                },
                baseSearchValue: { $set: e.target.value },
            }
        ));
        const fn = (value) => () =>
            this.getBaseList(undefined, undefined, undefined, value, 1);
        debounce(fn(e.target.value));
    };

    // 历史详情时间筛选
    onBaseTimeChange = (e) => {
        const type = e.target.value;
        let startTime = '', endTime = '';
        if (!type) { // type为自定义
            if (this.customBaseStartTime && this.customBaseEndTime) {
                startTime = this.customBaseStartTime;
                endTime = this.customBaseEndTime;
            }
        } else {
            const time = this.getTime(type);
            startTime = time.startTime;
            endTime = time.endTime;
        }
        this.baseStartTime = startTime;
        this.baseEndTime = endTime;
        this.setState(update(this.state, {
            baseTimeType: { $set: type },
        }), () => {
            if (!(startTime && endTime)) return;
            this.setState(update(this.state, {
                baseTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    }
                },
            }));
            this.getBaseList('', this.baseStartTime, this.baseEndTime);
        });
    };

    // DatePicker 自定义时间
    onBaseDatePickerChange = (attr) => (obj, time) => {
        this[attr] = time;
        if (this.customBaseStartTime && this.customBaseEndTime) {
            if (this.customBaseStartTime >= this.customBaseEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }

            this.setState(update(this.state, {
                baseTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    }
                }
            }));
            this.getBaseList(undefined, this.customBaseStartTime, this.customBaseEndTime, '', 1);
        }
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

    render() {
        const state = this.state;

        return (
            <Fragment>
                <div>
                    <div className="block-title" style={ { fontSize: '16px', margin: '-4px 0 5px' } }>
                        基本信息
                        <span style={ {
                            fontSize: '13px',
                            fontFamily: 'SourceHanSansCN-Regular',
                            fontWeight: '400',
                            color: 'rgba(128,128,128,1)',
                            marginLeft: '25px'
                        } }
                        >YARN 正在使用 { '110' } vcores 和内存{ '120GB' }</span>
                    </div>
                    <div className="block-body white-bg" style={ { padding: '16px 16px 20px 16px' } }>
                        <SDTable
                            id="queueBaseTable"
                            rowKey="index"
                            columns={ baseColumns }
                            className="sd-table-simple tr-color-interval"
                            scroll={ { x: '130%' } }
                            bordered={ true }
                            { ...state.baseTable }
                        />
                    </div>
                </div>

                <div>
                    <div className="block-title" style={ { fontSize: '16px', margin: '19px 0 7px' } }>
                        队列内存CPU趋势图
                    </div>

                    <div className="block-wrapper white-bg" style={ { padding: '10px', marginBottom: '12px' } }>
                        <Input.Search
                            allowClear
                            value={ state.baseSearchValue }
                            placeholder="请输入程序名称"
                            style={ { width: '150px' } }
                            onChange={ this.onBaseSearchChange }/>
                        <Radio.Group
                            className="radio-button" onChange={ this.onBaseTimeChange }
                            value={ state.baseTimeType }>
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
                            disabled={ state.baseTimeType !== 0 }
                            style={ { width: '160px', marginRight: '12px' } }
                            onChange={ this.onBaseDatePickerChange('customBaseStartTime') }/>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="结束时间"
                            disabled={ state.baseTimeType !== 0 }
                            style={ { width: '160px' } }
                            onChange={ this.onBaseDatePickerChange('customBaseEndTime') }/>
                    </div>

                    <div className="block-body white-bg">
                        <div className="part">
                            <div className="block-wrapper left">
                                <ControllerChart
                                    id='queueMemoryTrend'
                                    title='队列内存趋势图（总内存：120GB）'
                                    sliderEvent={ this.trendSliderEvent }
                                    { ...state.memoryTrend }/>
                            </div>
                            <div className="block-wrapper right">
                                <ControllerChart
                                    id='queueCpuTrend'
                                    title='队列CPU趋势图（总CPU：110个）'
                                    sliderEvent={ this.trendSliderEvent }
                                    { ...state.cpuTrend }/>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="block-title" style={ { fontSize: '16px', margin: '19px 0 7px' } }>
                        队列区间内程序内存CPU趋势图
                    </div>

                    <div className="block-wrapper white-bg" style={ { padding: '10px', marginBottom: '12px' } }>
                        队列选择
                        <Select
                            style={ {
                                width: '153px',
                                verticalAlign: 'middle',
                                marginLeft: '10px',
                            } }
                            notFoundContent="暂无数据"
                            value={ state.queueValue }
                            onChange={ this.onQueueChange }
                        >
                            { state.queueList.map(d => <Option key={ d.id }>{ d.name }</Option>) }
                        </Select>
                    </div>

                    <div className="block-body white-bg">
                        <div className="part">
                            <div className="block-wrapper left">
                                <LinkChart
                                    id='queueMemoryTopNTrend'
                                    title='区间内程序内存趋势图'
                                    onPageChange={ this.onTopNPageChange('memory') }
                                    { ...state.memoryTopNTrend }/>
                            </div>
                            <div className="block-wrapper right">
                                <LinkChart
                                    id='queueCpuTopNTrend'
                                    title='区间内程序CPU趋势图'
                                    onPageChange={ this.onTopNPageChange('cpu') }
                                    { ...state.cpuTopNTrend }/>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="block-title" style={ { fontSize: '16px', margin: '19px 0 7px' } }>
                        队列区间内程序内存CPU详情
                    </div>

                    <div className="block-body white-bg">
                        <div className="part">
                            <div className="block-wrapper left">
                                <LinkTable
                                    title='区间内程序内存详情'
                                    exportExcel={ this.exportTopNDetail('memory') }
                                    options={ {
                                        id: 'queueMemoryDetail',
                                        rowKey: 'index',
                                        columns: memoryTopNColumns,
                                        ...state.memoryTopNDetail,
                                    } }/>
                            </div>
                            <div className="block-wrapper right">
                                <LinkTable
                                    title='区间内程序CPU详情'
                                    exportExcel={ this.exportTopNDetail('cpu') }
                                    options={ {
                                        id: 'queueMemoryDetail',
                                        rowKey: 'index',
                                        columns: memoryTopNColumns,
                                        ...state.memoryTopNDetail,
                                    } }/>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="block-title" style={ { fontSize: '16px', margin: '19px 0 7px' } }>
                        区间内未成功程序详情
                        <span style={ {
                            fontSize: '13px',
                            fontFamily: 'SourceHanSansCN-Regular',
                            fontWeight: '400',
                            color: 'rgba(128,128,128,1)',
                            marginLeft: '25px'
                        } }
                        >时间：{ '2019-5-6 18:01:13' }~{ '2019-5-6 18:01:16' }</span>
                    </div>

                    <div className="block-body white-bg">
                        <div className="part">
                            <div className="block-wrapper left">
                                <LinkTable
                                    title='区间内程序内存详情'
                                    exportExcel={ this.exportTopNDetail('memory') }
                                    options={ {
                                        id: 'queueMemoryDetail',
                                        rowKey: 'index',
                                        columns: memoryTopNColumns,
                                        ...state.memoryTopNDetail,
                                    } }/>
                            </div>
                            <div className="block-wrapper right">
                                <LinkTable
                                    title='区间内程序CPU详情'
                                    exportExcel={ this.exportTopNDetail('cpu') }
                                    options={ {
                                        id: 'queueMemoryDetail',
                                        rowKey: 'index',
                                        columns: memoryTopNColumns,
                                        ...state.memoryTopNDetail,
                                    } }/>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}