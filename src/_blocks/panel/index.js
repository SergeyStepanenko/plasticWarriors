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
			<div>
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
					</B.FormGroup>
				</B.Panel>
				<B.Panel header={'Геоданные:'} bsStyle="primary">
					<B.FormGroup className='app__panel'>
						{
							positionedWarriors && positionedWarriors.map(warrior => (
								!warrior.error &&
									<div key={warrior.key || Math.random()} /* className='app__block' */>
										<B.Col sm={3}>
											<div>{warrior.name}</div>
											<div>{`lat:${warrior.lat}`}</div>
											<div>{`lng:${warrior.lng}`}</div>
											<div>{warrior.isInRange ? 'На карте' : 'Вне карты'}</div>
											<div>{`${new Date(warrior.time).getHours()}:${new Date(warrior.time).getMinutes()}`}</div>
										</B.Col>
									</div>
							))
						}
					</B.FormGroup>
				</B.Panel>
			</div>
		);
	}
}
