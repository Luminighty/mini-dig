import { World } from "@luminight/ecs";
import { PlayerComponent } from "../component/Player.component";
import { PositionComponent } from "../component/Position.component";
import { Map, TILE } from "../dependency/map";
import { ViewshedComponent } from "../component/Viewshed.component";

/** @param {World} world  */
export function InputSystem(world) {
	world.listen("onInput", ({key}) => {
		(KeyMap[key] ?? (() => {}))(world)
	})
}
/**
 * 
 * @param {*} dx 
 * @param {*} dy 
 * @returns {(world: World) => void}
 */
const movePlayer = (dx, dy) => (world) => {
	const map = world.getDependency(Map);

	for (const [position, _] of world.query(PositionComponent, PlayerComponent)) {
		const newX = position.x + dx;
		const newY = position.y + dy;

		if (map.isBlocked(newX, newY)) {

			if (map.target?.x == newX && map.target?.y == newY) {
				const idx = map.xyIndex(newX, newY)
				if (map.tiles[idx] == TILE.WALL)
					map.tiles[idx] = TILE.FLOOR
			} else {
				map.target = {x: newX, y: newY}
			}

			continue;
		}

		position.x = newX;
		position.y = newY;
		const viewshed = world.getEntity(position.parent).getComponent(ViewshedComponent)
		if (viewshed)
			viewshed.isDirty = true;
	}

	world.emit("onUpdate");
	world.emit("onRender");
}



const KeyMap = {
	"ArrowLeft": movePlayer(-1, 0),
	"ArrowRight": movePlayer(1, 0),
	"ArrowUp": movePlayer(0, -1),
	"ArrowDown": movePlayer(0, 1),
}
