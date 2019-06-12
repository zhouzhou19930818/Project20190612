// 创建装机任务
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Steps, message } from 'antd';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { prefixRoute } from "src/configs";
import api from 'src/tools/api';
import { isFunction } from 'src/tools/utils';
import { actions } from 'src/redux/modules/installManager';
import TaskInfoPicker from './TaskInfoPicker';
import TaskHostPicker from './TaskHostPicker';
import TaskModelPicker from './TaskModelPicker';

import './installTaskCreate.scss';

const Step = Steps.Step;

class TaskInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            task: {
                installTaskName: '', // 任务名称
                description: '', //描述
                hostIds: props.location.state || '', //主机ids
                modelId: '', // 模板id
            },
        };
    }

    static childContextTypes = {
        task: PropTypes.object,
        changeState: PropTypes.func,
    };

    getChildContext() {
        return {
            task: this.state.task,
            changeState: this.changeState,
        }
    }

    stepController = async (type) => {
        const current = this.state.current;
        if (type === 'last') {
            if (current === 0) {
                this.props.history.push(prefixRoute + '/auto_install_manage');
                return;
            }
            this.setState({
                current: this.state.current - 1,
            });
        } else {
            const compMap = ['taskInfo', 'hostPick', 'modelPick'];
            if (!this[compMap[current]].next()) return;
            if (current === this.allSteps.length - 1) {
                // 触发 完成创建
                if (await this.createCommit()) {
                    this.props.changeActiveTab('tab3');
                    this.props.history.push(prefixRoute + '/auto_install_manage');
                    message.success('创建成功');
                }
                return;
            }
            this.setState({
                current: this.state.current + 1,
            });
        }
    };

    // 创建装机
    createCommit = async () => {
        return await api.createInstallTask(this.state.task).then(res => {
            if (res.data.success !== 'true') {
                Modal.error({ title: '创建失败', content: res.data.msg });
                return false;
            }
            return true;
        }).catch(() => {
            Modal.error({ title: '创建失败' });
            return false;
        });
    };

    changeState = (value, cb1, cb2) => {
        this.setState(update(this.state, value), () => {
            if (isFunction(cb1)) {
                this[cb1] && this[cb1]();
            } else if (cb1 && cb2) {
                this[cb1] && this[cb1][cb2] && this[cb1][cb2]();
            }
        });
    };

    customDot = (dot, { status, index }) => {
        return <span>{ status === 'finish' ? '√' : `0${ index + 1 }` }</span>;
    };

    allSteps = [
        {
            title: '填写任务信息',
            component: (
                <TaskInfoPicker ref={ e => this.taskInfo = e } changeState={ this.changeState }/>)
        },
        {
            title: '导入资源',
            component: (
                <TaskHostPicker ref={ e => this.hostPick = e } changeState={ this.changeState }/>)
        },
        {
            title: '设置装机',
            component: (
                <TaskModelPicker ref={ e => this.modelPick = e } changeState={ this.changeState }/>)
        },
    ];

    onChange = current => {
        // console.log('onChange:', current);
        this.setState({ current });
      };
    

    render() {
        const { current } = this.state;
        const stepsLen = this.allSteps.length;
        return (
            <Fragment>
                <div className="sd-title">
                    <span>创建装机任务</span>
                    <Button htmlType="button"
                            type="primary"
                            className="sd-grey"
                            style={ { float: 'right', margin: '8px 18px' } }
                    >取消</Button>
                </div>

                <Steps progressDot={ this.customDot } current={ current }
                        onChange={this.onChange}
                       style={ { width: '50%', margin: '40px auto 20px' } }>
                    { this.allSteps.map((step, i) => <Step key={ 'step_' + i } title={ step.title }/>) }
                </Steps>

                <div className="steps-content">
                    { this.allSteps[current].component }
                </div>

                <div style={ { textAlign: 'center', margin: '36px 0 10px' } }>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-grey"
                        style={ { width: '72px', marginRight: '10px' } }
                        onClick={ () => this.stepController('last') }
                    >{ current === 0 ? '取消' : '上一步' }</Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={ { width: '72px' } }
                        onClick={ () => this.stepController('next') }
                    >{ current === stepsLen - 1 ? '装机' : '下一步' }</Button>
                </div>
            </Fragment>
        )
    }
}

// 创建成功后跳到'tab3'
const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(actions, dispatch)
});

export default connect(null, mapDispatchToProps)(TaskInfo)
