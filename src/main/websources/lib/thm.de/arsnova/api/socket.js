/*
 * Copyright 2013-2014 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
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
		"dojo/when",
		"dojo/request",
		"arsnova-api/globalConfig"
	],
	function (when, request, globalConfig) {
		"use strict";

		var
			self = null,
			socketApiPrefix = globalConfig.get().apiPath + "/socket/",
			socketUrl = request.get(socketApiPrefix + "url"),
			socket = null,
			firstConnect = true,
			callbacks = [],
			reconnectListeners = []
		;

		self = {
			connect: function () {
				if (!io || socket) {
					return;
				}
				socket = when(socketUrl, function (socketUrl) {
					var socketConn = io.connect(socketUrl);
					socketConn.on("connect", function () {
						if (!firstConnect) {
							return;
						}
						firstConnect = false;
						console.log("Socket.IO: connected");
						self.assign();

						for (var i = 0; i < callbacks.length; i++) {
							self.on(callbacks[i][0], callbacks[i][1]);
						}
						callbacks = [];
					});
					socketConn.on("disconnect", function () {
						console.log("Socket.IO: disconnected");
					});
					socketConn.on("reconnect", function () {
						console.log("Socket.IO: reconnected");
						when(self.assign(), function () {
							for (var i = 0; i < reconnectListeners.length; i++) {
								reconnectListeners[i]();
							}
						});
					});

					return socketConn;
				});
			},

			assign: function () {
				return when(socket, function (socket) {
					return request.post(socketApiPrefix + "assign", {
						headers: {"Content-Type": "application/json"},
						data: JSON.stringify({session: socket.io.engine.id})
					}).then(function () {
						console.log("Socket.IO: sessionid " + socket.io.engine.id + " assigned to user");
					});
				});
			},

			onReconnect: function (listener) {
				reconnectListeners.push(listener);
			},

			on: function (eventName, callback) {
				if (!socket) {
					callbacks.push([eventName, callback]);

					return;
				}
				when(socket, function (socket) {
					console.log("Socket.IO: added listener for " + eventName + " events");
					socket.on(eventName, function (data) {
						console.debug("Socket.IO: " + eventName + " received");
						callback(data);
					});
				});
			},

			emit: function (eventName, data) {
				if (!socket) {
					return;
				}
				when(socket, function (socket) {
					console.debug("Socket.IO: " + eventName + " emitted");
					socket.emit(eventName, data);
				});
			}
		};

		return self;
	}
);
