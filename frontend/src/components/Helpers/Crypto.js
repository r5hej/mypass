import aesjs from 'aes-js';
import sha256 from 'js-sha256';


const CRED_FIELDS = ['location', 'description', 'username', 'password'];

export default class Crypto {
	constructor(password) {
		const hash = sha256(password);
		const keyBytes = aesjs.utils.utf8.toBytes(hash).slice(0, 32); // 32 bytes for AES256
		this.enc = Crypto.encrypt(keyBytes);
		this.dec = Crypto.decrypt(keyBytes);
		this.encryptForm = this.encryptForm.bind(this);
		this.encryptedCopy = this.encryptedCopy.bind(this);
		this.decryptFields = this.decryptFields.bind(this);
		this.decryptCategories = this.decryptCategories.bind(this);
	}

	static encrypt(keyBytes) {
		return plainStr => {
			const strBytes = aesjs.utils.utf8.toBytes(plainStr);
			const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
			const encryptedBytes = aesCtr.encrypt(strBytes);
			return aesjs.utils.hex.fromBytes(encryptedBytes);
		};
	}
	static decrypt(keyBytes) {
		return hexStr => {
			const encryptedBytes = aesjs.utils.hex.toBytes(hexStr);
			const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
			const decryptedBytes = aesCtr.decrypt(encryptedBytes);
			return aesjs.utils.utf8.fromBytes(decryptedBytes);
		};
	}

	decryptCategories(categories) {
	    categories.forEach(category => {
			category.name = this.dec(category.name);
			for (const credential of category.credentials) {
				this.decryptFields(credential, CRED_FIELDS);
			}
		});
	}

	encryptForm(form, fields) {
		for (let field of fields) {
			form.set(field, this.enc(form.get(field)));
		}
	}
	encryptedCopy(obj, fields) {
		let newObj = Object.assign({}, obj);
        for (let field of fields) {
            newObj[field] = this.enc(newObj[field]);
        }
        return newObj;
    }
	decryptFields(obj, fields) {
		for (let field of fields) {
			obj[field] = this.dec(obj[field]);
		}
	}
}