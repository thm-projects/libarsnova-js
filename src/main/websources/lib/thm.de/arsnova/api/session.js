/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 *
 * This file is part of libarsnova-js.
 *
 * libarsnova-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
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
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/socket"
	],
	function (config, declare, Deferred, Stateful, JsonRestStore, MemoryStore, CacheStore, socket) {
		"use strict";

		var
			self = null,
			apiPrefix = config.arsnovaApi.root + "session/",

			SessionState = declare([Stateful], {
				key: null,
				activeUserCount: "-"
			}),

			sessionState = new SessionState({
				key: null,
				activeUserCount: "-"
			}),

			sessionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "keyword"
			}),
			sessionMemory = new MemoryStore({
				idProperty: "keyword"
			}),
			sessionStore = new CacheStore(sessionJsonRest, sessionMemory)
		;

		sessionState.watch("key", function (name, oldValue, value) {
			console.log("Session key changed: " + value);
			socket.emit("setSession", {keyword: value});
		});

		socket.onReconnect(function () {
			if (sessionState.getKey()) {
				socket.emit("setSession", {keyword: sessionState.getKey()});
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
				return sessionStore.query({visitedonly: true});
			},

			getOwned: function () {
				return sessionStore.query({ownedonly: true});
			},

			validate: function (session) {
				if (!session.name || !session.shortName) {
					return null;
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

				return sessionStore.update(session, {
					id: session._id,
					overwrite: true
				});
			},

			watchActiveUserCount: function (callback) {
				sessionState.watch("activeUserCount", callback);
			}
		};

		return self;
	}
);
