import { connect } from 'react-redux';
import Template from './template';
import { testAction } from 'reducers/main';

export default connect(
	store => store.main.toJS(),
	{ testAction },
)(Template);
