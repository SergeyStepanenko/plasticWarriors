import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import ToggleButton from 'react-toggle-button';

import { PinSVG2 } from '../index';

const NOTAVALIABLE = 'n/a';

export default class Stats extends PureComponent {
	static propTypes = {
		units: PropTypes.object.isRequired,
		positionedWarriors: PropTypes.array.isRequired,
		editWarrior: PropTypes.func.isRequired,
		toggleCollapse: PropTypes.func.isRequired,
		deleteWarrior: PropTypes.func.isRequired,
		toggleHideWarrior: PropTypes.func.isRequired,
		admin: PropTypes.bool,
		keys: PropTypes.array,
		collapsed: PropTypes.bool,
	}

	static defaultProps = {
		positionedWarriors: [],
		units: {},
		collapsed: false,
	}

	state = {
		warriors: {},
	}

	getMinutesAgo = (milliseconds) => {
		if (!milliseconds) {
			return false;
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

		return (
			<div>
				<B.Panel
					header={`Статистика: всего - ${positionedWarriors.length || ''}`}
					bsStyle="primary"
					onClick={() => this.props.toggleCollapse('stats')}
				/>
				<B.Panel
					bsStyle="primary"
					expanded={!this.props.collapsed}
					collapsible
				>
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
									<td>Отображение</td>
									<td></td>
									<td></td>
								</tr>
							</thead>
							<tbody>
								{
									positionedWarriors.map((warrior) => {
										const redPanelClassName = 'app__panel-red';
										const timeAgo = this.getMinutesAgo(warrior.time);
										const accuracy = warrior.acc ? `${warrior.acc}m` : NOTAVALIABLE;
										const batteryLevel = warrior.batteryLvl ? `${warrior.batteryLvl}%` : NOTAVALIABLE;
										const timeAgoString = timeAgo ? (timeAgo > 1 ? `${Math.round(timeAgo)}мин` : '<1мин') : NOTAVALIABLE;
										const status = this.getStatus({ isInRange: warrior.isInRange, timeAgo });
										const style = {
											batteryLevel: warrior.batteryLvl < 33 ? redPanelClassName : '',
											accuracy: warrior.acc > 25 ? redPanelClassName : '',
											timeAgo: timeAgo > 5 ? redPanelClassName : '',
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
												<td>
													<a href={warrior.url} target='_blank'>
														{warrior.name || NOTAVALIABLE}
													</a>
												</td>
												<td className={style.timeAgo}>{timeAgoString}</td>
												<td className={style.batteryLevel}>{batteryLevel}</td>
												<td className={style.accuracy}>{accuracy}</td>
												<td className='app__panel-status'>{status}</td>
												<td>
													<ToggleButton
														value={!warrior.hidden}
														onToggle={(value) => {
															this.props.toggleHideWarrior({ key: warrior.key, value });
														}}
													/>
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
															<B.Button bsStyle='danger' onClick={() => this.props.deleteWarrior(warrior.key)}>
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
