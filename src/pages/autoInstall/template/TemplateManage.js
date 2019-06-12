// 装机模板
import React, { Component, Fragment } from 'react';
import { Tabs, Button, Input, message, Icon, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import api from 'src/tools/api';
import { ContainerBody } from "src/components/LittleComponents";
import { debounce } from "src/tools/utils";
import { prefixRoute } from "src/configs";
import SDTable from "src/components/SDTable";
import DetailModal from "src/components/DetailModal";

const TabPane = Tabs.TabPane;

export default class TemplateManage extends Component {

    panes = [
        {
            key: 'tab1',
            title: '装机模版',
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
                    onEdit={ this.onEdit }
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
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [], // Check here to configure the default column
            tableLoading: true,
            dataSource: [],
            scrollY: undefined,
            // disabled:false,
        };
    }

    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
        },
        {
            title: '模板名称',
            dataIndex: 'modelName',
            key: 'modelName',
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
                            onClick={ this.getDetailFields(d) }
                    >
                        查看
                    </Button>,
                    <Button htmlType="button"
                            key="op_2"
                            disabled={ d.inUse }
                            style={ { height: '26px', marginRight: '3px' } }
                            onClick={ () => this.props.history.push(prefixRoute + '/install_template_create', d) }
                    >
                        编辑
                    </Button>,
                    <Button htmlType="button"
                            key="op_3"
                            style={ { height: '26px' } }
                            onClick={ this.delete(d) }
                            disabled={ d.inUse }
                    >
                        删除
                    </Button>
                ]
            }
        },
    ];

    componentDidMount() {
        this.getList();
        this.setScrollY();
    }

    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getAllModel().then(res => {
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

    onSearchChange = (e) => {
        this.setState({ tableLoading: true });
        const fn = (value) => () => {
            api.getModelByNameOrDesc(value).then((res) => {
                this.setState({
                    dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
                    tableLoading: false,
                })
            })
        };
        debounce(fn(e.target.value));
    };

    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    delete = (record) => () => {
        let ids = '', usingName = [];
        if (record && record.automaticModelId) {
            ids = record.automaticModelId;
            record.inUse && usingName.push(record.modelName);
        } else {
            const len = this.state.selectedRowKeys.length;
            if (len < 1) {
                message.error('请选择至少一个模板');
                return;
            }
            for (let i = 0; i < len; i++) {
                const obj = this.state.dataSource.find(d => d.automaticModelId === this.state.selectedRowKeys[i]);
                if (obj.inUse) {
                    usingName.push(obj.modelName);
                }
            }
            ids = this.state.selectedRowKeys.join(',');
        }
        Modal.confirm({
            title: usingName.length > 0 ? `${ usingName.join(',') }正在使用中，确认删除装机模板？` : '确认删除装机模板？',
            cancelText: '取消',
            okText: '确定',
            onOk: () => {
                api[record && record.automaticModelId ? 'removeModel' : 'batchRemoveModel'](ids).then(res => {
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

    // 获取某个数据的详情
    getDetailFields = (d) => async () => {

        const mirrorName = await api.getDistroById(d.distroId).then(res => {
            if (res.data.success !== 'true') return '';
            return res.data.data ? res.data.data.distroName : '';
        }).catch(() => '');

        const ksName = await api.getKsById(d.ksId).then(res => {
            if (res.data.success !== 'true') return '';
            return res.data.data ? res.data.data.ksName || '' : '';
        }).catch(() => '');

        this.setState({
            fields: {
                modelName: ['模板名称', d.modelName],
                description: ['描述', d.description],
                mirrorName: ['镜像', mirrorName],
                ksName: ['KS文件', ksName],
            }
        });
        this.detailModal.show();
    };

    render() {
        return (
            <Fragment>
                <div className="sd-filter-form">
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={ { margin: '0 8px 0 0' } }
                        onClick={ () => this.props.history.push(prefixRoute + '/install_template_create') }
                    >创建模板</Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-warning"
                        style={ { marginRight: '26px' } }
                        onClick={ this.delete() }
                    >
                        <Icon type="delete"/>删除
                    </Button>
                    <Input.Search
                        onChange={ this.onSearchChange }
                        placeholder="请输入模板名称、描述"
                        style={ { width: '230px', float: 'right' } }/>
                </div>
                <SDTable
                    rowKey="automaticModelId"
                    loading={ this.state.tableLoading }
                    columns={ this.columns }
                    dataSource={ this.state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    scroll={ { y: this.state.scrollY } }
                    columnsProportion={ [1, 2, 2, 3, 3,] }
                />
                <DetailModal ref={ e => this.detailModal = e }
                             modalTitle="查看详情"
                             col={ { span: 12, offset: 6 } }
                             fields={ this.state.fields }/>
            </Fragment>
        )
    }
}

const ManagerList = withRouter(ManagerListRoute);
