# Supercal events

Loads of 'em. All events should be bound to the overall container

- Overall events
	- Popup open (focus on target input)
	- Popup blur (clicked element isn't supercal global wrapper, or clicked element doesn't have global wrapper as a parent anywhere)
- Triggered events
	- Date/time pick/change event
	- Date pick/change events
	- Time pick/change event
	- Today event
	- Month change event
- Element events
	- Bound input change event updates calendar
	- Month back/forward button
	- Year input change event
	- Month table `<td>` click
	- Hour/minute/second spinner button up/down click
		- Shift + click goes up/down by 2/10/10 for hour/minute/second
		- Scroll wheel triggers button clicks. Holding shift makes numbers spin faster
		- **Numbers wrap around**
	- Popup close button