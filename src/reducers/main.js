import { Map } from 'immutable';

import {
	ICONSIZE,
	ICONRESIZESTEP,
} from 'constants/index';

const initalState = Map({
	iconSize: ICONSIZE,
});

export const enlargePinSize = () => ({ type: 'ENLAGE_PIN_SIZE' });
export const reducePinSize = () => ({ type: 'REDUCE_PIN_SIZE' });
export const resetPinSize = () => ({ type: 'RESET_PIN_SIZE' });

const main = (state = initalState, action) => {
	switch (action.type) {
	case 'ENLAGE_PIN_SIZE':
		return state.set('iconSize', state.get('iconSize') + ICONRESIZESTEP);
	case 'REDUCE_PIN_SIZE':
		return state.set('iconSize', state.get('iconSize') - ICONRESIZESTEP);
	case 'RESET_PIN_SIZE':
		return state.set('iconSize', ICONSIZE);
	default:
		return state;
	}
};

export default main;
