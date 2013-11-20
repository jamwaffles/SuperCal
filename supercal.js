/**
 * Supercal 0.3.0
 * jQuery calendar with various display modes, and optional time picker
 *
 * James Waples 2013
 *
 * https://github.com/jamwaffles/SuperCal
 **/

(function(factory) {
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	var defaults = {
		startDay: 1,		// Start day. 0 = Sunday, 1 = Monday, etc
	};

	// Generate a 2D array of `Date` objects ready to generate an HTML table from
	function tableDates(inputDate) {
		var selectedDate;

		if(inputDate !== undefined) {
			selectedDate = inputDate;
		} else {
			selectedDate = new Date(0);
		}

		// This is a _day_ not a time
		selectedDate.setHours(0);
		selectedDate.setMinutes(0);
		selectedDate.setSeconds(0);
		selectedDate.setMilliseconds(0);

		var dates = [];

		// for(var ) {
			
		// }
	}

	var methods = {
		// Create a Supercal instance for this element from scratch
		// NOTE: `this` refers to the current element in the DOM (`<div>` or other container)
		init: function(passedOptions) {
			var options = $.extend({}, defaults, passedOptions);

			console.log(options);
		}
	};

	// Main loop. Return object to allow chaining
	$.fn.supercal = function(method) {
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	};
}));