export class Position {
	constructor({x, y}) {
		this.x = x ?? 0;
		this.y = y ?? 0;
	}
}

export class Renderable {
	constructor(glyph, renderOrder) {
		/** @type {import("../ascii").Glyph} */
		this.glyph = glyph
		this.renderOrder = renderOrder
	}
}

export class Viewshed {
	tiles = []
	isDirty = true

	constructor(range) {
		this.range = range
	}
}

export class Player {}


export const RenderOrder = {
	PLAYER: 100,
	EXPLOSION: 500,
	ITEM: 50,
}