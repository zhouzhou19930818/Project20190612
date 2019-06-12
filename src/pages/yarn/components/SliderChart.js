import React from 'react';
import echarts from 'echarts';
import update from "immutability-helper";
import { computedStyle, getStyleNumber } from "../../../tools/utils";
import './echarts.scss';

let resizeWidth = 8;
const options = {};


export default class SliderChart extends React.Component {
    leftPercent;
    rightPercent;
    state = {
        startTime: '',
        endTime: '',
    };

    componentDidMount() {

        this.chartEL = document.getElementById(this.props.id);
        this.customZoom = document.getElementById('customZoom' + this.props.id);
        this.slideBlock = document.getElementById('slideBlock' + this.props.id);
        this.resizeLeft = document.getElementById('resizeLeft' + this.props.id);
        this.resizeRight = document.getElementById('resizeRight' + this.props.id);
        this.chart = echarts.init(this.chartEL);
        this.chart.setOption(this.props.options || options);
        this.setMarkArea();

        window.addEventListener('resize', () => {
            this.chart.resize();
            this.setMarkArea();
        });

        this.addMouseListeners();

    }

    shouldComponentUpdate(nextProps) {
        return nextProps.sliderParam !== this.props.sliderParam;
    }

    // 获取滑块位置, 设置areaMark
    setMarkArea = () => {
        const wrapperWidth = this.chartEL.clientWidth;
        const customZoomWidth = this.customZoom.clientWidth;
        // 滑块部分(custom-zoom)与echarts有相对位置调整
        // 获取左边偏移量(可理解为计算padding-left)
        const padding = getStyleNumber(computedStyle(this.customZoom).left) - getStyleNumber(computedStyle(this.customZoom).marginLeft);//
        const left = getStyleNumber(computedStyle(this.slideBlock).left);
        const blockWidth = this.slideBlock.clientWidth;
        const right = blockWidth + left;
        const leftPercent = (padding + left) / wrapperWidth;
        const rightPercent = (padding + right) / wrapperWidth;
        this.leftPercent = left / customZoomWidth;
        this.rightPercent = right / customZoomWidth;
        this.chart.setOption(update(this.props.options || options, {
            series: {
                0: {
                    markArea: {
                        data: {
                            $set: [
                                [{
                                    x: leftPercent * 100 + '%', // index
                                }, {
                                    x: rightPercent * 100 + '%', // index
                                },]
                            ]
                        }
                    }
                }
            }
        }));
    };

    // 滑块移动监听事件
    addMouseListeners = () => {

        // 左边
        this.mouseEvent(this.resizeLeft, (offsetX, id) => {
            const computed = computedStyle(this.slideBlock);
            if (!computed || id !== this.resizeLeft.id) return;
            const attr = getStyleNumber(computed.left);
            const res = attr + offsetX;
            this.slideBlock.style.left = res + "px";
            if (getStyleNumber(computed.width) <= resizeWidth) {
                this.slideBlock.style.left = attr + "px";
                return;
            }
            this.setMarkArea();
        });
        // 右边
        this.mouseEvent(this.resizeRight, (offsetX, id) => {
            const computed = computedStyle(this.slideBlock);
            if (!computed || id !== this.resizeRight.id || getStyleNumber(computed.width) <= resizeWidth) return;
            const attr = getStyleNumber(computed.right);
            const res = attr - offsetX;
            this.slideBlock.style.right = res + "px";
            if (getStyleNumber(computed.width) <= resizeWidth) {
                this.slideBlock.style.right = attr + "px";
                return;
            }
            this.setMarkArea();
        });
        // 中间
        this.mouseEvent(this.slideBlock, (offsetX, id) => {
            const computed = computedStyle(this.slideBlock);
            if (!computed || id !== this.slideBlock.id || getStyleNumber(computed.width) <= resizeWidth) return;
            const attr1 = getStyleNumber(computed.left);
            const attr2 = getStyleNumber(computed.right);
            const res1 = attr1 + offsetX;
            const res2 = attr2 - offsetX;
            this.slideBlock.style.left = res1 + "px";
            this.slideBlock.style.right = res2 + "px";
            if (attr1 + offsetX < 0 || attr2 - offsetX < 0) {
                this.slideBlock.style.left = attr1 + "px";
                this.slideBlock.style.right = attr2 + "px";
                return;
            }
            this.setMarkArea();
        });


    };

    // mouse events
    mouseEvent = (targetEl, callback) => {

        let isDown = false; //判断鼠标是否按下
        let movingId = '';

        //实时监听鼠标位置
        let currentX = 0;
        //记录鼠标按下瞬间的位置
        let x = 0;
        //鼠标按下时移动的偏移量
        let offsetX = 0;

        const moving = (event) => {
            event = event ? event : window.event;
            event.cancelBubble = true;
            event.stopPropagation();
            if (isDown) {
                currentX = event.clientX;
                offsetX = currentX - x;   //计算鼠标移动偏移量
                callback(offsetX, movingId);
                x = event.clientX;
            }

        };
        const start = (event) => {
            isDown = true;
            x = event.clientX;
            movingId = event.target.id;
        };
        const end = () => {
            isDown && this.props.sliderEvent && this.props.sliderEvent(this.leftPercent, this.rightPercent);
            isDown = false;
            offsetX = 0;
            movingId = '';
        };

        // 鼠标按下方块
        targetEl.addEventListener("touchstart", start);
        targetEl.addEventListener("mousedown", start);
        // 拖动
        window.addEventListener("touchmove", moving);
        window.addEventListener("mousemove", moving);
        // 鼠标松开
        window.addEventListener("touchend", end);
        window.addEventListener("mouseup", end);

    };

    /***
     * 设置滑块位置
     * @param startPosition %
     * @param endPosition %
     * @param startTime
     * @param endTime
     */
    setSlider = ({ startPosition, endPosition, startTime, endTime }) => {
        this.slideBlock.style.left = startPosition + '%';
        this.slideBlock.style.right = (100 - endPosition) + "%";
        this.setMarkArea();
        this.setState({ startTime, endTime });
    };

    render() {
        return (<div className="chart-wrapper" id={ "chart-wrapper" + this.props.id }>
            <div id={ this.props.id } className="chart"/>
            <div className="custom-zoom" id={ "customZoom" + this.props.id }>
                <div className="slide-block" id={ "slideBlock" + this.props.id }>
                    <span className="resize-left" id={ "resizeLeft" + this.props.id }>
                        <span className="date">{ this.state.startTime }</span>
                    </span>
                    <span className="resize-right" id={ "resizeRight" + this.props.id }>
                        <span className="date">{ this.state.endTime }</span>
                    </span>
                </div>

            </div>
        </div>)
    }
}