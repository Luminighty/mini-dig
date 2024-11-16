import { Entity, World } from "@luminight/ecs"
import { Gravity, Position, Renderable, RenderOrder, Viewshed } from "@shared/component"
import { glyphCode } from "../ascii"
import { Player } from "../component/player.component"
import { BLACK, ORANGE } from "../palette"
import { ClientOwned } from "../../../shared/component/network.component"
import { createMiner } from "../../../shared/templates"

/** 
 * @param {World} world 
 * @returns {Entity}  
 */
export const createPlayer = (world, x, y) => 
	world.createEntity(
		new Player(),
		new Position({x, y}),
		new Gravity(),
		new Renderable(glyphCode(0x02, ORANGE, BLACK), RenderOrder.PLAYER),
		new Viewshed(4),
		new ClientOwned(
			createMiner.name,
			Position
		)
	)