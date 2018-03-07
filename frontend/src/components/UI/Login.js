import { h, Component } from 'preact';
import Api from '../Helpers/Api';


export default class Login extends Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	async handleSubmit(ev) {
		ev.preventDefault();
		let formdata = new FormData(this.form);
		try {
			await Api.login(formdata);
			this.props.authed();
		}
		catch (err) {
			this.form.reset();
		}
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit} class="login-form" ref={element => this.form = element}>
				<input class="u-full-width" name="username" type="text"     placeholder="Username" required="required" autoFocus />
				<input class="u-full-width" name="password" type="password" placeholder="Password" required="required" />
				<input class="btn right-align" type="submit" value="Login" />
			</form>
		);
	}
}