import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { CirclePicker } from 'react-color';

const STRINGS = {
	header: 'Пластиковые воины:',
	name: 'Имя воина',
	enterName: 'Введите имя воина',
	link: 'Ссылка из trackKids',
	enterLink: 'Введите ссылку',
	pinColor: 'Цвет метки на карте',
	add: 'Добавить',
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
	}

	render() {
		const { form } = this.props;
		const isFormCompleted = !!~Object.values(form).indexOf('');

		return (
			<B.Form horizontal>
				<B.Panel header={STRINGS.header} bsStyle="primary">
					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel>{STRINGS.name}</B.ControlLabel>
							<B.FormControl
								placeholder={STRINGS.enterName}
								onChange={(event) => this.props.handleFormChange('name', event)}
								value={form.name}
							/>
						</B.Col>
					</B.FormGroup>

					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel>{STRINGS.link}</B.ControlLabel>
							<B.FormControl
								placeholder={STRINGS.enterLink}
								onChange={(event) => this.props.handleFormChange('url', event)}
								value={form.url}
							/>
						</B.Col>
					</B.FormGroup>

					<B.FormGroup>
						<B.Col sm={12}>
							<B.ControlLabel style={style}>
								{STRINGS.pinColor}
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
								onClick={this.props.handleSubmit}
								disabled={isFormCompleted}
							>
								{STRINGS.add}
							</B.Button>
						</B.Col>
					</B.FormGroup>
				</B.Panel>
			</B.Form>
		);
	}
}
