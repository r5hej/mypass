import Api from './Api';

export default class PassGen {
	constructor() {
		this.wordlists = Object.create(null);
		this.getLanguages = this.getLanguages.bind(this);
		this.generatePassphrase = this.generatePassphrase.bind(this);
		this.generatePassword = this.generatePassword.bind(this);
	}

	static getRandomNumbers(no) {
		if (window.crypto && window.crypto.getRandomValues) {
			return window.crypto.getRandomValues(new Uint32Array(no));
		}
		let arr = new Uint32Array(no);
		for (let i = 0; i < no; i++)
			arr[i] = Math.floor(Math.random() * 10242028);
		return arr;

	}
	static capitalizeWord(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	}

	getLanguages(languages) {
		return new Promise((accept, reject) => {
            if (!Array.isArray(languages)) languages = [languages];
			let final = [], done = 0;
			for (let i = 0; i < languages.length; i++){
				let lang = languages[i];
				if (this.wordlists[lang] === undefined){
					Api.getWordlist(lang).then(wl => {
						wl = wl.split('\n');
						this.wordlists[lang] = wl;
						final = final.concat(this.wordlists[lang]);
						if (done++ === languages.length - 1)
							accept(final);
					}).catch(err => reject(err));
				}
				else {
					final = final.concat(this.wordlists[lang]);
					if (done++ === languages.length - 1)
						accept(final);
				}
			}
		});
	}
	generatePassphrase(languages, wordNumber, capitalize, separators) {
		return new Promise((accept, reject) => {
			this.getLanguages(languages).then(wordlist => {
				capitalize = capitalize || false;
				if (separators.length === 0) separators = [' '];
				wordNumber = wordNumber || 6;
				let i = 0;
				let randomNumbers = PassGen.getRandomNumbers(wordNumber * 3);

				let str = '';
				for (let j = 0; j < wordNumber; j++) {
					let word = wordlist[randomNumbers[i++] % wordlist.length];
					if (capitalize && randomNumbers[i++] % 2 === 0)
						word = PassGen.capitalizeWord(word);
					str += word.trim();
					if (j === wordNumber - 1) break;
					str += separators[randomNumbers[i++] % separators.length];
				}
				accept(str.trim());
			});
		});
	}
	generatePassword(chars, len) {
		let numbers = PassGen.getRandomNumbers(len);
		let pass = '';
		for (let i = 0; i < len; i++){
			pass += chars[numbers[i] % chars.length];
		}
		return pass;
	}
}
