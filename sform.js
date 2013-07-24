/* 
 * SForm - Javascript plugin
 * 
 * Description:
 *     Easy and responsive form handling with no dependencies
 *
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Sami Purmonen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function SForm(formID) {

	// Utility functions
	function $(selector, element) {
		if (element === undefined) {
			element = document;
		}
		if (selector[0] === '#') {
			return element.getElementById(selector.substring(1));
		} else if (selector[0] === '.') {
			return element.getElementsByClassName(selector.substring(1));
		} else {
			return element.getElementsByTagName(selector);
		}
	}

	function arrayContains(array, value) {
		return array.indexOf(value) !== -1;
	}

	function addEvent(element, type, func) {
		if (element.attachEvent) {
			element.attachEvent('on' + type, func);
		} else {
			element.addEventListener(type, func, false);
		}
	}

	function addClass(element, newClass) {
		element.className = element.className.trim() + ' ' + newClass;
	}

	function removeClass(element, newClass) {
		var className = element.className;
		var start = className.search(newClass);
		if (start === -1) {
			return;
		}
		element.className = 
			className.substring(0, start) + 
			className.substring(start + newClass.length + 1);
	}

	function hasClass(element, newClass) {
		var re = new RegExp('\\b' + newClass + '\\b');
		return element.className.match(re) ? true : false;
	}

	var classes = [
		'min', 'max', 'required', 'success', 
		'type', 'refers', 'custom'
	];

	var re = {
		int: /^([1-9]+\d*|0)$/,
		float: /^(0|[1-9]+\d*)(\.\d+)?$/,
		email: /^\w+@\w+\.\w+$/
	};


	var validators = {
		'required': function(field) {
			return field.value ? true : false;
		},
		'type': function(field) {
			var type = field.dataset.type;
			return field.value.match(re[type]) ? true : false;
		},
		'min': function(field) {
			return field.dataset.min <= field.value.length;
		},
		'max': function(field) {
			return field.dataset.max >= field.value.length;
		},
		'refers': function(field) {
			var refers = $('#' + field.dataset.refers);
			return field.value === refers.value;
		},
		'custom': function(field) {
			return window[field.dataset.custom](field.value);
		}
	};

	function watch(form) {
		var event = form.dataset.event;
		if (event === undefined) {
			event = 'keyup';
		}

		setupTags(form);
		addEvents(form, event);
	}

	function addEvents(form, eventType) {
		var i;
		var element;
		var fields = $('.SForm-field', form);

		addEvent(form, 'submit', function (event) {
			for (i = 0; i < fields.length; i++) {
				console.log(fields[i]);
				console.log('valid: ' + fields[i].valid)
				if (!fields[i].valid) {
					console.log('failed');
					console.log('\n\n')
					event.preventDefault();
					return;
				}
			}
		});

		for (i = 0; i < fields.length; i++) {
			element = fields[i];

			addEvent(element, eventType, function (element) {
				return function() {
					validate(element);
				};
			}(element));

			addEvent(element, 'change', function (element) {
				return function() {
					validate(element);
				};
			}(element));


			var refers = $('#' + element.dataset.refers);
			if (refers) {
				addEvent(refers, 'keyup', function (element, refers) {
					return function() {
						validate(element);
					};
				}(element, refers));
				addEvent(refers, 'change', function (element, refers) {
					return function() {
						validate(element);
					};
				}(element, refers));
			}
		}
	}

	function validate(field) {
		var value = field.value;
		var data = field.dataset;
		var key;

		hideFilterElements(field);

		for (key in data) {
			if (arrayContains(classes, key) && !validators[key](field)) {
				field.valid = false;
				if (key !== 'required') {
					setInvalidInput(field);
				} else {
					setNeutralInput(field);
				}
				showFilterElement(field, key);
				return false;
			}
		}
		field.valid = true;
		setValidInput(field);
		showFilterElement(field, 'success');
		return true;
	}


	function setNeutralInput(field) {
		removeClass(field, 'SForm-valid');
		removeClass(field, 'SForm-invalid');
	}

	function setValidInput(field) {
		if (!hasClass(field, 'SForm-valid')) {
			addClass(field, 'SForm-valid');
		}
		removeClass(field, 'SForm-invalid');
	}

	function setInvalidInput(field) {
		if (!hasClass(field, 'SForm-invalid')) {
			addClass(field, 'SForm-invalid');
		}
		removeClass(field, 'SForm-valid');
	}

	function getFilterElement(element, filter) {
		return $('.SForm-' + filter, element.parentNode)[0];
	};

	function showFilterElement(element, filter) {
		showElement(getFilterElement(element, filter));
	};

	function hideFilterElements(element) {
		var i;
		var key;
		var filters = element.dataset;
		for (key in filters) {
			if (arrayContains(classes, key)) {
				hideElement(getFilterElement(element, key));
			}
		}
		hideElement(getFilterElement(element, 'success'));
	}

	function showElement(element) {
		element.style.display = 'inline';
	}

	function hideElement(element) {
		element.style.display = 'none';
	}

	function copyElement(element) {
		var copyInput = $('#' + element.dataset.copy);
		var copy = $('.' + element.className, copyInput.parentNode)[0];
		var parent = element.parentNode;
		var clone = copy.cloneNode(true);

		parent.removeChild(element);
		parent.appendChild(clone);
		return clone;
	}

	function setupTags(form) {
		var i;
		var j;
		var copy;
		var element;
		var elements;

		for (i = 0; i < classes.length; i++) {
			elements = $('.SForm-' + classes[i], form);
			for (j = 0; j < elements.length; j++) {
				element = elements[j];
				copy = element.dataset.copy;
				if (copy) {
					element = copyElement(element);
				}
				if (!hasClass(element, 'SForm-required')) {
					hideElement(element);
				} else {
					showElement(element);
				}
			}
		}
	}

	function initialize() {
		var forms = $('.SForm');
		var i;

		for (i = 0; i < forms.length; i++) {
			watch(forms[i]);
		}
	}

	addEvent(window, 'load', initialize);
}())