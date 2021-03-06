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
		"dojo/_base/declare",
		"dmodel/Model"
	],
	function (declare, Model) {
		"use strict";

		return declare(Model, {
			schema: {
				id: {
					type: "string",
					required: false
				},
				sessionId: {
					type: "string",
					required: true
				},
				subject: {
					type: "string",
					required: true
				},
				body: {
					type: "string",
					required: true
				},
				read: {
					type: "boolean",
					required: false,
					"default": false
				},
				creation: {
					type: "number",
					required: false
				}
			}
		});
	}
);
