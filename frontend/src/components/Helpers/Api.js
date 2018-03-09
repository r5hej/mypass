function sendRequest(method, url, data, json = true, contentType = '') {
	return new Promise((res, rej) => {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);

		// should be removed when not in dev anymore
		xhr.withCredentials = true;

		xhr.onload = e => {
			if (xhr.readyState === 4 && xhr.status === 200)
				res(json ? JSON.parse(xhr.responseText) : xhr.responseText);
			else rej(e, xhr.statusText);
		};
		xhr.onerror = e => rej(xhr.statusText);
        if (contentType) xhr.setRequestHeader('Content-Type', contentType);
		xhr.send(data);
	});
}
function sendJson(method, url, obj, json = true) {
	return sendRequest(method, url, JSON.stringify(obj), json, 'application/json;charset=UTF-8');
}
function sendForm(method, url, form, json = true) {
    return sendRequest(method, url, form, json);
}
export default {
	loadCategories: () => sendRequest('GET', '/categories'),
	loadUser: () => sendRequest('GET', '/user'),
    register: form => sendForm('POST', '/register', form, false),
	login: form => sendForm('POST', '/login', form, false),
	logout: () => sendRequest('POST', '/logout', null, false),
	getToken: () => sendRequest('GET', '/registertoken'),
	activateToken: obj => sendJson('POST', '/registertoken', obj),
	getLanguages: () => sendRequest('GET', '/wordlists'),
	getWordlist: lang => sendRequest('GET', `/assets/wordlist/${lang.toLowerCase()}.txt`, null, false),
	createCategory: form => sendForm('POST', '/category', form),
	updateCategory: obj => sendJson('PUT', '/category', obj),
	deleteCategory: obj => sendJson('DELETE', '/category', { _id: obj._id }),
	createCredential: form => sendForm('POST', '/credential', form),
	updateCredential: obj => sendJson('PUT', '/credential', obj),
	deleteCredential: obj => sendJson('DELETE', '/credential', { _id: obj._id })
};