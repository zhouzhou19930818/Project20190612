// 创建装机模板
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, message, Modal, Icon, } from 'antd';
import update from 'immutability-helper';
import api from 'src/tools/api';
import { prefixRoute } from "src/configs";

const { Item: FormItem } = Form;

class MirrorCreateForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fileList: [],
            hostList: [],
        };

        this.iconStatusMap = {
            uploading: <Icon type="loading" style={ { color: '#0E6EDF' } }/>,
            done: <Icon type="check-circle" style={ { color: '#0ABC51' } }/>,
            error: <Icon type="close-circle" style={ { color: '#FF4750' } }/>,
        };

        this.getSelectsList();
    }

    // 获取下拉框选项
    getSelectsList = () => {
        api.getAllHost().then(res => {
            if (!res.data.data || res.data.success !== 'true') {
                message.error('获取主机列表失败');
                return;
            }
            this.setState({ hostList: res.data.data });
        });
    };

    deleteFile = (i) => {
        this.setState(update(this.state, {
            fileList: { $splice: [[i, 1]] }
        }));
    };

    // 执行创建
    createCommit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            const apiUrl = this.props.location.state && this.props.location.state.automaticDistroId ? 'updateDistro' : 'addDistro';
            const msg = this.props.location.state && this.props.location.state.automaticDistroId ? '修改' : '创建';
            api[apiUrl]({
                ...values,
                automaticDistroId: this.props.location.state ? this.props.location.state.automaticDistroId : undefined,
            }).then(res => {
                if (res.data.success !== 'true') {
                    Modal.error({ title: msg + '失败', content: res.data.msg });
                    return;
                }
                message.success(msg + '成功');
                this.goBack();
            })
        });
    };

    goBack = () => {
        this.props.history.push(prefixRoute + '/mirror_manage');
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const obj = this.props.location.state || {};
        return (
            <Fragment>
                <div className="sd-title">
                    <span>编辑镜像</span>
                    <Button htmlType="button"
                            type="primary"
                            className="sd-grey"
                            style={ { float: 'right', margin: '8px 18px' } }
                            onClick={ this.goBack }
                    >取消</Button>
                </div>

                <Form layout="vertical"
                      className="sd-from"
                      style={ {
                          width: '70%',
                          background: '#ffffff',
                          margin: '0 auto',
                          marginTop: '40px',
                          padding: '20px 20%',
                          boxShadow: '0px 1px 5px 0px rgba(187,194,205,0.3)',
                      } }>
                    <FormItem label="描述：">
                        {
                            getFieldDecorator('description', { initialValue: obj.description || '', })(
                                <Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }/>)
                        }

                    </FormItem>

                </Form>

                <div style={ { textAlign: 'center', marginTop: '46px' } }>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-grey"
                        style={ { width: '72px', marginRight: '10px' } }
                        onClick={ this.goBack }
                    >取消</Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={ { width: '72px' } }
                        onClick={ this.createCommit }
                    >确定</Button>
                </div>
            </Fragment>
        )
    }
}

export default Form.create()(MirrorCreateForm);