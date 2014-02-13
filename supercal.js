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
	var shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

	var defaults = {
		startDay: 1,		// Start day. 0 = Sunday, 1 = Monday, etc
	};

	Date.prototype.daysInMonth = function(){
		var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
		
		return d.getDate();
	}
	Date.prototype.clone = function() {
		return new Date(this.getTime());
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
		this.date = date.clone();

		this.date.setHours(0);
		this.date.setMinutes(0);
		this.date.setSeconds(0);
		this.date.setMilliseconds(0);

		var day = date.clone();
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
		var day = this.date.clone();
		day.setDate(1);

		var numDaysPreceding = day.getDay() - this.options.startDay;
		var numDaysAfter = numDaysPreceding + this.date.daysInMonth() - 42;

		var prevMonth = new Month(new Date(this.date.getFullYear(), this.date.getMonth() - 1, this.date.getDate(), 0, 0, 0, 0));
		var nextMonth = new Month(new Date(this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate(), 0, 0, 0, 0));

		var index = 1;

		this.grid = [];

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
		month: function(month, otherClasses) {
			month.cells();

			var table = document.createElement('table');
			table.className = 'table table-condensed table-bordered';

			if(otherClasses !== undefined) {
				table.className += ' ' + otherClasses;
			}
			
			// Generate header
			var header = document.createElement('thead');
			var headerRow = document.createElement('tr');

			for(var i = 0; i < 7; i++) {
				var th = document.createElement('th');

				var index = month.options.startDay + i;

				// Wrap around to beginning of weekdays array if out of bounds
				if(index > 6) {
					index -= 7;
				}

				th.innerHTML = shortDays[index];

				headerRow.appendChild(th);
			}
			
			header.appendChild(headerRow);

			table.appendChild(header);

			var tbody = document.createElement('tbody');

			// Loop through 2D array of days and make main table
			for(var row = 0; row < 6; row++) {
				var tr = document.createElement('tr');

				for(var col = 0; col < 7; col++) {
					var day = month.grid[row][col].date;
					var td = document.createElement('td');
					var span = document.createElement('span');

					span.innerHTML = day.getDate();

					// Class names for cell: prev/next month, today, etc
					if(day.getMonth() === month.date.getMonth() - 1 || month.date.getMonth() === 0 && day.getMonth() === 11) {
						td.className = 'sc-month-prev';
					} else if(day.getMonth() === month.date.getMonth() + 1) {
						td.className = 'sc-month-next';
					} else if(day.getDate() === now.getDate()) {
						td.className = 'sc-today';
					}

					// Select this cell if it's the same as the passed date
					if(month.date.getFullYear() === day.getFullYear() && month.date.getMonth() === day.getMonth() && month.date.getDate() === day.getDate()) {
						td.className += ' sc-selected';
					}

					// Store date in DOM element
					td.scDate = day;

					td.appendChild(span);
					tr.appendChild(td);
				}

				tbody.appendChild(tr);
			}

			table.appendChild(tbody);

			return table;
		},

		// Generate the month nav and year input for a calendar table
		monthHeader: function(month) {
			var wrapper = document.createElement('div');
			wrapper.className = 'sc-header';

			var template = '<button type="button" class="sc-month-prev btn btn-default">&laquo;</button><button type="button" class="sc-month-next btn btn-default">&raquo;</button>\
						<span class="input-group">\
							<span class="sc-month-display input-group-addon"></span>\
							<input type="number" class="sc-year-display form-control" placeholder="Year" min="1970">\
							<span class="input-group-btn"><button class="btn btn-default sc-today" type="button">Today</button></span>\
						</span>';

			wrapper.innerHTML = template;

			var monthDisplay = wrapper.children[2].children[0];
			var yearInput = wrapper.children[2].children[1];

			monthDisplay.innerText = shortMonths[month.date.getMonth()];
			yearInput.value = month.date.getFullYear();

			return wrapper;
		},

		// Generate HTML for a spinner with a pre-filled value
		spinner: function(value, placeholder) {
			var template = '<button type="button" class="sc-spin-up btn btn-default">+</button>\
							<input type="text" class="form-control">\
							<button type="button" class="sc-spin-down btn btn-default">-</button>';

			var container = document.createElement('div');
			container.className = 'col-xs-4 sc-spinner';

			container.innerHTML = template;

			var input = container.children[1];
			input.placeholder = placeholder;
			input.value = ("0" + value).substr(-2);

			return container;
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

		this.month = new Month(this.options.date, this.options);

		var wrapper = document.createElement('div');
		var wrapperRow = document.createElement('div');
		wrapper.className = 'sc-wrapper';
		wrapperRow.className = 'row';

		wrapper.appendChild(wrapperRow);

		// Datepicker HTML
		var datepicker = this.datepicker();

		wrapperRow.appendChild(datepicker);

		this.el.appendChild(wrapper);

		// Add timepicker if specified in options
		if(this.options.time === true) {
			var timepicker = this.timepicker();

			wrapperRow.appendChild(timepicker);
		}

		var cal = this;

		// Set up DOM events
		this.$el.on('click', '.sc-month-prev', function(e) {
			e.preventDefault();
			
			cal.stepMonth(-1);
		}).on('click', '.sc-month-next', function(e) {
			e.preventDefault();
			
			cal.stepMonth(+1);
		}).on('change keyup', '.sc-year-display', function() {
			if(this.value.length !== 4 || !parseInt(this.value)) {
				return;
			}

			// Redraw header with new year
			cal.setYear(this.value);
		}).on('click', '.sc-table-current td', function() {
			// Set this instance's current date to selected cell
			if(typeof this.scDate !== 'object') {
				console.warn('No date object bound to element. Cannot set date.');

				return;
			}

			console.log("Hello");

			cal.month.date = this.scDate;

			cal.setDate();
		}).on('click', '.sc-today', function(e) {
			// Reset calendar to today's date. Leave time alone if it's displayed
			cal.month.date = now.clone();

			cal.setDate();
		});

		this.$el.data('supercal', this);
	}

	// Generate the HTML for the datepicker component
	Supercal.prototype.datepicker = function() {
		var container = document.createElement('div');
		container.className = 'sc-month-wrapper';

		if(this.options.time === true) {
			container.className += ' col-md-8';
		} else {
			container.className += ' col-md-12';
		}

		// Header
		container.appendChild(html.monthHeader(this.month));

		// Table
		this.monthContainer = document.createElement('div');
		this.monthContainer.className = 'sc-month';

		this.monthContainer.appendChild(html.month(this.month, 'sc-table-current'));

		container.appendChild(this.monthContainer);

		return container;
	};

	Supercal.prototype.timepicker = function() {
		var container = document.createElement('div');
		container.className = 'sc-time-wrapper col-md-4';

		var row = document.createElement('div');
		row.className = 'row';

		container.appendChild(row);

		row.appendChild(html.spinner(this.options.date.getHours(), 'HH'));
		row.appendChild(html.spinner(this.options.date.getMinutes(), 'MM'));
		row.appendChild(html.spinner(this.options.date.getSeconds(), 'SS'));

		return container;
	}

	// Change month by delta from current month
	Supercal.prototype.stepMonth = function(delta) {
		this.month.date.setMonth(this.month.date.getMonth() + delta);

		this.setDate();
	}

	// Set new year
	Supercal.prototype.setYear = function(year) {
		var newDate = this.month.date.clone();
		newDate.setFullYear(year);

		this.setDate(newDate);
	}

	// Change the month displayed (and date selected)
	Supercal.prototype.setDate = function() {
		// Set month/year in calendar header
		this.$el.find('.sc-month-display').text(shortMonths[this.month.date.getMonth()]);
		this.$el.find('.sc-year-display').val(this.month.date.getFullYear());

		// Change calendar
		this.monthContainer.innerHTML = '';
		this.monthContainer.appendChild(html.month(this.month, 'sc-table-current'));
	}

	// Set the selected date (cell click, `Today` button click, etc)
	Supercal.prototype.selectDay = function(date) {
		this.month.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

		// Redraw the calendar
		this.setDate();
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