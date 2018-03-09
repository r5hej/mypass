import { h, Component } from 'preact';
import { route } from 'preact-router';
import Api from '../../components/Helpers/Api';


export default class Login extends Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

    componentDidMount() {
        document.title = "Login - MyPass";
        Api.loadUser().then(() => window.location.href = '/');
    }

	async handleSubmit(ev) {
		ev.preventDefault();
		let form = new FormData(ev.target);
		try {
			await Api.login(form);
			route('/');
		}
		catch (err) {
            ev.target.reset();
		}
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit} class="login-form">
				<input class="u-full-width" name="username" type="text"     placeholder="Username" required="required" autofocus />
				<input class="u-full-width" name="password" type="password" placeholder="Password" required="required" />
				<input class="right-align" type="submit" value="Login" />
			</form>
		);
	}
}