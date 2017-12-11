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
	Warriors,
	Panel,
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

				this.interval = setInterval(() => {
					this.requestAndHandleResponse();
				}, 30000);
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
			...keys.map(key => requestData({ CORS, key, ...firebaseData[key] }))
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
			const isInLngRange = warrior.lng > geoData.west && warrior.lng < geoData.east;
			const isInlatRange = warrior.lat > geoData.south && warrior.lat < geoData.north;

			return {
				...warrior,
				lngInPx: (warrior.lng - geoData.west) * Xscale,
				ltdInPx: (geoData.north - warrior.lat) * Yscale,
				isInRange: isInLngRange && isInlatRange,
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
				<B.Row>
					<B.Col md={3}>
						<WarriorForm
							form={form}
							handleFormChange={this.handleFormChange}
							handleSubmit={this.handleSubmit}
							handleColorPick={this.handleColorPick}
							handleFormReset={this.resetForm}
						/>
					</B.Col>
					<B.Col md={4}>
						<Panel firebaseData={firebaseData}/>
					</B.Col>
					<B.Col md={4}>
						<B.Panel header={'Данные геопозиции:'} bsStyle="primary">
							<B.FormGroup>
								{
									positionedWarriors && positionedWarriors.map(warrior => (
										!warrior.error &&
											<B.Row key={warrior.key || Math.random()}>
												<B.Col sm={2}>{warrior.name}</B.Col>
												<B.Col sm={3}>
													<PinSVG
														color={warrior.color}
														width='15px'
														height='15px'
													/>
												</B.Col>
												<B.Col sm={3}>
													<p>lat: {warrior.lat}</p>
													<p>lng: {warrior.lng}</p>
												</B.Col>
												<B.Col sm={3}>{`На карте? ${warrior.isInRange}`}</B.Col>
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
				</B.Row>
				<B.Row>
					<div
						style={{ position: 'absolute' }}
						ref={(r) => { this.$image = r; }}
					>
						<B.Image
							src={mapImg}
							responsive
						/>
					</div>
					<Warriors positionedWarriors={positionedWarriors}/>
				</B.Row>
			</div>
		);
	}
}
