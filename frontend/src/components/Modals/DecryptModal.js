import { h, Component } from 'preact';

export default class DecryptModal extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
	}

	submit(ev) {
		ev.preventDefault();
		this.props.submit(this.pwdField.value);
	}

	render() {
		return (
			<div>
				<h5>Enter decryption password</h5>
				<form onSubmit={this.submit}>
					<input class="u-full-width" type="password" ref={element => this.pwdField = element} required="required" autofocus="true" />
					<input class="u-full-width btn-submit" type="submit" value="OK" />
				</form>
			</div>
		);
	}
}
