import { h, Component } from 'preact';

import MaterialIcon from '../../components/MaterialIcon';
import MainView from '../../components/UI/MainView';
import Login from '../../components/UI/Login';

import Crypto from '../../components/Helpers/Crypto';
import Api from '../../components/Helpers/Api';

let crypto = new Crypto('testen');

let cate = [{
	_id: 'q2c80m93q02c8m93xq2c80m93',
	name: 'Stuff',
	credentials: [
		{
			_id: 'q2c80m93q02c8m93xq2s8fm93',
			category_id: 'q2c80m93q02c8m93xq2c80m93',
			location: 'www.example.com',
			description: 'blablablablabla...',
			username: 'jepper',
			password: 'secretpass'
		},
		{
			_id: 'q2c80d4aq02c8m93xq2s8fm93',
			category_id: 'q2c80m93q02c8m93xq2c80m93',
			location: 'www.test.com',
			description: 'lalalalalalalala...',
			username: 'dawdaw',
			password: 'hemmeligheder'
		}]
}];

function showDropdown(item, element, ev) {
	ev.stopPropagation();
	if (!ev.ctrlKey) {
		element.style.top = ev.pageY + 'px';
		element.style.left = ev.pageX + 'px';
		element.classList.add('active');
		element.item = item;
	}
}

class Home extends Component {
	load() {

	}
	async tryLoad(){
		try {
			await this.loggedIn();
		}
		catch (err) {
			this.setState({ loaded: true, loggedIn: false });
		}
	}

	async loggedIn() {
		let categories = await Api.loadCategories();
		const user = await Api.loadUser();
		this.setState({ loaded: true, loggedIn: true, admin: user.admin, categories });
	}

	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			loggedIn: false,
			admin: false,
			categories: []
		};
		this.loggedIn = this.loggedIn.bind(this);
	}
	componentDidMount() {
		this.tryLoad();
	}

	render() {
		return (
			<div class="container">
				<h1 class="header">MyPass</h1>
				{this.state.loaded
					? this.state.loggedIn
						? <MainView admin={this.state.admin} categories={this.state.categories} />
						: <Login authed={this.loggedIn} />
					: <MaterialIcon class="spin" icon="autorenew" />}
			</div>
		);
	}
}

export default Home;