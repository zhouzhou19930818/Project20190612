// 创建装机模板
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Select, message, Modal } from 'antd';
import api from 'src/tools/api';
import { prefixRoute } from "src/configs";
import { nameRules } from 'src/tools/utils';

const { Item: FormItem } = Form;
const Option = Select.Option;

class TemplateCreateForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mirrorList: [],
            ksList: [],
            modalObj: {
                modelName: '',
                distroId: '',
                ksId: '',
                description: '',
            },
        };

        this.getSelectsList();

        this.tempIds = {
            distroId: undefined,
            ksId: undefined,
        };

        if (props.location.state) {
            this.tempIds = {
                distroId: props.location.state.distroId,
                ksId: props.location.state.ksId,
            };
        }
    }

    // 获取下拉框选项
    getSelectsList = () => {
        api.getAllDistro().then(res => {
            if (!res.data.data || res.data.success !== 'true') {
                message.error('获取镜像列表失败');
                return;
            }
            this.setState({ mirrorList: res.data.data });
        });
        api.getAllKs().then(res => {
            if (!res.data.data || res.data.success !== 'true') {
                message.error('获取KS文件列表失败');
                return;
            }
            this.setState({ ksList: res.data.data });
        });
    };

    onChange = (attr, value) => {
        this.setState({
            modalObj: {
                [attr]: value,
            }
        })
    };

    // 执行创建
    createCommit = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const apiUrl = this.props.location.state && this.props.location.state.automaticModelId ? 'updateModel' : 'addModel';
            const msg = this.props.location.state && this.props.location.state.automaticModelId ? '修改' : '创建';
            if (isNaN(Number(values.distroId))) values.distroId = this.tempIds.distroId;
            if (isNaN(Number(values.ksId))) values.ksId = this.tempIds.ksId;
            api[apiUrl]({
                ...values,
                automaticModelId: this.props.location.state ? this.props.location.state.automaticModelId : undefined,
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
        this.props.history.push(prefixRoute + '/template_manage');
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const state = this.state;
        const obj = this.props.location.state;
        let mirrorName = '', ksName = '';
        if (obj) {
            const mirrorObj = state.mirrorList.find(d => d.automaticDistroId.toString() === obj.distroId.toString());
            const ksObj = state.ksList.find(d => d.automaticKsId.toString() === obj.ksId.toString());
            mirrorName = mirrorObj ? mirrorObj.distroName : '';
            ksName = ksObj ? ksObj.ksName : '';
        }
        return (
            <Fragment>
                <div className="sd-title">
                    <span>创建装机模版</span>
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
                    <FormItem label="模板名称：">
                        {
                            getFieldDecorator('modelName', {
                                ...nameRules({ required: true, message: '请输入模板名称' }),
                                initialValue: obj ? obj.modelName : '',
                            })(<Input/>)
                        }
                    </FormItem>
                    <FormItem label="选择镜像：">
                        {
                            getFieldDecorator('distroId', {
                                rules: [{ required: true, message: '请选择镜像', }],
                                initialValue: mirrorName,
                            })(<Select notFoundContent="暂无数据">{
                                state.mirrorList.map(d => <Option key={ d.automaticDistroId }>{ d.distroName }</Option>)
                            }</Select>)
                        }
                    </FormItem>
                    <FormItem label="选择KS文件名称：">
                        {
                            getFieldDecorator('ksId', {
                                rules: [{ required: true, message: '请选择KS文件', }],
                                initialValue: ksName,
                            })(<Select notFoundContent="暂无数据">{
                                state.ksList.map(d => <Option key={ d.automaticKsId }>{ d.ksName }</Option>)
                            }</Select>)
                        }
                    </FormItem>
                    <FormItem label="描述：">
                        {
                            getFieldDecorator('description', {
                                initialValue: obj ? obj.description : '',
                            })(<Input.TextArea autosize={ { minRows: 2, maxRows: 5 } }/>)
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

export default Form.create()(TemplateCreateForm);