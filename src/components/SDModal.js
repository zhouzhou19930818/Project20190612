import React from 'react';
import ReactDOM from 'react-dom';
import 'src/components/sdModal.scss';

export default class SDModal extends React.Component {
    constructor(props) {
        super(props);
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
    }

    componentWillUnmount() {
        document.body.removeChild(this.container)
    }

    render() {
        const props = this.props;
        return ReactDOM.createPortal(
            <div className={ `sd-modal${ props.visible ? ' show' : '' }` }>
                <div className="modal-mask" onClick={ props.onCancel }/>
                <div className={ `modal-container` } style={ props.style }>
                    <div className="modal-header">
                        <span>{ props.title }</span>
                        <button className="sd-anchor-button close" onClick={ props.onCancel }>&times;</button>
                    </div>
                    <div className="modal-body">
                        { props.children }
                    </div>
                </div>
            </div>
            , this.container)
    }
}