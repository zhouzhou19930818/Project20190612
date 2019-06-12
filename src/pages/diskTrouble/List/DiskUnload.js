import React, { Fragment } from "react";
import { Button, Input, message, Divider } from "antd";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import SDTable from "src/components/SDTable";
import SDModal from "src/components/SDModal";
import { ArrowButton } from "src/components/LittleComponents";
import api from 'src/tools/api';
import { debounce } from "src/tools/utils";
import { getStatus, logStatus } from './commonStatus';
import Context from './Context';

// const stepStatus = { 0: '未处理', 1: '卸载中', 2: '卸载失败', 3: '卸载成功' };
class DiskUnload extends React.Component {
    static contextType = Context;
    state = {
        selectedRowKeys: [],
        detailVisible: false,
        detailInfo: null,
        dataSource: [],
        display: false,
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
            render: (status) =>{
                const obj = getStatus(status, 3);
                return (
                    <span style={{
                        fontSize: '12px',
                        verticalAlign:'middle',
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
            render: (d, record) => {
                return (
                    <Fragment>
                        <button
                            key="btn_1"
                            className="sd-anchor-button"
                            style={{ color: '#0E6EDF' }}
                            onClick={() => this.onDetailShow(record)}
                        >
                            详情
                        </button>
                        {
                            record.status === 2 ? (
                                <Fragment>
                                    <Divider type="vertical" />
                                    <button
                                        key="btn_2"
                                        className="sd-anchor-button"
                                        style={{ color: '#0E6EDF' }}
                                        onClick={() => this.artificialRestorationProcess(record)}
                                    >
                                        人工修复
                                    </button>
                                </Fragment>
                            ) : null
                        }
                    </Fragment>
                )
            }
        },
    ];
    currentObj = {};

    componentDidMount() {
        if (this.props.taskId) {
            this.getList();
        } else if (this.props.unInstallList.length > 0) {
            this.setState({
                dataSource: this.props.unInstallList,
                selectedRowKeys: this.props.unInstallList.map(d => d.id)
            });
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // 从"未处理磁盘"获取待处理磁盘数据
        if (!nextProps.taskId && nextProps.unInstallList.length > 0) { // 切换未处理磁盘
            this.setState({
                dataSource: nextProps.unInstallList,
                selectedRowKeys: nextProps.unInstallList.map(d => d.id)
            });
        } else if (nextProps.taskId && nextProps.taskId !== this.props.taskId) { // 从"未完成任务"获取taskId
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

    componentWillUnmount() {
        this.setState = () => {
            return null;
        };
    }

    // 获取表格数据
    getList = (taskId) => {
        this.setState({ tableLoading: true });
        if (!taskId && !this.props.taskId) return;
        api.getRecoveringDiskMsgInUnloadStep({
            taskId: taskId || this.props.taskId,
        }).then(res => {
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

    onRowSelect = (selectedRowKeys) => this.setState({ selectedRowKeys });

    // "详情"
    onDetailShow = (record) => {
        if (!this.state.detailVisible) this.setState({ detailVisible: true });
        if (record) this.currentObj = record;
        api.getProcessLogsDetail({ taskId: this.props.taskId, logId: this.currentObj.id, processType: 1 }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            let obj = res.data.data;
            obj.statusObj = getStatus(obj.status, 3);
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

    //"卸载"按钮
    confirm = async () => {
        const isStatusOK = this.state.dataSource.find(d => d.status >= 3);
        if (isStatusOK) {
            message.error('请选择未成功卸载的磁盘');
            return;
        }

        const logIds = this.state.dataSource.map(item => item.id);
        const taskId = await api.createTask({ logIds: logIds }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeTaskId(res.data.data);  // 设置taskId
            return res.data.data;
        });
        if (!taskId) return;
        await api.completeUnloadDisks({ logIds: logIds, taskId: taskId }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
            }
        });
    };

    // 下一步
    nextStep = () => {
        const isStatusOK = this.state.dataSource.find(d => this.state.selectedRowKeys.includes(d.id) && d.status < 3);
        if (isStatusOK) {
            message.error('请选择成功卸载的磁盘');
            return;
        }
        api.confirmUnloadedDisk({ taskId: this.props.taskId, logIds: this.state.selectedRowKeys }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeStepCurrent(this.props.stepCurrent + 1);
            this.props.changeIsExpendContent(true);
            this.props.changeUninstallList([]); // 清空数据
        });
    };

    // 重试按钮
    retryProcess = () => {
        const isStatusOK = this.state.dataSource.find(d => d.status !== 2);
        if (isStatusOK) {
            message.error('请选择卸载失败的磁盘');
            return;
        }
        api.retryProcess({ taskId: this.props.taskId, logIds: this.state.selectedRowKeys }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
            }
        });
    };

    // 人工修复
    artificialRestorationProcess = (record) => {
        api.artificialRestorationProcess({ taskId: this.props.taskId, logIds: [record.id] }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.getList();
        });
    };

    render() {
        const props = this.props;
        const state = this.state;
        return <Fragment>
            <div className="top-part">
                <div className="sd-filter-form">
                    <span className="icon-wrapper top" />
                    <span className="title">任务名称{this.context.taskName}详情</span>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-grey"
                        disabled={!props.taskId}
                        style={{ marginRight: '8px' }}
                        onClick={this.retryProcess}
                    >
                        重试
                        </Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={{ marginRight: '8px' }}
                        onClick={this.confirm}
                    >
                        卸载
                        </Button>
                    <div style={{ float: 'right' }}>
                        <Input.Search
                            placeholder="请输入关键字"
                            style={{ width: '230px', marginRight: '18px' }}
                            onChange={this.onSearchChange}
                        />
                    </div>
                </div>
                <SDTable
                    rowKey="id"
                    className="sd-table-simple tr-color-interval"
                    style={{ boxShadow: '0px 1px 5px 0px rgba(187,194,205,0.3)' }}
                    columns={this.columns}
                    dataSource={this.state.dataSource}
                    pagination={false}
                    rowSelection={{
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    }}
                    columnsProportion={[2, 3, 1, 4]}
                />
                <div style={{ float: 'right', marginTop: '10px', position: 'relative',}}>
                    <ArrowButton type="next" onClick={(current) => this.nextStep(current)} disabled={state.display}>下一步</ArrowButton>
                </div>
            </div>
            <SDModal
                title="磁盘修复详情"
                visible={state.detailVisible}
                onCancel={() => this.setState({ detailVisible: false })}
                style={{ width: '426px' }}
            >
            </SDModal>
        </Fragment>
    }
}

export default reduxMapper(DiskUnload);