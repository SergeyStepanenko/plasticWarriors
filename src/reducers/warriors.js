import { Map, fromJS } from 'immutable';

const initalState = Map({
	data: {},
	positionedWarriors: [],
});

export const handleFirebaseDataReceival = ({ data, imgParams }) => ({
	type: 'WEBSOCETS_DATA_RECEIVED',
	payload: { data, imgParams }
});

const warriors = (state = initalState, action) => {
	switch (action.type) {
	case 'WEBSOCETS_DATA_RECEIVED':
		return state
			.set('data', fromJS(action.payload.data))
			.set('imgParams', fromJS(action.payload.imgParams));
	default:
		return state;
	}
};

export default warriors;
