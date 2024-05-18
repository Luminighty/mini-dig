import { Component, World } from "@luminight/ecs";
import { generateMap } from "../dependency/map";
import { setupSystems } from "../system";
import { GameConfig } from "../dependency/config";
import { glyph, glyphCode } from "../ascii";
import { BLACK, ORANGE } from "../palette";
import { Rect } from "../utils";
import { ComponentRegistry, PlayerComponent, PositionComponent, RenderableComponent } from "../component";
import { PlayerEntity } from "../dependency/player";
import { ViewshedComponent } from "../component/Viewshed.component";

export function setupEcs(renderer, config) {
	const world = new World();

	ComponentRegistry.forEach(([key, component]) => Component(key)(component))

	world.injectDependency(new GameConfig())
	const map = world.injectDependency(generateMap(config.world.x, config.world.y))

	const [x, y] = Rect.center(map.rooms[0])
	const player = new PlayerEntity(
		world.createEntity(
			new PlayerComponent(),
			new PositionComponent({x, y}),
			new RenderableComponent(glyphCode(0x02, ORANGE, BLACK)),
			new ViewshedComponent(8),
		)
	)
	world.injectDependency(player);
	world.injectDependency(renderer)

	world.addSystem(setupSystems)

	world.emit("onUpdate")
	world.emit("onRender")
	return world
}