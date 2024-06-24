import { World } from "@luminight/ecs";
import { Map, TILE_GLYPH } from "../dependency/map";
import { AsciiRenderer } from "../ascii";
import { GameConfig } from "../dependency/config";
import { BLACK, GRAY } from "../palette";
import { Position, Renderable } from "../component";

/**
 * @param {World} world 
 */
export function RenderSystem(world) {
	const renderer = world.getDependency(AsciiRenderer);
	const map = world.getDependency(Map);
	const config = world.getDependency(GameConfig);

	world.listen("onRender", () => {
		for (let i = 0; i < map.tiles.length; i++) {
			const x = i % config.world.x
			const y = Math.floor(i / config.world.x)

			if (!map.isTileDiscovered(x, y))
				continue

			const glyph = TILE_GLYPH[map.tiles[i]];
			const fg = map.isTileVisible(x, y) ? glyph.fg : GRAY(0x30)
			const bg = map.isTileVisible(x, y) ? glyph.bg : BLACK

			renderer.set(x, y, {c: glyph.c, fg, bg});
		}

		const renderables = world.query(Position, Renderable).sort((l, r) => l[1].renderOrder - r[1].renderOrder)
		for (const [position, renderable] of renderables) {
			if (!map.isTileVisible(position.x, position.y))
				continue
			renderer.set(
				position.x,
				position.y,
				renderable.glyph
			)
		}

		renderer.render()
	})
}