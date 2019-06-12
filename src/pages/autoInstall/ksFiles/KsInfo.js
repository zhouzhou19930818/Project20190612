// 创建装机模板
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, message, Modal, } from 'antd';
import api from 'src/tools/api';
import { prefixRoute } from "src/configs";
import { nameRules } from 'src/tools/utils';

const { Item: FormItem } = Form;

class KsCreateForm extends Component {
    // 执行创建
    createCommit = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const apiUrl = this.props.location.state && this.props.location.state.automaticKsId ? 'updateKs' : 'addKs';
            const msg = this.props.location.state && this.props.location.state.automaticKsId ? '修改' : '创建';
            api[apiUrl]({
                ...values,
                automaticKsId: this.props.location.state ? this.props.location.state.automaticKsId : undefined,
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
        this.props.history.push(prefixRoute + '/fs_file_manage');
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const obj = this.props.location.state || {};
        return (
            <Fragment>
                <div className="sd-title">
                    <span>新增KS文件</span>
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
                    <FormItem label="KS文件名称：">
                        {
                            getFieldDecorator('ksName', {
                                ...nameRules({ required: true, message: '请输入KS文件名称' }),
                                initialValue: obj.ksName || '',
                            })(
                                <Input/>)
                        }
                    </FormItem>

                    <FormItem label="描述：">
                        {
                            getFieldDecorator('description', {
                                initialValue: obj.description || '',
                            })(<Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }/>)
                        }
                    </FormItem>
                    <FormItem label="KS文件预置内容：">
                        {
                            getFieldDecorator('ksContent', {
                                initialValue: obj.ksContent || '',
                            })(<Input.TextArea autosize={ { minRows: 8, maxRows: 20 } }/>)
                        }
                    </FormItem>
                </Form>

                <div style={ { textAlign: 'center', marginTop: '46px' } }>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-minor"
                        style={ { width: '72px', marginRight: '10px' } }
                        onClick={ () => this.createCommit() }
                    >确定</Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-grey"
                        style={ { width: '72px', marginRight: '10px' } }
                        onClick={ () => this.props.form.resetFields() }
                    >重置</Button>
                    <Button
                        htmlType="button"
                        type="primary"
                        className="sd-grey"
                        style={ { width: '72px' } }
                        onClick={ this.goBack }
                    >取消</Button>
                </div>
            </Fragment>
        )
    }
}

export default Form.create()(KsCreateForm);