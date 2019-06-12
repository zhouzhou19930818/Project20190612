import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Layout, Button, Icon, Menu, Popover } from 'antd';
import { NestRouter } from "src/router";

import Crumb from "src/components/Crumb";
import { prefixRoute, title, needToken } from 'src/configs';
import menuData from 'src/data/menu';
import crumbPaths from 'src/data/CrumbPaths';

import './home.scss';


const { Header, Sider, Content } = Layout;

const { Item: MenuItem, SubMenu } = Menu;

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        const username = localStorage.getItem('userName');
        if (!username) {
            needToken && this.props.history.push(prefixRoute + '/login');
        }

        this.state = {
            openKeys: [],
        };

        this.username = username === 'null' ? '超级管理员' : username;
    }

    generateLink = (obj) => {
        return obj.openWay === 'New_Tab' ?
            <a href={ obj.url }
               target="_blank"
               rel="noopener noreferrer"
               className="menu"
               key={ obj.id }
            >{ obj.name }</a> :
            <NavLink
                to={ obj.openWay === 'Replace_Tab' ? obj.url : `/${ prefixRoute }/iframe?url=${ escape(obj.url) }` }
                key={ obj.id }
                className="nav-link"
                activeClassName="active"
            >{ obj.name }</NavLink>
    };
    onOpenChange = (e) => {
        let res = [];
        switch (e.length) {
            case 1:
                res = e;
                break;
            case 2:
                res = [e[1]];
                break;
            default:
                res = [];
                break;
        }
        this.setState({ openKeys: res });
    };

    loginOut = () => {
        localStorage.clear();
        this.props.history.push(prefixRoute + '/login');
    };

    loginContent = (
        <div>
            <button className="sd-anchor-button" onClick={ this.loginOut }>退出</button>
        </div>
    );

    render() {
        return (
            <Layout className="home">
                <Header className="header">
                    <span className="title">{ title }</span>

                    <Popover content={ this.loginContent } title={ null } trigger="click">
                        <Button className="user sd-minor" type="primary" htmlType="button">
                            <Icon type="user"/>{ this.username }
                        </Button>
                    </Popover>
                </Header>
                <Layout className="body">
                    <Sider className="sider">
                        <Menu
                            mode="inline"
                            className="menu"
                            openKeys={ this.state.openKeys }
                            onOpenChange={ (e) => this.onOpenChange(e) }
                        >
                            { menuData.map((obj, key) => {
                                return obj.children && obj.children.length > 0 ?
                                    (<SubMenu
                                        className="subMenu"
                                        key={ key }
                                        title={ (
                                            <span>
                                                { obj.icon && <Icon className="menu-icon" type={ obj.icon }/> }
                                                <span>{ obj.name }</span>
                                            </span>) }
                                    >
                                        {
                                            obj.children.map((child, childKey) => (
                                                <MenuItem key={ key + '_' + childKey }>
                                                    { this.generateLink(child) }
                                                </MenuItem>
                                            ))
                                        }
                                    </SubMenu>) :
                                    <MenuItem key={ key }>
                                        <Link to={ obj.url }>
                                            { obj.icon && <Icon className="menu-icon" type={ obj.icon }/> }
                                            <span>{ obj.name }</span>
                                        </Link>
                                    </MenuItem>

                            }) }
                        </Menu>
                    </Sider>
                    <Content className="content" style={ { background: '#F7F9FC' } }>
                        <Crumb crumbPaths={ crumbPaths } target={ this.props.location.pathname }/>
                        <div className="router-wrapper">
                            <NestRouter children={ this.props.routes }/>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        )
    }
}