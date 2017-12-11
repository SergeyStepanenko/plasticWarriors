import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { CirclePicker } from 'react-color';

const STRINGS = {
	add: {
		header: 'Добавить или изменить воина:',
		name: 'Имя воина',
		enterName: 'Введите имя воина',
		link: 'Ссылка из trackKids',
		enterLink: 'Введите ссылку',
		pinColor: 'Цвет метки на карте',
		submit: 'Добавить',
	},
	edit: {
		header: 'Добавить или изменить воина:',
		name: 'Введите новое имя воина',
		enterName: 'Введите новое имя воина',
		link: 'Введите новую ссылку из trackKids',
		enterLink: 'Введите новую ссылку',
		pinColor: 'Выберите новый цвет',
		submit: 'Изменить',
		reset: 'Отмена'
	}
};

const style = {
	marginBottom: '10px'
};

export default class WarriorForm extends PureComponent {
	static propTypes = {
		form: PropTypes.object.isRequired,
		handleFormChange: PropTypes.func.isRequired,
		handleColorPick: PropTypes.func.isRequired,
		handleSubmit: PropTypes.func.isRequired,
		handleFormReset: PropTypes.func,
	}

	render() {
		const { form } = this.props;
		const isFormCompleted = !!~Object.values(form).indexOf('');

		return (
			<B.Form horizontal>
				<B.Panel header={STRINGS[form.type].header} bsStyle="primary">
					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel>{STRINGS[form.type].name}</B.ControlLabel>
							<B.FormControl
								placeholder={STRINGS[form.type].enterName}
								onChange={(event) => this.props.handleFormChange('name', event)}
								value={form.name}
							/>
						</B.Col>
					</B.FormGroup>

					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel>{STRINGS[form.type].link}</B.ControlLabel>
							<B.FormControl
								placeholder={STRINGS[form.type].enterLink}
								onChange={(event) => this.props.handleFormChange('url', event)}
								value={form.url}
							/>
						</B.Col>
					</B.FormGroup>

					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel style={style}>
								{STRINGS[form.type].pinColor}
							</B.ControlLabel>
							<CirclePicker
								onChangeComplete={this.props.handleColorPick}
								color={form.color}
							/>
						</B.Col>
					</B.FormGroup>

					<B.FormGroup>
						<B.Col sm={12}>
							<B.Button
								onClick={() => this.props.handleSubmit(form.key)}
								disabled={isFormCompleted}
							>
								{STRINGS[form.type].submit}
							</B.Button>
							{
								form.type === 'edit' &&
									<B.Button onClick={() => this.props.handleFormReset()}>
										{STRINGS[form.type].reset}
									</B.Button>
							}
						</B.Col>
					</B.FormGroup>
				</B.Panel>
			</B.Form>
		);
	}
}
