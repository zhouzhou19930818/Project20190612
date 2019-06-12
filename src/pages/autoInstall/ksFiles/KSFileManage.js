import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs, Button, Input, message, Modal } from 'antd';
import moment from "moment";
import { ContainerBody } from "src/components/LittleComponents";
import { prefixRoute } from "src/configs";
import api from "src/tools/api";
import DetailModal from "src/components/DetailModal";
import SDTable from "src/components/SDTable";

const TabPane = Tabs.TabPane;

export default class KSFileManage extends Component {

    panes = [
        {
            key: 'tab1',
            title: 'ks文件管理',
            content: <ManagerList/>,
        },
    ];
    onTabsChange = () => {
    };

    render() {
        return (
            <ContainerBody>
                <Tabs
                    className="sd-tabs"
                    onChange={ this.onTabsChange }
                >
                    {
                        this.panes.map((pane) =>
                            <TabPane key={ pane.key } tab={ pane.title }>{ pane.content }</TabPane>)
                    }
                </Tabs>
            </ContainerBody>
        )
    }
}

class ManagerListRoute extends Component {
    state = {
        tableLoading: true,
        dataSource: [],
        fields: [],
        isCreate: true,
    };
    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
        },
        {
            title: 'ks文件名称',
            dataIndex: 'ksName',
            key: 'ksName',
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'op',
            render: (d) => {
                return [
                    <Button htmlType="button"
                            key="op_1"
                            style={ { height: '26px', marginRight: '3px' } }
                            onClick={ this.getDetailFields(d.automaticKsId) }>查看</Button>,
                    <Button htmlType="button"
                            key="op_2"
                            style={ { height: '26px', marginRight: '3px' } }
                            onClick={ () => this.setState({ isCreate: false }, () => this.props.history.push(prefixRoute + '/fs_file_create', d)) }
                    >编辑</Button>,
                    <Button htmlType="button"
                            key="op_3"
                            style={ { height: '26px' } }
                            onClick={ this.delete(d) }>删除</Button>
                ]
            }
        },
    ];


    componentDidMount() {
        this.getList();
        this.setScrollY();
    }

    // 获取列表数据
    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getAllKs().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
            });
        }).catch(() => {
            this.setState({ tableLoading: false });
        });
    };

    setScrollY = () => {
        const contentEl = document.getElementsByClassName('router-wrapper')[0];
        let scrollY = undefined;
        if (contentEl) {
            const contentPadding = 16;
            const contentTabs = 61;
            const contentTablePagination = 44;
            const contentTableHead = 64; // 当表格内容占两行时的高度, 43: 一行的高度
            const contentFilterForm = 45;
            const containerHeight = contentEl.clientHeight;
            scrollY = containerHeight - contentPadding - contentTabs - contentFilterForm - contentTablePagination - contentTableHead;
        }
        this.setState({ scrollY });
    };

    // 获取某个数据的详情
    getDetailFields = (id) => () => {
        api.getKsById(id).then(res => {
            if (res.data.success !== 'true') {
                Modal.error({ title: '查看详情失败', content: res.data.msg });
                return;
            }
            const d = res.data.data;
            this.setState({
                fields: {
                    ksName: ['KS名称', d.ksName],
                    ksContent: ['KS文件预置内容', d.ksContent],
                    createUser: ['创建人', d.createUser],
                    createTime: ['创建时间', moment(d.createTime).format('YYYY-MM-DD HH:mm:ss')],
                    updateTime: ['更新时间', moment(d.updateTime).format('YYYY-MM-DD HH:mm:ss')],
                    updateUser: ['更新人员', d.updateUser],
                    description: ['描述', d.description],
                }
            });
            this.detailModal.show();
        });
    };

    onSearchChange = () => {
    };

    delete = (record) => () => {

        Modal.confirm({
            title: `您确定要删除"${ record.ksName }"吗？`,
            cancelText: '取消',
            okText: '确定',
            onOk: () => {
                api.removeKs(record.automaticKsId).then(res => {
                    if (res.data.success !== 'true') {
                        Modal.error({ title: '删除失败', content: res.data.msg });
                        return;
                    }
                    this.getList();
                    message.success('删除成功');
                });
            },
        });
    };

    render() {
        const state = this.state;
        return (
            <Fragment>
                <div className="sd-filter-form">
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={ { margin: '0 8px 0 0' } }
                        onClick={ () => this.setState({ isCreate: true }, () => this.props.history.push(prefixRoute + '/fs_file_create')) }
                    >新增文件</Button>
                    <Input.Search
                        onSearch={ this.onSearchChange }
                        placeholder="请输入关键词"
                        style={ { width: '230px', float: 'right' } }/>
                </div>
                <SDTable
                    rowKey="automaticKsId"
                    loading={ state.tableLoading }
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    scroll={ { y: this.state.scrollY } }
                    columnsProportion={ [1, 2, 2, 3, 3] }
                />
                <DetailModal ref={ e => this.detailModal = e }
                             modalTitle="查看详情"
                             fields={ this.state.fields }/>
            </Fragment>
        )
    }
}

const ManagerList = withRouter(ManagerListRoute);