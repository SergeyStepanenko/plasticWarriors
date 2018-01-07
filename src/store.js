import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import reducer from './reducers/main';

export default createStore(
	combineReducers({ reducer }),
	{},
	applyMiddleware(createLogger())
);
