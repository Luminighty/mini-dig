import { Entities, World } from "@luminight/ecs"
import { Position } from "../component"
import { Map } from "../dependency/map"

/** @param {World} world */
export function MapSystem(world) {
	const map = world.getDependency(Map)

	world.listen("onLateUpdate", () => {

		for (let i = 0; i < map.tileEntities.length; i++) {
			const entities = map.tileEntities[i]
			entities.length = 0
		}

		for (const [position, entity] of world.query(Position, Entities)) {
			const entities = map.tileEntities[map.xyIndex(position.x, position.y)]
			if (entities)
				entities.push(entity)
		}
	})
}