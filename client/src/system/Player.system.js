import { Entities, World } from "@luminight/ecs"
import { Map } from "@shared/dependency"
import { Gravity, Ladder, Position, Viewshed } from "@shared/component"
import { ORE_DROP, TILE, TILE_DIGGABLE } from "@shared/dependency"
import { Timer } from "@shared/utils"
import { createDynamite, createLadder } from "@shared/templates"
import { Player } from "../component/player.component"
import { Input, Key } from "../dependency/input"
import { NetworkSocket } from "../dependency/network"

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
		if (input.isPressed(Key.PICKUP))
			pickup(world)

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
function pickup(world) {
	const map = world.getDependency(Map)
	for (const [player, position] of world.query(Player, Position)) {
		const idx = map.xyIndex(position.x, position.y)
		console.log(map.tileEntities[idx])
	}
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
	const network = world.getDependency(NetworkSocket)
	for (const [position, player] of world.query(Position, Player)) {
		if (player.ladders == 0)
			continue

		if (!ladders.find((p) => p.x == position.x && p.y == position.y)) {
			player.ladders--
			world.deleteEntity(player.inventory.remove(0))
			network.createEntity(createLadder, position.x, position.y)
		}
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
		const newPosition = {
			x: position.x + dx,
			y: position.y
		}
		
		const usedLadder = applyLadder(position, newPosition, dy, ladders)
		if (!usedLadder)
			applyJump(position, newPosition, player, map, gravity)

		if (gravity.onGround)
			dig(world, map, player, newPosition.x, position.y + dy)

		let moved = false
		if (!map.isBlocked(newPosition.x, position.y)) {
			position.x = newPosition.x
			moved = true
		}
		if (!map.isBlocked(position.x, newPosition.y)) {
			position.y = newPosition.y
			moved = true
		}

		if (moved) {
			const viewshed = world.getComponent(entity, Viewshed)
			if (viewshed)
				viewshed.isDirty = true
		}
	}
}

function applyLadder(position, newPosition, dy, ladders) {
	if (!dy)
		return false
	const currentLadder = ladders.find((p) => 
		p.x == newPosition.x && 
		(p.y == newPosition.y || p.y == newPosition.y + dy)
	)
	if (currentLadder)
		newPosition.y = position.y + dy
	return Boolean(currentLadder)
}

function applyJump(position, newPosition, player, map, gravity) {
	if (!player.jump)
		return
	player.jump--
	const newY = position.y - 1
	if (!map.isBlocked(position.x, newY)) {
		newPosition.y = newY
	} else {
		player.jump = 0
	}
	gravity.enabled = player.jump == 0
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
	const idx = map.xyIndex(x, y)
	if (TILE_DIGGABLE.includes(map.tiles[idx])) {
		const drop = ORE_DROP[map.tiles[idx]]
		if (drop)
			world.getDependency(NetworkSocket).createEntity(drop, x, y)
		map.tiles[idx] = TILE.FLOOR
	}
	world.getDependency(NetworkSocket).emit("onDigged", {idx})
}

/** @param {World} world */
const placeExplosive = (world) => {
	for (const [position, _] of world.query(Position, Player)) {
		createDynamite(world, position.x, position.y, true)
	}
}

