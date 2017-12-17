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

	getMinutesAgo = (milliseconds) => {
		if (!milliseconds) {
			return false;
		}

		if (milliseconds > Date.now()) {
			console.error('Время сервера опережает браузерное', milliseconds - Date.now());
		}

		const minutes = (Date.now() - milliseconds) / 1000 / 60;
		const seconds = minutes < 1 ? Math.round(minutes * 60) : false;


		return minutes < 1 ? seconds : Math.round(minutes);
	}

	render() {
		const { units, positionedWarriors, admin } = this.props;
		const LOADING = 'loading';
		let fbArray = Object.keys(units).map(value => ({ ...units[value] }));

		if (positionedWarriors.length) {
			fbArray = positionedWarriors;
		}

		return (
			<div>
				<B.Panel header={`Статистика: Всего - ${fbArray.length}`} bsStyle="primary">
					<B.FormGroup className='app__panel'>
						<table>
							<tbody>
								{
									fbArray.map((warrior) => {
										const timeAgo = this.getMinutesAgo(warrior.time);
										const status = timeAgo > 5 && 'Оффлайн';
										const accuracy = warrior.acc && `${warrior.acc}m` || LOADING;
										const batteryLevel = warrior.batteryLvl && `${warrior.batteryLvl}%` || LOADING;
										const timeAgoString = timeAgo > 1 ? `${timeAgo}мин` : '<1мин';

										return (
											<tr key={warrior.url}>
												<td>
													<PinSVG
														color={warrior.color}
														width='15px'
														height='15px'
													/>
												</td>
												<td>{warrior.name || LOADING}</td>
												<td>{timeAgoString}</td>
												<td>{batteryLevel}</td>
												<td>{accuracy}</td>
												<td className='app__panel-status'>{status}</td>
												<td>
													<a href={warrior.url} target='_blank'>Ссылка</a>
												</td>
												{
													admin &&
														<td>
															<B.Button onClick={() => this.props.editWarrior({ units, key: warrior.key })}>
																Изменить
															</B.Button>
														</td>
												}
												{
													admin &&
														<td>
															<B.Button onClick={() => this.props.deleteWarrior(warrior.key)}>
																Удалить
															</B.Button>
														</td>
												}
											</tr>
										);
									})
								}
							</tbody>
						</table>
					</B.FormGroup>
				</B.Panel>
			</div>
		);
	}
}
