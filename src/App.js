import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';
import { CirclePicker } from 'react-color';

import mapImg from './maps/map_1.jpg';

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
			color: '',
		},
		firebaseData: {},
		mappedWarriors: [],
		geoData: {
			north: 55.6631224066095,
			south: 55.6537422837442,
			east: 37.6337206363678,
			west: 37.6171284914017,
		},
		positionedWarriors: [],
		isTrackingDataLoading: true,
	}

	componentDidMount() {
		rootRef.on('value', (snap) => {
			this.setState({
				firebaseData: snap.val()
			}, () => {
				this.setState({ isFirebaseDataLoading: false });
				this.requestAndHandleResponse();

				// this.interval = setInterval(() => {
				// 	console.log('request');
				// 	this.requestAndHandleResponse();
				// }, 30000);
			});
		});

		window.addEventListener('resize', this.handleWindowsResize);
	}

	componentWillUnmount() {
		clearInterval(this.interval);

		window.removeEventListener('resize', this.handleWindowsResize);
	}

	handleWindowsResize = () => {
		const imgParams = this.$image.getBoundingClientRect();
		this.paintWarriorsOnMap({ imgData: imgParams, warriors: this.state.mappedWarriors });

		this.setState({
			imgParams,
		});
	}

	sendDataToFirebase = (warrior) => {
		firebase.database().ref('/').push().set({
			name: warrior.name,
			url: warrior.url
		});
	}

	requestData = ({ url, ...rest }) => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const wrappedUrl = `${CORS}${url}&mode=poll`;

			xhr.open('GET', wrappedUrl, true);
			xhr.onload = function x() {
				if (this.status === 200) {
					resolve({
						...JSON.parse(this.response).payload[0].data,
						...rest,
						url,
					});
				} else {
					const error = new Error(this.statusText);
					error.code = this.status;
					reject({
						...rest,
						url,
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

	requestKidsTrackData = async (firebaseData) => {
		const keys = Object.keys(firebaseData);
		const promises = [
			...keys.map(key => this.requestData({ ...firebaseData[key] }))
		];
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

	handleColorPick = (color) => {
		this.setState({
			form: {
				...this.state.form,
				color: color.hex,
			}
		});
	};

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
				color: ''
			}
		});
	}

	paintWarriorsOnMap = ({ imgData, warriors }) => {
		const { geoData } = this.state;
		const Xscale = imgData.width / (geoData.east - geoData.west); // количество пикселей в одном градусе долготы (3093/0,0166=186325)
		const Yscale = imgData.height / (geoData.north - geoData.south);  // количество пикселей в одном градусе широты (3093/0,00938=329744)

		const positionedWarriors = warriors.map((warrior) => {
			return {
				...warrior,
				lngInPx: (warrior.lng - geoData.west) * Xscale,
				ltdInPx: (geoData.north - warrior.lat) * Yscale,
			};
		});

		this.setState({
			positionedWarriors,
		});
	}

	requestAndHandleResponse = () => {
		this.setState({
			imgParams: this.$image.getBoundingClientRect(),
			isTrackingDataLoading: true,
		}, async () => {
			await this.requestKidsTrackData(this.state.firebaseData);
			this.setState({ isTrackingDataLoading: false });
			this.paintWarriorsOnMap({ imgData: this.state.imgParams, warriors: this.state.mappedWarriors });
		});
	}

	render() {
		const {
			mappedWarriors,
			firebaseData,
			form,
			positionedWarriors,
			isTrackingDataLoading,
			// isFirebaseDataLoading,
		} = this.state;

		const isFormCompleted = !!~Object.values(form).indexOf('');

		return (
			<div>
				<B.Col xs={8} md={8}>
					<div style={{ position: 'absolute' }} ref={(r) => { this.$image = r; }}>
						<B.Image
							src={mapImg}
							responsive
						/>
					</div>
					{
						positionedWarriors.map((warrior) => {
							const iconWidth = 15;
							const iconHeight = 15;
							const shiftOnMap = `translate(${warrior.lngInPx - iconWidth / 2}px, ${warrior.ltdInPx - iconHeight / 2}px)`;
							const style = {
								position: 'relative',
								width: `${iconWidth}px`,
								height: `${iconHeight}px`,
								transform: shiftOnMap,
							};

							const tooltip = (
								<B.Tooltip id="tooltip">
									<p>{`Имя: ${warrior.name}`}</p>
									<p>{`Уровень заряда: ${warrior.batteryLvl}`}</p>
									<p>{`Acc: ${warrior.acc}`}</p>
									<p>{`Sleep: ${warrior.sleep}`}</p>
								</B.Tooltip>
							);

							return (
								<div key={`${warrior.name} ${warrior.key}`}>
									<B.OverlayTrigger id={warrior.key} overlay={tooltip}>
										<div style={style}>
											<PinSVG color={warrior.color} />
										</div>
									</B.OverlayTrigger>
								</div>
							);
						})
					}
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
									<B.ControlLabel style={{ marginBottom: '10px' }}>Цвет метки на карте</B.ControlLabel>
									<CirclePicker
										onChangeComplete={this.handleColorPick}
										color={this.state.form.color}
									/>
								</B.Col>
							</B.FormGroup>

							<B.FormGroup>
								<B.Col sm={12}>
									<B.Button
										type="submit"
										onClick={this.handleSubmit}
										disabled={isFormCompleted}
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
											<B.Col sm={2}>
												<PinSVG
													color={firebaseData[key].color}
													width='15px'
													height='15px'
												/>
											</B.Col>
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
										<B.Row key={warrior.lat + warrior.lng + warrior.battery_lvl}>
											<B.Col sm={4}>{warrior.name}</B.Col>
											<B.Col sm={4}>lat: {warrior.lat}</B.Col>
											<B.Col sm={4}>lng: {warrior.lng}</B.Col>
										</B.Row>
								))
							}
						</B.FormGroup>
					</B.Panel>
					<B.Button
						onClick={this.requestAndHandleResponse}
						disabled={isTrackingDataLoading}
					>
						{isTrackingDataLoading ? 'Обновляется' : 'Обновить карту'}
					</B.Button>
				</B.Col>
			</div>
		);
	}
}

export function PinSVG({ width = '100%', height = '100%', color }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 426.667 426.667" width={width} height={height}>
			<g>
				<path d="M213.333,106.667c-58.88,0-106.667,47.787-106.667,106.667S154.453,320,213.333,320S320,272.213,320,213.333     S272.213,106.667,213.333,106.667z" fill={color}/>
				<path d="M213.333,0C95.467,0,0,95.467,0,213.333s95.467,213.333,213.333,213.333S426.667,331.2,426.667,213.333     S331.2,0,213.333,0z M213.333,384c-94.293,0-170.667-76.373-170.667-170.667S119.04,42.667,213.333,42.667     S384,119.04,384,213.333S307.627,384,213.333,384z" fill={color}/>
			</g>
		</svg>
	);
}

PinSVG.propTypes = {
	width: PropTypes.string,
	height: PropTypes.string,
	color: PropTypes.string,
};
