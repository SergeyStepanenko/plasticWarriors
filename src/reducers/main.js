import { Map } from 'immutable';

const initalState = Map({
	a: 1,
});

export const testAction = () =>
	({
		type: 'TEST',
		payload: 'TEST PAYLOAD'
	});

const main = (state = initalState, action) => {
	switch (action.type) {
	case 'TEST':
		return state.set('b', 2);
	default:
		return state;
	}
};

export default main;
