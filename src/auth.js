/*
 * This file is part of libarsnova-js.
 * Copyright 2013-2015 Daniel Gerhardt <code@dgerhardt.net>
 *
 * libarsnova-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * libarsnova-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/string",
		"dojo/request",
		"dojo/Deferred",
		"libarsnova/globalConfig"
	],
	function (string, request, Deferred, globalConfig) {
		"use strict";

		var
			self = null,
			apiPrefix = globalConfig.get().apiPath + "/auth/",
			loginError = false,
			loginType = null,
			username = null,
			servicesDfd = null,

			checkLoginStatus = function () {
				request.get(apiPrefix, {sync: true, handleAs: "json"}).then(
					function (response) {
						if ("guest" === response.type) {
							loginError = true;
						} else {
							loginType = response.type;
							username = response.username;
						}
					},
					function (error) {
						loginError = true;
					}
				);
			}
		;

		self = {
			init: function (loginHandler) {
				console.log("-- auth.init --");

				checkLoginStatus();
				if (loginError) {
					console.log("Auth: user is not logged in");
					if (loginType) {
						console.log("Auth: user will be redirected to login service");
						location.href = apiPrefix + "login?type=" + loginType + "&user=" + username + "&role=SPEAKER";
					} else {
						console.log("Auth: user cannot be logged in automatically");
						loginHandler();
						servicesDfd = new Deferred();
						var services = request.get(apiPrefix + "services", {handleAs: "json"});
						services.then(function (services) {
							services.sort(function (a, b) {
								if (a.order > 0 && (a.order < b.order || b.order <= 0)) {
									return -1;
								}
								if (b.order > 0 && (a.order > b.order || a.order <= 0)) {
									return 1;
								}

								return 0;
							});
							servicesDfd.resolve(services);
						});
					}
				} else {
					console.log("Auth: user is already logged in (" + loginType + ")");
				}
			},

			getServices: function () {
				return servicesDfd;
			},

			logout: function () {
				location.href = apiPrefix + "logout";
			},

			isLoggedIn: function () {
				return !loginError;
			}
		};

		return self;
	}
);
