import { Entity } from "@luminight/ecs"

export class Camera {
	constructor(main) {
		this._main = main
	}
	/** @type {import("@luminight/ecs/dist/entity").EntityId} */
	_main = 0
	width = 17
	height = 17
	offset = { x: -8, y: -8 }
	size = this.width * this.height

	get main() { return this._main }

	/** @param {import("@luminight/ecs/dist/entity").EntityId} main  */
	set main(main) { this._main = main }

}