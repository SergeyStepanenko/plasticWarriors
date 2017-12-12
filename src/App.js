import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';

import { requestData, Promise_all } from './helpers';
// import mapImg from './maps/map_1.jpg';
import mapMoscow from './maps/moscow.jpg';
import {
	Modal,
	WarriorForm,
	Warriors,
	Panel,
	MapAddForm,
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
const unitsRef = database.ref('/units');
const mapsRef = database.ref('/maps');

const formInitialState = {
	name: '',
	url: '',
	color: '',
	key: null,
	type: 'add',
};

export default class App extends PureComponent {
	state = {
		form: formInitialState,
		firebaseData: {},
		mappedWarriors: [],
		mapUrl: 'https://preview.ibb.co/eJ8z0G/map_1_7a9f92a2.jpg',
		geoData: {
			north: 55.9237682742173,
			south: 55.5634952742938,
			east: 37.8509902954102,
			west: 37.3441600799561,
		},
		positionedWarriors: [],
		isTrackingDataLoading: true,
		modal: {
			type: '',
		},
		imgParams: {
			height: 0,
		},
	}

	componentDidMount() {
		unitsRef.on('value', (snap) => {
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
			form: formInitialState,
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
			unitsRef.push().set(postData);
		} else {
			const updates = {};
			updates[key] = postData;

			unitsRef.update(updates);
		}

	}

	deleteDataFromFirebase = (key) => {
		database.ref(`/units/${key}`).remove();
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

	handleMapUpdate = ({ mapName, mapUrl, north, east, south, west }) => {
		const postData = {
			mapName, mapUrl, north, east, south, west,
		};

		this.setState({
			mapName,
			mapUrl,
			geoData: {
				north,
				east,
				south,
				west,
			}
		});

		mapsRef.push().set(postData);
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
			},
			form: formInitialState,
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
			keys,
			// mapUrl,
		} = this.state;

		return (
			<div>
				{
					modal.show &&
						<Modal
							config={modal}
							show
							onHide={this.modalHide}
						/>
				}
				<B.Row>
					<div className='app__map' ref={(r) => { this.$image = r; }}	>
						<B.Image
							src={mapMoscow /* mapImg */}
							responsive
						/>
					</div>
					<div className='app__warriors'>
						<Warriors positionedWarriors={positionedWarriors}/>
					</div>
				</B.Row>
				<B.Row>
					<WarriorForm
						form={form}
						handleFormChange={this.handleFormChange}
						handleSubmit={this.handleSubmit}
						handleColorPick={this.handleColorPick}
						handleFormReset={this.resetForm}
					/>
				</B.Row>
				<B.Row>
					<MapAddForm handleMapUpdate={this.handleMapUpdate} />
				</B.Row>
				<B.Row>
					<B.Col>
						<Panel
							keys={keys}
							firebaseData={firebaseData}
							editWarrior={this.editWarrior}
							deleteWarrior={this.deleteWarrior}
							positionedWarriors={positionedWarriors}
						/>
					</B.Col>
				</B.Row>
				<B.Row>
					<B.Col>
						<B.Button
							onClick={this.requestAndHandleResponse}
							disabled={isTrackingDataLoading}
						>
							{isTrackingDataLoading ? 'Обновляется' : 'Обновить карту'}
						</B.Button>
					</B.Col>
				</B.Row>
			</div>
		);
	}
}
