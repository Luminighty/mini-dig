import { Entities, World } from "@luminight/ecs";
import { fieldOfVision2D } from "../algorithms/fov";
import { Map } from "../dependency/map";
import { PlayerEntity } from "../dependency/player";
import { Position, Viewshed } from "../component";

/** @param {World} world */
export function ViewshedSystem(world) {
	const map = world.getDependency(Map)
	const player = world.getDependency(PlayerEntity)
	console.log(world);

	world.listen("onUpdate", () => {

		for (const [entity, viewshed, position] of world.query(Entities, Viewshed, Position)) {
			if (!viewshed.isDirty)
				continue

			viewshed.tiles = fieldOfVision2D(
				position.x, position.y,
				(x, y) => map.isTileOpaque(x, y),
				viewshed.range,
			)
			viewshed.isDirty = false

			if (entity == player.entity) {
				map.setVisibleTiles(viewshed.tiles)
			}
		}
	})
}