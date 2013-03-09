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
- Each cell has date in `data-*` attribute
- Default layout should pretty much work without CSS
*/

(function($) {
	var settings = {
		todayButton: true,		// Show the button to reset to today's date?
		dateInput: true			// Show input to manually enter a date. Calendar updates automatically when valid date entered (valid as in can be parsed by `new Date()`)
	};

	var methods = {
		init: function(options) {
			return this.each(function() {
				$(window).bind('resize.supercal', methods.reposition);
			});
		},
		changeMonth: function(month) {
			// Manually triggers month change event. Month can either be date object, or integer delta value for month
		}
	};

	$.fn.supercal = function(method) {
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.supercal');
		}
	};
})(jQuery);