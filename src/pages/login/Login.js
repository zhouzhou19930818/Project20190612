import React from 'react';
import { Form, Icon, Button, Input } from 'antd';
import api from 'src/tools/api';
import { hex_sha1 } from 'src/tools/sha1';
import { prefixRoute } from "src/configs";
import './login.scss';

const FormItem = Form.Item;

class Login extends React.Component {
    constructor(props) {
        super(props);
        localStorage.clear();
    }

    state = {
        loading: false,
        codeImg: '',
        msg: '',
    };
    codeIdentity = '';

    componentDidMount() {
        api.getCheckCode().then(res => {
            if (res.data.success !== 'true') {
                return;
            }
            this.codeIdentity = res.data.data.codeIdentity;
            this.setState({ codeImg: 'data:image/png;base64,' + res.data.data.checkCodeImg });
        });
    }

    login = () => {
        this.setState({ loading: true });
        this.props.form.validateFields((err, values) => {
            if (err) {
                this.setState({ loading: false });
                return;
            }
            const params = {
                codeIdentity: this.codeIdentity,
                checkCode: values.checkCode,
                password: hex_sha1(values.password),
                username: values.username,
            };
            api.logon(params).then(res => {
                const json = res.data;
                if (json.success !== 'true') {
                    this.setState({
                        msg: json.msg,
                        loading: false,
                    });
                    return;
                }
                this.setState({ loading: false });
                localStorage.setItem('userId', json.data.userId);
                localStorage.setItem('roleId', json.data.roleId);
                localStorage.setItem('userName', json.data.userName);
                localStorage.setItem('roleName', json.data.roleName);
                localStorage.setItem('token', json.data.token);

                this.props.history.push(`${ prefixRoute }/`)

            });
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const state = this.state;
        return (
            <div className="login">
                <div className="img-container">
                    <img alt="pic" src={ require('src/assets/images/login_company.png') } className="company"/>
                    <img alt="pic" src={ require('src/assets/images/login_logo.png') } className="logo"/>
                </div>
                <div className="form_container">
                    <Form className="form">
                        <div className="title">
                            <span>用户登录</span>
                            <span>User  Login</span>
                        </div>
                        <FormItem>
                            {
                                getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入用户名' }]
                                })(<Input placeholder="请输入用户名"
                                          suffix={ <Icon type="user"/> }/>)
                            }
                        </FormItem>
                        <FormItem>
                            {
                                getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入密码' }]
                                })(<Input.Password
                                    placeholder="请输入密码"
                                    suffix={ <Icon type="lock"/> }/>)
                            }
                        </FormItem>
                        <FormItem>
                            {
                                getFieldDecorator('checkCode', {
                                    rules: [{ required: true, message: '请输入验证码' }]
                                })(<Input placeholder="请输入验证码" suffix={ <img alt="验证码" src={ state.codeImg }/> }/>)
                            }
                        </FormItem>
                        <div className={ `msg ${ state.msg ? 'show' : '' }` }>
                            <p>{ state.msg ? `* ${ state.msg }` : '' }</p>
                        </div>
                        <FormItem>
                            <Button htmlType="submit"
                                    type="primary"
                                    className="sd-main"
                                    style={ {
                                        width: '100%',
                                        background: 'linear-gradient(90deg, #2F87EC, #0E6EDF)',
                                        color: '#FEFEFE'
                                    } }
                                    loading={ state.loading }
                                    onClick={ this.login }>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(Login);
