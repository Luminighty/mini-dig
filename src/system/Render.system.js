import { World } from "@luminight/ecs";
import { Map, TILE_GLYPH } from "../dependency/map";
import { PositionComponent } from "../component/Position.component";
import { RenderableComponent } from "../component/Renderable.component";
import { AsciiRenderer } from "../ascii";
import { GameConfig } from "../dependency/config";
import { BLACK, GRAY } from "../palette";

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

		for (const [position, renderable] of world.query(PositionComponent, RenderableComponent)) {
			renderer.set(
				position.x,
				position.y,
				renderable.glyph
			)
		}

		renderer.render()
	})
}