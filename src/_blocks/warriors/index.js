import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

import { PinSVG2 } from '../index';

export default class Warriors extends PureComponent {
	static defaultProps = {
		iconSize: 15,
	}

	static propTypes = {
		positionedWarriors: PropTypes.array,
		shift: PropTypes.string.isRequired,
		iconSize: PropTypes.number,
	}

	render() {
		const { iconSize, positionedWarriors } = this.props;

		return (
			<div className='app__warriors'>
				{
					positionedWarriors.sort((a, b) => a.color < b.color).map((warrior) => {
						const shiftOnMap = `translate(${warrior.lngInPx - iconSize / 2}px, ${warrior.ltdInPx - iconSize / 2}px)`;
						const pinStyles = {
							position: 'absolute',
							width: `${iconSize}px`,
							height: `${iconSize}px`,
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
