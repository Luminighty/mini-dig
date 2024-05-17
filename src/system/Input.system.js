import { World } from "@luminight/ecs";
import { PlayerComponent } from "../component/Player.component";
import { PositionComponent } from "../component/Position.component";
import { Map } from "../dependency/map";

/** @param {World} world  */
export function InputSystem(world) {
	world.listen("onInput", ({key}) => {
		console.log("onInput", key);
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
		console.log(`Moved to ${newX} ${newY}`);

		if (map.isBlocked(newX, newY))
			continue;

		position.x = newX;
		position.y = newY;
	}

	world.emit("onRender");
}



const KeyMap = {
	"ArrowLeft": movePlayer(-1, 0),
	"ArrowRight": movePlayer(1, 0),
	"ArrowUp": movePlayer(0, -1),
	"ArrowDown": movePlayer(0, 1),
}
