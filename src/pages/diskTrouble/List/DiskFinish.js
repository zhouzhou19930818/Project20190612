import React, { Fragment } from "react";
import { Input, message } from "antd";
import SDTable from "src/components/SDTable";
import api from "src/tools/api";
import { ArrowButton } from "src/components/LittleComponents";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import { debounce } from "src/tools/utils";
import Context from './Context';

class DiskFinish extends React.Component {
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
        },
        {
            title: '磁盘路径',
            dataIndex: 'directory',
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: () => '已完成',
        },
    ];

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
            debounce(() => this.getList(nextProps.taskId));
        }
    }

    getList = () => {
        this.setState({ tableLoading: true });
        api.getRecoveredDiskMsgInCompleteStep({ taskId: this.props.taskId }).then(res => {
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

    //上一步
    upStep = (current) => {
        this.props.changeStepCurrent(this.props.stepCurrent - 1);
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

    nextStep = () => {
        api.confirmCompleteDiskRecoveryTask({
            taskId: this.props.taskId,
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
            }
        });
    };

    render() {
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
                <div style={{ float: 'right', marginTop: '18px' }}>
                    <ArrowButton type="last" onClick={this.upStep}>上一步</ArrowButton>
                    <ArrowButton type="next" onClick={this.nextStep}>完成</ArrowButton>
                </div>
            </div>
        </Fragment>
    }
}

export default reduxMapper(DiskFinish);