import { connect } from 'react-redux';
import Template from './template';
import * as actions from 'reducers/warriors';
import { isEmpty } from 'lodash';

const calculatePosition = ({ map, mappedWarriors, imgParams }) => {
	const Xscale = imgParams.width / (+map.east - +map.west);
	const Yscale = imgParams.height / (+map.north - +map.south);

	const positionedWarriors = mappedWarriors.map((warrior) => {
		const isInLngRange = +warrior.lng > +map.west && +warrior.lng < +map.east;
		const isInlatRange = +warrior.lat > +map.south && +warrior.lat < +map.north;

		return {
			...warrior,
			lngInPx: (warrior.lng - map.west) * Xscale,
			ltdInPx: (map.north - warrior.lat) * Yscale,
			isInRange: isInLngRange && isInlatRange,
		};
	});

	return ({
		positionedWarriors,
		imgParams,
	});
};

const prepareDataForProps = ({ data, imgParams }) => {
	if (isEmpty(data)) {
		return {};
	}
	const selectedMapId = localStorage.getItem('selectedMap') || '';
	const keys = Object.keys(data.units);
	const mappedWarriors = keys.map((key) => ({
		key,
		hidden: localStorage.getItem(key) === 'true',
		...data.units[key],
		...data.kidsTrackData[key],
	}));
	const map = { ...data.maps[selectedMapId || '-L0AjXER8To8hYfZfuAw'] };

	const { positionedWarriors } = calculatePosition({ map, mappedWarriors, imgParams });

	return ({
		selectedMapId,
		keys,
		mappedWarriors,
		map,
		imgParams,
		positionedWarriors,
	});
};

export default connect(
	reducers => prepareDataForProps(reducers.warriors.toJS()),
	{ ...actions },
)(Template);
