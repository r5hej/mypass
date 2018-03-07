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
	loadCategories: () => sendRequest('GET', 'http://localhost:3000/categories'),
	loadUser: () => sendRequest('GET', 'http://localhost:3000/user'),
    register: form => sendForm('POST', 'http://localhost:3000/register', form, false),
	login: form => sendForm('POST', 'http://localhost:3000/login', form, false),
	logout: () => sendRequest('POST', 'http://localhost:3000/logout', null, false),
	getToken: () => sendRequest('GET', 'http://localhost:3000/registertoken'),
	activateToken: obj => sendJson('POST', 'http://localhost:3000/registertoken', obj),
	getLanguages: () => sendRequest('GET', 'http://localhost:3000/wordlists'),
	getWordlist: lang => sendRequest('GET', `http://localhost:3000/wordlist/${lang.toLowerCase()}.txt`),
	createCategory: form => sendForm('POST', 'http://localhost:3000/category', form),
	updateCategory: obj => sendJson('PUT', 'http://localhost:3000/category', obj),
	deleteCategory: obj => sendJson('DELETE', 'http://localhost:3000/category', { _id: obj._id }),
	createCredential: form => sendForm('POST', 'http://localhost:3000/credential', form),
	updateCredential: obj => sendJson('PUT', 'http://localhost:3000/credential', obj),
	deleteCredential: obj => sendJson('DELETE', 'http://localhost:3000/credential', { _id: obj._id })
};