var profile = (function () {
	"use strict";

	var depPath = "bower_components/";

	return {
		basePath: "./",
		action: "release",
		mini: true,
		layerOptimize: false,
		cssOptimize: "comments",
		stripConsole: "all",
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			baseUrl: "./",
			hasCache: {
				"config-selectorEngine": "lite"
			}
		},

		packages: [
			{
				name: "dojo",
				location: depPath + "dojo"
			},
			{
				name: "dstore",
				location: depPath + "dstore"
			},
			{
				name: "dmodel",
				location: depPath + "dmodel"
			},
			{
				name: "rql",
				location: depPath + "rql"
			}
		],

		layers: {
			"dojo/dojo":{
				customBase: true,
				include: []
			},
			"libarsnova/libarsnova": {
				/* do not add dojo/main automatically */
				customBase: true,
				boot: true,
				include: [
					"dojo/request/xhr",

					"libarsnova/audienceQuestion",
					"libarsnova/auth",
					"libarsnova/feedback",
					"libarsnova/lecturerQuestion",
					"libarsnova/session",
					"libarsnova/socket"
				]
			}
		},

		staticHasFeatures: {
			/* These properties allow Closure compiler to remove unused code
			 * from Dojo Toolkit and further decrease file size of the build */
			"config-deferredInstrumentation": 0,
			"config-dojo-loader-catches": 0,
			"config-stripStrict": 0,
			"config-tlmSiblingOfDojo": 1,
			"dojo-amd-factory-scan": 0,
			"dojo-built": 1,
			"dojo-cdn": 0,
			"dojo-combo-api": 0,
			"dojo-config-api": 1,
			"dojo-config-require": 0,
			"dojo-debug-messages": 0,
			"dojo-dom-ready-api": 0,
			"dojo-firebug": 0,
			"dojo-guarantee-console": 0,
			"dojo-has-api": 1,
			"dojo-inject-api": 1,
			"dojo-loader": 0,
			"dojo-loader-eval-hint-url": 1,
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
			"dojo-v1x-i18n-Api": 0,
			"dojo-xhr-factory": 0,
			"dom": 0,
			"extend-dojo": 0,
			"host-browser": 1,
			"host-node": 0,
			"host-rhino": 0,

			/* There is no UI in libarsnova so touch support can be removed */
			"touch": 0,

			/* Legacy browsers are not supported so remove unnecessary code */
			"activex": 0,
			"dojo-force-activex-xhr": 0,
			"dom-addeventlistener": 1,
			"ie-event-behavior": 0,
			"json-parse": 1,
			"json-stringify": 1,
			"quirks": 0
		}
	};
}());
