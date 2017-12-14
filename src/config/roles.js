const roles = {
	admins: [
		'groverfmx@gmail.com',
		'trilorn0@gmail.com',
	],
};

export const premissionRequest = (email) => Boolean(~roles.admins.indexOf(email));
