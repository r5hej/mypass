import { h, Component } from 'preact';

import MaterialIcon from '../MaterialIcon';
import Copy from '../Helpers/Copy';

const HIDDEN_PASS = '••••••••••';

export default class Credential extends Component {
	constructor(props) {
		super(props);
		this.state = {
			password: HIDDEN_PASS,
			passwordShown: false
		};
		this.onTogglePasswordShown = this.onTogglePasswordShown.bind(this);
		this.onMoreButtonPressed = this.onMoreButtonPressed.bind(this);
		this.usernameClicked = this.usernameClicked.bind(this);
		this.passwordClicked = this.passwordClicked.bind(this);
	}

	onTogglePasswordShown() {
		if (!this.state.passwordShown)
			this.setState({
				password: this.props.credential.password,
				passwordShown: true
			});
		else
			this.setState({
				password: HIDDEN_PASS,
				passwordShown: false
			});
	}

	usernameClicked() {
		if (this.props.credential.username)
			Copy.copy(this.props.credential.username);
	}
    passwordClicked() {
        if (this.props.credential.password)
        	Copy.copy(this.props.credential.password);
    }

	onMoreButtonPressed(ev) {
		this.props.moreClick(this.props.credential, ev);
	}

	render() {
		let usernameHint = this.props.credential.username ? 'Click to copy' : '';
		return (
			<tr>
				<td class="truncate" title={this.props.credential.location}>{this.props.credential.location}</td>
				<td class="truncate credential-desc" title={this.props.credential.description}>{this.props.credential.description}</td>
				<td class="truncate copyable" title={usernameHint} onClick={this.usernameClicked}>{this.props.credential.username}</td>
				<td class="truncate copyable" title="Click to copy" onClick={this.passwordClicked}>{this.state.password}</td>
				<td>
					<MaterialIcon icon={this.state.passwordShown ? 'visibility_off' : 'visibility'} title="Toggle show password" click={this.onTogglePasswordShown} />
					<MaterialIcon icon="more_horiz" title="More options" click={this.onMoreButtonPressed} />
				</td>
			</tr>
		);
	}
}