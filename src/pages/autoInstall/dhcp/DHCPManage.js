// 装机模板
import React, { Component, Fragment } from 'react';
import { Tabs, Button, Input, message, Modal, Form, Icon } from 'antd';
import moment from 'moment';
import { ContainerBody } from "src/components/LittleComponents";
import SDTable from 'src/components/SDTable';
import api from 'src/tools/api';

const TabPane = Tabs.TabPane;
const { Item: FormItem } = Form;

export default class DHCPManage extends Component {

    panes = [
        {
            key: 'tab1',
            title: 'DHCP历史修改列表',
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

class ManagerList extends Component {

    state = {
        selectedRowKeys: [], // Check here to configure the default column
        tableLoading: true,
        dataSource: [],
    };
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
            render: () => {
                return <Button htmlType="button" style={ { height: '26px' } }>删除</Button>
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
            this.setState({
                tableLoading: false,
            });
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

    onSearchChange = () => {
    };

    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
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
                        onClick={ () => this.createModal.show() }
                    >创建模板</Button>
                    <Button htmlType="button" type="primary" className="sd-warning" style={ { marginRight: '26px' } }>
                        <Icon type="delete"/>删除
                    </Button>
                    <Input.Search
                        onSearch={ this.onSearchChange }
                        placeholder="请输入模板名称、描述"
                        style={ { width: '230px', float: 'right' } }/>
                </div>
                <SDTable
                    rowKey="automaticDhcpModifyRecordId"
                    loading={ this.state.tableLoading }
                    columns={ this.columns }
                    dataSource={ this.state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    scroll={ { y: this.state.scrollY } }
                    columnsProportion={ [1, 2, 2, 3, 3] }
                />
                <CreateModal ref={ (e) => this.createModal = e }/>
            </Fragment>
        )
    }
}

class CreateModal extends Component {
    state = {
        fileList: [],
        visible: false,
    };

    show = () => {
        this.setState({ visible: true })
    };

    render() {
        return (
            <Modal visible={ this.state.visible }
                   title="新增DHCP"
                   footer={ null }
                   onCancel={ () => this.setState({ visible: false }) }
            >
                <Form layout="vertical" style={ {
                    // margin: '0 auto',
                    // marginTop: '40px',
                    padding: '0 80px',
                } }>
                    <FormItem label="模板名称：">
                        <Input/>
                    </FormItem>

                    <FormItem label="描述：">
                        <Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }/>
                    </FormItem>
                    <FormItem label="模板：">
                        <Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }/>
                    </FormItem>
                    <FormItem style={ { textAlign: 'center', marginTop: '46px' } }>
                        <button
                            key="cancel"
                            className="sd-anchor-button"
                            style={ { color: '#666666', marginRight: '10px' } }
                        >取消
                        </button>
                        <Button
                            key="reset"
                            type="primary"
                            className="sd-grey"
                            style={ { width: '72px', marginRight: '10px' } }
                        >重置</Button>
                        <Button
                            key="ok"
                            type="primary"
                            style={ { width: '72px' } }
                        >确认</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}