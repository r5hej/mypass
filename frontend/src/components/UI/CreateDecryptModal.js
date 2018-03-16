import { h, Component } from 'preact';

export default class CreateDecryptModal extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
	}

	submit(ev) {
		ev.preventDefault();
		if (this.pwdField1.value !== this.pwdField2.value) return this.form.reset();
        this.props.submit(this.pwdField1.value);
	}

	render() {
		return (
			<div>
				<h5>Create encryption password</h5>
				<div class="hint-text">
					<p>The encryption password is not stored anywhere, so it is VERY important that you don't lose it. We strongly recommend writing this password down on a piece of paper or alike, and never sharing it with anyone. We recommend the following criteria:</p>
					<ul>
						<li>Minimum length: 6 characters</li>
						<li>Capitalized and small letters</li>
						<li>Numbers</li>
					</ul>
				</div>
				<form onSubmit={this.submit} ref={element => this.form = element}>
					<input class="u-full-width" ref={element => this.pwdField1 = element} type="password" required="required" placeholder="Password" />
					<input class="u-full-width" ref={element => this.pwdField2 = element} type="password" required="required" placeholder="Confirm password" />
					<input class="right-align" type="submit" value="OK" />
				</form>
			</div>
		);
	}
}
