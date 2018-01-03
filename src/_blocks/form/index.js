import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { CirclePicker } from 'react-color';
import { isEmpty } from 'lodash';

import { unitsRef } from 'config/firebase';
import { requestData } from 'helpers';
import { COLORS } from 'constants/index';

const URL = 'https://www.izhforum.info/forum/izhevsk/tracker_live_map.php';
const CONSTANTS = {
	add: {
		header: 'Добавление воина:',
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
		form: PropTypes.object,
		toggleCollapse: PropTypes.func,
		clearState: PropTypes.func,
		collapsed: PropTypes.bool,
	}

	static defaultProps = {
		collapsed: false,
	}

	state = {
		form: formInitialState,
		statusText: '',
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.form) {
			this.setState({ form: nextProps.form });
		}
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
			},
			statusText: '',
		});
	}

	resetForm = () => this.setState({ form: formInitialState });

	handleSubmit = async () => {
		this.setState({
			disabled: true,
			statusText: 'Проверка',
		});

		const isValidLink = this.state.form.url.startsWith(URL);

		if (!isValidLink) {
			this.setState({
				disabled: false,
				statusText: `Ссылка начинается не с ${URL}`,
			});

			return;
		}

		const response = await requestData({ url: this.state.form.url });

		if (!response || isEmpty(response)) {
			this.setState({
				disabled: false,
				statusText: 'Неверная ссылка',
			});

			return;
		}

		this.sendUnitToFirebase({
			key: this.state.form.key,
			name: this.state.form.name.trim(),
			url: this.state.form.url.trim(),
			color: this.state.form.color,
		});

		this.setState({
			disabled: false,
			statusText: 'Ок',
		});

		this.resetForm();

		const { clearState } = this.props;
		this.props.form && clearState && clearState('form');
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

	resetForm = () => this.setState({ form: formInitialState });

	render() {
		const { form } = this.state;
		const { toggleCollapse } = this.props;
		const isFormCompleted = !!~Object.values(form).indexOf('');
		// const isFormCompleted = !!~Object.keys(form).map(value => form[value]).indexOf('');
		const editButton = (form.type === 'edit') ?
			<B.Button onClick={() => this.resetForm()}>
				{CONSTANTS[form.type].reset}
			</B.Button>
			: null;

		return (
			<B.Form horizontal>
				<B.Panel
					header={CONSTANTS[form.type].header}
					bsStyle="primary"
					onClick={() => toggleCollapse && this.props.toggleCollapse('warriorForm')}
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
										onClick={this.handleSubmit}
										disabled={isFormCompleted || this.state.disabled}
									>
										{CONSTANTS[form.type].submit}
									</B.Button>
									{editButton}
								</div>
								<span>{this.state.statusText}</span>
							</B.Col>
						</B.FormGroup>
					</B.Col>
				</B.Panel>
			</B.Form>
		);
	}
}
