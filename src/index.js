import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

import App from './app';
import { WarriorAddPage } from 'pages';
import './styles.css';

ReactDOM.render(
	// eslint-disable-next-line
	<BrowserRouter basename={process.env.PUBLIC_URL}>
		<Switch>
			<Route path='/' exact component={App} />
			<Route path='/add' exact component={WarriorAddPage} />
		</Switch>
	</BrowserRouter>,
	document.getElementById('root'));
registerServiceWorker();
