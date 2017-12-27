import React, { PureComponent } from 'react';
import * as firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';
import { isEqual } from 'lodash';

import {
	Modal,
	WarriorForm,
	Warriors,
	Stats,
	MapAddForm,
} from '_blocks';
import { premissionRequest } from './config/roles';
import resetSVG from 'assets/icons/spinner.svg';

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
const ICONRESIZESTEP = 2;
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
		expanded: {
			stats: localStorage.getItem('stats') === 'true',
			mapForm: localStorage.getItem('mapForm') === 'true',
			warriorForm: localStorage.getItem('warriorForm') === 'true',
		},
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
			const selectedMapId = localStorage.getItem('selectedMap') || '';
			const keys = Object.keys(data.units);
			const mappedWarriors = keys.map((key) => ({
				key,
				hidden: localStorage.getItem(key) === 'true',
				...data.units[key],
				...data.kidsTrackData[key],
			}));
			const imgParams = this.$image.getBoundingClientRect();
			const map = { ...data.maps[selectedMapId || '-L0AjXER8To8hYfZfuAw'] };

			this.setState({
				data,
				units: data.units,
				maps: data.maps,
				selectedMapId,
				mappedWarriors,
				keys,
				imgParams,
				map,
			}, () => {
				this.calculatePosition();
			});
		});

		window.addEventListener('resize', this.calculatePosition);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.calculatePosition);
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
		if (event) {
			event.preventDefault();
		}

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
			configRef.set(++counter);
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

	calculatePosition = () => {
		const imgParams = this.$image.getBoundingClientRect();
		const { map, mappedWarriors } = this.state;
		const Xscale = imgParams.width / (+map.east - +map.west);
		const Yscale = imgParams.height / (+map.north - +map.south);

		const positionedWarriors = mappedWarriors.map((warrior) => {
			const isInLngRange = +warrior.lng > +map.west && +warrior.lng < +map.east;
			const isInlatRange = +warrior.lat > +map.south && +warrior.lat < +map.north;

			return {
				...warrior,
				lngInPx: (warrior.lng - map.west) * Xscale,
				ltdInPx: (map.north - warrior.lat) * Yscale,
				isInRange: isInLngRange && isInlatRange,
			};
		});

		if (
			isEqual(this.state.positionedWarriors, positionedWarriors) &&
			isEqual(this.state.imgParams, imgParams)
		) {
			return false;
		}

		this.setState({
			positionedWarriors,
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
		if (!key) {
			return;
		}
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
		if (!data) {
			return;
		}
		mapsRef.push().set({ ...data });
	}

	handleMapSelect = (event) => {
		if (event) {
			event.preventDefault();
		}
		const mapId = event.target.value;
		const { maps } = this.state;
		const map = maps[mapId];

		this.setState({
			map,
			selectedMapId: mapId,
		}, () => localStorage.setItem('selectedMap', mapId));
	}

	handleColorPick = (color) => {
		if (!color) {
			return;
		}
		this.setState({
			form: {
				...this.state.form,
				color: color.hex,
			}
		});
	};

	editWarrior = ({ units, key }) => {
		if (!units || !key) {
			return;
		}

		this.setState({
			form: {
				name: units[key].name,
				url: units[key].url,
				color: units[key].color,
				key,
				type: 'edit',
			},
		}, () => {
			this.toggleCollapse('warriorForm');
		});
	}

	deleteWarrior = (key) => {
		if (!key) {
			return;
		}

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

		let size = iconSize;

		switch (flag) {
		case '+': size += ICONRESIZESTEP;
			break;
		case '-': size -= ICONRESIZESTEP;
			break;
		default:
			size = ICONSIZE;
		}

		this.setState({
			iconSize: size,
		});
	}

	toggleCollapse = (block) => {
		this.setState(prevState => ({
			expanded: {
				...this.state.expanded,
				[block]: !prevState.expanded[block],
			}
		}), () => {
			localStorage[block] = this.state.expanded[block];
		});
	}

	toggleHideWarrior = ({ key, value }) => {
		const { positionedWarriors } = this.state;

		if (!positionedWarriors.length) {
			return;
		}

		localStorage.setItem(key, !value);

		let clone = [ ...positionedWarriors ];
		const index = clone.findIndex(warrior => warrior.key === key);
		clone[index].hidden = !clone[index].hidden;

		this.setState({
			positionedWarriors: clone,
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
		const {
			authenticated,
			admin,
		} = this.state.authentication;

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
						<B.ButtonGroup className='app__header-button-group app__header-buttons'>
							<B.Button className='app__form-button-long' onClick={() => this.resize('+')}>+</B.Button>
							<B.Button onClick={this.resize}>
								<img className='app__header-reset-button' alt='reset' src={resetSVG}></img>
							</B.Button>
							<B.Button className='app__form-button-long' onClick={() => this.resize('-')}>-</B.Button>
						</B.ButtonGroup>
					</div>
					<B.FormControl
						className='app__header-select-map'
						componentClass='select'
						value={selectedMapId}
						onChange={this.handleMapSelect}
					>
						<MapsList maps={this.state.maps} selected={selectedMapId} />
					</B.FormControl>
					<div className='app__header-buttons'>
						<B.ButtonGroup>
							<B.Button onClick={this.signIn} disabled={authenticated}>Войти</B.Button>
							<B.Button onClick={this.signOut} disabled={!authenticated}>Выйти</B.Button>
							<B.Button onClick={this.refreshData}>Обновить карту</B.Button>
						</B.ButtonGroup>
					</div>
				</div>
				<B.Row>
					<div className='app__map' ref={(r) => { this.$image = r; }}	>
						<B.Image onLoad={this.calculatePosition} src={map.url} responsive />
					</div>
					<Warriors
						shift={SHIFTYAXIS}
						positionedWarriors={positionedWarriors}
						iconSize={iconSize}
					/>
				</B.Row>
				<B.Row>
					<B.Col>
						<Stats
							admin={admin}
							keys={keys}
							units={units}
							editWarrior={this.editWarrior}
							deleteWarrior={this.deleteWarrior}
							positionedWarriors={positionedWarriors}
							toggleCollapse={this.toggleCollapse}
							collapsed={this.state.expanded.stats}
							toggleHideWarrior={this.toggleHideWarrior}
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
						toggleCollapse={this.toggleCollapse}
						collapsed={this.state.expanded.warriorForm}
					/>
				</B.Row>
				<B.Row>
					<MapAddForm
						sendMapToFirebase={this.sendMapToFirebase}
						mapsData={maps}
						selectedMapId={selectedMapId}
						handleMapSelect={this.handleMapSelect}
						toggleCollapse={this.toggleCollapse}
						collapsed={this.state.expanded.mapForm}
					/>
				</B.Row>
			</div>
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
