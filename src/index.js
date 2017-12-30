import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

import App from './app';
import { WarriorAddPage } from 'pages';
import './styles.css';

ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Route exact path='/' component={App}/>
			<Route path='/add' component={WarriorAddPage}/>
		</Switch>
	</BrowserRouter>,
	document.getElementById('root'));
registerServiceWorker();
