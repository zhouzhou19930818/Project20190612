import React from 'react';
import { Tabs, Badge, Input, Table } from 'antd';
import { ContainerBody } from 'src/components/LittleComponents';

const TabPane = Tabs.TabPane;

export default class HistoryManage extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: '序号',
                dataIndex: 'no',
                key: 'no',
            }, {
                title: 'IP',
                dataIndex: 'ip',
                key: 'ip',
            }, {
                title: '路径',
                dataIndex: 'path',
                key: 'path',
            },];

        this.state = {
            dataSource: [],
            panes: [
                {
                    key: 'tab1',
                    name: '太和',
                },
                {
                    key: 'tab2',
                    name: '萝岗',
                }]
        };
    }

    getTabContent = () => {
        return <React.Fragment>
            <Input.Search
                onSearch={ this.onSearchChange }
                placeholder="模糊查询"
                style={ { width: '287px', margin: '15px 0 12px' } }/>
            <Table
                className="sd-table-simple"
                columns={ this.columns }
                dataSource={ this.state.dataSource }
                onHeaderCell={ () => ({ background: '#ff0' }) }
            />;
        </React.Fragment>
    };

    onTabsChange = () => {
    };

    onSearchChange = () => {
    };

    render() {
        return (
            <ContainerBody>
                <Tabs
                    onChange={ this.onTabsChange }
                    onEdit={ this.onEdit }
                >
                    {
                        this.state.panes.map(pane =>
                            <TabPane
                                className="line"
                                key={ pane.key }
                                tab={
                                    <Badge
                                        className="tabs-title-badge"
                                        count={ 99 }
                                        overflowCount={ 99 }
                                        offset={ [15, -5] }
                                    >{ pane.name }</Badge>
                                }
                            >{ this.getTabContent() }</TabPane>)
                    }
                </Tabs>
                <div>

                </div>
            </ContainerBody>
        )
    }
}