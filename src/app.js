import React, { PureComponent } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as B from 'react-bootstrap';
import { isEqual } from 'lodash';

import firebase, { provider, database, rootRef, mapsRef, configRef } from 'config/firebase';
import {
	Modal,
	WarriorForm,
	Warriors,
	Stats,
	MapAddForm,
	Header,
} from '_blocks';
import { premissionRequest } from 'config/roles';
import {
	ICONSIZE,
	ICONRESIZESTEP,
	SHIFTYAXIS,
} from 'constants/index';

export default class App extends PureComponent {
	state = {
		authentication: {
			authenticated: false,
		},
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
		maps: {},
		selectedMapId: '',
		isTrackingDataLoading: true,
		modal: {
			type: '',
		},
		form: null,
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
		configRef.once('value').then((snap) => {
			let counter = snap.val();
			configRef.set(++counter);
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

		setTimeout(() => {
			this.setState({
				positionedWarriors,
				imgParams,
			});
		}, 1000);
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
			if (this.state.expanded.warriorForm) {
				this.toggleCollapse('warriorForm');
			}
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
				itemName: this.state.units[key].name,
				action: this.deleteUnitFromFirebase,
			},
		});
	}

	modalHide = () => {
		this.setState({
			modal: {
				show: false,
			}
		});
	}

	deleteUnitFromFirebase = (key) => {
		if (!key) {
			return;
		}
		database.ref(`/units/${key}`).remove();
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

	clearState = (value) => this.setState({ [value]: null });

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

		const modalConditional = (modal.show) ? (
			<Modal
				data={modal}
				show={modal.show}
				onHide={this.modalHide}
			/>) : null;

		return (
			<div className='app'>
				{modalConditional}
				<Header
					selectedMapId={selectedMapId}
					authenticated={authenticated}
					maps={maps}
					resize={this.resize}
					signIn={this.signIn}
					signOut={this.signOut}
					refreshData={this.refreshData}
					handleMapSelect={this.handleMapSelect}
				/>
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
						editWarrior={this.editWarrior}
						toggleCollapse={this.toggleCollapse}
						collapsed={this.state.expanded.warriorForm}
						clearState={this.clearState}
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
