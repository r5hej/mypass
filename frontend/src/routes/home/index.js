import { h, Component } from 'preact';

import MaterialIcon from '../../components/MaterialIcon';
import MainView from '../../components/UI/MainView';

import Api from '../../components/Helpers/Api';

export default class Home extends Component {
	async load() {
        try {
            const user = await Api.loadUser();
            const categories = await Api.loadCategories();
            this.setState({ loaded: true, admin: user.admin, categories });
        }
        catch (err) {
        	window.location.href = '/login';
        }
	}

    componentDidMount() {
        document.title = "MyPass";
        this.load();
    }

	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			admin: false,
			categories: []
		};
		this.load = this.load.bind(this);
	}

	render() {
		return (
			<div class="container">
				{this.state.loaded
                    ? <MainView admin={this.state.admin} categories={this.state.categories} />
					: <MaterialIcon className="spin" icon="autorenew" />}
			</div>
		);
	}
}