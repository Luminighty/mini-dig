export const Key = {
	LEFT: "LEFT",
	RIGHT: "RIGHT",
	UP: "UP",
	DOWN: "DOWN",
	JUMP: "JUMP",
	LADDER: "LADDER",
	EXPLOSIVE: "EXPLOSIVE"
}

export const InputMap = {
	'ArrowUp': Key.UP,
	'ArrowLeft': Key.LEFT,
	'ArrowRight': Key.RIGHT,
	'ArrowDown': Key.DOWN,
	'x': Key.JUMP,
	'c': Key.LADDER,
	'v': Key.EXPLOSIVE
}

const Keys = Object.values(Key)
export class Input {
	constructor() {
		this.events = []
		this.state = {}
		for (const key of Keys)
			this.state[key] = 0
	}

	press(key) {
		if (InputMap[key])
			this.events.push([InputMap[key], 1])
	}

	release(key) {
		if (InputMap[key])
			this.events.push([InputMap[key], -1])
	}

	updateKeys() {
		for (const key of Keys)
			if (this.state[key] == 1 || this.state[key] == -1)
				this.state[key]++
		for (const [key, value] of this.events)
			this.state[key] = value
		this.events.length = 0
	}

	isPressed(key) { return this.state[key] == 1 }
	isHeld(key) { return this.state[key] > 0 }
	isReleased(key) { return this.state[key] == -1 }
	isIdle(key) { return this.state[key] == 0 }
	getAxis(negative, positive) {
		return +this.isHeld(positive) - (+this.isHeld(negative))
	}
}
