import React, { Component } from 'react';
import { Spin } from "antd";

export default class TestSpin extends Component {

    render() {
        console.log('render', this.props.option);
        return <div style={ {
            width: '100px',
            height: '100px',
            background: 'pink',
            margin: '20px',
            boxShadow: '0 0 2px 1px #ffcc00'
        } }>
            <Spin spinning={ this.props.option.loading }/>
        </div>
    }
}