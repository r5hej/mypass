import { h, Component } from 'preact';
import { Router } from "preact-router";

import Home from '../routes/home';
import Login from '../routes/login';
import Register from '../routes/register';

if (module.hot) {
	require('preact/debug');
}

export default class App extends Component {
	render() {
		return (
			<div class="container">
                <h1 class="header no-select">MyPass</h1>
                <Router>
                    <Home path="/" />
                    <Login path="/login"/>
                    <Register path="/register" />
                </Router>
			</div>
		);
	}
}
