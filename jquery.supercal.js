/**
 * Supercal 0.1
 * jQuery calendar widget/large view plugin
 *
 * James Waples 2013
 *
 * https://github.com/jamwaffles/SuperCal
 **/ 

/*
Notes:

- Will have hidden input with currently selected date in it as a UNIX epoch (NOT microseconds)
- Will also store date object in container
- Each cell has date in `$.data('date', ...)` attribute
- Default layout should pretty much work without CSS
*/

(function($) {
	var defaults = {
		todayButton: true,		// Show the button to reset to today's date?
		dateInput: true,		// Show input to manually enter a date. Calendar updates automatically when valid date entered (valid as in can be parsed by `new Date()`)
		weekStart: 1			// Start day of the week. 0 is Sunday, 6 for Saturday, 1 for Monday (default)
	};

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	Date.prototype.daysInMonth = function(delta) {
		if(delta === undefined) {
			delta = 0;
		}

		var date = new Date(this.getFullYear(), this.getMonth() + 1 + delta, 0);

		return date.getDate();
	}

	$.fn.supercal = function(method) {
		var options = $.extend(defaults, options);

		var pMethods = {
			drawCalendar: function(selectedDate) {
				if(!selectedDate) {
					selectedDate = new Date();
				}

				pMethods.drawHeader(selectedDate);

				pMethods.drawMonth(selectedDate);
			},
			drawHeader: function(date) {
				var header = $('<div />').addClass('supercal-header');

				$('<button />').addClass('prev-month change-month').html('&laquo;').appendTo(header);

				$('<span />').addClass('month').html(months[date.getMonth()]).appendTo(header);

				$('<button />').addClass('next-month change-month').html('&raquo;').appendTo(header);

				return header;
			},
			drawMonth: function(date) {
				var monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
				var days = [];
				var rows = [];
				var table = $('<table />');

				var numPrevDays = monthStart.getDay() - options.weekStart;
				var numCurrentDays = date.daysInMonth();
				var numNextDays = 42 - numPrevDays - numCurrentDays;

				var daysInLastMonth = date.daysInMonth(-1);

				// Add previous month's days
				for(var i = 1; i <= numPrevDays; i++) {
					var day = (daysInLastMonth - numPrevDays) + i;

					days.push({
						date: new Date(date.getFullYear(), date.getMonth() - 1, day, 0, 0, 0),
						displayNumber: day,
						classes: 'month-prev'
					});
				}

				// Add current month's days
				for(var i = 1; i <= numCurrentDays; i++) {
					days.push({
						date: new Date(date.getFullYear(), date.getMonth(), i, 0, 0, 0),
						displayNumber: i,
						classes: ''
					});
				}

				// Add next month's days
				for(var i = 1; i <= numNextDays; i++) {
					days.push({
						date: new Date(date.getFullYear(), date.getMonth() + 1, i, 0, 0, 0),
						displayNumber: i,
						classes: 'month-next'
					});
				}

				// Slice array into 7s
				rows = [
					days.slice(0, 7),
					days.slice(7, 14),
					days.slice(14, 21),
					days.slice(21, 28),
					days.slice(28, 35),
					days.slice(35)
				];

				// Append arrays to table
				for(var row = 0; row < 6; row++) {
					var tr = $('<tr />');

					for(var col = 0; col < 7; col++) {
						var cell = rows[row][col];

						$('<td />')
							.data('date', cell.date)
							.text(cell.displayNumber)
							.addClass(cell.classes)
							.appendTo(tr);
					}

					tr.appendTo(table);
				}

				return table;
			}
		};

		var methods = {
			init: function(options) {
				// Events
				$(window).off('.supercal');

				return this.each(function() {
					var displayDate = new Date($(this).data('initial-date'));

					pMethods.drawCalendar.apply(this, arguments);
				});
			},
			changeMonth: function(month) {
				// Manually triggers month change event. Month can either be date object, or integer delta value for month
			},
			resize: function() {

			}
		};

		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.supercal');
		}
	};
})(jQuery);