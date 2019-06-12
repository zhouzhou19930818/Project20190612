import React from 'react';
import { Select, Tabs, message } from 'antd';
import Program from 'src/pages/yarn/program/Program';
import Queue from 'src/pages/yarn/queue/Queue';
import { ContainerBody } from "src/components/LittleComponents";
import Context from './Context';
import api from "src/tools/api";

import './yarn.scss';

const TabPane = Tabs.TabPane;
const { Option } = Select;

export default class YarnAnalysis extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterValue: '',
            clusterRequestError: false,
        };

        this.clusterOptions = []; // 集群下拉框选项

        this.panes = [
            {
                key: 'tab1',
                title: '程序',
                content: <Program/>,
            }, {
                key: 'tab2',
                title: '队列',
                content: <Queue/>,
            }, {
                key: 'tab3',
                title: '租户',
                content: <Program/>,
            }, {
                key: 'tab4',
                title: '应用',
                content: <Program/>,
            },
        ];
    }

    componentDidMount() {
        this.getThunkOptions();
    }

    // 获取集群列表
    getThunkOptions = () => {
        api.getClusterBasicInfo().then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                this.setState({ clusterRequestError: true });
                return;
            }
            this.clusterOptions = res.data.data;
            this.setState({
                clusterValue: res.data.data[0].clusterName,
                clusterRequestError: false,
            });
        }).catch((e) => {
            message.destroy();
            message.error('获取集群列表失败');
        });
    };

    // 集群选项修改事件
    onThunkChange = (value) => {
        this.setState({
            clusterValue: value,
        });
    };

    render() {
        const state = this.state;
        return (
            <Context.Provider
                value={ { clusterValue: state.clusterValue, clusterRequestError: state.clusterRequestError } }
            >
                <ContainerBody>
                    <Tabs
                        className="sd-tabs"
                        onChange={ this.onTabsChange }
                        tabBarExtraContent={
                            <Select
                                style={ {
                                    width: '153px',
                                    marginRight: '10px',
                                    verticalAlign: 'middle',
                                } }
                                notFoundContent="暂无数据"
                                value={ state.clusterValue }
                                onChange={ this.onThunkChange }
                            >
                                {
                                    this.clusterOptions.map((d, i) =>
                                        <Option key={ 'cluster_' + i } value={ d.clusterName }>
                                            { d.clusterName }
                                        </Option>
                                    )
                                }
                            </Select>
                        }
                    >
                        {
                            this.panes.map(pane =>
                                <TabPane key={ pane.key } tab={ pane.title }>{ pane.content }</TabPane>)
                        }
                    </Tabs>
                </ContainerBody>
            </Context.Provider>
        )
    }
}