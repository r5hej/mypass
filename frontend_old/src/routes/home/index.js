import { h, Component } from 'preact';
import { route } from 'preact-router';

import MaterialIcon from '../../components/MaterialIcon';
import MainView from '../../components/UI/MainView';
import CreateDecryptModal from '../../components/UI/CreateDecryptModal';
import DecryptModal from '../../components/UI/DecryptModal';

import Api from '../../components/Helpers/Api';
import Crypto from "../../components/Helpers/Crypto";

export default class Home extends Component {
	async load() {
        try {
            const user = await Api.loadUser();
            const categories = await Api.loadCategories();
            this.setState({ loaded: true, admin: user.admin, categories });
        }
        catch (err) {
        	route('/login');
        }
	}

    decryptPasswordEntered(password) {
        const crypto = new Crypto(password);
		this.setState(oldState => {
		    oldState.decrypted = false;
            crypto.decryptCategories(oldState.categories);
            oldState.crypto = crypto;
		});
    }

    componentDidMount() {
        // document.title = "MyPass";
        this.load();
    }

	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			decrypted: false,
			admin: false,
			categories: []
		};
		this.load = this.load.bind(this);
		this.decryptPasswordEntered = this.decryptPasswordEntered.bind(this);
	}

	render() {
		return (
			<div class="container">
				{this.state.loaded
                    ? this.state.decrypted
						? <MainView admin={this.state.admin} categories={this.state.categories} crypto={this.state.crypto}/>
						: this.state.categories.length === 0
							? <CreateDecryptModal submit={this.decryptPasswordEntered} />
							: <DecryptModal submit={this.decryptPasswordEntered} />
					: <MaterialIcon className="spin" icon="autorenew" />}
			</div>
		);
	}
}