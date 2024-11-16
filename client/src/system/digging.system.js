import { World } from "@luminight/ecs"
import { Map } from "../../../shared/dependency"
import { NetworkSocket } from "../dependency/network"
import { ORE_DROP, TILE, TILE_DIGGABLE } from "../../../shared/dependency/tile"

/** @param {World} world  */
export function DiggingSystem(world) {
	const map = world.getDependency(Map)
	const network = world.getDependency(NetworkSocket)

	world.listen("onDigged", ({x, y, client}) => {

		const idx = map.xyIndex(x, y)
		if (TILE_DIGGABLE.includes(map.tiles[idx])) {
			const drop = ORE_DROP[map.tiles[idx]]
			if (drop)
				drop(world, x, y)
			map.tiles[idx] = TILE.FLOOR
		}


		if (!client)
			network.emit("onDigged", {x, y})
	})
}