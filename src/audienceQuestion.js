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
		"dojo/_base/declare",
		"libarsnova/store/RestQueryCache",
		"libarsnova/globalConfig",
		"libarsnova/session",
		"libarsnova/socket",
		"libarsnova/model/AudienceQuestion",
		"libarsnova/model/audienceQuestionPropertyMap"
	],
	function (declare, RestQueryCache, globalConfig, sessionModel, socket, AudienceQuestion, audienceQuestionPropertyMap) {
		"use strict";

		var
			self = null,
			apiPrefix = globalConfig.get().apiPath + "/audiencequestion/",

			AudienceQuestionStore = declare(RestQueryCache, {
				target: apiPrefix,
				model: AudienceQuestion,
				propertyMap: audienceQuestionPropertyMap
			}),
			questionStore = null
		;

		sessionModel.watchKey(function (name, oldValue, value) {
			questionStore = new AudienceQuestionStore();
		});

		self = {
			getStore: function () {
				return questionStore;
			},

			getAll: function () {
				return questionStore.filter({
					sessionkey: sessionModel.getKey()
				}).fetch();
			},

			get: function (id) {
				var question = questionStore.get(id);
				if (!question.body) {
					/* force reloading of question */
					questionStore.cachingStore.remove(id);
					question = questionStore.get(id);
				}

				return question;
			},

			remove: function (id) {
				questionStore.remove(id);
			},

			onQuestionAvailable: function (callback) {
				socket.on("audQuestionAvail", callback);
			}
		};

		return self;
	}
);
