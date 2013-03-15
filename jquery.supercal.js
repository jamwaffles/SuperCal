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
		showInput: true,		// Show input
		weekStart: 1,			// Start day of the week. 0 is Sunday, 6 for Saturday, 1 for Monday (default)
		widget: true,
		cellRatio: 1,
		format: 'd/m/y',
		footer: true,
		dayHeader: true,
		mode: 'widget',			// 'widget' (default), 'tiny', 'popup', 'page'
		animDuration: 200,
		transition: ''
	};
	
	var now = new Date();

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Get the number of days in the current month (or next month if delta == 1, or prev month if delta == -1, etc)
	Date.prototype.daysInMonth = function(delta) {
		if(delta === undefined) {
			delta = 0;
		}

		var date = new Date(this.getFullYear(), this.getMonth() + 1 + delta, 0);

		return date.getDate();
	}

	// Is this date today? Can also test against another date when specifying `now`
	Date.prototype.isToday = function(now) {
		if(now === undefined) {
			now = new Date();
		}

		return this.getFullYear() == now.getFullYear() 
				&& this.getMonth() == now.getMonth() 
				&& this.getDate() == now.getDate();
	}

	Date.prototype.isValid = function() {
		return Object.prototype.toString.call(this) === "[object Date]" && !isNaN(this.getTime());
	}

	$.fn.supercal = function(method) {
		var options = $.extend(defaults, method);

		// Private methods
		var pMethods = {
			drawCalendar: function(selectedDate, replace) {
				if(!selectedDate) {
					selectedDate = now;
				}

				if(replace !== undefined && replace == true) {
					this.empty();
				}

				pMethods.drawHeader(selectedDate).appendTo(this);

				var month = pMethods
					.drawMonth(selectedDate)
					.addClass('current');

				$('<div />')
					.addClass('supercal-month')
					.html(month)
					.appendTo(this)
					.height(month.outerHeight(true));

				pMethods.drawFooter(selectedDate).appendTo(this);
			},
			drawHeader: function(date) {
				var header = $('<div />').addClass('supercal-header');

				$('<button />')
					.addClass('prev-month change-month btn')
					.html('&laquo;')
					.appendTo(header);

				$('<button />')
					.addClass('next-month change-month btn')
					.html('&raquo;')
					.appendTo(header);

				$('<span />')
					.addClass('month')
					.append('<div>' + months[date.getMonth()] + ' ' + date.getFullYear() + '</div>')
					.appendTo(header);

				return header;
			},
			drawMonth: function(date) {
				var monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
				var days = [];
				var rows = [];
				var table = $('<table />').addClass('table table-bordered table-condensed');

				var numPrevDays = monthStart.getDay() - options.weekStart;
				var numCurrentDays = date.daysInMonth();
				var numNextDays = 42 - numPrevDays - numCurrentDays;

				var daysInLastMonth = date.daysInMonth(-1);

				// Header
				if(options.dayHeader) {
					var tableHeader = $('<tr />');

					for(var i = 0; i <= 6; i++) {
						var day = i + options.weekStart;

						if(day > 6) {
							day = i - 5;
						}

						$('<th />')
							.text(shortDays[day])
							.appendTo(tableHeader);
					}

					table.append(tableHeader);
				}

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
					var day = {
						date: new Date(date.getFullYear(), date.getMonth(), i, 0, 0, 0),
						displayNumber: i,
						classes: ''
					};

					if(day.date.isToday()) {
						day.classes = 'today';
					}

					// Selected date?
					if(day.date.isToday(date)) {
						day.classes += ' selected';
					}

					days.push(day);
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

				// Store date in table
				table.data('date', date);

				return table;
			},
			drawFooter: function(date) {
				var footer = $('<div />').addClass('supercal-footer input-prepend');

				if(options.footer == false) {
					footer.hide();
				}

				if(options.todayButton) {
					$('<button />')
						.text('Today')
						.addClass('btn supercal-today')
						.attr('type', 'button')
						.appendTo(footer);
				}

				if(options.showInput) {
					$('<span />')
						.text(pMethods.formatDate(date))
						.addClass('supercal-input uneditable-input span2')
						.appendTo(footer);
				}

				$('<input />')
					.prop('type', 'hidden')
					.val(parseInt(date.getTime() / 1000), 10)
					.appendTo(footer);

				return footer;
			},
			// Split out into helper object
			formatDate: function(date) {		// Verrrry primitive date format function. Does what it needs to do...
				return options.format
					.replace('d', ('0' + date.getDate()).substr(-2))
					.replace('m', ('0' + (date.getMonth() + 1)).substr(-2))
					.replace('y', date.getFullYear().toString().substr(-2))
					.replace('Y', date.getFullYear());
			}
		};

		var methods = {
			init: function(options) {
				// Events
				$(document).off('.supercal');		// Turn them all off

				// Bind events
				$(document).on('click.supercal', '.supercal .change-month', function() {
						methods.changeMonth.apply($(this).closest('.supercal'), [ $(this).hasClass('next-month') ? 1 : -1 ]);
					})
					.on('click.supercal', '.supercal-today', function() {
						var now = new Date();

						pMethods.drawCalendar.apply($(this).closest('.supercal'), [ now, true ]);
					})
					.on('click.supercal', '.supercal table.current td', function() {
						var container = $(this).closest('.supercal');
						var table = $(this).closest('table');

						table.find('.selected').removeClass('selected');

						$(this).addClass('selected');

						table.data('date', $(this).data('date'));

						container.find('.supercal-footer').replaceWith(pMethods.drawFooter($(this).data('date')));
					});

				return this.each(function() {
					$(this).addClass('supercal');

					pMethods.drawCalendar.apply(this);
				});
			},
			changeMonth: function(month) {
				// Manually triggers month change event. Month can either be date object, or integer delta value for month

				var container = this;
				var calendar = this.find('table');
				var currentDate = calendar.data('date');
				var calWidth = calendar.outerWidth(true);
				var newDay, newDate, delta;

				if(typeof month === 'number') {
					newDay = Math.min(currentDate.daysInMonth(month), currentDate.getDate());		// 31st of March clamped to 28th Feb, for example
					newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, newDay);
					delta = month;
				}

				container.find('.supercal-header').replaceWith(pMethods.drawHeader(newDate));
				container.find('.supercal-footer').replaceWith(pMethods.drawFooter(newDate));

				// Fade
				if(options.transition == 'fade') {
					calendar.fadeOut(options.animDuration, function() {
						$(this).replaceWith(pMethods.drawMonth(newDate).hide().fadeIn(options.animDuration));
					});
				} else if(options.transition == 'crossfade') {		// Crossfade
					var newCalendar = pMethods.drawMonth(newDate).css({ opacity: 0, position: 'absolute', top: 0 }).addClass('current');

					calendar.removeClass('current').after(newCalendar);

					calendar.animate({ opacity: 0 }, options.animDuration);
					newCalendar.animate({ opacity: 1 }, options.animDuration, function() {
						calendar.remove();
						$(this).css({ position: 'static' });
					});
				} else if(options.transition == 'carousel-horizontal') {
					var newCalendar = pMethods.drawMonth(newDate).css({ left: delta * calWidth, position: 'absolute' }).addClass('current');

					calendar.css({ position: 'absolute' }).animate({ left: -(calWidth * delta) });
					calendar.after(newCalendar);

					newCalendar.animate({ left: 0 }, function() {
						calendar.remove();
					});
				} else {		// No transition
					pMethods.drawCalendar.apply(container, [ newDate, true ]);
				}
			},
			resize: function() {

			}
		};

		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	};
})(jQuery);