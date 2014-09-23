/*
 * This file is part of libarsnova-js.
 * Copyright 2013-2014 Daniel Gerhardt <code@dgerhardt.net>
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
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/Deferred",
		"dojo/Stateful",
		"libarsnova/store/RestQueryCache",
		"libarsnova/globalConfig",
		"libarsnova/socket",
		"libarsnova/model/Session",
		"libarsnova/model/sessionPropertyMap"
	],
	function (config, declare, Deferred, Stateful, RestQueryCache, globalConfig, socket, Session, sessionPropertyMap) {
		"use strict";

		var
			self = null,
			apiPrefix = globalConfig.get().apiPath + "/session/",

			SessionState = declare([Stateful], {
				key: null,
				activeUserCount: "-"
			}),

			sessionState = new SessionState({
				key: null,
				activeUserCount: "-"
			}),

			sessionStore = new RestQueryCache({
				target: apiPrefix,
				model: Session,
				propertyMap: sessionPropertyMap
			})
		;

		sessionState.watch("key", function (name, oldValue, value) {
			console.log("Session key changed: " + value);
			socket.emit("setSession", {keyword: value});
		});

		socket.onReconnect(function () {
			if (sessionState.get("key")) {
				socket.emit("setSession", {keyword: sessionState.get("key")});
			}
		});

		socket.on("activeUserCountData", function (activeUserCount) {
			sessionState.set("activeUserCount", activeUserCount);
		});

		self = {
			watchKey: function (callback) {
				sessionState.watch("key", callback);
			},

			getKey: function () {
				return sessionState.get("key");
			},

			setKey: function (value) {
				if (value !== sessionState.get("key")) {
					sessionState.set("key", value);
				}
			},

			getCurrent: function () {
				return sessionStore.get(sessionState.get("key"));
			},

			getStore: function () {
				return sessionStore;
			},

			getVisited: function () {
				return sessionStore.filter({visitedonly: true}).fetch();
			},

			getOwned: function () {
				return sessionStore.filter({ownedonly: true}).fetch();
			},

			validate: function (session) {
				if (!session.name || !session.shortName) {
					return null;
				}

				if (session.hasOwnProperty("courseSession")) {
					/* courseSession may be set in received data but is not accepted by the backend */
					delete session.courseSession;
				}

				return session;
			},

			create: function (session) {
				session = this.validate(session);
				if (!session) {
					var result = new Deferred();
					result.reject();

					return result;
				}

				return sessionStore.add(session);
			},

			update: function (session) {
				session = this.validate(session);
				if (!session) {
					var result = new Deferred();
					result.reject();

					return result;
				}

				return sessionStore.put(session, {
					id: session.id,
					overwrite: true
				});
			},

			remove: function (id) {
				if (id) {
					return sessionStore.remove(id);
				}

				return null;
			},

			watchActiveUserCount: function (callback) {
				sessionState.watch("activeUserCount", callback);
			}
		};

		return self;
	}
);
