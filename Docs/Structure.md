# Supercal HTML structure

Supercal must always be bound to an element that isn't an <input>. To use with an input, specify a `target` parameter and bind the Supercal instance to the container. This allows greatest flexibility for binding to far off inputs, or creating views without an input, such as the large view.

## Tree

- Overall container `.supercal` (`.sc-popup`, `.sc-large`)
	- Bound input `.supercal-target`
	- Bootstrap row `.row`
		- Calendar widget wrapper `.sc-month-wrapper` (`.col-md-6`)
			- Header `.sc-header`
			- (Other, hidden tables for animations backwards/down) `.sc-table-prev`
			- Table `.sc-table-current`
			- (Other, hidden tables for animations forward/up) `.sc-table-next
			- Footer (input/today button) `.sc-footer`
		- Time spinner widget wrapper `.sc-time-wrapper` (`.col-md-6`)
			- Bootstrap row `.row`
				- Hour spinner `.sc-spinner.sc-hour`
				- Minute spinner `.sc-spinner.sc-minute`
				- Second spinner (optional) `.sc-spinner.sc-second`

## Notes

- If the bound element is an input, then the overall container must contain that input as it's first child. Otherwise, the bound element is given a class of whatever and is the container for supercal.

## Selectors and naming

All selectors "namespaced" in `.supercal` container class. All class names can be seen in tree above. Anything that isn't public facing is given the `sc-` prefix.