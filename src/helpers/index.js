export const requestData = ({ CORS, url, key, ...rest }) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		// const wrappedUrl = `${CORS}${url}&mode=poll`;
		const wrappedUrl = `${url}&mode=poll`;

		xhr.open('GET', wrappedUrl, true);
		xhr.onload = function x() {
			if (this.status === 200) {
				resolve({
					...JSON.parse(this.response).payload[0].data,
					...rest,
					key,
					url,
				});
			} else {
				const error = new Error(this.statusText);
				error.code = this.status;
				reject({
					...rest,
					key,
					url,
					error
				});
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
