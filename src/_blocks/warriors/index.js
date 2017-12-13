import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

import PinSVG from '../pin';

export default class Warriors extends PureComponent {
	static propTypes = {
		positionedWarriors: PropTypes.array,
		shift: PropTypes.string.isRequired,
	}

	render() {
		return (
			<div className='app__warriors'>
				{
					this.props.positionedWarriors.map((warrior) => {
						const iconWidth = 15;
						const iconHeight = 15;
						const shiftOnMap = `translate(${warrior.lngInPx - iconWidth / 2}px, ${warrior.ltdInPx - iconHeight / 2}px)`;
						const pinStyles = {
							position: 'absolute',
							width: `${iconWidth}px`,
							height: `${iconHeight}px`,
							transform: shiftOnMap,
							marginTop: this.props.shift, // shift as per header height
						};

						const tooltipStyles = {
							display: 'flex',
							flexFlow: 'column',
						};

						const tooltip = (
							<B.Tooltip id="tooltip" style={tooltipStyles}>
								<div>{`Имя: ${warrior.name}`}</div>
								<div>{`Уровень заряда: ${warrior.batteryLvl}`}</div>
								<div>{`Acc: ${warrior.acc}`}</div>
								<div>{`Sleep: ${warrior.sleep}`}</div>
							</B.Tooltip>
						);

						return (
							<div key={warrior.key}>
								{
									warrior.isInRange &&
										<B.OverlayTrigger id={warrior.key} overlay={tooltip}>
											<div style={pinStyles}>
												<PinSVG color={warrior.color} />
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
