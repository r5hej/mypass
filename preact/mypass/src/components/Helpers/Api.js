function sendRequest(method, url, data, json, contentType) {
	return new Promise((res, rej) => {
		json = json === undefined ? true : json;
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		if (contentType) xhr.setRequestHeader('Content-Type', contentType);

		// should be removed when not in dev anymore
		xhr.withCredentials = true;

		xhr.onload = e => {
			if (xhr.readyState === 4 && xhr.status === 200)
				res(json ? JSON.parse(xhr.responseText) : xhr.responseText);
			else rej(e, xhr.statusText);
		};
		xhr.onerror = e => rej(xhr.statusText);
		xhr.send(data);
	});
}
function sendJson(method, url, obj, json) {
	return sendRequest(method, url, JSON.stringify(obj), json, 'application/json;charset=UTF-8');
}
function sendForm(method, url, form, json) {
	return sendRequest(method, url, form, json);
}

export default {
	loadCategories: () => sendRequest('GET', 'http://localhost:3000/categories'),
	loadUser: () => sendRequest('GET', 'http://localhost:3000/user'),
	login: data => sendForm('POST', 'http://localhost:3000/login', data, false),
	register: data => sendForm('POST', 'http://localhost:3000/login', data, false),
	logout: () => sendRequest('POST', 'http://localhost:3000/logout', null, false),
	getToken: () => sendRequest('GET', 'http://localhost:3000/registertoken'),
	activateToken: token => sendJson('POST', 'http://localhost:3000/registertoken', token),
	getLanguages: () => sendRequest('GET', 'http://localhost:3000/wordlists'),
	getWordlist: lang => sendRequest('GET', `http://localhost:3000/wordlist/${lang.toLowerCase()}.txt`),
	createCategory: categoryForm => sendForm('POST', 'http://localhost:3000/category', categoryForm),
	updateCategory: category => sendJson('PUT', 'http://localhost:3000/category', category),
	deleteCategory: id => sendJson('DELETE', 'http://localhost:3000/category', { _id: id }),
	createCredential: credentialForm => sendForm('POST', '/credential', credentialForm),
	updateCredential: credential => sendJson('PUT', '/credential', credential),
	deleteCredential: credential => sendJson('DELETE', '/credential', credential)
};