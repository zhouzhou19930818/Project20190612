import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import { withRouter } from 'react-router-dom';

const findPaths = (routes, target, pathList) => {
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if (!route) {
            return false;
        }
        pathList.push(route);
        if (route.url === target) {
            return true;
        }
        if (route.hasOwnProperty('children')) {
            for (let j = 0; j < route.children.length; j++) {
                if (findPaths(route.children, target, pathList) === true) {
                    return true;
                }
            }
        }
        pathList.pop();
    }
};

function Crumb(props) {
    let pathList = [];
    findPaths(props.crumbPaths, props.target, pathList);
    return (
        <div className="sd-breadcrumb-wrapper">
            <Icon type="compass"/>
            <Breadcrumb className="sd-breadcrumb">
                {
                    pathList.map((path, i) => {
                        return path.url && i !== pathList.length - 1
                            ? (
                                <Breadcrumb.Item
                                    key={ 'path_' + i }
                                    className="sd-breadcrumb-link"
                                    onClick={ () => props.history.push(path.url) }
                                >
                                    <span>{ path.name }</span>
                                </Breadcrumb.Item>
                            )
                            : <Breadcrumb.Item key={ 'path_' + i }>{ path.name }</Breadcrumb.Item>
                    })
                }

                {/*<Breadcrumb.Item>报表分析</Breadcrumb.Item>*/ }
            </Breadcrumb>
        </div>
    )
}

export default withRouter(Crumb)