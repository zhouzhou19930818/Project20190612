import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';
import App from './App';
import * as serviceWorker from './serviceWorker';
import store from 'src/redux/index';

import './assets/css/index.scss';

moment.locale('zh-cn');

ReactDOM.render(
    <LocaleProvider locale={ zh_CN }>
        <Provider store={ store }>
            <Router>
                <App/>
            </Router>
        </Provider>
    </LocaleProvider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
