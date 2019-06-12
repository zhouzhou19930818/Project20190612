import React from 'react';
import { Modal, Row, Col } from 'antd';

export default class DetailModal extends React.Component {
    state = {
        visible: false,
    };

    show = () => {
        this.setState({ visible: true });
    };

    generateFields = (fields, col) => {
        if (!fields || Object.keys(fields).length < 1) return null;

        let res = [];
        let i = 1;
        for (let attr in fields) {
            if (!fields.hasOwnProperty(attr)) continue;
            const field = fields[attr];
            res.push(<Col span={ 12 } { ...col } key={ i } style={ { padding: '6px 0 6px 10px' } }>
                <div className="sd-ellipsis"
                     style={ { display: 'inline-block', width: '40%' } }
                     title={ field[0] }
                >
                    { field[0] }：
                </div>
                <div className="sd-ellipsis"
                     style={ { display: 'inline-block', width: '60%' } }
                     title={ field[1] }
                >
                    { field[1] }
                </div>
            </Col>);
            i = i + 1;
        }
        return res;
    };

    render() {
        const props = this.props;

        return (
            <Modal visible={ this.state.visible }
                   title={ props.modalTitle }
                   onCancel={ () => this.setState({ visible: false }) }
                   footer={ null }
            >
                <Row>
                    {
                        this.generateFields(props.fields, props.col)
                    }
                </Row>
            </Modal>
        )
    }
}