import React, { Component } from 'react';


export default class Iframe extends Component {
    getQueryString = (name) => {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);  // 解密   加密：escape()
        return null;
    };

    render() {
        const src = this.getQueryString('url');
        return (
            <iframe
                title="iframe"
                src={ `${ src }${ window.location.hash }` }
                frameBorder="0"
                style={ {
                    height: document.documentElement.clientHeight - 170,
                    width: "100%",
                    overflow: "scroll",
                    border: "0"
                } }

            />
        )
    }
}