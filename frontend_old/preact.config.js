import asyncPlugin from 'preact-cli-plugin-async';

export default (config, env, helpers) => {
	asyncPlugin(config);
	config.devServer = {
		hot: true,
		quiet: true,
		publicPath: '/',
		historyApiFallback: true,
		proxy: [
			{
				path: '/api/**',
				target: 'http://localhost:4590'
				// ...any other stuff...
			}
		]
	};
};