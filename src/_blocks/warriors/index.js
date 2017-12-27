import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';

import { PinSVG2 } from '../index';

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
		shift: PropTypes.string.isRequired,
		iconSize: PropTypes.number,
	}

	sorting = (a, b) => {
		if (a.color > b.color) {
			return 1;
		} else if (a.color < b.color) {
			return -1;
		}

		return 0;
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
							marginTop: this.props.shift, // shift as per header height
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
