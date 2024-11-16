import { Entities, World } from "@luminight/ecs"
import { Position } from "../component"
import { Map } from "../dependency/map"

/** @param {World} world */
export function MapSystem(world) {
	const map = world.getDependency(Map)

	world.listen("onPositionUpdated", () => {

		map.tileEntities = Array(map.width * map.height).fill([])

		for (const [position, entity] of world.query(Position, Entities)) {
			const entities = map.tileEntities[map.xyIndex(position.x, position.y)]
			if (entities)
				entities.push(entity)
		}
	})
}