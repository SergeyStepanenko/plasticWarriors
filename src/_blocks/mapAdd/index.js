import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

// const CONSTANTS = {
// 	add: {
// 		header: 'Добавление юнита:',
// 		name: 'Имя воина',
// 		enterName: 'Введите имя воина',
// 		link: 'Ссылка из trackKids',
// 		enterLink: 'Введите ссылку',
// 		pinColor: 'Цвет метки на карте',
// 		submit: 'Добавить',
// 	},
// 	edit: {
// 		header: 'Изменение юнита:',
// 		name: 'Введите новое имя воина',
// 		enterName: 'Введите новое имя воина',
// 		link: 'Введите новую ссылку из trackKids',
// 		enterLink: 'Введите новую ссылку',
// 		pinColor: 'Выберите новый цвет',
// 		submit: 'Изменить',
// 		reset: 'Отмена'
// 	}
// };

export default class MapAddForm extends PureComponent {
	static propTypes = {
		handleMapUpdate: PropTypes.func.isRequired,
		handleFormReset: PropTypes.func,
		handleMapSelect: PropTypes.func,
	}

	state = {
		form: {
			name: '',
			url: '',
			north: '',
			east: '',
			south: '',
			west: '',
		},
	}

	handleFormChange = (field, event) => {
		event.preventDefault();
		this.setState({
			form: {
				...this.state.form,
				[field]: event.target.value,
			}
		});
	}

	render() {
		const { form } = this.state;
		const { mapsData } = this.props;
		const isFormCompleted = !!~Object.values(form).indexOf('');

		return (
			<B.Form horizontal>
				<B.Panel header='Добавить новую карту' bsStyle="primary">
					<B.Col md={4}>
						<B.FormGroup>
							<B.Col md={12}>
								<B.ControlLabel>Ссылка на карту</B.ControlLabel>
								<B.FormControl
									placeholder='Название карты'
									onChange={(event) => this.handleFormChange('name', event)}
									value={form.name}
								/>
								<B.FormControl
									placeholder='Ссылка'
									onChange={(event) => this.handleFormChange('url', event)}
									value={form.url}
								/>
							</B.Col>
						</B.FormGroup>
						<B.FormGroup>
							<B.Col sm={12}>
								<B.ControlLabel>Задайте границы карты</B.ControlLabel>
								<B.FormControl
									placeholder='северная граница'
									onChange={(event) => this.handleFormChange('north', event)}
									value={form.north}
								/>
								<B.FormControl
									placeholder='южная граница'
									onChange={(event) => this.handleFormChange('south', event)}
									value={form.south}
								/>
								<B.FormControl
									placeholder='восточная граница'
									onChange={(event) => this.handleFormChange('east', event)}
									value={form.east}
								/>
								<B.FormControl
									placeholder='западная граница'
									onChange={(event) => this.handleFormChange('west', event)}
									value={form.west}
								/>
								<B.Button
									onClick={() => this.props.handleMapUpdate(form)}
									disabled={isFormCompleted}
								>
									Добавить
								</B.Button>
							</B.Col>
						</B.FormGroup>
					</B.Col>
					<B.Col md={4}>
						<B.FormGroup>
							<B.ControlLabel>Выберите сохраненную карту</B.ControlLabel>
							<B.FormControl componentClass='select' onChange={this.props.handleMapSelect}>
								<MapsList maps={this.props.mapsData} />
							</B.FormControl>
						</B.FormGroup>
					</B.Col>
				</B.Panel>
			</B.Form>
		);
	}
}

const MapsList = ({ maps }) => {
	if (!maps) {
		return [];
	}

	return (
		Object.keys(maps).map(key => {
			return (
				<option key={key} value={key}>
					{maps[key].name}
				</option>
			);
		})
	);
};
