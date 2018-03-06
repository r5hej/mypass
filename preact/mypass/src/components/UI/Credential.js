import { h, Component } from 'preact';

import MaterialIcon from '../MaterialIcon';

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
	}

	onTogglePasswordShown() {
		console.log(this.props.credential.password);
		if (!this.state.passwordShown)
			this.setState({
				password: this.props.crypto.dec(this.props.credential.password),
				passwordShown: true
			});
		else
			this.setState({
				password: HIDDEN_PASS,
				passwordShown: false
			});
	}

	onMoreButtonPressed(ev) {
		this.props.moreClick(this.props.credential, ev);
	}

	render() {
		if (!this.props.credential) {
			console.log('empty?!',this.props.credential);
			return;
		}
		return (
			<tr>
				<td class="truncate" title={this.props.credential.location}>{this.props.credential.location}</td>
				<td class="truncate credential-desc" title={this.props.credential.description}>{this.props.credential.description}</td>
				<td class="truncate copyable" title="Click to copy">{this.props.credential.username}</td>
				<td class="truncate copyable" title="Click to copy">{this.state.password}</td>
				<td>
					<MaterialIcon icon="visibility" title="Toggle show password" click={this.onTogglePasswordShown} />
					<MaterialIcon icon="more_horiz" title="More options" click={this.onMoreButtonPressed} />
				</td>
			</tr>
		);
	}
}