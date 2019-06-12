import events from 'events';
import {message} from 'antd';

export const eventEmitter = new events.EventEmitter();


let timeId;
export const debounce = function (fn, timeDelay = 500) {
    timeId && clearTimeout(timeId);
    timeId = setTimeout(function () {
        fn.apply();
    }, timeDelay);
};


export const nameRules = (others) => ({
    rules: [{
        validator: (rule, value, callback) => {
            if (!value) {
                callback('数字及字母,-,_,不能超过20个字');
            } else if (value && !/(^[\w-]+$)/.test(value)) {
                callback('数字及字母,-,_');
            } else if (value.length > 20) {
                callback('不能超过20个字');
            } else {
                callback();
            }
        }
    }, others]
});

/***
 * candidateHeight: 由大到小
 * @param section
 * @returns {{candidateHeight: number, width: number, height: number}}
 */
// const section = [568, 920, 1200];
export const computeHeight = (section = []) => {
    if (!section || section.length !== 2) {
        throw new Error('需要传入数据且含有两个数组元素');
    } else if (section[1].length - section[0].length !== 1) {
        throw new Error('第二个数组需要比第一个数组多一个元素');
    }
    let candidateHeight = 0;
    const contentEl = document.getElementsByClassName('router-wrapper')[0];
    if (!contentEl) return null;
    const width = contentEl.clientWidth;
    const height = contentEl.clientHeight;
    const section0 = section[0], section1 = section[1];
    let sectionLen = section1.length;
    for (let i = 0; i < sectionLen; i++) {
        if (i === 0) {
            if (width <= section0[i]) { // 第一个
                candidateHeight = section1[i] || 0;
                break;
            }
        } else if (i === sectionLen - 1) { // 最后一个
            if (width > section0[i - 1]) {
                candidateHeight = section1[i] || 0;
                break;
            }
        } else { // 中间
            if (width > section0[i - 1] && width <= section0[i]) {
                candidateHeight = section1[i] || 0;
                break;
            }
        }
    }
    return { width, height, candidateHeight };
};

export const downloadFile = (response) => {
    const blob = new Blob([response.data]);
    const disposition = response.headers['content-disposition'];
    if(!disposition){
        message.error('系统异常');
        return;
    }
    let fileName = disposition.split('filename=')[1];
    console.log(fileName)
    fileName = decodeURIComponent(fileName) || fileName; // 中文
    if ('download' in document.createElement('a')) { // 非IE下载
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } else {
        navigator.msSaveBlob(blob, fileName)
    }
};

export function isString(o) { //是否字符串
    return Object.prototype.toString.call(o).slice(8, -1) === 'String';
}

export function isNumber(o) { //是否数字
    return Object.prototype.toString.call(o).slice(8, -1) === 'Number';
}

export function isObj(o) { //是否对象
    return Object.prototype.toString.call(o).slice(8, -1) === 'Object';
}

export function isArray(o) { //是否数组
    return Object.prototype.toString.call(o).slice(8, -1) === 'Array';
}

export function isDate(o) { //是否时间
    return Object.prototype.toString.call(o).slice(8, -1) === 'Date';
}

export function isBoolean(o) { //是否boolean
    return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean';
}

export function isFunction(o) { //是否函数
    return Object.prototype.toString.call(o).slice(8, -1) === 'Function';
}

export function isNull(o) { //是否为null
    return Object.prototype.toString.call(o).slice(8, -1) === 'Null';
}

export function isUndefined(o) { //是否undefined
    return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined';
}

export function isFalse(o) {
    return (!o || o === 'null' || o === 'undefined' || o === 'false' || o === 'NaN');
}

export function isTrue(o) {
    return !this.isFalse(o);
}

export const computedStyle = (el) => {
    let computedStyle;
    if (window.getComputedStyle) {
        computedStyle = getComputedStyle(el, null)
    } else {
        computedStyle = el.currentStyle;//兼容IE
    }
    return computedStyle;
};

export const getStyleNumber = (string) => {
    if (!isString(string)) return;
    const res = string.match(/\d+/g);
    return res && res[0] ? Number(res[0]) : 0;
};