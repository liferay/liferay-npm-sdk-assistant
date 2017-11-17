import * as gradle from './tool/gradle';
import * as npm from './tool/npm';
import * as babel from './tool/babel';
import * as liferayNpmBundler from './tool/liferay-npm-bundler';
import * as portal from './tool/portal';

/**
 * Default entry point for the lnk command line tool
 * @param {String[]} argv
 * @return {void}
 */
export function analyze(argv) {
	// TODO: report diagnostic errors when requested by a flag
	// TODO: find all babel and liferay-npm-bundler plugin versions just in case

	const gradlePromise = gradle.version();
	const gradlePluginsNodePromise = gradle.nodePluginVersion();
	const npmVersionPromise = npm.version();
	const babelVersion = babel.version();
	const liferayNpmBundlerPromise = liferayNpmBundler.version();
	const loaderModulesExtenderPromise = portal.osgiBundleVersion(
		argv.server,
		argv.gogoPort,
		'Liferay Frontend JS Loader Modules Extender'
	);
	const amdLoaderVersionPromise = portal.amdLoaderVersion(
		argv.server,
		argv.httpPort
	);

	Promise.all([
		gradlePromise,
		gradlePluginsNodePromise,
		npmVersionPromise,
		babelVersion,
		liferayNpmBundlerPromise,
		loaderModulesExtenderPromise,
		amdLoaderVersionPromise,
	]).then(() => {
		gradlePromise.then(version => console.log('gradle:', version));
		gradlePluginsNodePromise.then(version =>
			console.log('gradle-plugins-node:', version)
		);
		npmVersionPromise.then(version => console.log('npm:', version));
		babelVersion.then(version => console.log('babel:', version));
		liferayNpmBundlerPromise.then(version =>
			console.log('liferay-npm-bundler:', version)
		);
		loaderModulesExtenderPromise.then(version =>
			console.log('frontend-js-loader-modules-extender:', version)
		);
		amdLoaderVersionPromise.then(version =>
			console.log('liferay-amd-loader:', version)
		);
	});
}
