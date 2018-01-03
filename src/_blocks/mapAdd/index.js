import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

export default class MapAddForm extends PureComponent {
	static propTypes = {
		sendMapToFirebase: PropTypes.func.isRequired,
		handleFormReset: PropTypes.func,
		handleMapSelect: PropTypes.func,
		toggleCollapse: PropTypes.func.isRequired,
		mapsData: PropTypes.object,
		selectedMapId: PropTypes.string,
		collapsed: PropTypes.bool,
	}

	static defaultProps = {
		collapsed: false,
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
		const isFormCompleted = !!~Object.values(form).indexOf('');
		// const isFormCompleted = !!~Object.keys(form).map(value => form[value]).indexOf('');

		return (
			<B.Form horizontal>
				<B.Panel
					header='Добавить новую карту'
					bsStyle="primary"
					onClick={() => this.props.toggleCollapse('mapForm')}
				/>
				<B.Panel
					bsStyle="primary"
					expanded={!this.props.collapsed}
					collapsible
				>
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
									className='app__form-buttons'
									onClick={() => this.props.sendMapToFirebase(form)}
									disabled={isFormCompleted}
								>
									Добавить
								</B.Button>
							</B.Col>
						</B.FormGroup>
					</B.Col>
				</B.Panel>
			</B.Form>
		);
	}
}
