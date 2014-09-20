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
		"dojo/string",
		"dojo/Deferred",
		"dojo/when",
		"dojo/Stateful",
		"arsnova-api/store/RestQueryCache",
		"arsnova-api/globalConfig",
		"arsnova-api/session",
		"arsnova-api/socket",
		"arsnova-api/model/LecturerQuestion",
		"arsnova-api/model/lecturerQuestionPropertyMap",
		"arsnova-api/model/AnswerChoiceSummary",
		"arsnova-api/model/answerChoiceSummaryPropertyMap",
		"arsnova-api/model/AnswerText",
		"arsnova-api/model/answerTextPropertyMap"
	],
	function (declare, string, Deferred, when, Stateful, RestQueryCache, globalConfig, sessionModel, socket, LecturerQuestion, lecturerQuestionPropertyMap, AnswerChoiceSummary, answerChoiceSummaryPropertyMap, AnswerText, answerTextPropertyMap) {
		"use strict";

		var
			self = null,
			apiPrefix = globalConfig.get().apiPath + "/lecturerquestion/",
			answerPath = apiPrefix + "${questionId}/answer/",

			questionStore = null,
			questionCache = null,
			questionSortIndex = [],
			questionSortIndexPi = [],
			questionSortIndexJitt = [],

			ftAnswerStore = null,

			answerCountStore = [],
			answerCountQuestionId = null,

			subjects = [],

			/* declarations of private "methods" */
			buildQuestionSortIndex = null,
			setupAnswerStore,

			LecturerQuestionStore = declare(RestQueryCache, {
				target: apiPrefix,
				model: LecturerQuestion,
				propertyMap: lecturerQuestionPropertyMap
			})
		;

		sessionModel.watchKey(function (name, oldValue, value) {
			self.resetState();
		});

		socket.on("lecQuestionAvail", function (lecturerQuestionId) {

		});

		socket.on("answersTolecQuestionAvail", function (lecturerQuestionId) {

		});

		self = {
			getStore: function () {
				return questionStore;
			},

			getCache: function () {
				return questionCache;
			},

			resetState: function () {
				questionStore = new LecturerQuestionStore();
				subjects = [];
			},

			getAll: function (type) {
				if (!questionStore) {
					console.log("No session selected");

					return null;
				}

				var params = {sessionkey: sessionModel.getKey()};
				if ("pi" === type) {
					params.lecturequestionsonly = true;
				} else if ("jitt" === type) {
					params.preparationquestionsonly = true;
				}
//				var questions = questionStore.query(params);
				var questions = questionStore.filter(params);
				questionCache = questions.fetch();
				questionCache.then(function (questions) {
					subjects = [];
					buildQuestionSortIndex(questions);
				});

				return questionCache;
			},

			get: function (questionId) {
				return questionStore.get(questionId);
			},

			validate: function (question, noAnswers) {
				question.sessionId = sessionModel.getKey();
				if (noAnswers || !question.answerOptions) {
					question.answerOptions = [];
				}
				if (!noAnswers && question.answerOptions.length < 2 && "freetext" !== question.format
						|| !question.subject || !question.body || !sessionModel.getKey()) {
					return null;
				}

				return question;
			},

			create: function (question) {
				question = this.validate(question);
				if (!question) {
					var result = new Deferred();
					result.reject();

					return result;
				}

				return questionStore.add(question);
			},

			update: function (question) {
				question = this.validate(question);
				if (!question) {
					var result = new Deferred();
					result.reject();

					return result;
				}

				return questionStore.put(question, {
					id: question.id,
					overwrite: true
				});
			},

			remove: function (id) {
				if (!id) {
					return null;
				}
				return questionStore.remove(id);
			},

			prevId: function (id, type) {
				var sortIndex = "pi" === type
					? questionSortIndexPi
					: ("jitt" === type
						? questionSortIndexJitt
						: questionSortIndex);
				var prevQuestionIndex = null;
				for (var i = sortIndex.length - 1; i >= 0 ; i--) {
					if (id === sortIndex[i]) {
						prevQuestionIndex = 0 === i ? sortIndex.length - 1 : i - 1;

						break;
					}
				}

				return sortIndex[prevQuestionIndex];
			},

			nextId: function (id, type) {
				var sortIndex = "pi" === type
					? questionSortIndexPi
					: ("jitt" === type
						? questionSortIndexJitt
						: questionSortIndex);
				var nextQuestionIndex = null;
				for (var i = 0; i < sortIndex.length; i++) {
					if (id === sortIndex[i]) {
						nextQuestionIndex = sortIndex.length - 1 === i ? 0 : i + 1;

						break;
					}
				}

				return sortIndex[nextQuestionIndex];
			},

			firstId: function (type) {
				var sortIndex = "pi" === type
					? questionSortIndexPi
					: ("jitt" === type
						? questionSortIndexJitt
						: questionSortIndex);

				return sortIndex[0];
			},

			lastId: function (type) {
				var sortIndex = "pi" === type
					? questionSortIndexPi
					: ("jitt" === type
						? questionSortIndexJitt
						: questionSortIndex);

				return sortIndex[sortIndex.length - 1];
			},

			position: function (questionId, type) {
				var sortIndex = "pi" === type
				? questionSortIndexPi
				: ("jitt" === type
					? questionSortIndexJitt
					: questionSortIndex);

				return sortIndex.indexOf(questionId);
			},

			count: function (type) {
				var sortIndex = "pi" === type
				? questionSortIndexPi
				: ("jitt" === type
					? questionSortIndexJitt
					: questionSortIndex);

				return sortIndex.length;
			},

			getUnanswered: function () {
				if (!questionStore) {
					console.log("No session selected");

					return null;
				}

				return questionStore.filter({
					sessionkey: sessionModel.getKey(),
					filter: "unanswered"
				}).fetch();
			},

			getAnswers: function (questionId, round, refresh) {
				if (questionId !== answerCountQuestionId) {
					setupAnswerStore(questionId);
					answerCountQuestionId = questionId;
				}
				var question = self.get(questionId);

				return when(question, function (question) {
					if ("freetext" === question.format) {
						if (!refresh && ftAnswerStore.cachingStore.data.length > 0) {
							return ftAnswerStore.cachingStore.fetch();
						}

						return ftAnswerStore.fetch();
					}

					if (undefined === round || round < 1 || round > 2) {
						round = question.round;
					}

					if (refresh || !answerCountStore[round]) {
						answerCountStore[round] = new RestQueryCache({
							target: string.substitute(answerPath, {questionId: question.id}),
							model: AnswerChoiceSummary,
							propertyMap: answerChoiceSummaryPropertyMap
						});

						return answerCountStore[round].filter({round: round}).fetch();
					}

					return answerCountStore[round].cachingStore.fetch();
				});
			},

			removeAnswer: function (questionId, id) {
				if (!id) {
					return null;
				}
				if (questionId !== answerCountQuestionId) {
					setupAnswerStore(questionId);
					answerCountQuestionId = questionId;
				}

				return ftAnswerStore.remove(id);
			},

			removeAllAnswers: function (questionId) {
				if (!questionId) {
					return null;
				}
				if (questionId !== answerCountQuestionId) {
					setupAnswerStore(questionId);
					answerCountQuestionId = questionId;
				}

				return ftAnswerStore.remove("");
			},

			updateLocks: function (questionId, lockQuestion, lockStats, lockCorrect) {
				var question = self.get(questionId);

				return when(question, function (question) {
					question.active = !lockQuestion;
					question.publishResults = !lockStats;
					question.publishCorrectAnswer = !lockCorrect;

					return self.update(question);
				});
			},

			startSecondPiRound: function (questionId) {
				var question = self.get(questionId);
				return when(question, function (question) {
					question.round = 2;
					return self.update(question);
				});
			},

			getSubjects: function () {
				if (0 === subjects.length && questionStore) {
					questionCache.forEach(function (question) {
						if (-1 === subjects.indexOf(question.subject)) {
							subjects.push(question.subject);
						}
					});
					subjects.sort();
				}

				return subjects;
			},

			onAnswersAvailable: function (callback) {
				socket.on("answersToLecQuestionAvail", callback);
			}
		};

		buildQuestionSortIndex = function (questions) {
			questionSortIndex = [];
			questionSortIndexPi = [];
			questionSortIndexJitt = [];

			questions.sort(function (q1, q2) {
				var r = q1.subject.localeCompare(q2.subject);
				if (0 === r) {
					r = q1.number - q2.number;
				}
				if (0 === r) {
					r = q1.body.localeCompare(q2.body);
				}

				return r;
			});

			questions.forEach(function (question) {
				questionSortIndex.push(question.id);
				if ("lecture" === question.type) {
					questionSortIndexPi.push(question.id);
				}
				if ("preparation" === question.type) {
					questionSortIndexJitt.push(question.id);
				}
			});
		};

		setupAnswerStore = function (questionId) {
			ftAnswerStore = new RestQueryCache({
				target: string.substitute(answerPath, {questionId: questionId}),
				model: AnswerText,
				propertyMap: answerTextPropertyMap
			});

			/* remove cached answers */
			answerCountStore = [];
		};

		return self;
	}
);
