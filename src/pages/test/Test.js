import React from 'react';
import update from 'immutability-helper';
import TestSpin from "./TestSpin";

/**
 * 方法1: 不用update
 * 方法2: async await
 * 方法3: 同时更改state值,(此方法可减少重新render次数)
 */

export default class Queue extends React.Component {
    state = {
        a: {
            loading: false,
            id: 'a',
        },
        b: {
            loading: false,
            id: 'b',
        },
    };

    refresh = async () => {
        this.refresh1();
        this.refresh2();
    };

    refresh1 = () => {
        // this.setState({
        //     a: { ...this.state.a, loading: !this.state.a.loading, },
        // });
        this.setState(update(this.state, {
            a: { loading: { $set: !this.state.a.loading }, },
        }));
    };

    refresh2 = () => {
        // this.setState({
        //     b: { ...this.state.b, loading: !this.state.a.loading, },
        // });
        this.setState(update(this.state, {
            b: { loading: { $set: !this.state.b.loading }, },
        }));

    };

    render() {
        const state = this.state;

        return (
            <div className="part">
                <button onClick={ this.refresh }>刷新</button>
                <TestSpin option={ state.a }/>
                <TestSpin option={ state.b }/>
            </div>
        )
    }
}