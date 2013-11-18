# Supercal HTML structure

Supercal must always be bound to an element that isn't an <input>. To use with an input, specify a `target` parameter and bind the Supercal instance to the container. This allows greatest flexibility for binding to far off inputs, or creating views without an input, such as the large view.

## Tree

- Overall container
	- Bound input
	- Bootstrap row
		- Calendar widget wrapper
			- Header
			- Table
			- Footer (input/today button)
		- Time spinner widget wrapper
			- Bootstrap row
				- Hour spinner
				- Minute spinner
				- Second spinner (optional)

## Notes

- If the bound element is an input, then the overall container must contain that input as it's first child. Otherwise, the bound element is given a class of whatever and is the container for supercal.