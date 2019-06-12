import React, { Component } from 'react';
import { Tabs, message, Input, Steps, Divider } from 'antd';
import update from 'immutability-helper';
import { reduxMapper } from 'src/redux/modules/diskTrouble';
import { ContainerBody } from 'src/components/LittleComponents';
import UntreatedDisk from './UntreatedDisk';
import UntreatedTask from './UntreatedTask';
import DiskUnload from './DiskUnload';
import DiskChange from './DiskChange';
import DiskLoad from './DiskLoad';
import DiskReBalance from './DiskReBalance';
import DiskFinish from './DiskFinish';
import api from "src/tools/api";
import { computedStyle, debounce, getStyleNumber } from "src/tools/utils";
import Context from './Context';
import './diskDroubleList.scss';


const TabPane = Tabs.TabPane;
const { Step } = Steps;

class ListManage extends Component {
    state = {
        leftActiveKey: '',
        searchValue: '',
        taskName: '',
    };
    wsConnectTimes = 0;

    //获取任务名称
    getTaskName = (name) => {
        console.log(name)
        this.setState({
            taskName: name
        }, (name) => {
            this.setState({
                taskName: name
            })
            console.log(this.state.taskName)
        });

    }
    topPanes = [
        {
            key: 'tab1',
            title: '待处理磁盘 ',
            content: <UntreatedDisk />,
        },
        {
            key: 'tab2',
            title: '未完成任务 ',
            content: <UntreatedTask getTaskName={this.getTaskName} />,
        },
    ];

    steps = [
        {
            key: 'tab1',
            title: "卸载",
            content: <DiskUnload list={this.state.unInstallList} parmsTaskName={this.state.taskName} />,
        },
        {
            key: 'tab2',
            title: "换盘",
            content: <DiskChange parmsTaskName={this.state.taskName} />,
        },
        {
            key: 'tab3',
            title: "加载",
            content: <DiskLoad parmsTaskName={this.state.taskName} />,
        },
        {
            key: 'tab4',
            title: "重平衡",
            content: <DiskReBalance parmsTaskName={this.state.taskName} />,
        },
        {
            key: 'tab5',
            title: "完成",
            content: <DiskFinish parmsTaskName={this.state.taskName} />,
        },
    ];

    componentDidMount() {
        this.mouseEvent();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const dragContent = document.getElementById('dragContent');
        if (nextProps.isExpendContent && nextProps.isExpendContent !== this.props.isExpendContent) {
            if (!dragContent) return;
            dragContent.style.top = '200px';
            dragContent.style.transition = 'top 0.5s';
            this.wsTimeout = setTimeout(() => {
                dragContent.style.transition = null;
            }, 1000);
        }

        if (nextProps.taskId && nextProps.taskId !== this.props.taskId) {
            this.connectWebsocket(() => {
                this.websocket.send(JSON.stringify({ taskId: nextProps.taskId }));
            });
            this.getTaskStatusMsg(nextProps.taskId);
        }
    }

    componentWillUnmount() {
        this.websocket && this.websocket.close();
    }

    //步骤点击事件
    onChange = current => {
        this.props.changeStepCurrent(current);
    };

    //下一步
    stepNextCurrent(stepNextCurrent) {
        this.props.changeStepCurrent(this.props.stepCurrent + 1);
    }

    //上一步
    stepPrevCurrent(stepPrevCurrent) {
        this.props.changeStepCurrent(this.props.stepCurrent - 1);
    }

    // 拖动
    mouseEvent = () => {
        const parent = document.getElementById('dragContent');
        const header = document.getElementById('dragHeader');

        //判断鼠标是否按下
        let isDown = false;
        //实时监听鼠标位置
        let currentY = 0;
        //记录鼠标按下瞬间的位置
        let originY = 0;
        //鼠标按下时移动的偏移量
        let offsetY = 0;

        const moving = (e) => {
            e = e ? e : window.event;
            e.cancelBubble = true;
            e.stopPropagation();
            if (isDown) {
                currentY = e.clientY;
                offsetY = currentY - originY;   //计算鼠标移动偏移量
                const elY = getStyleNumber(computedStyle(parent).top);
                const resY = elY + offsetY;
                parent.style.top = resY + 'px';
                originY = currentY;
            }
        };
        const start = (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            isDown = true;
            originY = e.clientY;
        };
        const end = (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            if (isDown) {
                isDown = false;
                offsetY = 0;
                this.props.changeIsExpendContent(false);
            }
        };
        // 鼠标按下方块
        header.addEventListener("touchstart", start);
        header.addEventListener("mousedown", start);
        // 拖动
        window.addEventListener("touchmove", moving);
        window.addEventListener("mousemove", moving);
        // 鼠标松开
        window.addEventListener("touchend", end);
        window.addEventListener("mouseup", end);
    };


    connectWebsocket = (callback) => {
        if (!this.websocket) {
            if (this.wsConnectTimes > 10) return;
            this.wsConnectTimes = this.wsConnectTimes + 1;
            this.websocket = new WebSocket(api.wsUrl, `WS-DATAE-TOKEN.${localStorage.getItem('token')}`);
        }
        this.websocket.onopen = () => {
            callback();
            setInterval(() => this.websocket.send('HeartBeat'), 5000);
        };
        this.websocket.onmessage = (evt) => {
            try {
                const res = JSON.parse(evt.data);
                if (res.wsMsgType) {
                    const newMsg = update(this.props.websocketMsg, { $set: res.data });
                    this.props.setWebsocketMsg(newMsg);
                }
            } catch (e) {
                console.log(e);
            }

        };
        this.websocket.onclose = (evt) => {
            clearInterval(this.wsTimeout);
            this.websocket = null;
            this.connectWebsocket(() => {
                this.websocket.send(JSON.stringify({ taskId: this.props.taskId }));
            });
        };
        this.websocket.onerror = (evt) => {
            clearInterval(this.wsTimeout);
            this.websocket = null;
            this.connectWebsocket(() => {
                this.websocket.send(JSON.stringify({ taskId: this.props.taskId }));
            });
        };
        if (this.websocket.readyState === 1) {
            callback();
        }
    };


    getTaskStatusMsg = (taskId) => {
        api.getTaskStatusMsg({ taskId: taskId }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            const data = res.data.data;
            this.props.changeStepCurrent(data.nowLatestProcess - 1);
            this.props.changeStepStatus([
                data.unloadStatusMsg,
                data.changeStatusMsg,
                data.loadStatusMsg,
                data.rebalanceStatusMsg,
                data.finishStatusMsg,
            ]);
        })
    };
    render() {
        const props = this.props;
        const current = props.stepCurrent;
        const customDot = (dot, { status, index }) => (
            <span className={'dot-img-' + index}></span>
        );
        return (
            <Context.Provider value={{ searchValue: this.state.searchValue }}>
                <ContainerBody style={{ height: '100%', position: 'relative' }}>
                    <div className="drag-container">
                        <Tabs
                            className="sd-tabs"
                            activeKey={props.activeTopTab}
                            onChange={this.props['changeTopTab']}
                            tabBarExtraContent={<Input.Search
                                placeholder="请输入关键字"
                                style={{ float: 'right', marginTop: '5px', width: '230px', marginRight: '12px' }}
                                onChange={e => debounce(() => () => this.setState({ searchValue: e.target.value }))}
                            />}
                        >
                            {
                                this.topPanes.map((pane) =>
                                    <TabPane key={pane.key}
                                        tab={pane.title}
                                    >
                                        {props.activeTopTab === pane.key ? pane.content : null}
                                    </TabPane>)
                            }
                        </Tabs>
                        <div className="drag-content" id="dragContent">
                            <div className="drag-header" id="dragHeader">
                            </div>
                            <div>
                                <Steps current={current} progressDot={customDot} onChange={this.onChange}>
                                    {this.steps.map((item, index) => <Step title={item.title} key={"step" + index} />)}
                                </Steps>
                                <div className="steps-content">{this.steps[current].content}</div>
                                <Divider />
                            </div>
                        </div>
                    </div>
                </ContainerBody>
            </Context.Provider>
        )
    }
}
export default reduxMapper(ListManage);

