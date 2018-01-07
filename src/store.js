import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import main from './reducers/main';

export default createStore(
	combineReducers({ main }),
	{},
	applyMiddleware(
		createLogger({
			collapsed: false,
			stateTransformer: state => ({ ...state.main.toJS() })
		})
	)
);
