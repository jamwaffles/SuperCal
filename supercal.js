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
	var now = new Date;
	var shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
	var shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep-', 'Oct', 'Nov', 'Dec' ];

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
	};

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
	};

	// HTML rendering methods
	var html = {
		// Render a month view
		month: function(month) {
			month.cells();

			var thisMonthIndex = month.date.getMonth();

			var table = document.createElement('table');
			
			// Generate header
			var header = document.createElement('thead');

			for(var i = 0; i < 7; i++) {
				var th = document.createElement('th');

				var index = month.options.startDay + i;

				// Wrap around to beginning of weekdays array if out of bounds
				if(index > 6) {
					index -= 7;
				}

				th.innerHTML = shortDays[index];

				header.appendChild(th);
			}
			
			table.appendChild(header);

			// Loop through 2D array of days and make main table
			for(var row = 0; row < 6; row++) {
				var tr = document.createElement('tr');

				for(var col = 0; col < 7; col++) {
					var day = month.grid[row][col];
					var td = document.createElement('td');
					var span = document.createElement('span');

					span.innerHTML = day.date.getDate();

					// Class names for cell: prev/next month, today, etc
					if(day.date.getMonth() === month.date.getMonth() - 1) {
						td.className = 'sc-month-prev';
					} else if(day.date.getMonth() === month.date.getMonth() + 1) {
						td.className = 'sc-month-next';
					} else if(day.date.getDate() === now.getDate()) {
						td.className = 'sc-today';
					}

					td.appendChild(span);
					tr.appendChild(td);
				}

				table.appendChild(tr);
			}

			return table;
		}
	};

	// Supercal instance
	function Supercal(container, options) {
		this.options = options;
		this.$el = container;
		this.el = this.$el[0];

		// Already initialised
		if(this.$el.data('supercal') !== undefined) {
			return;
		}

		if(this.options.date === undefined) {
			this.options.date = new Date;
		}

		var month = html.month(new Month(this.options.date, this.options));

		// Datepicker HTML
		// var elements = this.generateHtml();
		var datepicker = this.datepicker();

		this.el.appendChild(datepicker);

		this.$el.data('supercal', this);
	}

	// Generate the HTML for the datepicker component
	Supercal.prototype.datepicker = function() {
		var template = '<div class="sc-header"></div><div class="sc-month"></div>';
		var skeleton = document.createElement('div');
		skeleton.className = 'sc-month-wrapper';

		skeleton.innerHTML = template;

		skeleton.children[0].appendChild(this.header());

		return skeleton;
	};

	// Generate table header and month/year nav
	Supercal.prototype.header = function() {
		var template = '<button type="button" class="sc-month-prev btn btn-default">&laquo;</button><button type="button" class="sc-month-next btn btn-default">&raquo;</button>\
						<span class="input-group">\
							<span class="sc-month-display input-group-addon"></span>\
							<input type="number" class="sc-year-display form-control" placeholder="Year" min="1970">\
							<span class="input-group-btn"><button class="btn btn-default sc-today" type="button">Today</button></span>\
						</span>';
		var header = document.createElement('div');
		header.className = 'sc-header';

		header.innerHTML = template;

		var month = header.children[2].children[0];
		var year = header.children[2].children[1];

		month.innerText = shortMonths[this.options.date.getMonth()];
		year.value - this.options.date.getFullYear();

		return header;
	};

	var methods = {
		// Create a Supercal instance for this element from scratch
		// NOTE: `this` refers to the current element in the DOM (`<div>` or other container)
		init: function(passedOptions) {
			var options = $.extend({}, defaults, passedOptions);

			var calendar = new Supercal(this, options);
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