import { h, Component } from 'preact';

import MaterialIcon from '../../components/MaterialIcon';
import MainView from '../../components/UI/MainView';
import Login from '../../components/UI/Login';

import Api from '../../components/Helpers/Api';

class Home extends Component {
	async tryLoad(){
		try {
			await this.load();
		}
		catch (err) {
			this.setState({ loaded: true, loggedIn: false });
		}
	}

	async load() {
		const categories = await Api.loadCategories();
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
		this.load = this.load.bind(this);
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
						: <Login authed={this.load} />
					: <MaterialIcon className="spin" icon="autorenew" />}
			</div>
		);
	}
}

export default Home;