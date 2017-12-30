const CORS = 'https://cors-anywhere.herokuapp.com/';

export const requestData = ({ url }) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const wrappedUrl = `${CORS}${url}&mode=poll`;

		xhr.open('GET', wrappedUrl, true);
		xhr.onload = function x() {
			if (this.status === 200) {
				let response = {};

				try {
					response = JSON.parse(this.response).payload[0].data;
				} catch (e) {
					console.error('JSON.parse error', e); // eslint-disable-line
				} finally {
					resolve(response);
				}
			} else {
				const error = new Error(this.statusText);
				error.code = this.status;
				reject(error);
			}
		};

		xhr.send();
		xhr.onerror = () => reject(new Error('oops'));
	});
};

export const Promise_all = (promises) => {
	return new Promise((resolve) => {
		const results = [];
		let count = 0;
		promises.forEach((promise, idx) => {
			promise
				.catch(err => err)
				.then(valueOrError => {
					results[idx] = valueOrError;
					count += 1;
					if (count === promises.length) resolve(results);
				});
		});
	});
};
