import { World } from "@luminight/ecs";
import { ViewshedComponent } from "../component/Viewshed.component";
import { PositionComponent } from "../component";
import { fieldOfVision2D } from "../algorithms/fov";
import { Map } from "../dependency/map";
import { PlayerEntity } from "../dependency/player";

/** @param {World} world */
export function ViewshedSystem(world) {
	const map = world.getDependency(Map)
	const player = world.getDependency(PlayerEntity)

	world.listen("onUpdate", () => {

		for (const [viewshed, position] of world.query(ViewshedComponent, PositionComponent)) {
			if (!viewshed.isDirty)
				continue

			viewshed.tiles = fieldOfVision2D(
				position.x, position.y,
				(x, y) => map.isTileOpaque(x, y),
				8,
			)
			viewshed.isDirty = false

			if (viewshed.parent == player.entity.uuid) {
				map.setVisibleTiles(viewshed.tiles)
			}
		}
	})
}