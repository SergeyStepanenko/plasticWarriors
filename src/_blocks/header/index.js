import { connect } from 'react-redux';
import Template from './template';
import * as actions from 'reducers/main';

export default connect(
	reducers => reducers.main.toJS(),
	{ ...actions },
)(Template);
