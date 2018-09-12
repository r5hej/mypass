import { h, Component } from 'preact';
import 'linkstate/polyfill';

import Api from '../Helpers/Api';
import MaterialIcon from '../MaterialIcon';

export default class EditCredentialModal extends Component {
	async onSubmit(ev) {
		ev.preventDefault();
        this.setState({loading: true});
        let encCopy = this.props.crypto.encryptedCopy(this.state.credential, ['location', 'description', 'username', 'password']);
        await Api.updateCredential(encCopy);
        this.props.updated();
	}

	constructor(props) {
		super(props);
		this.state = {
            credential: props.credential,
            loading: false
		};
		this.onSubmit = this.onSubmit.bind(this);
	}

	render() {
		return (
			<div>
				<h5>Edit credential</h5>
				<form onSubmit={this.onSubmit}>
					<input class="u-full-width" type="text" name="location" placeholder="Location" required="required"
						value={this.state.credential.location} onInput={this.linkState('credential.location')}
					/>
					<input class="u-full-width" type="text" name="description" placeholder="Description"
						value={this.state.credential.description} onInput={this.linkState('credential.description')}
					/>
					<input class="u-full-width" type="text" name="username" placeholder="Username"
						value={this.state.credential.username} onInput={this.linkState('credential.username')}
					/>
					<input class="u-full-width" type="password" name="password" placeholder="Password"
						required="required" value={this.state.credential.password} onInput={this.linkState('credential.password')}
					/>
					{this.state.loading
					 	? <MaterialIcon className="spin" icon="autorenew" />
						: <input class="right-align" type="submit" value="Update" />}
				</form>
			</div>
		);
	}
}