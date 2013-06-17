/* Dojo application profile for production */
var profile = (function() {
	var libPath = "src/main/websources/lib/";
	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "../../..",
		action: "release",
		mini: true,
		layerOptimize: "closure",
		cssOptimize: "comments",

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
					"dojo/selector/acme", // this module is always needed

					"arsnova-api/audienceQuestion",
					"arsnova-api/auth",
					"arsnova-api/feedback",
					"arsnova-api/lecturerQuestion",
					"arsnova-api/session",
					"arsnova-api/socket",

					"version"
				]
			}
		}
	};
})();
