import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { CirclePicker } from 'react-color';

import { unitsRef } from 'config/firebase';

import { COLORS } from 'constants/index';

const CONSTANTS = {
	add: {
		header: 'Добавление юнита:',
		name: 'Имя воина',
		enterName: 'Введите имя воина',
		link: 'Ссылка из trackKids',
		enterLink: 'Введите ссылку',
		pinColor: 'Цвет метки на карте',
		submit: 'Добавить',
	},
	edit: {
		header: 'Изменение юнита:',
		name: 'Введите новое имя воина',
		enterName: 'Введите новое имя воина',
		link: 'Введите новую ссылку из trackKids',
		enterLink: 'Введите новую ссылку',
		pinColor: 'Выберите новый цвет',
		submit: 'Изменить',
		reset: 'Отмена'
	}
};

const formInitialState = {
	name: '',
	url: '',
	color: '',
	key: null,
	type: 'add',
};

export default class WarriorForm extends PureComponent {
	static propTypes = {
		// form: PropTypes.object,
		// handleFormChange: PropTypes.func.isRequired,
		// handleColorPick: PropTypes.func.isRequired,
		// handleSubmit: PropTypes.func.isRequired,
		toggleCollapse: PropTypes.func,
		// handleFormReset: PropTypes.func,
		collapsed: PropTypes.bool,
	}

	static defaultProps = {
		collapsed: false,
	}

	state = {
		form: formInitialState,
	}

	handleColorPick = (color) => {
		if (!color) {
			return;
		}
		this.setState({
			form: {
				...this.state.form,
				color: color.hex,
			}
		});
	};

	handleFormChange = (field, event) => {
		event.preventDefault();
		this.setState({
			form: {
				...this.state.form,
				[field]: event.target.value
			}
		});
	}

	handleSubmit = (key) => {
		this.sendUnitToFirebase({
			key,
			name: this.state.form.name.trim(),
			url: this.state.form.url.trim(),
			color: this.state.form.color,
		});

		this.resetForm();
	}

	sendUnitToFirebase = ({ key, name, url, color }) => {
		const postData = {
			name,
			url,
			color,
		};

		if (!key) {
			unitsRef.push().set(postData);
		} else {
			const updates = {};
			updates[key] = postData;

			unitsRef.update(updates);
		}
	}

	resetForm = () => {
		this.setState({
			form: formInitialState,
		});
	}

	render() {
		const { form } = this.state;
		const isFormCompleted = !!~Object.values(form).indexOf('');

		const editButton = (this.state.form.type === 'edit') ?
			<B.Button onClick={() => this.handleFormReset()}>
				{CONSTANTS[this.state.form.type].reset}
			</B.Button>
			: null;

		return (
			<B.Form horizontal>
				<B.Panel
					header={CONSTANTS[form.type].header}
					bsStyle="primary"
					onClick={() => this.props.toggleCollapse('warriorForm')}
				/>
				<B.Panel
					bsStyle="primary"
					expanded={!this.props.collapsed}
					collapsible
				>
					<B.Col md={4}>
						<B.FormGroup>
							<B.Col md={12}>
								<B.ControlLabel>{CONSTANTS[form.type].name}</B.ControlLabel>
								<B.FormControl
									placeholder={CONSTANTS[form.type].enterName}
									onChange={(event) => this.handleFormChange('name', event)}
									value={form.name}
								/>
							</B.Col>
						</B.FormGroup>
						<B.FormGroup>
							<B.Col sm={12}>
								<B.ControlLabel>{CONSTANTS[form.type].link}</B.ControlLabel>
								<B.FormControl
									placeholder={CONSTANTS[form.type].enterLink}
									onChange={(event) => this.handleFormChange('url', event)}
									value={form.url}
								/>
							</B.Col>
							<B.Col sm={4}>
								<B.ControlLabel>
									{CONSTANTS[form.type].pinColor}
								</B.ControlLabel>
								<CirclePicker
									onChangeComplete={this.handleColorPick}
									color={form.color}
									colors={COLORS}
								/>
								<div className='app__form-buttons'>
									<B.Button
										onClick={() => this.handleSubmit(form.key)}
										disabled={isFormCompleted}
									>
										{CONSTANTS[form.type].submit}
									</B.Button>
									{editButton}
								</div>
							</B.Col>
						</B.FormGroup>
					</B.Col>
				</B.Panel>
			</B.Form>
		);
	}
}
