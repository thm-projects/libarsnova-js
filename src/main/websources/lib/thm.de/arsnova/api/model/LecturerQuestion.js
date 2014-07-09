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
		"dojo/_base/declare",
		"dstore/Model"
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
				type: {
					type: "string",
					required: true,
					"default": "lecture"
				},
				format: {
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
				active: {
					type: "boolean",
					required: true,
					"default": true
				},
				number: {
					type: "number",
					required: false
				},
				round: {
					type: "number",
					required: false
				},
				answerOptions: {
					type: "object",
					required: false
				},
				allowAbstentions: {
					type: "boolean",
					required: false,
					"default": false
				},
				publishCorrectAnswer: {
					type: "boolean",
					required: false,
					"default": false
				},
				publishResults: {
					type: "boolean",
					required: false,
					"default": false
				}
			}
		});
	}
);
