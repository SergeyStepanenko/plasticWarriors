import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import main from './reducers/main';

const convertImmutableToPlain = (state) => {
	return Object.keys(state).reduce((acc, res) => {
		return {
			...acc,
			[res]: state[res].toJS()
		};
	}, {});
};

export default createStore(
	combineReducers({ main }),
	{},
	applyMiddleware(
		createLogger({
			collapsed: false,
			stateTransformer: state => convertImmutableToPlain(state),
		})
	)
);
