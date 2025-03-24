import { World } from "@luminight/ecs"
import { Gravity, Position, Renderable, RenderOrder } from "../component"
import {  glyphCode } from "../../client/src/ascii"
import { BLACK, BLUE, GRAY, RED } from "@shared/utils"

/**
 * @param {World} world 
 * @param {number} x 
 * @param {number} y 
 */
export function createOre(world, x, y, glyph) {
	return world.createEntity(
		new Position({x, y}),
		new Renderable(glyph, RenderOrder.ITEM),
		new Gravity()
	)
}

export const createCoalOre = (world, x, y) => createOre(world, x, y, glyphCode(0x0F, GRAY(0x22), BLACK))
export const createIronOre = (world, x, y) => createOre(world, x, y, glyphCode(0x2A, RED, BLACK))
export const createDiamondOre = (world, x, y) => createOre(world, x, y, glyphCode(0x0F, BLUE, BLACK))
