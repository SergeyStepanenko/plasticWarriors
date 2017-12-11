import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as B from 'react-bootstrap';
import { PinSVG } from '../index';

export default class Panel extends PureComponent {
	static propTypes = {
		firebaseData: PropTypes.object.isRequired,
	}

	render() {
		const { firebaseData } = this.props;

		return (
			<B.Panel header={'Пластиковые воины:'} bsStyle="primary">
				<B.FormGroup>
					{
						Object.keys(firebaseData).map((key) => {
							return(
								<B.Row key={key}>
									<B.Col sm={3}>{firebaseData[key].name}</B.Col>
									<B.Col sm={1}>
										<PinSVG
											color={firebaseData[key].color}
											width='15px'
											height='15px'
										/>
									</B.Col>
									<B.Col sm={3}>
										<B.Button onClick={() => this.editWarrior({ firebaseData, key })}>
											Изменить
										</B.Button>
									</B.Col>
									<B.Col sm={3}>
										<B.Button onClick={() => this.deleteWarrior(key)}>
											Удалить
										</B.Button>
									</B.Col>
								</B.Row>
							);
						})
					}
				</B.FormGroup>
			</B.Panel>
		);
	}
}
