import { h, Component } from 'preact';
import 'linkstate/polyfill';

import MaterialButton from '../MaterialButton';
import Api from '../Helpers/Api';
import Copy from '../Helpers/Copy';
import PassGen from '../Helpers/PassGen';

export default class PassgenModal extends Component {

	onPassphraseSelected() {
		this.setState({
			displayPhrase: true,
			displayWord: false
		});
        this.onGenerateNewPass();
	}

	onPasswordSelected() {
		this.setState({
			displayPhrase: false,
			displayWord: true
		});
		this.onGenerateNewPass();
	}

	onGenerateNewPass() {
		if (this.state.displayPhrase) {
			this.gen.generatePassphrase(this.state.passphraseLanguages, this.state.passphraseLength,
				this.state.passphraseCapitalisation, this.state.passphraseSeparators).then(pass => {
				this.setState({ pass });
			});
		}
		else {
			let pass = this.gen.generatePassword(this.state.passwordChars, this.state.passwordLength);
			this.setState({ pass });
		}
	}

    onPassClicked() {
	    Copy.copy(this.state.pass);
    }

	constructor(props) {
		super(props);
		this.setState({
            availableLanguages: ['english'],
			passphraseLanguages: ['english'],
			passphraseLength: 6,
			passphraseSeparators: ' ',
			passphraseCapitalisation: false,
			passwordChars: 'abcdefghijklmnopqrstuvwxyz 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ !#¤%&/()=',
			passwordLength: 12,
			displayPhrase: true,
			displayWord: false,
            pass: ''
		});

		this.onPassphraseSelected = this.onPassphraseSelected.bind(this);
		this.onPasswordSelected = this.onPasswordSelected.bind(this);
		this.onGenerateNewPass = this.onGenerateNewPass.bind(this);
		this.onPassClicked = this.onPassClicked.bind(this);
		this.gen = new PassGen();
	}

	componentDidMount() {
		Api.getLanguages().then(langs => {
			this.setState({ availableLanguages: langs });
            this.onGenerateNewPass();
		});
	}

	render() {
		return (
			<div>
				<h5>Create new passphrase or password</h5>
				<div class="row">
					<div class="six columns">
						<button class={('u-full-width' + (this.state.displayPhrase ? ' active' : ''))} onClick={this.onPassphraseSelected}>Passphrase</button>
					</div>
					<div class="six columns">
						<button class={('u-full-width' + (this.state.displayWord ? ' active' : ''))} onClick={this.onPasswordSelected}>Password</button>
					</div>
				</div>
				<div class="separator" />
				<div class={('pass-gen' + (this.state.displayPhrase ? ' active' : ''))} >
					<div class="row">
						<div class="six columns">
							<label>Language(s)</label>
							<select multiple required class="u-full-width" onInput={this.linkState('passphraseLanguages')} value={this.state.passphraseLanguages}>
								{this.state.availableLanguages.map(lang => <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.substr(1)}</option>)}
							</select>
						</div>
						<div class="six columns">
							<label>Words in phrase</label>
							<input type="number" value={this.state.passphraseLength} onInput={this.linkState('passphraseLength')} min="3" max="12" required class="u-full-width" />
						</div>
					</div>
					<div class="row">
						<div class="six columns">
							<label style="display: inline-block;">Random capitalization</label>
							<input type="checkbox" checked={this.state.passphraseCapitalisation} onChange={this.linkState('passphraseCapitalisation')} style="transform: scale(1.2);" />
						</div>
						<div class="six columns">
							<label>Separator characters</label>
							<input type="text" value={this.state.passphraseSeparators} onInput={this.linkState('passphraseSeparators')} required class="u-full-width" />
						</div>
					</div>
				</div>
				<div class={('pass-gen' + (this.state.displayWord ? ' active' : ''))}>
					<label>Characters</label>
					<textarea class="u-full-width" spellCheck={false} style="resize: none;" required onInput={this.linkState('passwordChars')}>
						{this.state.passwordChars}
						</textarea>
					<label>Length</label>
					<input type="number" value={this.state.passwordLength} onInput={this.linkState('passwordLength')} min="6" max="50" step="1" required />
				</div>
				<div class="new-pass-row">
					<span class="u-full-width truncate new-pass" title="Click on password to copy" onClick={this.onPassClicked}>{this.state.pass}</span>
					<MaterialButton icon="refresh" click={this.onGenerateNewPass} />
				</div>
			</div>
		);
	}
}


