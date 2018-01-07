import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import * as reducers from './reducers/index';

const convertImmutableToPlain = (state) => {
	return Object.keys(state).reduce((acc, res) => {
		return {
			...acc,
			[res]: state[res].toJS()
		};
	}, {});
};

export default createStore(
	combineReducers({ ...reducers }),
	{},
	applyMiddleware(
		createLogger({
			collapsed: true,
			stateTransformer: state => convertImmutableToPlain(state),
		})
	)
);
