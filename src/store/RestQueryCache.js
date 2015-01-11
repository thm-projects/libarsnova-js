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
		"dojo/_base/lang",
		"dstore/Rest",
		"dstore/Cache"
	],
	function (declare, lang, Rest, Cache) {
		"use strict";

		return declare([Rest, Cache], {
			queryCache: null,
			propertyMap: {},
			reversedPropertyMap: null,

			parse: function (text) {
				if (!this.reversedPropertyMap) {
					this.reversedPropertyMap = {};
					for (var property in this.propertyMap) {
						if (this.propertyMap.hasOwnProperty(property)) {
							this.reversedPropertyMap[this.propertyMap[property]] = property;
						}
					}
				}
				var value = text ? JSON.parse(text) : [];

				var transform = function (value) {
					for (var property in value) {
						if (value.hasOwnProperty(property)) {
							if (this.reversedPropertyMap.hasOwnProperty(property)) {
								if (this.reversedPropertyMap[property]) {
									value[this.reversedPropertyMap[property]] = value[property];
									delete value[property];
								}
							} else if (this.model && !this.model.superclass.schema.hasOwnProperty(property)) {
								value._hidden = value._hidden || {};
								value._hidden[property] = value[property];
								delete value[property];
							}
						}
					}
				};

				if (Array.isArray(value)) {
					value.forEach(lang.hitch(this, transform));
				} else {
					(lang.hitch(this, transform))(value);
				}

				return value;
			},

			stringify: function (value) {
				value = lang.clone(value);
				var property;
				for (property in value) {
					if (value.hasOwnProperty(property) && "_hidden" !== property) {
						if (this.propertyMap.hasOwnProperty(property)) {
							if (this.propertyMap[property]) {
								value[this.propertyMap[property]] = value[property];
								delete value[property];
							}
						} else if (this.model && !this.model.superclass.schema.hasOwnProperty(property)) {
							delete value[property];
						}
					}
				}
				if (value._hidden) {
					for (property in value._hidden) {
						if (value._hidden.hasOwnProperty(property)) {
							value[property] = value._hidden[property];
						}
					}
					delete value._hidden;
				}
				if (this.propertyMap._mixin) {
					lang.mixin(value, this.propertyMap._mixin);
				}

				var text = JSON.stringify(value);

				return text;
			}
		});
	}
);
