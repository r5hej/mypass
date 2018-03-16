import { h, Component } from 'preact';
import { route } from 'preact-router';

import Api from '../../components/Helpers/Api';


export default class Register extends Component {
	constructor(props) {
		super(props);
		this.state.status = '';
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	async handleSubmit(ev) {
		ev.preventDefault();
		let form = new FormData(ev.target);
		if (form.get('password') !== form.get('password2')){
			this.setState({status: 'Passwords do not match'});
			return;
		}
		try {
            await Api.register(form);
			route('/login');
		}
		catch (err) {
            if (err === 'taken')
                this.setState({status: 'Username is taken'});
            else if (err === 'invalid')
                this.setState({status: 'Invalid username and/or password'});
		}
	}

	componentDidMount() {
        // document.title = "Register - MyPass";
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit} class="login-form">
                <input class="u-full-width" type="text" name="username" placeholder="Username" required="required"/>
				<input class="u-full-width" type="password" name="password" placeholder="Password" required="required" minLength="6"/>
				<input class="u-full-width" type="password" name="password2" placeholder="Repeat password" required="required" minLength="6"/>
                <input class="btn right-align" type="submit" value="Register" />
				<p>{this.state.status}</p>
			</form>
		);
	}
}