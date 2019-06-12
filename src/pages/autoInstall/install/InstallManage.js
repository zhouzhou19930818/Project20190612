import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { bindActionCreators } from "redux";
import { Tabs, Steps, Divider } from 'antd';
import { ContainerBody } from "src/components/LittleComponents";
// import { actions } from 'src/redux/modules/installManager';
import TaskList from './TaskList';
// import DiskUnload from 'src/pages/diskTrouble/List/DiskUnload';
// import DiskChange from 'src/pages/diskTrouble/List/DiskChange';
// import DiskLoad from 'src/pages/diskTrouble/List/DiskLoad';
// import DiskReBalance from 'src/pages/diskTrouble/List/DiskReBalance';
// import DiskFinish from 'src/pages/diskTrouble/List/DiskFinish';
import { reduxMapper } from 'src/redux/modules/diskTrouble';
import 'src/pages/diskTrouble/List/diskDroubleList.scss';
import { computedStyle, getStyleNumber } from "src/tools/utils";
import api from "src/tools/api";
import update from 'immutability-helper';


const TabPane = Tabs.TabPane;
const { Step } = Steps;

class InstallManage extends Component {

    panes = [
        {
            key: 'tab1',
            title: '未完成任务',
            content: <TaskList />,
        },
    ];
    wsConnectTimes = 0;
    steps = [
        {
            key: 'tab1',
            title: "安全系统",
            content: ' <DiskUnload />',
        },
        {
            key: 'tab2',
            title: "设置IP",
            content: '<DiskChange />',
        },
        {
            key: 'tab3',
            title: "平台接入",
            content: '<DiskLoad />',
        },
        {
            key: 'tab4',
            title: "安全加固",
            content: '<DiskReBalance />',
        },
        {
            key: 'tab5',
            title: "大数据初始化",
            content: '<DiskFinish />',
        },
        {
            key: 'tab6',
            title: "集群配置",
            content: '<DiskFinish />',
        },{
            key: 'tab7',
            title: "滚动重启",
            content: '<DiskFinish />',
        },{
            key: 'tab8',
            title: "验证确认",
            content: '<DiskFinish />',
        },
    ];

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

    render() {
        const current = this.props.stepCurrent;
        const customDot = (dot, { status, index }) => (
            <span className={'dot-img-' + index}></span>
        );
        return (
            <ContainerBody style={{ height: '100%', position: 'relative' }}>
                <div className="drag-container">
                    <Tabs
                        activeKey="tab1"
                        className="sd-tabs"
                        onEdit={this.onEdit}
                    >
                        {
                            this.panes.map((pane) =>
                                <TabPane key={pane.key} tab={pane.title}>
                                    {pane.content}
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
        )
    }
}


export default reduxMapper(InstallManage);