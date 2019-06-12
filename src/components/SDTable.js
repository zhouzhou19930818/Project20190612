import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

export default class SDTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            update: 0,
        };
    }

    static defaultProps = {
        id: 'sdTable',
        defaultColumnsWidth: 100
    };

    proptypes = {
        id: PropTypes.string.isRequired,
        defaultColumnsWidth: PropTypes.number,
        scrollY: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    generateColumns = (source = [], columnsProportion) => {
        let scrollX = 0;
        const len = source.length;
        if (len < 1) return { scrollX: scrollX, columns: source };
        const el = document.getElementById(this.props.id);
        if (!el) return { scrollX: scrollX, columns: source };
        let totalWidth = el.clientWidth - 100;
        let columns = [];
        if (columnsProportion) { // 按照比例重新分配
            let copyProportion = [], sum = 0;
            source.reduce((res, data, i) => {
                const count = columnsProportion[i] || 1;
                res.push(count);
                sum = sum + count;
                return res;
            }, copyProportion);
            const averageWidth = Math.floor(totalWidth / sum);
            columns = source.map((d, i) => {
                const { width, ...others } = d;
                if (i === len - 1) return others;
                d.width = averageWidth * copyProportion[i] + 'px';
                return d;
            });
        } else {
            const averageWidth = Math.floor(totalWidth / len);
            columns = source.map((d, i) => {  // 最后一列不需要width, 已有width的用已有的, 没有的用平均值
                const { width, ...others } = d;
                if (i === len - 1) return others;
                if (width) {
                    i === 0 && (totalWidth = 0);
                    totalWidth = totalWidth + width;
                    return d;
                }
                d.width = averageWidth + 'px';
                return d;
            });
        }

        scrollX = totalWidth;
        return { scrollX: scrollX, columns: columns }
    };

    render() {
        const { scrollX, columns } = this.generateColumns(this.props.columns, this.props.columnsProportion);
        const scroll = this.props.scroll ?
            (scrollX ? { ...this.props.scroll, x: scrollX } : this.props.scroll) :
            { x: false, y: null };
        return (
            <Table
                { ...this.props }
                id={ this.props.id }
                cloumns={ columns }
                scroll={ scroll }
            />)
    }
}
