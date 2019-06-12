import React, { Fragment } from "react";
import { message, Progress, Avatar } from "antd";
import api from 'src/tools/api';
import SDTable from "src/components/SDTable";
// import moment from "moment";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import Context from "./Context";

const stepStatus = { 1: '卸载', 2: '换盘', 3: '加载', 4: '重平衡', 5: '完成' };

class UntreatedTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            statistics: [],
            tableLoading: true,
            percent: '',
        };
    }

    static contextType = Context;

    columns = [
        {
            title: '任务名称',
            dataIndex: 'taskName',
            key: 'taskName',
        },
        {
            title: '创建人',
            dataIndex: 'createUserName',
            key: 'createUserName',
            render() {
                return (
                    <Avatar size="small" icon="user" />
                )
            }
        },
        {
            title: '处理进度',
            dataIndex: 'currentTaskPoint',
            key: 'currentTaskPoint',
            sorter: (a, b) => parseInt(a.currentTaskPoint / a.totalTaskPoint * 100) - parseInt(b.currentTaskPoint / b.totalTaskPoint * 100),
            render(currentTaskPoint, record) {
                const totalTaskPoint = record.totalTaskPoint;
                const percent = parseInt(currentTaskPoint / totalTaskPoint * 100);
                return (
                    <Progress percent={percent} strokeColor="#22C151" />
                );
            },
        },
        {
            title: '磁盘个数',
            dataIndex: 'totalTaskPoint',
            key: 'totalTaskPoint',
            render(totalTaskPoint, record) {
                return (
                    <span>{totalTaskPoint}</span>
                );
            }
        },
        {
            title: '最后状态',
            dataIndex: 'nowLatestProcess',
            key: 'nowLatestProcess',
            render: (status) => <span style={{
                color: status === 5 ? '#008364' : '#213555',
                background: status === 5 ? '#EAF8E5' : '#D2F1FF',
                display: 'inline-block',
                width: '48px',
                height: '24px',
                lineHeight: '24px',
                textAlign: 'center',
                borderRadius: '2px'
            }}>{stepStatus[status]}</span>,


        },
    ];

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getUnfinishedTaskList().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
            });
            // console.log(this.state.dataSource.map(item => item.taskName))
            // this.props.getTaskName(this.state.dataSource.map(item => item.taskName))
        });
    };
    render() {
        const state = this.state;
        // console.log(this.props)
        return (
            <Fragment>
                <SDTable
                    onRow={(record, index) => {
                        return {
                            onClick: event => {
                                this.props.changeUninstallList([]);
                                this.props.changeTaskId(record.id);
                                this.props.changeIsExpendContent(true);
                                this.props.getTaskName(record.taskName);
                            } // 点击行
                        };
                    }}
                    rowKey="id"
                    id="testclick"
                    columns={this.columns}
                    dataSource={state.dataSource}
                    scroll={{ y: 200 }}
                    columnsProportion={[1, 3, 3, 2]}
                />
            </Fragment>
        )
    }
}

export default reduxMapper(UntreatedTask);