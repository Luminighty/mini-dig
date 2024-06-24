import { Entities, World } from "@luminight/ecs";
import { Map, TILE } from "../dependency/map";
import { createDynamite } from "../templates";
import { Player, Position, Viewshed } from "../component";

/** @param {World} world  */
export function InputSystem(world) {
	let keys = {}
	world.listen("onInputDown", ({key}) => {
		keys[key] = true
	})

	world.listen("onUpdate", () => {
		for (const key in keys)
			if (keys[key])
				(KeyMap[key] ?? (() => {}))(world)
		keys = {}
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

	for (const [entity, position, _] of world.query(Entities, Position, Player)) {
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
		const viewshed = world.getComponent(entity, Viewshed)
		if (viewshed)
			viewshed.isDirty = true;
	}
}


/** @param {World} world */
const placeExplosive = (world) => {
	for (const [position, _] of world.query(Position, Player)) {
		createDynamite(world, position.x, position.y, true)
	}
}


const KeyMap = {
	"ArrowLeft": movePlayer(-1, 0),
	"ArrowRight": movePlayer(1, 0),
	"ArrowUp": movePlayer(0, -1),
	"ArrowDown": movePlayer(0, 1),
	"e": placeExplosive,
}
