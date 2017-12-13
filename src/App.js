import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';

import { requestData, Promise_all } from './helpers';
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
const rootRef = database.ref('/');
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
		units: {},
		mappedWarriors: [],
		positionedWarriors: [],
		map: {
			name: 'Москва',
			url: 'https://preview.ibb.co/ksLtAG/123.jpg',
			north: 55.9237682742173,
			south: 55.5634952742938,
			east: 37.8509902954102,
			west: 37.3441600799561,
		},
		isTrackingDataLoading: true,
		modal: {
			type: '',
		},
		imgParams: {
			height: 0,
		},
	}

	componentDidMount() {
		rootRef.on('value', (snap) => {
			const data = snap.val();

			this.setState({
				units: data.units,
				maps: data.maps,
			}, () => {
				this.setState({ areUnitsLoading: false });
				this.requestAndHandleResponse();

				// this.interval = setInterval(() => {
				// 	this.requestAndHandleResponse();
				// }, 120000);
			});
		});

		window.addEventListener('resize', this.recalculatePosition);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		window.removeEventListener('resize', this.recalculatePosition);
	}

	handleSubmit = (key) => {
		this.sendUnitToFirebase({
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

	recalculatePosition = () => {
		const imgParams = this.$image.getBoundingClientRect();
		this.paintWarriorsOnMap({ imgData: imgParams, warriors: this.state.mappedWarriors });

		this.setState({
			imgParams,
		});
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

	deleteUnitFromFirebase = (key) => {
		database.ref(`/units/${key}`).remove();
	}

	requestKidsTrackData = async (units) => {
		const keys = Object.keys(units);
		const promises = [
			...keys.map(key => requestData({ CORS, key, ...units[key] }))
		];
		const mappedWarriors = await Promise_all(promises);

		this.setState({
			mappedWarriors,
			keys
		}, () => {
			this.recalculatePosition();
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

	sendMapToFirebase = (data) => {
		mapsRef.push().set({ ...data });
	}

	handleMapSelect = (event) => {
		const mapId = event.target.value;
		const { maps } = this.state;
		const map = maps[mapId];

		this.setState({ map }, () => {
			setTimeout(() => {
				this.recalculatePosition();
			}, 500);
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
		const { map } = this.state;
		const Xscale = imgData.width / (+map.east - +map.west); // количество пикселей в одном градусе долготы (3093/0,0166=186325)
		const Yscale = imgData.height / (+map.north - +map.south);  // количество пикселей в одном градусе широты (3093/0,00938=329744)

		const positionedWarriors = warriors.map((warrior) => {
			const isInLngRange = +warrior.lng > +map.west && +warrior.lng < +map.east;
			const isInlatRange = +warrior.lat > +map.south && +warrior.lat < +map.north;

			return {
				...warrior,
				lngInPx: (warrior.lng - map.west) * Xscale,
				ltdInPx: (map.north - warrior.lat) * Yscale,
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
			await this.requestKidsTrackData(this.state.units);
			this.setState({ isTrackingDataLoading: false });
		});
	}

	editWarrior = ({ units, key }) => {
		this.setState({
			form: {
				name: units[key].name,
				url: units[key].url,
				color: units[key].color,
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
				action: this.deleteUnitFromFirebase,
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
			units,
			form,
			positionedWarriors,
			isTrackingDataLoading,
			modal,
			keys,
			maps,
			map,
		} = this.state;

		const shiftYaxis = '40px';

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
				<B.Panel style={{ height: shiftYaxis }} className='app__header' header={'Юнит-трекер'} bsStyle="primary"/>
				<B.Row>
					<div className='app__map' ref={(r) => { this.$image = r; }}	>
						<B.Image
							src={map.url}
							responsive
						/>
					</div>
					<Warriors
						shift={shiftYaxis}
						positionedWarriors={positionedWarriors}
					/>
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
					<MapAddForm
						sendMapToFirebase={this.sendMapToFirebase}
						mapsData={maps}
						handleMapSelect={this.handleMapSelect}
					/>
				</B.Row>
				<B.Row>
					<B.Col>
						<Panel
							keys={keys}
							units={units}
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
