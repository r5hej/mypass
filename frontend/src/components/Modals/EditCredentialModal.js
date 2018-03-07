import { h, Component } from 'preact';

import Api from '../Helpers/Api';

export default class EditCredentialModal extends Component {
	async onSubmit(ev) {
		ev.preventDefault();
        this.props.credential.location = this.locationField.value;
        this.props.credential.description = this.descField.value;
        this.props.credential.username = this.usernameField.value;
        this.props.credential.password = this.passwordField.value;
        let encCopy = this.props.crypto.encryptedCopy(this.props.credential, ['location', 'description', 'username', 'password']);
        await Api.updateCredential(encCopy);
        this.props.updated();
	}

	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	render() {
		return (
			<div>
				<h5>Edit credential</h5>
				<form onSubmit={this.onSubmit}>
					<input class="u-full-width" type="text" name="location" placeholder="Location" required="required"
						value={this.props.credential.location} ref={element => this.locationField = element}
					/>
					<input class="u-full-width" type="text" name="description" placeholder="Description"
						value={this.props.credential.description} ref={element => this.descField = element}
					/>
					<input class="u-full-width" type="text" name="username" placeholder="Username"
						value={this.props.credential.username} ref={element => this.usernameField = element}
					/>
					<input class="u-full-width" type="password" name="password" placeholder="Password"
						required="required" value={this.props.credential.password} ref={element => this.passwordField = element}
					/>
					<input class="u-full-width btn-submit" type="submit" value="Update" />
				</form>
			</div>
		);
	}
}