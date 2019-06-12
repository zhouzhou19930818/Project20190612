import React, { Fragment } from "react";
import { message } from "antd";
import moment from "moment";
import api from 'src/tools/api';
import SDTable from "src/components/SDTable";
import { computeHeight, debounce } from "src/tools/utils";
import Context from './Context';

import { reduxMapper } from "src/redux/modules/diskTrouble";


class UntreatedDisk extends React.Component {

    static contextType = Context;

    state = {
        dataSource: [],
        selectedRowKeys: [],
        tableLoading: true,
        scrollY: undefined,
    };

    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
        }, {
            title: 'IP地址',
            dataIndex: 'ip',
            key: 'ip',
        }, {
            title: '磁盘路径',
            dataIndex: 'directory',
            key: 'directory',
        }, {
            title: '产生时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },];

    componentDidMount() {
        this.getList();
        this.setScrollY();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.taskId && nextProps.taskId !== this.props.taskId) {
            this.getList();
        }
        if (nextContext.searchValue !== this.context.searchValue) {
            this.setState({
                dataSource: this.state.dataSource.filter(d => {
                    let flag = false;
                    for (let attr in d) {
                        if (!d.hasOwnProperty(attr)) continue;
                        if (d.includes(nextContext.searchValue)) {
                            flag = true;
                        }
                    }
                    return flag;
                })
            })
        }
    }


    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getUntreatedDiskList().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            const responseData = res.data.data;
            this.setState({
                tableLoading: false,
                dataSource: responseData && responseData.map((d, i) => ({ ...d, index: i + 1 })),
                selectedRowKeys: this.props.unInstallList.reduce((res, data) => {
                    const obj = responseData.find(d => d.id === data.id);
                    obj && res.push(obj.id);
                    return res;
                }, []),
            });
        });
    };

    setScrollY = () => {
        const compute = computeHeight([[568, 606, 805], [105, 120, 100, 64]]);
        let scrollY = undefined;
        if (compute) {
            const contentPadding = 16;
            const contentTabs = 61;
            const contentTablePagination = 44;
            // const contentTableHead = 64; // 当表格内容占两行时的高度, 43: 一行的高度
            const containerHeight = compute.height;
            const contentTableHead = compute.candidateHeight;
            const filterFormEL = document.getElementById('filterForm');
            let contentFilterForm = 45;
            if (filterFormEL) contentFilterForm = filterFormEL.clientHeight + 5;
            scrollY = containerHeight - contentPadding - contentTabs - contentFilterForm - contentTablePagination - contentTableHead;
        }
        this.setState({ scrollY });
    };

    onRowSelect = (selectedRowKeys, objList) => {
        this.setState({ selectedRowKeys }, () => {
            this.props.changeUninstallList(objList);
            this.props.changeTaskId(undefined);
            this.props.changeStepStatus();
            debounce(() => this.props.changeIsExpendContent(true), 1200);
        });
    };

    render() {
        const state = this.state;
        return (
            <Fragment>
                <SDTable
                    rowKey="id"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    scroll={ { y: 200 } }
                    columnsProportion={ [1, 2, 4, 2] }
                />
            </Fragment>
        )
    }
}

export default reduxMapper(UntreatedDisk);