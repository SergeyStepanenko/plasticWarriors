import * as firebase from 'firebase';

const config = {
	apiKey: 'AIzaSyCB1TfuGQegOrHOPcFJFqpxDmMTSElXQVg',
	authDomain: 'plastic-warriors.firebaseapp.com',
	databaseURL: 'https://plastic-warriors.firebaseio.com',
	projectId: 'plastic-warriors',
	storageBucket: '',
	messagingSenderId: '143541315246',
};


const initializedFirebase = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
firebase.auth().languageCode = 'ru';

export const provider = new firebase.auth.GoogleAuthProvider();
export const database = firebase.database();
export const mapsRef = database.ref('/maps');
export const rootRef = database.ref('/');
export const unitsRef = database.ref('/units');
export const configRef = database.ref('/config/counter');

export default initializedFirebase;
