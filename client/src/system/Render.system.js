import { World } from "@luminight/ecs"
import { Map } from "../../../shared/dependency/map"
import { AsciiRenderer, glyphCode } from "../ascii"
import { BLACK, GRAY } from "../palette"
import { Position, Renderable } from "../../../shared/component"
import { Camera } from "../dependency/camera"
import { TILE_GLYPH } from "../../../shared/dependency/tile"

/** @param {World} world */
export function RenderSystem(world) {
	const renderer = world.getDependency(AsciiRenderer)
	const map = world.getDependency(Map)
	const camera = world.getDependency(Camera)

	const main = {
		entity: camera.main,
		position: world.getComponent(camera.main, Position)
	}

	const GYLPH_NONE = glyphCode(0, BLACK, BLACK)
	world.listen("onRender", () => {

		if (main.entity != camera.main)
			main.position = world.getComponent(camera.main, Position)

		const offsetX = main.position.x + camera.offset.x
		const offsetY = main.position.y + camera.offset.y
		
		for (let i = 0; i < camera.size; i++) {
			const x = i % camera.width
			const y = Math.floor(i / camera.width)
			const mapX = x + offsetX
			const mapY = y + offsetY
			const tile = mapX + mapY * map.width

			if (!map.isTileDiscovered(mapX, mapY)) {
				renderer.set(x, y, GYLPH_NONE)
				continue
			}

			const glyph = TILE_GLYPH[map.tiles[tile]]
			const isVisible = map.isTileVisible(mapX, mapY)
			const [fg, bg] = isVisible ? [glyph.fg, glyph.bg] : [GRAY(0x30), BLACK]
			renderer.set(x, y, {c: glyph.c, fg, bg})
		}

		const renderables = world.query(Position, Renderable).sort((l, r) => l[1].renderOrder - r[1].renderOrder)
		for (const [position, renderable] of renderables) {
			if (!map.isTileVisible(position.x, position.y))
				continue
			renderer.set(
				position.x - offsetX,
				position.y - offsetY,
				renderable.glyph
			)
		}

		renderer.render()
	})
}