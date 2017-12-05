import React, { PureComponent } from 'react';
import * as firebase from 'firebase';

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

export default class Map extends PureComponent {
	state = {
		form: {
			name: '',
			url: '',
		},
		mappedWarriors: [],
		firebaseData: {},
	}

	componentDidMount() {
		rootRef.on('value', (snap) => {
			this.setState({
				firebaseData: snap.val()
			}, () => {
				this.handleFirebaseResponse(this.state.firebaseData).then(mappedWarriors => {
					this.setState({ mappedWarriors });
				});
			});
		});
	}

	sendDataToFirebase = (warrior) => {
		firebase.database().ref('/').push().set({
			name: warrior.name,
			url: warrior.url
		});
	}

	requestDataFromKidsTrack = (url, assignedName) => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', `${CORS}${url}&mode=poll`, true);
			xhr.onload = function x() {
				if (this.status === 200) {
					resolve({
						...JSON.parse(this.response),
						name: assignedName
					});
				} else {
					const error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};
			xhr.send();
			xhr.onerror = () => reject(new Error('oops'));
		});
	};

	handleFirebaseResponse = async (data) => {
		const { firebaseData } = this.state;
		const keys = Object.keys(data);
		const promises = [ ...keys.map(key => this.requestDataFromKidsTrack(firebaseData[key].url, firebaseData[key].name)) ];
		const mappedWarriors = await Promise.all(promises);

		this.setState({
			mappedWarriors
		});

		return Promise.resolve(mappedWarriors);
	};

	handleChange = (form, event) => {
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
			name: this.state.form.name,
			url: this.state.form.url,
		});

		this.setState({
			form: {
				name: '',
				url: ''
			}
		});
	}

	render() {
		const { mappedWarriors } = this.state;

		return(
			<div>
				<div>
					<input
						placeholder='Имя'
						onChange={(event) => this.handleChange('name', event)}
						value={this.state.form.name}
					/>
					<input
						placeholder='Ссылка из trackKids'
						onChange={(event) => this.handleChange('url', event)}
						value={this.state.form.url}
					/>
					<button
						onClick={this.handleSubmit}
						disabled={this.state.name === '' || this.state.url === ''}
					>
						Добавить
					</button>
				</div>
				<div>
					<strong>Данные геопозиции:</strong>
					{
						mappedWarriors && mappedWarriors.map(value => (
							<div key={`${value.lat}_${value.lng}`}>
								<span>{value.name}  </span>
								<span>lat: {value.lat}&</span>
								<span>lng: {value.lng}</span>
							</div>
						))
					}
				</div>
				<div>
					<strong>Пластиковые воины:</strong>
					{
						Object.keys(this.state.firebaseData).map((value) => (
							<div key={value}>
								<small>{this.state.firebaseData[value].name}</small>
							</div>
						))
					}
				</div>
			</div>
		);
	}
}
