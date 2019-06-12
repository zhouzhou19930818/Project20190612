import React, { Fragment } from "react";
import { Button, Input, message } from "antd";
import SDTable from "src/components/SDTable";
import SDModal from "src/components/SDModal";
import { ArrowButton } from "src/components/LittleComponents";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import api from "src/tools/api";
import { debounce } from "src/tools/utils";
import { getStatus, logStatus } from "./commonStatus";
import Context from './Context';

// const stepStatus = { 12: '未平衡', 13: '平衡中', 14: '平衡失败', 15: '平衡成功' };

class DiskReBalance extends React.Component {
    static contextType = Context;
    state = {
        selectedRowKeys: [],
        detailVisible: false,
        detailInfo: null,
        dataSource: [],
        tableLoading: false,
    };

    columns = [
        {
            title: 'IP地址',
            dataIndex: 'ip',
            width: '15%',
        },
        {
            title: '磁盘路径',
            dataIndex: 'directory',
            width: '15%',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            render: (status) => {
                const obj = getStatus(status, 15);
                return (
                    <span style={{
                        fontSize: '12px',
                        verticalAlign: 'middle',
                        borderRadius: '2px',
                        padding: '6px 10px'
                    }}
                        className={'status ' + obj.className}
                    >{obj.text}</span>
                )
            },
        },
        {
            title: '控制台',
            dataIndex: 'summaryLog',
            width: '40%',
            render: (d, record) => {
                if (!d) return '';
                return (
                    <div className="bottom-part">
                        <div className="console">
                            {
                                d.map((msg, i) =>
                                    <div key={'msg' + i}>
                                        {msg.roleType + ' -- ' + msg.stepName + ' -- ' + logStatus[msg.stepStatus]}
                                    </div>)
                            }
                        </div>
                    </div>
                )
            }
        },
        {
            title: '操作',
            dataIndex: 'op',
            width: '10%',
            render: (text, record) => {
                return (
                    <button
                        className="sd-anchor-button"
                        style={{ color: '#0E6EDF' }}
                        onClick={() => this.onDetailShow(record)}
                    >详情</button>)
            }
        },
    ];

    currentObj = {};

    componentDidMount() {
        this.getList();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // 从"未完成任务"获取taskId
        if (nextProps.taskId !== this.props.taskId) {
            this.getList(nextProps.taskId);
        }
        // websocket 更新
        if (nextProps.websocketMsg) {
            debounce(() => {
                this.getList(nextProps.taskId);
                if (this.state.detailVisible) this.onDetailShow();
            });
        }
    }

    getList = () => {
        this.setState({ tableLoading: true });
        api.getRecoveringDiskMsgInRebalanceStep({ taskId: this.props.taskId }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                this.setState({ tableLoading: false });
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data,
                selectedRowKeys: res.data.data.map(d => d.id),
            });
        })
    };

    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    onDetailShow = (record) => {
        if (!this.state.detailVisible) this.setState({ detailVisible: true });
        if (record) this.currentObj = record;
        api.getProcessLogsDetail({ taskId: this.props.taskId, logId: this.currentObj.id, processType: 4 }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            let obj = res.data.data;
            obj.statusObj = getStatus(obj.status, 15);
            this.setState({ detailInfo: obj });
        });
    };

    // 模糊查询
    onSearchChange = (e) => {
        this.setState({ tableLoading: true });
        const fn = (value) => () => {
            // todo: 模糊查询接口
            api.getModelByNameOrDesc(value).then((res) => {
                this.setState({
                    dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
                    tableLoading: false,
                })
            })
        };
        debounce(fn(e.target.value));
    };

    confirm = () => {
        const isStatusOK = this.state.dataSource.find(d => d.status !== 12);
        if (isStatusOK) {
            message.error('请选择未重平衡的磁盘');
            return;
        }

        api.completeRebalanceDisk({
            logIds: this.state.dataSource.map(item => item.id),
            taskId: this.props.taskId
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.getList(); // 刷新表格内容
        });
    };

    // 下一步
    nextStep = () => {
        const isStatusOK = this.state.dataSource.find(d => this.state.selectedRowKeys.includes(d.id) && d.status < 15);
        if (isStatusOK) {
            message.error('请选择成功重平衡的磁盘');
            return;
        }
        api.confirmRebalancedDisk({
            logIds: this.state.dataSource.map(item => item.id),
            taskId: this.props.taskId
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeStepCurrent(this.props.stepCurrent + 1);
            this.props.changeStepStatus(); // left tabs
        });
    };
    //上一步
    upStep = (current) => {
        this.props.changeStepCurrent(this.props.stepCurrent - 1);
    };
    render() {
        const state = this.state;
        return <Fragment>
            <div className="top-part">
                <div className="sd-filter-form">
                    <span className="icon-wrapper top" />
                    <span className="title">任务名称{this.context.taskName}详情</span>
                    <div style={{ float: 'right' }}>
                        <Input.Search
                            placeholder="请输入关键字"
                            style={{ width: '230px', marginRight: '18px' }}
                            onChange={this.onSearchChange}
                        />
                        <Button
                            htmlType="button"
                            type="primary"
                            className="sd-minor"
                            style={{ marginRight: '8px' }}
                            onClick={this.confirm}
                        >
                            重平衡
                        </Button>
                    </div>
                </div>
                <SDTable
                    rowKey="id"
                    className="sd-table-simple tr-color-interval"
                    style={{ boxShadow: '0px 1px 5px 0px rgba(187,194,205,0.3)' }}
                    columns={this.columns}
                    dataSource={this.state.dataSource}
                    pagination={false}
                    loading={this.state.tableLoading}
                    rowSelection={{
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    }}
                />

                <div style={{ marginTop: '18px' }}>
                    <span style={{
                        display: 'inline-block',
                        width: '319px',
                        height: '28px',
                        lineHeight: '28px',
                        background: '#E7F5FF',
                        color: '#8A93A1',
                        fontSize: '12px',
                        marginTop: '10px',
                    }}
                    >温馨提示：数据重平衡耗时较长，请耐心等待</span>
                    <div style={{ float: 'right' }}>
                        <ArrowButton type="last" onClick={this.upStep}>上一步</ArrowButton>
                        <ArrowButton type="next" onClick={this.nextStep}>下一步</ArrowButton>
                    </div>
                </div>
            </div>
            <SDModal
                title="磁盘修复详情"
                visible={state.detailVisible}
                onCancel={() => this.setState({ detailVisible: false })}>
                {
                    state.detailInfo ? (
                        <Fragment>
                            <div className="detail_top" style={{ padding: '8px 6px', marginBottom: '10px' }}>
                                <div className="wrapper">
                                    <span className="icon_ip" />
                                    {state.detailInfo.ip}
                                    <span className={`status ${state.detailInfo.statusObj.className}`}>
                                        {state.detailInfo.statusObj.text}
                                    </span>
                                </div>
                                <div className="wrapper">
                                    <span className="icon_url" />
                                    {state.detailInfo.directory}
                                </div>
                            </div>
                            {
                                state.detailInfo.detailLog.length > 0 ? (
                                    < div className="detail_bottom">
                                        {state.detailInfo.detailLog.map((log, i) =>
                                            <div key={'log' + i}>
                                                {log.roleType + ' -- ' + log.stepName + ' -- ' + logStatus[log.stepStatus]}
                                                <pre className="step-console">   {log.stepConsole}</pre>
                                            </div>)}
                                    </div>
                                ) : null
                            }
                        </Fragment>
                    ) : null
                }
            </SDModal>
        </Fragment>
    }
}

export default reduxMapper(DiskReBalance);