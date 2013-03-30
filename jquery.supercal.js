/**
 * Supercal 0.1
 * jQuery calendar widget/large view plugin with Bootstrap compatibility
 *
 * James Waples 2013
 *
 * https://github.com/jamwaffles/SuperCal
 **/ 
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
		transition: '',
		tableClasses: 'table table-condensed',
		hidden: true
	};
	
	var now = new Date();

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Get the number of days in the current month (or next month if delta == 1, or prev month if delta == -1, etc)
	Date.prototype.daysInMonth = function(delta) {
		delta = delta === undefined ? 0 : delta;

		return new Date(this.getFullYear(), this.getMonth() + 1 + delta, 0).getDate();
	}

	// Is this date today? Can also test against another date when specifying `now`
	Date.prototype.isDay = function(day) {
		if(day === undefined) {
			day = new Date();
		}

		return this.getFullYear() == day.getFullYear() 
			&& this.getMonth() == day.getMonth() 
			&& this.getDate() == day.getDate();
	}

	Date.prototype.isValid = function() {
		return Object.prototype.toString.call(this) === "[object Date]" && !isNaN(this.getTime());
	}

	$.fn.supercal = function(method) {
		var options = $.extend(options, defaults, method);

		// Private methods
		var pMethods = {
			drawCalendar: function(selectedDate, replace) {
				selectedDate = selectedDate || now;

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

				$(this).data('supercal', true);
				$(this).data('date', selectedDate);
				$(this).data('element', this);

				return this;
			},
			drawPopupCalendar: function(selectedDate, replace) {
				selectedDate = selectedDate || now;

				var div;

				if($(this).next('.supercal-popup').length) {
					div = $(this).next('.supercal-popup');
					div.empty();
				} else {
					div = $('<div />');
					div
						.addClass('supercal supercal-popup')
						.width($(this).outerWidth(true));

					$(this).after(div);
				}

				if(options.hidden) {
					div.hide();
				}

				pMethods.drawHeader(selectedDate).appendTo(div);

				var month = pMethods
					.drawMonth(selectedDate)
					.addClass('current');

				$('<div />')
					.addClass('supercal-month')
					.html(month)
					.appendTo(div);

				$(this).data('supercal', true);
				$(this).data('date', selectedDate);
				div.data('element', this);

				return this;
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
				date = date || now;
				var monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
				var days = [];
				var rows = [];
				var table = $('<table />').addClass(options.tableClasses);

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

					// If this date is today's date, add the `today` class
					day.classes = day.date.isDay() ? 'today' : '';

					// If this date is the one selected, add the `selected` class
					day.classes += day.date.isDay(date) ? ' selected' : '';

					days.push(day);		// Add date to array
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
			init: function() {
				// Events
				$(document).off('.supercal');		// Turn them all off

				// Bind events
				$(document).on('click.supercal', '.supercal .change-month', function(e) {
						e.preventDefault();
						e.stopPropagation();

						methods.changeMonth.apply($(this).closest('.supercal'), [ $(this).hasClass('next-month') ? 1 : -1 ]);
					})
					.on('click.supercal', '.supercal-today', function() {
						methods.changeMonth.apply($(this).closest('.supercal'), [ now ]);
					})
					.on('click.supercal', '.supercal table.current td', function() {
						var container = $(this).closest('.supercal');
						var table = $(this).closest('table');

						table.find('.selected').removeClass('selected');

						$(this).addClass('selected');

						container.find('.supercal-footer').replaceWith(pMethods.drawFooter($(this).data('date')));
						container.data('date', $(this).data('date'));
					})
					// Popups
					.on('click.supercal', '.supercal-popup-trigger', function(e) {
						$(this).addClass('supercal-open');

						$(this).next('.supercal-popup').show();
					})
					.on('click.supercal', function(e) {
						var target = $(e.target);

						if(!target.closest('.supercal').length) {
							$('.supercal-popup-trigger.supercal-open')
								.removeClass('supercal-open')
								.next('.supercal-popup').hide();
						}
					})
					.on('click.supercal', '.supercal td', function() {
						var thisDate = $(this).data('date');
						var originalElement = $(this).closest('.supercal').data('element');

						$(originalElement).trigger('dateselect', [ thisDate ]);
					});

				return this.each(function() {
					$(this).addClass('supercal ' + options.transition);

					if(options.transition) {
						$(this).addClass('transition');
					}

					switch(options.mode) {
						case 'popup':
							$(this).addClass('supercal-popup-trigger');

							pMethods.drawPopupCalendar.apply(this);
						break;
						case 'widget':
						default:
							pMethods.drawCalendar.apply(this);
					}
				});
			},
			changeMonth: function(month) {
				var newDay, newDate, direction, newCalendar;

				var container = this;
				var calendar = this.find('table');

				var currentDate = container.data('date');
				var calWidth = calendar.outerWidth(true);
				var calHeight = calendar.outerHeight(true);

				calendar.parent().height(calHeight);

				if(typeof month === 'number') {
					direction = month > 0 ? 1 : -1;
					newDay = Math.min(currentDate.daysInMonth(month), currentDate.getDate());		// 31st of March clamped to 28th Feb, for example
					newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, newDay);
				} else if(month instanceof Date) {
					direction = (month > currentDate) ? 1 : -1;
					newDate = now;
				}

				calendar.stop(true, true);
				container.data('date', newDate);
				newCalendar = pMethods.drawMonth(newDate).addClass('current');

				switch(options.transition) {
					case 'fade':
						calendar.fadeOut(options.animDuration, function() {
							$(this).replaceWith(newCalendar.hide().fadeIn(options.animDuration));
						});
					break;
					case 'crossfade':		// Crossfade
						calendar.removeClass('current').after(newCalendar);
						calendar.animate({ opacity: 0 }, options.animDuration);

						newCalendar.css({ opacity: 0, position: 'absolute', top: 0 }).animate({ opacity: 1 }, options.animDuration);
					break;
					case 'carousel-horizontal':
						calendar.css({ position: 'absolute' }).animate({ left: -(calWidth * direction) }).after(newCalendar);

						newCalendar.css({ left: direction * calWidth, position: 'absolute' }).animate({ left: 0 });
					break;
					case 'carousel-vertical':		// Vertical slide
						calendar.css({ position: 'absolute' }).animate({ top: -(calHeight * direction) }).after(newCalendar);

						newCalendar.css({ top: direction * calHeight, position: 'absolute' }).animate({ top: 0 });
					break;
					default:		// No transition - default
						calendar.replaceWith(newCalendar);
					break;
				}

				// Remove old calendar
				newCalendar.promise().done(function() {
					container.find('table').not(newCalendar).remove();
				});

				// Update header and footer
				container.find('.supercal-header').replaceWith(pMethods.drawHeader(newDate));
				container.find('.supercal-footer').replaceWith(pMethods.drawFooter(newDate));
			},
			date: function() {		// Return current selected date
				if(!$(this).data('supercal')) {
					return false;
				}

				return $(this).data('date');
			}
		};

		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	};
})(jQuery);