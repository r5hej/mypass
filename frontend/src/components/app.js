import { h, Component } from 'preact';

import Home from '../routes/home';

if (module.hot) {
	require('preact/debug');
}

export default class App extends Component {
	render() {
		return (
			<Home />
		);
	}
}
