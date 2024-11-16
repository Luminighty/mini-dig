export class Explosion {
	constructor(radius) {
		this.radius = radius
	}
}

export class Explosive {
	constructor({delay, radius, ignited} = {}) {
		this.delay = delay
		this.radius = radius
		this.ignited = ignited ?? false
		this.volatility = 5
	}
}
