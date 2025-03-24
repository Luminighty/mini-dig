export class Timer {
	constructor (time) {
		this.time = time
		this.current = time
	}

	step(dt) {
		if (!this.done)
			this.current -= dt
	}

	get done() {
		return this.current < 0
	}

	reset() {
		this.current = this.time
	}

	start(time) {
		this.time = time
		this.current = time
	}
}