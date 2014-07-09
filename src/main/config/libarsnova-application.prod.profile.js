/* Dojo application profile for production */
var profile = (function () {
	"use strict";

	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "../../..",
		action: "release",
		mini: true,
		layerOptimize: "closure",
		cssOptimize: "comments",
		stripConsole: "all",
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			baseUrl: "app/",
			paths: {
				"dojo": "../lib/dojotoolkit.org/dojo"
			}
		},

		packages: [
			{
				name: "dojo",
				location: dojoPath + "dojo"
			},
			{
				name: "arsnova-api",
				location: "src/main/websources/lib/thm.de/arsnova/api"
			},
			{
				name: "version",
				location: versionFilePath,
				main: "version"
			}
		],

		layers: {
			"app/libarsnova": {
				customBase: true, // do not add dojo/main automatically
				boot: true,
				include: [
					"dojo/dojo", // Dojo loader

					"arsnova-api/audienceQuestion",
					"arsnova-api/auth",
					"arsnova-api/feedback",
					"arsnova-api/lecturerQuestion",
					"arsnova-api/session",
					"arsnova-api/socket",

					"version"
				]
			}
		},

		staticHasFeatures: {
			/* These properties allow Closure compiler to remove unused code from Dojo Toolkit
			 * and further decrease file size of the build */
			"config-deferredInstrumentation": 0,
			"config-dojo-loader-catches": 0,
			"config-tlmSiblingOfDojo": 1,
			"dojo-amd-factory-scan": 0,
			"dojo-combo-api": 0,
			"dojo-config-api": 1,
			"dojo-config-require": 0,
			"dojo-debug-messages": 0,
			"dojo-dom-ready-api": 1,
			"dojo-firebug": 0,
			"dojo-guarantee-console": 0,
			"dojo-has-api": 1,
			"dojo-inject-api": 1,
			"dojo-loader": 0,
			"dojo-log-api": 0,
			"dojo-modulePaths": 0,
			"dojo-moduleUrl": 0,
			"dojo-publish-privates": 0,
			"dojo-requirejs-api": 0,
			"dojo-sniff": 0,
			"dojo-sync-loader": 0,
			"dojo-test-sniff": 0,
			"dojo-timeout-api": 0,
			"dojo-trace-api": 0,
			"dojo-undef-api": 0,
			"dojo-v1x-i18n-Api": 1,
			"dojo-xhr-factory": 0,
			"dom": 1,
			"extend-dojo": 1,
			"host-browser": 1
		}
	};
}());
