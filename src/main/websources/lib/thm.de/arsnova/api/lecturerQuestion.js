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
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/globalConfig",
		"arsnova-api/session",
		"arsnova-api/socket"
	],
	function (declare, string, Deferred, when, Stateful, JsonRestStore, MemoryStore, CacheStore, globalConfig, sessionModel, socket) {
		"use strict";

		var
			self = null,
			apiPrefix = globalConfig.get().apiPath + "/lecturerquestion/",
			answerPath = apiPrefix + "${questionId}/answer/",

			questionJsonRest = null,
			questionMemory = null,
			questionStore = null,
			questionSortIndex = [],
			questionSortIndexPi = [],
			questionSortIndexJitt = [],

			ftAnswerJsonRest = null,
			ftAnswerMemory = null,
			ftAnswerStore = null,

			answerCountJsonRest = [],
			answerCountMemory = [],
			answerCountStore = [],
			answerCountQuestionId = null,

			subjects = [],

			/* declarations of private "methods" */
			buildQuestionSortIndex = null,
			setupAnswerStore
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

			resetState: function () {
				questionJsonRest = new JsonRestStore({
					target: apiPrefix,
					idProperty: "_id"
				});
				questionMemory = new MemoryStore({
					idProperty: "_id"
				});
				questionStore = new CacheStore(questionJsonRest, questionMemory);
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
				var questions = questionStore.query(params);
				questions.then(function () {
					buildQuestionSortIndex();
					subjects = [];
				});

				return questions;
			},

			get: function (questionId) {
				return questionStore.get(questionId);
			},

			validate: function (question, noAnswers) {
				question.sessionKeyword = sessionModel.getKey();
				question.questionVariant = question.questionVariant || "lecture";
				question.releasedFor = question.releasedFor || "all";
				if (noAnswers || !question.possibleAnswers) {
					question.possibleAnswers = [];
				}
				if (!noAnswers && question.possibleAnswers.length < 2 && "freetext" !== question.questionType
						|| !question.subject || !question.text || !sessionModel.getKey()) {
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
					id: question._id,
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

				return questionStore.query({
					sessionkey: sessionModel.getKey(),
					filter: "unanswered"
				});
			},

			getAnswers: function (questionId, piRound, refresh) {
				if (questionId !== answerCountQuestionId) {
					setupAnswerStore(questionId);
					answerCountQuestionId = questionId;
				}
				var question = self.get(questionId);

				return when(question, function (question) {
					if ("freetext" === question.questionType) {
						if (!refresh && ftAnswerMemory.data.length > 0) {
							return ftAnswerMemory.query();
						}

						return ftAnswerStore.query();
					}

					if (undefined === piRound || piRound < 1 || piRound > 2) {
						piRound = question.piRound;
					}

					if (refresh || !answerCountStore[piRound]) {
						answerCountJsonRest[piRound] = new JsonRestStore({
							target: string.substitute(answerPath, {questionId: question._id}),
							idProperty: "answerText"
						});
						answerCountMemory[piRound] = new MemoryStore({
							idProperty: "answerText"
						});
						answerCountStore[piRound] = new CacheStore(answerCountJsonRest[piRound], answerCountMemory[piRound]);

						return answerCountStore[piRound].query({piround: piRound});
					}

					return answerCountMemory[piRound].query();
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
					question.showStatistic = !lockStats;
					question.showAnswer = !lockCorrect;

					return self.update(question);
				});
			},

			startSecondPiRound: function (questionId) {
				var question = self.get(questionId);
				return when(question, function (question) {
					question.piRound = 2;
					return self.update(question);
				});
			},

			getSubjects: function () {
				if (0 === subjects.length && questionMemory) {
					questionMemory.query().forEach(function (question) {
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

		buildQuestionSortIndex = function () {
			questionSortIndex = [];
			questionSortIndexPi = [];
			questionSortIndexJitt = [];
			var questions = questionMemory.query();

			questions.sort(function (q1, q2) {
				var r = q1.subject.localeCompare(q2.subject);
				if (0 === r) {
					r = q1.number - q2.number;
				}
				if (0 === r) {
					r = q1.text.localeCompare(q2.text);
				}

				return r;
			});

			questions.forEach(function (question) {
				questionSortIndex.push(question._id);
				if ("lecture" === question.questionVariant) {
					questionSortIndexPi.push(question._id);
				}
				if ("preparation" === question.questionVariant) {
					questionSortIndexJitt.push(question._id);
				}
			});
		};

		setupAnswerStore = function (questionId) {
			ftAnswerJsonRest = new JsonRestStore({
				target: string.substitute(answerPath, {questionId: questionId}),
				idProperty: "_id"
			});
			ftAnswerMemory = new MemoryStore({
				idProperty: "_id"
			});
			ftAnswerStore = new CacheStore(ftAnswerJsonRest, ftAnswerMemory);

			/* remove cached answers */
			answerCountStore = [];
		};

		return self;
	}
);
