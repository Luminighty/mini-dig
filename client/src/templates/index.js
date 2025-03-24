import { Entity, World } from "@luminight/ecs"
import { Gravity, Position, Renderable, RenderOrder, Viewshed, ClientOwned, Item } from "@shared/component"
import { glyphCode } from "../ascii"
import { Player } from "../component/player.component"
import { BLACK, BLUE, ORANGE } from "@shared/utils/palette"
import { createLadder, createLadderItem, createMiner } from "@shared/templates"

/** 
 * @param {World} world 
 * @returns {Entity}  
 */
export const createPlayer = (world, x, y) => {
	const player = new Player()
	const ore = world.createEntity(
		new Renderable(glyphCode(0x0F, BLUE, BLACK)),
		new Gravity(),
		new Item({name: "DIAMOND", weight: 3})
	)
	for (let i = 0; i < 5; i++)
		player.inventory.add(createLadderItem(world), 1)
	player.inventory.add(ore, 3)
	return world.createEntity(
		player,
		new Position({x, y}),
		new Gravity(),
		new Renderable(glyphCode(0x02, ORANGE, BLACK), RenderOrder.PLAYER),
		new Viewshed(4),
		new ClientOwned(
			createMiner.name,
			Position
		)
	)
}