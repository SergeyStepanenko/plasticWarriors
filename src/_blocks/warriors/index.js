import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

import { PinSVG2 } from '../index';
import { COLORS } from 'constants/index';
import { SHIFTYAXIS } from 'constants/index';

const tooltipStyles = {
	display: 'flex',
	flexFlow: 'column',
};

export default class Warriors extends PureComponent {
	static defaultProps = {
		iconSize: 15,
	}

	static propTypes = {
		positionedWarriors: PropTypes.array,
		iconSize: PropTypes.number,
	}

	sorting = (a, b) => {
		const first = COLORS.indexOf(a.color);
		const second = COLORS.indexOf(b.color);

		if (first === second) {
			return (first + a.batteryLvl) - (second + b.batteryLvl);
		}

		return first - second;
	}

	render() {
		const { iconSize, positionedWarriors } = this.props;

		return (
			<div className='app__warriors'>
				{
					positionedWarriors.sort(this.sorting).map((warrior) => {
						const shiftOnMap = `translate(${warrior.lngInPx - iconSize / 2}px, ${warrior.ltdInPx - iconSize / 2}px)`;
						const pinStyles = {
							position: 'absolute',
							width: `${iconSize}px`,
							height: `${iconSize}px`,
							transform: shiftOnMap,
							marginTop: SHIFTYAXIS, // shift as per header height
						};

						const tooltip = (
							<B.Tooltip id="tooltip" style={tooltipStyles}>
								<div>{`Имя: ${warrior.name}`}</div>
							</B.Tooltip>
						);

						return (
							<div key={warrior.key}>
								{
									warrior.isInRange && !warrior.hidden &&
										<B.OverlayTrigger key={warrior.key} overlay={tooltip}>
											<div style={pinStyles}>
												<PinSVG2 color={warrior.color} />
											</div>
										</B.OverlayTrigger>
								}
							</div>
						);
					})
				}
			</div>
		);
	}
}
