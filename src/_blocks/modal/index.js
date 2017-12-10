import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

export default class Modal extends PureComponent {
	static propTypes = {
		onHide: PropTypes.func.isRequired,
		config: PropTypes.object,
	}

	handleAction = () => {
		this.props.config.action(this.props.config.key);
		this.props.onHide();
	}

	render() {
		return (
			<B.Modal {...this.props} bsSize="small" aria-labelledby="contained-modal-title-sm">
				<B.Modal.Header closeButton>
					<B.Modal.Title>Удаление воина</B.Modal.Title>
				</B.Modal.Header>
				<B.Modal.Body>
					<h4>Вы действительно хотите удалить воина</h4>
				</B.Modal.Body>
				<B.Modal.Footer>
					<B.Button onClick={this.props.onHide}>Нет</B.Button>
					<B.Button onClick={this.handleAction}>Да</B.Button>
				</B.Modal.Footer>
			</B.Modal>
		);
	}
}
