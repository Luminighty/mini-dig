import { Entities, World } from "@luminight/ecs"
import { Map } from "@shared/dependency"
import { Gravity, Ladder, Position, Viewshed } from "@shared/component"
import { ORE_DROP, TILE, TILE_DIGGABLE } from "@shared/dependency/tile"
import { Timer } from "@shared/utils/timer"
import { createDynamite, createLadder } from "@shared/templates"
import { Player } from "../component/player.component"
import { Input, Key } from "../dependency/input"

/** @param {World} world  */
export function PlayerSystem(world) {
	const action = new Timer(100)
	const input = world.getDependency(Input)
	const map = world.getDependency(Map)

	world.listen("onUpdate", ({dt}) => {
		if (input.isPressed(Key.JUMP))
			jumpPlayer(world)
		if (input.isPressed(Key.LADDER))
			placeLadder(world)

		action.step(dt)
		if (!action.done)
			return
		action.reset()
		const dx = input.getAxis(Key.LEFT, Key.RIGHT)
		const dy = input.getAxis(Key.UP, Key.DOWN)
		movePlayer(world, map, dx, dy)
	})
}

/** @param {World} world  */
function jumpPlayer(world) {
	for (const [player, gravity] of world.query(Player, Gravity)) {
		if (gravity.onGround) {
			player.jump = 3
			gravity.enabled = false
			gravity.onGround = false
		}
	}
}

/** @param {World} world  */
function placeLadder(world) {
	const ladders = world.query(Position, Ladder).map(([position]) => position)
	for (const [position] of world.query(Position, Player)) {
		if (!ladders.find((p) => p.x == position.x && p.y == position.y))
			createLadder(world, position.x, position.y)
	}
}


/**
 * @param {World} world 
 * @param {number} dx 
 * @param {boolean} jump
 */
function movePlayer(world, map, dx, dy) {
	const ladders = world.query(Position, Ladder).map(([position]) => position)

	for (const [entity, position, player, gravity] of world.query(Entities, Position, Player, Gravity)) {
		const newX = position.x + dx

		if (dy && ladders.find((p) => p.x == position.x && (p.y == position.y || p.y == position.y + dy))) {
			const newY = position.y + dy
			if (!map.isBlocked(position.x, newY)) {
				position.y = newY
			}
		} else if (player.jump) {
			player.jump--
			const newY = position.y - 1
			if (!map.isBlocked(position.x, newY)) {
				position.y = newY
			} else {
				player.jump = 0
			}
			gravity.enabled = player.jump == 0
		}

		if (gravity.onGround)
			dig(world, map, player, newX, position.y + dy)

		if (map.isBlocked(newX, position.y))
			continue

		position.x = newX
		const viewshed = world.getComponent(entity, Viewshed)
		if (viewshed)
			viewshed.isDirty = true
	}
}

/**
 * 
 * @param {World} world 
 * @param {Player} player 
 * @param {Map} map
 * @param {number} x 
 * @param {number} y 
 */
function dig(world, map, player, x, y) {
	if (!map.isBlocked(x, y))
		return
	if (player.dig.x != x || player.dig.y != y) {
		player.dig = {x, y}
		return
	}
	world.emit("onDigged", {x, y})
}

/** @param {World} world */
const placeExplosive = (world) => {
	for (const [position, _] of world.query(Position, Player)) {
		createDynamite(world, position.x, position.y, true)
	}
}

