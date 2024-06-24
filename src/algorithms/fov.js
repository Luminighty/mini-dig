// https://www.jordansavant.com/book/algorithms/shadowcasting.md#:~:text=Shadowcasting%20is%20a%20way%20to,sight%20path%20to%20the%20destination

/**
 * @param {number} x
 * @param {number} y
 * @param {(x: number, y: number) => bool} isOpaque 
 * @param {number} distance 
 * @param {(fromX, fromY, toX, toY) => number} distanceFn
 */
export function fieldOfVision2D(x, y, isOpaque, distance) {
	console.log("fieldOfVision2D");

	const visibleFields = new Set()
	const setVisible = (x, y) => visibleFields.add(`${x};${y}`)

	setVisible(x, y)

	for (let i = 0; i < 8; i++) {
		castLight(
			i, 1, 1.0, 0.0, 
			MULTIPLIERS[0][i], MULTIPLIERS[1][i], 
			MULTIPLIERS[2][i], MULTIPLIERS[3][i]
		)
	}

	function castLight(
		octantId, row, startSlope, endSlope,
		xx, xy, yx, yy
	) {
		if (startSlope < endSlope)
			return

		let nextStartSlope = startSlope
		for (let i = row; i <= distance; i++) {
			let blocked = false

			for (let dx = -i, dy = -i; dx <= 0; dx++) {
				const leftSlope = (dx - 0.5) / (dy + 0.5)
				const rightSlope = (dx + 0.5) / (dy - 0.5)

				if (startSlope < rightSlope)
					continue;
				if (endSlope > leftSlope)
					break;
			
				const sax = dx * xx + dy * xy;
				const say = dx * yx + dy * yy;
				if ((sax < 0 && Math.abs(sax) > origin.x) || (say < 0 && Math.abs(say) > origin.y))
					continue;

				const ax = x + sax;
				const ay = y + say;

				if ((dx * dx + dy * dy) < distance * distance)
					setVisible(ax, ay)

				if (blocked) {
					if (isOpaque(ax, ay)) {
						nextStartSlope = rightSlope
					} else {
						blocked = false
						startSlope = nextStartSlope
					}
					continue
				}
				if (isOpaque(ax, ay)) {
					blocked = true
					nextStartSlope = rightSlope
					castLight(octantId, i + 1, startSlope, leftSlope, xx, xy, yx, yy)
				}
			}
			if (blocked)
				break;
		}
	}
	return visibleFields
}


const MULTIPLIERS = [
	[1,  0,  0, -1, -1,  0,  0,  1],
	[0,  1, -1,  0,  0, -1,  1,  0],
	[0,  1,  1,  0,  0, -1, -1,  0],
	[1,  0,  0,  1, -1,  0,  0, -1]
]