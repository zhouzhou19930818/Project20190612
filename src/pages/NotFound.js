import React from 'react';

export default class NotFound extends React.Component {
    render() {
        return (
            <div style={ { position: 'fixed', top: '0', bottom: '0', left: '0', right: '0' } }>
                <div style={ {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    height: '100%'
                } }>
                    <h1>404</h1>
                    <h4>找不到页面</h4>
                </div>
            </div>
        )
    }
}