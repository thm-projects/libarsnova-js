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
		"dojo/when",
		"dojo/request",
		"libarsnova/globalConfig"
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
			reconnectListeners = [],
			latencyUpdateListeners = [],
			pingSentTime = 0,
			pingTimeoutHandle = null,

			/* private methods */
			setupLatencyCheck = null
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
						setupLatencyCheck(socketConn.io.engine);
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
						setupLatencyCheck(socketConn.io.engine);
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

			onLatencyUpdate: function (listener) {
				latencyUpdateListeners.push(listener);
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

		setupLatencyCheck = function (eio) {
			var ping = eio.ping;
			eio.ping = function () {
				console.debug("PING");
				ping.call(eio);
				pingSentTime = Date.now();
				pingTimeoutHandle = setTimeout(function () {
					var latency = -1;
					console.log("Socket.IO: high latency (> 5000ms)");
					latencyUpdateListeners.forEach(function (listener) {
						listener(latency);
					});
				}, 5000);
			};
			eio.on("heartbeat", function () {
				console.debug("PONG");
				if (pingSentTime > 0) {
					clearTimeout(pingTimeoutHandle);
					var latency = Date.now() - pingSentTime;
					console.debug("Socket.IO: latency is " + latency + "ms");
					latencyUpdateListeners.forEach(function (listener) {
						listener(latency);
					});
				}
				pingSentTime = 0;
			});
		};

		return self;
	}
);
