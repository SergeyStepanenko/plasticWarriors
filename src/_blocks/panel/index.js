import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { PinSVG } from '../index';

export default class Panel extends PureComponent {
	static propTypes = {
		units: PropTypes.object.isRequired,
		positionedWarriors: PropTypes.array.isRequired,
		editWarrior: PropTypes.func.isRequired,
		deleteWarrior: PropTypes.func.isRequired,
		admin: PropTypes.bool,
	}

	render() {
		const { units, positionedWarriors, admin } = this.props;

		return (
			<B.Panel header={'Пластиковые воины:'} bsStyle="primary">
				<B.FormGroup className='app__panel'>
					<div>
						{
							Object.keys(units).map((key) => {
								return(
									<div key={key} className='app__block'>
										<div className='app__block-name'>{units[key].name}</div>
										<B.Col sm={1}>
											<PinSVG
												color={units[key].color}
												width='15px'
												height='15px'
											/>
										</B.Col>
										{
											admin &&
												<B.Col sm={3}>
													<B.Button onClick={() => this.props.editWarrior({ units, key })}>
														Изменить
													</B.Button>
												</B.Col>
										}
										{
											admin &&
												<B.Col sm={3}>
													<B.Button onClick={() => this.props.deleteWarrior(key)}>
														Удалить
													</B.Button>
												</B.Col>
										}
									</div>
								);
							})
						}
					</div>
					<div>
						{
							positionedWarriors && positionedWarriors.map(warrior => (
								!warrior.error &&
									<div key={warrior.key || Math.random()} className='app__block'>
										<B.Col sm={3}>
											<div>{`lat:${warrior.lat}`}</div>
										</B.Col>
										<B.Col sm={3}>
											<div>{`lng:${warrior.lng}`}</div>
										</B.Col>
										<B.Col sm={3}>
											<div>{warrior.isInRange ? 'На карте' : 'Вне карты'}</div>
										</B.Col>
										<B.Col sm={3}>
											<div>{new Date(warrior.time).toLocaleString()}</div>
										</B.Col>
									</div>
							))
						}
					</div>
				</B.FormGroup>
			</B.Panel>
		);
	}
}
