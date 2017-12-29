import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
} from 'react-router-dom';
import './styles.css';
import App from './app';
import registerServiceWorker from './registerServiceWorker';

import { WarriorAddPage } from 'pages';

ReactDOM.render(
	<Router>
		<div>
			<Route exact path="/" component={App}/>
			<Route path="/add" component={WarriorAddPage}/>
		</div>
	</Router>,
	document.getElementById('root'));
registerServiceWorker();
