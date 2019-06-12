import React, { Component } from 'react';
import { Button, Radio } from "antd";
import echarts from "echarts";
import SDTable from '../../../components/SDTable';
import SliderChart from '../components/SliderChart';

const chartLoadingStyle = {
    text: 'loading',
    color: '#2AA0FF',
    textColor: '#2AA0FF',
    // maskColor: 'rgba(255, 255, 255, 0.1)',
};

const intervalStyle = {
    color: '#808080',
    background: '#E9E9E9',
    fontSize: '12px',
    fontWeight: '400',
    fontFamily: 'SourceHanSansCN-Regular',
    borderRadius: '12px',
    padding: '18px 4px',
    position: 'absolute',
    right: '4px',
    top: '20%',
};

// 获取时间间隔
const getInterval = (str) => {
    if (!str) return '';
    const intervalList = str.match(/[\u4e00-\u9fa5]|\d+/gm);
    let block1Interval = '';
    (intervalList && intervalList.length) && intervalList.forEach(d => block1Interval = block1Interval + `${ d }<br/>`);
    return block1Interval;
};

export class ControllerChart extends Component {
    renderTime = 0;

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.loading) {
            this.chartSlider.chart.showLoading(chartLoadingStyle);
        } else {
            this.renderTime += 1;
            if (nextProps.loading !== this.props.loading) {
                this.chartSlider.chart.hideLoading(); // 撤去loading
                this.chartSlider.chart.clear();
                this.chartSlider.chart.setOption(nextProps.chartOption); // 更新图表
            }
            if (nextProps.sliderParam) {
                this.chartSlider.setSlider(nextProps.sliderParam); // 设置滑块位置
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.renderTime === 1;
    }

    render() {
        const props = this.props;
        return (
            <div className="block">
                <div className="block-title">{ props.title }</div>
                <div className="block-body">
                    <SliderChart
                        id={ props.id }
                        ref={ e => this.chartSlider = e }
                        options={ props.chartOption }
                        loading={ props.loading }
                        sliderEvent={ props.sliderEvent }
                    />
                    { props.interval ? (
                        <span dangerouslySetInnerHTML={ { __html: getInterval(props.interval) } }
                              style={ intervalStyle }
                        />
                    ) : null }
                </div>
            </div>
        )
    }
}

export class LinkChart extends Component {

    renderTime = 0;

    componentDidMount() {
        this.block2Chart = echarts.init(document.getElementById(this.props.id));
        window.addEventListener("resize", () => this.block2Chart.resize());
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loading) {
            this.block2Chart.showLoading(chartLoadingStyle);
        } else {
            this.renderTime += 1;
            if (nextProps.loading !== this.props.loading) {
                this.block2Chart.hideLoading();
                this.block2Chart.clear();
                this.block2Chart.setOption(nextProps.chartOption);
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.renderTime === 1;
    }

    render() {
        const props = this.props;
        return (
            <div className="block">
                <div className="block-title">
                    { props.title }
                    {
                        props.chartOption.series && props.chartOption.series.length > 10 ?
                            <Radio.Group
                                className="radio-button wireframe"
                                style={ { float: 'right' } }
                                onChange={ (e) => props.onPageChange(e.target.value) }
                                value={ props.pageIndex }
                            >
                                <Radio.Button key={ props.id + 1 } value={ 1 }>Top10</Radio.Button>
                                <Radio.Button key={ props.id + 2 } value={ 2 }>Top11-20</Radio.Button>
                            </Radio.Group> : null
                    }
                </div>
                <div className="block-body">
                    <div id={ props.id } className="chart-table"/>
                    {
                        props.interval ? (
                            <span dangerouslySetInnerHTML={ { __html: getInterval(props.interval) } }
                                  style={ intervalStyle }
                            />
                        ) : null
                    }
                </div>
            </div>
        )
    }
}

export class LinkTable extends Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextProps.options.loading !== this.props.options.loading;
    }

    render() {
        const props = this.props;
        return (
            <div className="block">
                <div className="block-title" style={ { paddingRight: '20px' } }>
                    { props.title }
                    <Button type="primary"
                            className="sd-wireframe"
                            onClick={ props.exportExcel }
                            style={ { float: 'right', height: '28px' } }
                    >导出</Button>
                </div>
                <div className="block-body">
                    <SDTable
                        bordered={ true }
                        className="sd-table-simple tr-color-interval"
                        style={ { padding: '16px' } }
                        pagination={ false }
                        scroll={ { y: 200 } }
                        { ...props.options }
                    />
                </div>
            </div>
        )
    }
}
