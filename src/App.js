import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';

import mapImg from './maps/map_1.jpg';
import mapKML from './maps/map.kml';

const config = {
	apiKey: 'AIzaSyCB1TfuGQegOrHOPcFJFqpxDmMTSElXQVg',
	authDomain: 'plastic-warriors.firebaseapp.com',
	databaseURL: 'https://plastic-warriors.firebaseio.com',
	projectId: 'plastic-warriors',
	storageBucket: '',
	messagingSenderId: '143541315246'
};

firebase.initializeApp(config);

const CORS = 'https://cors-anywhere.herokuapp.com/';
const database = firebase.database();
const rootRef = database.ref('/');

export default class App extends PureComponent {
	state = {
		form: {
			name: '',
			url: '',
			color: 'red'
		},
		mappedWarriors: [],
		firebaseData: {},
		geoData: {
			north: 55.6631224066095,
			south: 55.6537422837442,
			east: 37.6337206363678,
			west: 37.6171284914017,
		}
	}

	componentDidMount() {
		rootRef.on('value', (snap) => {
			this.setState({
				firebaseData: snap.val()
			}, () => {
				this.requestKidsTrackData(this.state.firebaseData);
			});
		});
	}

	sendDataToFirebase = (warrior) => {
		firebase.database().ref('/').push().set({
			name: warrior.name,
			url: warrior.url
		});
	}

	requestData = (url, assignedName, key) => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('GET', `${CORS}${url}&mode=poll`, true);
			xhr.onload = function x() {
				if (this.status === 200) {
					resolve({
						...JSON.parse(this.response),
						name: assignedName,
						key
					});
				} else {
					const error = new Error(this.statusText);
					error.code = this.status;
					reject({
						name: assignedName,
						key,
						error
					});
				}
			};

			xhr.send();
			xhr.onerror = () => reject(new Error('oops'));
		});
	};

	Promise_all = (promises) => {
		return new Promise((resolve) => {
			const results = [];
			let count = 0;
			promises.forEach((promise, idx) => {
				promise
					.catch(err => err)
					.then(valueOrError => {
						results[idx] = valueOrError;
						count += 1;
						if (count === promises.length) resolve(results);
					});
			});
		});
	};

	requestKidsTrackData = async (data) => {
		const keys = Object.keys(data);
		const promises = [ ...keys.map(key => this.requestData(data[key].url, data[key].name, key)) ];
		const mappedWarriors = await this.Promise_all(promises);

		this.setState({
			mappedWarriors,
			keys
		}, () => {
			return Promise.resolve(mappedWarriors);
		});
	};

	handleFormChange = (form, event) => {
		event.preventDefault();
		this.setState({
			form: {
				...this.state.form,
				[form]: event.target.value
			}
		});
	}

	handleSubmit = () => {
		this.sendDataToFirebase({
			name: this.state.form.name.trim(),
			url: this.state.form.url.trim(),
			color: this.state.form.color,
		});

		this.setState({
			form: {
				name: '',
				url: '',
				color: 'red'
			}
		});
	}

	paintWarriorsOnMap = (params, warriors) => {
		console.log({
			params,
			warriors
		});
	}

	handleMapRefresh = () => {
		this.setState({
			imgParams: this.$image.getBoundingClientRect()
		}, async () => {
			// await this.requestKidsTrackData(this.state.firebaseData);
			this.paintWarriorsOnMap(this.state.imgParams, this.state.mappedWarriors);
		});
	}

	render() {
		const { mappedWarriors, firebaseData, form } = this.state;

		return(
			<div>
				<B.Col xs={8} md={8}>
					<div style={{ position: 'absolute' }} ref={(r) => { this.$image = r; }}>
						<B.Image
							src={mapImg}
							responsive
						/>
					</div>
					<div style={{
						position: 'relative',
						backgroundColor: 'red',
						width: '20px',
						height: '20px',
						top: '0',
						left: '0',
					}}/>
				</B.Col>
				<B.Col xs={4} md={4}>
					<B.Form horizontal>
						<B.Panel header={'Пластиковые воины:'} bsStyle="primary">
							<B.FormGroup controlId="formHorizontalEmail">
								<B.Col sm={12}>
									<B.ControlLabel>Имя воина</B.ControlLabel>
									<B.FormControl
										type="text"
										placeholder='Введите имя воина'
										onChange={(event) => this.handleFormChange('name', event)}
										value={this.state.form.name}
									/>
								</B.Col>
							</B.FormGroup>

							<B.FormGroup controlId="formHorizontalPassword">
								<B.Col sm={12}>
									<B.ControlLabel>Ссылка из trackKids</B.ControlLabel>
									<B.FormControl
										type="text"
										placeholder='Введите ссылку'
										onChange={(event) => this.handleFormChange('url', event)}
										value={this.state.form.url}
									/>
								</B.Col>
							</B.FormGroup>

							<B.FormGroup>
								<B.Col sm={12}>
									<B.ControlLabel>Цвет метки на карте</B.ControlLabel>
									<B.FormControl componentClass="select" onChange={(event) => this.handleFormChange('color', event)}>
										<option value="red">красный</option>
										<option value="green">зеленый</option>
										<option value="yellow">желтый</option>
									</B.FormControl>
								</B.Col>
							</B.FormGroup>

							<B.FormGroup>
								<B.Col sm={12}>
									<B.Button
										type="submit"
										onClick={this.handleSubmit}
										disabled={form.name === '' || form.url === ''}
									>
										Добавить
									</B.Button>
								</B.Col>
							</B.FormGroup>
						</B.Panel>
					</B.Form>
					<B.Panel header={'Пластиковые воины:'} bsStyle="primary">
						<B.FormGroup>
							{
								Object.keys(firebaseData).map((key) => {
									return(
										<B.Row key={key}>
											<B.Col sm={3}>{firebaseData[key].name}</B.Col>
											<B.Col sm={2}>{firebaseData[key].color || 'color'}</B.Col>
											<B.Col sm={2}>{firebaseData[key].status || 'isOnline'}</B.Col>
										</B.Row>
									);
								})
							}
						</B.FormGroup>
					</B.Panel>
					<B.Panel header={'Данные геопозиции:'} bsStyle="primary">
						<B.FormGroup>
							{
								mappedWarriors && mappedWarriors.map(warrior => (
									!warrior.error &&
										<B.Row key={warrior.lat+warrior.lng + warrior.battery_lvl}>
											<B.Col sm={4}>{warrior.name}</B.Col>
											<B.Col sm={4}>lat: {warrior.lat}</B.Col>
											<B.Col sm={4}>lng: {warrior.lng}</B.Col>
										</B.Row>
								))
							}
						</B.FormGroup>
					</B.Panel>
					<B.Button onClick={this.handleMapRefresh}>Обновить карту</B.Button>
				</B.Col>
			</div>
		);
	}
}
