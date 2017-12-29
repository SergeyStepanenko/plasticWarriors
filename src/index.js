import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

import App from './app';
import { WarriorAddPage } from 'pages';
import './styles.css';

ReactDOM.render(
	<BrowserRouter>
		<div>
			<Route exact path="/" component={App}/>
			<Route path="/addUnit" component={WarriorAddPage}/>
		</div>
	</BrowserRouter>,
	document.getElementById('root'));
registerServiceWorker();
