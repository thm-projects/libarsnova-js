var profile = (function () {
	"use strict";

	return {
		resourceTags: {
			amd: function (filename) {
				return (/\.js$/).test(filename);
			}
		}
	};
}());
