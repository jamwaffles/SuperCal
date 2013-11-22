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

	Date.prototype.daysInMonth = function(){
		var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
		
		return d.getDate();
	}

	// Class defining a single table cell. Should be stored in an array in an instance of `Month`
	function Day(date) {
		if(date !== undefined) {
			tmpDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
		} else {
			tmpDate = new Date();

			tmpDate.setHours(0);
			tmpDate.setMinutes(0);
			tmpDate.setSeconds(0);
			tmpDate.setMilliseconds(0);
		}

		this.date = tmpDate;
		this.today = new Date();
	}
	Day.prototype.isToday = function() {
		return this.date.getFullYear() === this.today.getFullYear() &&
				this.date.getMonth() === this.today.getMonth() &&
				this.date.getDate() === this.today.getDate();
	}

	// Create a month object from any given date
	function Month(date, options) {
		this.days = [];
		this.grid = [];
		this.options = options;
		this.date = new Date(date.getTime());

		this.date.setHours(0);
		this.date.setMinutes(0);
		this.date.setSeconds(0);
		this.date.setMilliseconds(0);

		var day = date;
		var monthNumber = day.getMonth();			// The number of this month, used to break `while()` loop
		day.setDate(1);			// Reset to the first day

		while(day.getMonth() === monthNumber) {
			this.days.push(new Day(day));

			day.setDate(day.getDate() + 1);
		}
	}

	// Get a day by index (E.g. get previous day from previous month 4 days from end of month: `Month.getDay(-4)`)
	Month.prototype.getDay = function(index) {
		if(index > 0) {
			return new Day(new Date(this.date.getFullYear(), this.date.getMonth(), index));
		} else {
			return new Day(new Date(this.date.getFullYear(), this.date.getMonth(), this.date.daysInMonth() + index));
		}
	}

	// Produce a 2D array of cells to create a calendar table for this month
	Month.prototype.cells = function() {
		var day = new Date(this.date.getTime());
		day.setDate(1);

		var numDaysPreceding = day.getDay() - this.options.startDay;
		var numDaysAfter = numDaysPreceding + this.date.daysInMonth() - 42;

		var prevMonth = new Month(new Date(this.date.getFullYear(), this.date.getMonth() - 1, this.date.getDate(), 0, 0, 0, 0));
		var nextMonth = new Month(new Date(this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate(), 0, 0, 0, 0));

		var index = 1;

		for(var row = 0; row < 6; row++) {
			var rowCells = [];

			for(var col = 0; col < 7; col++) {
				var cell;

				// Previous month
				if(index <= numDaysPreceding) {
					cell = prevMonth.getDay(-numDaysPreceding + index);
				} else if(index > numDaysPreceding + this.date.daysInMonth()) {		// Next month
					cell = nextMonth.getDay(index - numDaysPreceding - this.date.daysInMonth());
				} else {		// Current month
					cell = this.getDay(index - numDaysPreceding);
				}

				rowCells.push(cell);

				index++;
			}

			this.grid.push(rowCells);
		}

		return this.grid;
	}

	// Generate a 2D array of `Date` objects ready to generate an HTML table from
	// function tableDates(inputDate) {
	// 	var selectedDate;

	// 	if(inputDate !== undefined) {
	// 		selectedDate = inputDate;
	// 	} else {
	// 		selectedDate = new Date();
	// 	}

	// 	var lastMonth = new Month(new Date(inputDate.getFullYear(), inputDate.getMonth() - 1, inputDate.getDate()));
	// 	var thisMonth = new Month(inputDate);
	// 	var nextMonth = new Month(new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, inputDate.getDate()));


	// }

	var methods = {
		// Create a Supercal instance for this element from scratch
		// NOTE: `this` refers to the current element in the DOM (`<div>` or other container)
		init: function(passedOptions) {
			var options = $.extend({}, defaults, passedOptions);

			var foo = new Month(new Date(), options);

			console.log(foo.cells());
			// console.log(options);
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