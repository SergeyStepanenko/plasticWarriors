import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';
import {
	Modal,
	WarriorForm,
	Warriors,
	Panel,
	MapAddForm,
} from './_blocks';
import { premissionRequest } from './config/roles';
const config = {
	apiKey: 'AIzaSyCB1TfuGQegOrHOPcFJFqpxDmMTSElXQVg',
	authDomain: 'plastic-warriors.firebaseapp.com',
	databaseURL: 'https://plastic-warriors.firebaseio.com',
	projectId: 'plastic-warriors',
	storageBucket: '',
	messagingSenderId: '143541315246',
};

firebase.initializeApp(config);
firebase.auth().languageCode = 'ru';

const provider = new firebase.auth.GoogleAuthProvider();
const ICONSIZE = 15;
const SHIFTYAXIS = '40px';
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
		authentication: {
			authenticated: false,
		},
		form: formInitialState,
		units: {},
		mappedWarriors: [],
		positionedWarriors: [],
		map: {
			name: '',
			url: '',
			north: 0,
			south: 0,
			east: 0,
			west: 0,
		},
		selectedMapId: '',
		isTrackingDataLoading: true,
		modal: {
			type: '',
		},
		imgParams: {
			height: 0,
		},
		iconSize: ICONSIZE,
	}

	componentWillMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				const {
					displayName,
					email,
					emailVerified,
					photoURL,
					uid,
					phoneNumber,
					providerData,
				} = user;

				user.getIdToken().then((accessToken) => {
					this.setState({
						authentication: {
							admin: premissionRequest(email),
							authenticated: true,
							displayName,
							email,
							emailVerified,
							photoURL,
							uid,
							phoneNumber,
							providerData,
							accessToken,
						}
					});
				});
			} else {
				console.log('Signed out'); // eslint-disable-line
			}
		}, (error) => {
			console.log(error); // eslint-disable-line
		});
	}

	componentDidMount() {
		rootRef.on('value', (snap) => {
			const data = snap.val();

			const selectedMapId = localStorage.getItem('selectedMap');
			const keys = Object.keys(data.units);

			const mappedWarriors = keys.map((key) => {
				return {
					key,
					...data.units[key],
					...data.kidsTrackData[key],
				};
			});

			const imgParams = this.$image.getBoundingClientRect();

			this.setState({
				units: data.units,
				maps: data.maps,
				selectedMapId,
				mappedWarriors,
				keys,
				imgParams,
				map: {
					...data.maps[selectedMapId || '-L0AjXER8To8hYfZfuAw'],
				}
			}, () => {
				setTimeout(() => this.recalculatePosition(), 1500);
			});
		});

		window.addEventListener('resize', this.recalculatePosition);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		window.removeEventListener('resize', this.recalculatePosition);
	}

	signIn = (event) => {
		if (event) {
			event.preventDefault();
		}

		firebase.auth().signInWithRedirect(provider);

		firebase.auth().getRedirectResult().then((result) => {
			this.setState({
				authentication: {
					authenticated: true,
					...result,
				}
			});

		}).catch((error) => {
			this.setState({
				authentication: {
					authenticated: false,
					...error,
				}
			});
		});
	}

	signOut = (event) => {
		event.preventDefault();
		firebase.auth().signOut().then(() => {
			this.setState({
				authentication: {
					admin: false,
					authenticated: false,
				}
			});
			console.log('Sign-out successful') // eslint-disable-line
		}).catch((error) => {
			console.log('An error happened', error) // eslint-disable-line
		});
	}

	refreshData = () => {
		const configRef = database.ref('/config/counter');
		configRef.once('value').then((snap) => {
			let counter = snap.val();
			counter = counter += 1;
			configRef.set(counter);
		});
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

		this.setState({
			map,
			selectedMapId: mapId,
		}, () => {
			setTimeout(() => {
				this.recalculatePosition();
			}, 500);

			localStorage.setItem('selectedMap', mapId);
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
		const Xscale = imgData.width / (+map.east - +map.west);
		const Yscale = imgData.height / (+map.north - +map.south);

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

	resize = (flag) => {
		const { iconSize } = this.state;
		const step = 2;
		let size = iconSize;

		switch (flag) {
		case '+': size += step;
			break;
		case '-': size -= step;
			break;
		default:
			size = ICONSIZE;
		}

		this.setState({
			iconSize: size,
		});
	}

	render() {
		const {
			units,
			form,
			positionedWarriors,
			modal,
			keys,
			maps,
			map,
			selectedMapId,
			iconSize,
		} = this.state;
		const { authenticated, admin } = this.state.authentication;

		return (
			<div className='app'>
				<Modal
					config={modal}
					show={modal.show}
					onHide={this.modalHide}
				/>
				<div style={{ height: SHIFTYAXIS }} className='app__header'>
					<div className='app__header-lable'>
						Трекер
						<B.Button onClick={() => this.resize('+')}>+</B.Button>
						<B.Button onClick={this.resize}>0</B.Button>
						<B.Button onClick={() => this.resize('-')}>-</B.Button>
					</div>
					<div className='app__header-buttons'>
						<B.Button onClick={this.signIn} disabled={authenticated}>Войти</B.Button>
						<B.Button onClick={this.signOut} disabled={!authenticated}>Выйти</B.Button>
						<B.Button onClick={this.refreshData}>Обновить карту</B.Button>
					</div>
				</div>
				<B.Row>
					<div className='app__map' ref={(r) => { this.$image = r; }}	>
						<B.Image src={map.url} responsive />
					</div>
					<Warriors
						shift={SHIFTYAXIS}
						positionedWarriors={positionedWarriors}
						iconSize={iconSize}
					/>
				</B.Row>
				<B.Row>
					<B.Col>
						<Panel
							admin={admin}
							keys={keys}
							units={units}
							editWarrior={this.editWarrior}
							deleteWarrior={this.deleteWarrior}
							positionedWarriors={positionedWarriors}
						/>
					</B.Col>
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
						selectedMapId={selectedMapId}
						handleMapSelect={this.handleMapSelect}
					/>
				</B.Row>
			</div>
		);
	}
}
