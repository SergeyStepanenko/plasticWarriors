import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';

import App from './app';
import { WarriorAddPage } from 'pages';
import store from './store';
import './styles.css';

const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const history = isStandalone ? createHashHistory() : createBrowserHistory();
const publicUrl = isStandalone ? '' : process.env.PUBLIC_URL; // eslint-disable-line

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Switch>
				<Route path={`${publicUrl}/`} exact component={App} />
				<Route path={`${publicUrl}/add`} exact component={WarriorAddPage} />
			</Switch>
		</Router>
	</Provider>,
	document.getElementById('root')
);
registerServiceWorker();
