import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

import resetSVG from 'assets/icons/spinner.svg';
import { SHIFTYAXIS } from 'constants/index';

export default class Header extends PureComponent {
	static propTypes = {
		selectedMapId: PropTypes.string.isRequired,
		authenticated: PropTypes.bool.isRequired,
		maps: PropTypes.object.isRequired,
		resize: PropTypes.func.isRequired,
		signIn: PropTypes.func.isRequired,
		signOut: PropTypes.func.isRequired,
		refreshData: PropTypes.func.isRequired,
		handleMapSelect: PropTypes.func.isRequired,
	}

	render() {
		const {
			selectedMapId,
			authenticated,
			maps,
			resize,
			signIn,
			signOut,
			refreshData,
			handleMapSelect,
		} = this.props;

		return (
			<div style={{ height: SHIFTYAXIS }} className='app__header'>
				<div className='app__header-lable'>
					Трекер
					<B.ButtonGroup className='app__header-button-group app__header-buttons'>
						<B.Button className='app__form-button-long' onClick={() => resize('+')}>+</B.Button>
						<B.Button onClick={resize}>
							<img className='app__header-reset-button' alt='reset' src={resetSVG}></img>
						</B.Button>
						<B.Button className='app__form-button-long' onClick={() => resize('-')}>-</B.Button>
					</B.ButtonGroup>
				</div>
				<B.FormControl
					className='app__header-select-map'
					componentClass='select'
					value={selectedMapId}
					onChange={handleMapSelect}
				>
					<MapsList maps={maps} selected={selectedMapId} />
				</B.FormControl>
				<div className='app__header-buttons'>
					<B.ButtonGroup>
						<B.Button onClick={signIn} disabled={authenticated}>Войти</B.Button>
						<B.Button onClick={signOut} disabled={!authenticated}>Выйти</B.Button>
						<B.Button onClick={refreshData}>Обновить карту</B.Button>
					</B.ButtonGroup>
				</div>
			</div>
		);
	}
}


const MapsList = ({ maps }) => {
	if (!maps) {
		return [];
	}

	return (
		Object.keys(maps).map(key => {
			return (
				<option key={key} value={key}>
					{maps[key].name}
				</option>
			);
		})
	);
};
