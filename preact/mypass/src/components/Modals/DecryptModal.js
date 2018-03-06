import { h, Component } from 'preact';

export default class DecryptModal extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
		this.state.password = '';
	}

	submit(ev) {
		ev.preventDefault();
		this.props.submit(this.state.password);
	}

	render() {
		return (
			<div>
				<h5>Enter decryption password</h5>
				<form onSubmit={this.submit}>
					<input class="u-full-width" type="password" value={this.state.password} required="required" autoFocus="true" />
					<input class="u-full-width btn-submit" type="submit" value="OK" />
				</form>
			</div>
		);
	}
}
