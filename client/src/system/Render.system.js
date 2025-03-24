import { World } from "@luminight/ecs"
import { GameConfig, Map } from "@shared/dependency"
import { AsciiRenderer, glyph, glyphCode } from "../ascii"
import { Position, Renderable } from "@shared/component"
import { Camera } from "../dependency/camera"
import { TILE_GLYPH } from "@shared/dependency"
import { WHITE, BLACK, GRAY, RED, BROWN } from "@shared/utils/palette"
import { Player } from "../component/player.component"
import { PlayerEntity } from "../dependency/player"

/** @param {World} world */
export function RenderSystem(world) {
	const renderer = world.getDependency(AsciiRenderer)
	const map = world.getDependency(Map)
	const camera = world.getDependency(Camera)
	const config = world.getDependency(GameConfig)
	const player = world.getDependency(PlayerEntity)

	const main = {
		entity: camera.main,
		position: world.getComponent(camera.main, Position)
	}

	const GYLPH_NONE = glyphCode(0, BLACK, BLACK)
	world.listen("onRender", () => {
		if (main.entity != camera.main)
			main.position = world.getComponent(camera.main, Position)

		const offset = {
			x: main.position.x + camera.offset.x,
			y: main.position.y + camera.offset.y
		}

		renderMap(renderer, config, camera, offset, map)
		renderEntities(renderer, config, offset, map, world)
		renderUI(renderer, world, config, world.getComponent(player.entity, Player))

		renderer.render()
	})
}


/**
 * @param {AsciiRenderer} renderer 
 * @param {GameConfig} config
 * @param {Camera} camera 
 * @param {{x: number, y: number}} offset 
 * @param {Map} map 
 */
function renderMap(renderer, config, camera, offset, map) {
	const GYLPH_NONE = glyph('.', GRAY(0x05), BLACK)
	
	for (let i = 0; i < camera.size; i++) {
		const x = i % camera.width
		const y = Math.floor(i / camera.width)
		const mapX = x + offset.x
		const mapY = y + offset.y
		const tile = mapX + mapY * map.width

		if (!map.isTileDiscovered(mapX, mapY)) {
			renderer.set(x + config.ui.x, y + config.ui.y, GYLPH_NONE)
			continue
		}

		const glyph = TILE_GLYPH[map.tiles[tile]]
		const isVisible = map.isTileVisible(mapX, mapY)
		const [fg, bg] = isVisible ? [glyph.fg, glyph.bg] : [GRAY(0x30), BLACK]
		renderer.set(
			x + config.ui.x, 
			y + config.ui.y, 
			{c: glyph.c, fg, bg}
		)
	}
}

/**
 * @param {AsciiRenderer} renderer 
 * @param {GameConfig} config
 * @param {{x: number, y: number}} offset 
 * @param {Map} map 
 * @param {World} world 
 */
function renderEntities(renderer, config, offset, map, world) {
	const renderables = world.query(Position, Renderable).sort((l, r) => l[1].renderOrder - r[1].renderOrder)
	for (const [position, renderable] of renderables) {
		if (!map.isTileVisible(position.x, position.y))
			continue
		renderer.set(
			position.x - offset.x + config.ui.x,
			position.y - offset.y + config.ui.y,
			renderable.glyph
		)
	}
}

const HP_FULL = glyphCode(0x03, RED, BLACK)
const HP_EMPTY = glyphCode(0x03, GRAY(0x50), BLACK)
const LADDER = glyph('|', BROWN, BLACK)
const INV_SLOT = glyphCode(0xF9, GRAY(0x60), BLACK)
/**
 * @param {AsciiRenderer} renderer 
 * @param {World} world
 * @param {GameConfig} config 
 * @param {Player} player 
 */
function renderUI(renderer, world, config, player) {
	for (let i = 0; i < player.maxHp; i++)
		renderer.set(i, 0, i < player.hp ? HP_FULL : HP_EMPTY)

	let remaining = player.inventory.size
	for (let i = 0; i < player.inventory.items.length; i++) {
		let item = player.inventory.items[i]
		const render = world.getComponent(item.item, Renderable)
		for(let j = 0; j < item.weight; j++) {
			renderer.set(
				config.screen.x - remaining + j,
				0,
				render.glyph
			)
		}
		remaining -= item.weight
	}
	for (let i = 0; i < remaining; i++)
		renderer.set(config.screen.x - i - 1, 0, INV_SLOT)
}