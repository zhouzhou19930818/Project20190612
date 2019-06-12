import React, { Component } from 'react';
import { Routes } from "src/router";
import allRouters from 'src/data/allRouters';
import { title } from 'src/configs';
import api from 'src/tools/api';

let tokenInterval = null;
const tokenRefresh = () => {
    const refresh = () => {
        if (localStorage.getItem('token')) {
            api.tokenRefresh().then(() => {
                console.log('刷新token');
            })
        }
    };
    refresh();
    tokenInterval = setInterval(refresh, 240000);
};
const tokenCloseWait = () => {
    clearInterval(tokenInterval);
    api.closeWait().then(() => console.log('销毁token'));
};

class App extends Component {

    constructor(props) {
        super(props);
        document.title = title;
        tokenRefresh();
        window.addEventListener('beforeunload', tokenCloseWait);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', tokenCloseWait);
    }

    render() {
        return (
            <div className="App">
                <Routes routes={ allRouters }/>
            </div>
        );
    }
}


export default App;
