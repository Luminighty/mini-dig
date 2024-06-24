import { World } from "@luminight/ecs";
import { glyph, glyphCode } from "../ascii";
import { BLACK, GRAY, ORANGE, RED, YELLOW } from "../palette";
import { Explosion, Explosive, Player, Position, RenderOrder, Renderable, Viewshed } from "../component";
import { Random } from "../utils";

/** @param {World} world  */
export const createPlayer = (world, x, y) => 
	world.createEntity(
		new Player(),
		new Position({x, y}),
		new Renderable(glyphCode(0x02, ORANGE, BLACK), RenderOrder.PLAYER),
		new Viewshed(16),
	)


export const createDynamite = (world, x, y, ignited) => 
	world.createEntity(
		new Explosive({delay: 16, radius: 6, ignited}),
		new Position({x, y}),
		new Renderable(glyph('\\', RED, BLACK), RenderOrder.ITEM)
	)

export const createExplosion = (world, x, y, radius) =>
	world.createEntity(
		new Explosion(radius),
		new Position({x, y}),
		new Renderable(explosionGlyph(radius + Random.range(-1, 2)), RenderOrder.EXPLOSION + 10 + radius)
	)

export const explosionGlyph = (radius) => {
	if (radius > 6)
		return glyphCode(
			radius % 2 ? 0xB0 : 0xB1, 
			radius % 3 ? YELLOW : ORANGE, 
			radius % 3 ? ORANGE : YELLOW
		)
	if (radius > 3)
		return glyphCode(
			radius % 2 ? 0xB1 : 0xB2,
			radius % 3 ? RED : BLACK, 
			radius % 3 ? ORANGE : RED
		)
	return glyphCode(
		0xB0,
		radius % 3 ? RED : GRAY(0xA0), 
		radius % 3 ? GRAY(0x20) : BLACK
	)
}