// 创建装机任务
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import './installTaskCreate.scss';

const { Item: FormItem } = Form;


export default class TaskInfoPicker extends Component {
    static contextTypes = {
        task: PropTypes.object,
    };
    state = {
        nameStatus: '',
    };

    nameValidMsg = ['请输入任务名称', '数字、字母、-、_，不超过200字'];

    changeProps = (attr, value) => {
        if (attr === 'installTaskName') {
            this.setState({ nameStatus: '' });
            if (!/(^[\w-]+$)/.test(value)) {
                this.setState({ nameStatus: '1' });
            }
        }

        this.props.changeState({
            task: {
                [attr]: { $set: value }
            }
        });
    };

    next = () => {
        if (!this.context.task.installTaskName) {
            this.setState({ nameStatus: '0' });
            return false;
        }
        return true;
    };

    render() {
        const task = this.context.task;
        const nameStatus = this.state.nameStatus;
        return (
            <Form layout="vertical" style={ {
                width: '70%',
                maxWidth: '900px',
                padding: '30px 20%',
            } }>
                <FormItem label="任务名称："
                          validateStatus={ nameStatus ? 'error' : '' }
                          hasFeedback={ true }
                          help={ this.nameValidMsg[nameStatus] }
                >
                    <span className="sd-required">
                        <Input value={ task.installTaskName }
                               onChange={ (e) => this.changeProps('installTaskName', e.target.value) }/>
                    </span>
                    { nameStatus === '' ? (<p>{ this.nameValidMsg[1] }</p>) : null }
                </FormItem>
                <FormItem label="描述：">
                    <Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }
                                    value={ task.description }
                                    onChange={ (e) => this.changeProps('description', e.target.value) }/>
                </FormItem>
            </Form>
        )
    }
}
