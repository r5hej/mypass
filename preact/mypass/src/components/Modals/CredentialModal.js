import { h, Component } from 'preact';

import Api from '../Helpers/Api';

export default class CredentialModal extends Component {
	onSubmit(ev) {
		ev.preventDefault();
		if (this.props.credential) {

		}
		else {

		}
	}

	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	render() {
		return (
			<div>
				<h5>{this.props.credential ? 'Edit credential' : 'Create credential'}</h5>
				<form onSubmit={this.onSubmit} id="add-credential-form">
					<input class="u-full-width" type="text" name="location" placeholder="Location" required="required"
						value={this.props.credential ? this.props.credential.location : ''}
					/>
					<input class="u-full-width" type="text" name="description" placeholder="Description"
						value={this.props.credential ? this.props.credential.description : ''}
					/>
					<input class="u-full-width" type="text" name="username" placeholder="Username"
						value={this.props.credential ? this.props.credential.username : ''}
					/>
					<input class="u-full-width" type="password" name="password" placeholder="Password"
						required="required" value={this.props.credential ? this.props.credential.password : ''}
					/>
					<input class="u-full-width btn-submit" type="submit" value="Add" />
				</form>
			</div>
		);
	}
}