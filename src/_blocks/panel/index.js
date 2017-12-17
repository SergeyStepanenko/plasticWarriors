import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { PinSVG2 } from '../index';

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

		return minutes;
	}

	getStatus = ({ isInRange, timeAgo }) => {
		if (isInRange !== undefined && !isInRange) {
			return 'Вне карты';
		}

		if (timeAgo > 5) {
			return 'Оффлайн';
		}
	}

	render() {
		const { units, positionedWarriors, admin } = this.props;
		const LOADING = 'загружается';
		let fbArray = Object.keys(units).map(value => ({ ...units[value] }));

		if (positionedWarriors.length) {
			fbArray = positionedWarriors;
		}

		return (
			<div>
				<B.Panel header={`Статистика: всего - ${fbArray.length}`} bsStyle="primary">
					<B.FormGroup className='app__panel'>
						<table>
							<thead>
								<tr>
									<td></td>
									<td>Имя</td>
									<td>Время</td>
									<td>Заряд</td>
									<td>Точность</td>
									<td>Статус</td>
									<td></td>
									<td></td>
								</tr>
							</thead>
							<tbody>
								{
									fbArray.map((warrior) => {
										const timeAgo = this.getMinutesAgo(warrior.time);
										const accuracy = warrior.acc && `${warrior.acc}m` || LOADING;
										const batteryLevel = warrior.batteryLvl && `${warrior.batteryLvl}%` || LOADING;
										const timeAgoString = timeAgo && (timeAgo > 1 ? `${Math.round(timeAgo)}мин` : '<1мин') || LOADING;
										const status = this.getStatus({ isInRange: warrior.isInRange, timeAgo });
										const style = {
											batteryLevel: warrior.batteryLvl < 33 ? 'app__panel-red' : '',
											accuracy: warrior.acc > 25 ? 'app__panel-red' : '',
											timeAgo: timeAgo > 5 ? 'app__panel-red' : '',
										};

										return (
											<tr key={warrior.url}>
												<td>
													<PinSVG2
														color={warrior.color}
														width='15px'
														height='15px'
													/>
												</td>
												<td>{warrior.name || LOADING}</td>
												<td className={style.timeAgo}>{timeAgoString}</td>
												<td className={style.batteryLevel}>{batteryLevel}</td>
												<td className={style.accuracy}>{accuracy}</td>
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
