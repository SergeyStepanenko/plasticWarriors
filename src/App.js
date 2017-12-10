import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';

import { requestData, Promise_all } from './helpers';
import mapImg from './maps/map_1.jpg';
import {
	Modal,
	WarriorForm,
	PinSVG,
} from './_blocks';

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
			key: null,
			type: 'add',
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
		modal: {
			type: '',
		},
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

	handleSubmit = (key) => {
		this.sendDataToFirebase({
			key,
			name: this.state.form.name.trim(),
			url: this.state.form.url.trim(),
			color: this.state.form.color,
		});

		this.resetForm();
	}

	resetForm = () => {
		this.setState({
			form: {
				name: '',
				url: '',
				color: '',
				key: null,
				type: 'add',
			},
		});
	}

	handleWindowsResize = () => {
		const imgParams = this.$image.getBoundingClientRect();
		this.paintWarriorsOnMap({ imgData: imgParams, warriors: this.state.mappedWarriors });

		this.setState({
			imgParams,
		});
	}

	sendDataToFirebase = ({ key, name, url, color }) => {
		const postData = {
			name,
			url,
			color,
		};

		if (!key) {
			firebase.database().ref('/').push().set(postData);
		} else {
			const updates = {};
			updates[key] = postData;

			firebase.database().ref().update(updates);
		}

	}

	deleteDataFromFirebase = (key) => {
		firebase.database().ref(`/${key}`).remove();
	}

	requestKidsTrackData = async (firebaseData) => {
		const keys = Object.keys(firebaseData);
		const promises = [
			...keys.map(key => requestData({ CORS, ...firebaseData[key] }))
		];
		const mappedWarriors = await Promise_all(promises);

		this.setState({
			mappedWarriors,
			keys
		}, () => {
			return Promise.resolve(mappedWarriors);
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

	handleColorPick = (color) => {
		this.setState({
			form: {
				...this.state.form,
				color: color.hex,
			}
		});
	};

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

	editWarrior = ({ firebaseData, key }) => {
		this.setState({
			form: {
				name: firebaseData[key].name,
				url: firebaseData[key].url,
				color: firebaseData[key].color,
				key,
				type: 'edit',
			},
		});
	}

	deleteWarrior = (key) => {
		this.setState({
			modal: {
				...this.state.modal,
				type: 'delete',
				show: true,
				key,
				action: this.deleteDataFromFirebase,
			}
		});
	}

	modalHide = () => {
		this.setState({
			modal: {
				show: false,
			}
		});
	}

	render() {
		const {
			mappedWarriors,
			firebaseData,
			form,
			positionedWarriors,
			isTrackingDataLoading,
			modal,
			// isFirebaseDataLoading,
		} = this.state;


		return (
			<div>
				<Modal
					config={modal}
					show={modal.show}
					onHide={this.modalHide}
				/>
				<B.Col xs={8} md={8}>
					<div
						style={{ position: 'absolute' }}
						ref={(r) => { this.$image = r; }}
					>
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
							const pinStyles = {
								position: 'relative',
								width: `${iconWidth}px`,
								height: `${iconHeight}px`,
								transform: shiftOnMap,
							};

							const tooltipStyles = {
								display: 'flex',
								flexFlow: 'column',
							};

							const tooltip = (
								<B.Tooltip id="tooltip" style={tooltipStyles}>
									<div>{`Имя: ${warrior.name}`}</div>
									<div>{`Уровень заряда: ${warrior.batteryLvl}`}</div>
									<div>{`Acc: ${warrior.acc}`}</div>
									<div>{`Sleep: ${warrior.sleep}`}</div>
								</B.Tooltip>
							);

							return (
								<div key={`${warrior.name} ${warrior.key}`}>
									<B.OverlayTrigger id={warrior.key} overlay={tooltip}>
										<div style={pinStyles}>
											<PinSVG color={warrior.color} />
										</div>
									</B.OverlayTrigger>
								</div>
							);
						})
					}
				</B.Col>
				<B.Col xs={4} md={4}>
					<WarriorForm
						form={form}
						handleFormChange={this.handleFormChange}
						handleSubmit={this.handleSubmit}
						handleColorPick={this.handleColorPick}
						handleFormReset={this.resetForm}
					/>
					<B.Panel header={'Пластиковые воины:'} bsStyle="primary">
						<B.FormGroup>
							{
								Object.keys(firebaseData).map((key) => {
									return(
										<B.Row key={key}>
											<B.Col sm={3}>{firebaseData[key].name}</B.Col>
											<B.Col sm={1}>
												<PinSVG
													color={firebaseData[key].color}
													width='15px'
													height='15px'
												/>
											</B.Col>
											<B.Col sm={3}>
												<B.Button onClick={() => this.editWarrior({ firebaseData, key })}>
													Изменить
												</B.Button>
											</B.Col>
											<B.Col sm={3}>
												<B.Button onClick={() => this.deleteWarrior(key)}>
													Удалить
												</B.Button>
											</B.Col>
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
										<B.Row key={warrior.lat + warrior.lng}>
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
