export class Position {
	constructor({x, y} = {}) {
		/** @type {number} */
		this.x = x ?? 0
		/** @type {number} */
		this.y = y ?? 0
	}
}
export class Gravity {
	enabled = true
	onGround = false
}

export class Ladder {}

export class Viewshed {
	tiles = []
	isDirty = true

	constructor(range) {
		this.range = range
	}
}

export class Item {
	constructor({name, weight} = {}) {
		/** @type {number} */
		this.name = name ?? "Unknown"
		/** @type {number} */
		this.weight = weight ?? 1
	}

	/** @param {Item} other  */
	equals(other) {
		return this.name == other.name && this.weight == other.weight
	}
}

export class Placeable {
	constructor(template) {
		this.template = template
	}
}

export const RenderOrder = {
	PLAYER: 100,
	EXPLOSION: 500,
	ITEM: 50,
}

export class Renderable {
	constructor(glyph, renderOrder) {
		/** @type {import("../../client/src/ascii").Glyph} */
		this.glyph = glyph
		this.renderOrder = renderOrder
	}
}
