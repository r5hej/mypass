import { h, Component } from 'preact';

import MaterialButton from '../MaterialButton';
import Api from '../Helpers/Api';

export default class InviteModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: false,
			url: `${window.location.protocol}//${window.location.host}/register`,
			canActivate: false,
			canRequest: false
		};
		this.requestToken = this.requestToken.bind(this);
		this.activateToken = this.activateToken.bind(this);
	}

	componentDidMount() {
		this.requestToken();
	}

	async requestToken() {
		let token = await Api.getToken();
		this.setState({
			canActivate: true,
			canRequest: false,
			token,
			url: `${window.location.protocol}//${window.location.host}/register?token=${token._id}`
		});
	}

	async activateToken(ev) {
	    ev.preventDefault();
	    await Api.activateToken(this.state.token);
		this.setState({
			canActivate: false,
			canRequest: true
		});
	}

	render() {
		return (
			<div class="invite">
				<h5>Invite friends</h5>
				<p>To invite people to register on this MyPass-server, you just have to send them a link to the registration page with a valid registration token.</p>
				<b>
                    Registration token:
				    <span>{this.state.token && this.state.token._id}</span>
				</b>
				<a href={this.state.url} style="display: inline-block;">{this.state.url}</a>
				<MaterialButton icon="assignment" title="Copy url to clipboard" />
				<p>You need to activate the token for it to be valid</p>
				<i>The registration token will become invalid 7 days after the creation time</i>
				<form onSubmit={this.activateToken}>
					<div class="row">
						<div class="six columns small-screen-bottom-spacing">
							<input type="submit" class="btn-submit u-full-width" disabled={this.state.canActivate} value="Activate registration token" />
						</div>
						<div class="six columns">
							<input type="button" class="btn-submit u-full-width" disabled={this.state.canRequest} onClick={this.requestToken} value="Get another token" />
						</div>
					</div>
				</form>
			</div>
		);
	}
}