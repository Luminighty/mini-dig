export class Position {
	constructor({x, y}) {
		this.x = x ?? 0
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
