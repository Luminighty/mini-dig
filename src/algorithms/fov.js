// https://www.jordansavant.com/book/algorithms/shadowcasting.md#:~:text=Shadowcasting%20is%20a%20way%20to,sight%20path%20to%20the%20destination.

/**
 * @param {{x: number, y: number}} origin 
 * @param {(x: number, y: number) => bool} isOpaque 
 * @param {number} distance 
 * @param {(fromX, fromY, toX, toY) => number} distanceFn
 */
function fieldOfVision2D(origin, isOpaque, distance, distanceFn) {

	const visibleFields = [];
	visibleFields.push(origin)
	for (let octantId = 0; octantId < 8; octantId++) {
		shadowCasting(
			origin, isOpaque, octantId,
			distance, distanceFn,
			0, 1, 0, visibleFields
		)
	}

	return visibleFields.filter((v, i) => !visibleFields.slice(0, i).some((other) => other.x == v.x && other.y == v.y))
}


/**
 * @param {{x: number, y: number}} origin 
 * @param {(x: number, y: number) => bool} isOpaque 
 * @param {number} octantId 
 * @param {number} fromSlope 
 * @param {number} toSlope 
 * @param {number} row 
 * @param {Set} visibleFields 
 */
function shadowCasting(
	origin, isOpaque, octantId, distance, distanceFn,
	fromSlope, toSlope, row, visibleFields
) {
	if (fromSlope > toSlope)
		return

	let octant = Octant(fromSlope, toSlope, row)
	const [rx, ry, cx, cy] = OctantConsts[octantId]

	let tooFarRow = null
	while (true) {
		let [row, column] = octant.next().value
		let x = origin.x + rx * row + cx * column
		let y = origin.y + ry * row + cy * column

		if (row > distance)
			return

		if (distanceFn(origin.x, origin.y, x, y) > distance) {
			if (tooFarRow == null)
				tooFarRow = row
			if (row > tooFarRow)
				return
		}
		tooFarRow = null
		visibleFields.push({x, y})

		if (!isOpaque(x, y)) {
			continue
		}

		shadowCasting(
			origin, isOpaque, octantId, 
			distance, distanceFn,
			fromSlope, slope(row, column), 
			row + 1, visibleFields
		)

		do {
			let [newRow, newColumn] = octant.next().value
			if (newRow != row)
				return
			column = newColumn
			x = origin.x + rx * row + cx * column
			y = origin.y + ry * row + cy * column
			visibleFields.push({x, y})
		} while (isOpaque(x, y))
		
		// Found non opaque tile, continue with new octant
		octant = Octant(slope(row, column), toSlope, row)
	}
}


function slope(row, column) {
	return column / row
}



/**
 * 
 * @param {{x: number, y: number}} delta 
 * @param {{x: number, y: number}} rowStart 
 * @returns {Generator<[number, number]>}
 */
function *Octant(fromSlope, toSlope, row) {
	let column = Math.floor(fromSlope * row);
	let toColumn = Math.floor(toSlope * row)

	while (true) {
		// Step
		column++;
		if (column > toColumn) {
			// go to next row
			row++;
			toColumn = Math.floor(toSlope * row)
			column = Math.floor(fromSlope * row)
		}

		yield [row, column]
	}
}

const OctantConsts = [
	// Rx, Ry, Cx, Cy
	[0, -1, 1, 0],  // Octant 0: Top-right (N -> E)
	[1, 0, 0, -1],  // Octant 1: Right-top (E -> N)

	[1, 0, 0, 1],   // Octant 2: Right-bottom (E -> S)
	[0, 1, 1, 0],   // Octant 3: Bottom-right (S -> E)

	[0, 1, -1, 0],  // Octant 4: Bottom-left (S -> W)
	[-1, 0, 0, 1],  // Octant 5: Left-bottom (W -> S)

	[-1, 0, 0, -1], // Octant 6: Left-top (W -> N)
	[0, -1, -1, 0], // Octant 7: Top-left (N -> W)
];
/** 
const OctantConsts = [
	// Rx, Ry, Cx, Cy
	[-1, -1, 1, 0],
	[1, -1, -1, 0],

	[1, -1, 0, 1],
	[1, 1, 0, -1],

	[1, 1, -1, 0],
	[-1, 1, -1, 0],

	[-1, -1, 0, -1],
	[-1, 1, 0, 1],
]
*/


function Test() {
	const Map = [
		".....................",
		".....................",
		".......######........",
		".....................",
		".....................",
		"......##.............",
		".....##..............",
		"....##.......##......",
		"....##........###....",
		"..........@....##....",
		".....................",
		".....................",
		"................#....",
		".........###.........",
		".....................",
		".....................",
		".....................",
		".....##############..",
		".....................",
		".....................",
	]

	const isOpaque = (x, y) => !Map[y] || !Map[y][x] || Map[y].charAt(x) == '#'
	const distanceFn = (x1, y1, x2, y2) => {
		const dx = x1 - x2;
		const dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy)
	}

	const visible = fieldOfVision2D({ x: 10, y: 9}, isOpaque, 10, distanceFn)

	return Map.map((row, y) => 
		Array.from(row).map(
			(c, x) => visible.some((v) => v.x == x && v.y == y) ? c : " "
		).join('')
	)
}