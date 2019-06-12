// 创建装机任务
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, message, Modal } from 'antd';
import SDTable from 'src/components/SDTable';
import api from 'src/tools/api';

import './installTaskCreate.scss';

export default class TaskModelPicker extends Component {
    static contextTypes = {
        task: PropTypes.object,
    };

    state = {
        selectedRowKeys: [], // Check here to configure the default column
        tableLoading: true,
        dataSource: [],
    };
    columns = [
        {
            title: '模板名称',
            dataIndex: 'modelName',
            key: 'modelName',
            width: 100,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            width: 100,
        },
        {
            title: '操作',
            key: 'op',
            width: 100,
            render: () => {
                return <button className="sd-anchor-button">查看</button>
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
                dataSource: res.data.data,
                selectedRowKeys: this.context.task.modelId ? [Number(this.context.task.modelId)] : [],
            });
        }).catch(() => {
            this.setState({ tableLoading: false });
        });
    };

    setScrollY = () => {
        const stepContentPadding = 20;
        const stepContentFilterForm = 46;
        const stepContentTablePagination = 44;
        const stepContentTableHead = 40;
        const stepsContentEl = document.getElementsByClassName('steps-content')[0];
        let scrollY = undefined;
        if (stepsContentEl) {
            const containerHeight = stepsContentEl.clientHeight;
            scrollY = containerHeight - stepContentPadding - stepContentFilterForm - stepContentTablePagination - stepContentTableHead;
        }
        this.setState({ scrollY });
    };

    onSearchChange = () => {
    };

    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys }, () => {
            this.props.changeState({
                task: {
                    modelId: { $set: selectedRowKeys[0] }
                }
            })
        });
    };

    next = () => {
        if (!this.context.task.modelId) {
            Modal.warn({ title: '请选择一个模板' });
            return false;
        }
        return true;
    };

    render() {
        const state = this.state;
        return (
            <div style={ {
                width: '80%',
                maxWidth: '1000px',
                padding: '0 0 10px 0',
            } }>
                <div className="sd-title sub-title" style={ { width: '100%' } }>
                    <span>模版选择</span>
                    <Input.Search
                        onSearch={ this.onSearchChange }
                        placeholder="请输入模板名称、描述"
                        style={ { float: 'right', margin: '8px 30px', width: '230px' } }
                    />
                </div>
                <SDTable
                    id="importSource"
                    rowKey="automaticModelId"
                    style={ { padding: '5px 30px 0 30px' } }
                    className="sd-table-simple"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    rowSelection={ {
                        type: "radio",
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    scroll={ { y: state.scrollY } }
                    bordered={ true }
                    loading={ state.tableLoading }
                    onRow={ (record) => ({ onClick: () => this.onRowSelect([record.automaticModelId]) }) }
                />
            </div>
        )
    }
}
