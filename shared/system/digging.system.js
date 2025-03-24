import { World } from "@luminight/ecs"
import { Map } from "@shared/dependency"
import { ORE_DROP, TILE, TILE_DIGGABLE } from "@shared/dependency"

/** @param {World} world  */
export function DiggingSystem(world) {
	const map = world.getDependency(Map)
	world.listen("onDigged", ({idx}) => {
		map.tiles[idx] = TILE.FLOOR
	})
}