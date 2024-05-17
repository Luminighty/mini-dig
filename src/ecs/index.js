import { Component, World } from "@luminight/ecs";
import { generateMap } from "../dependency/map";
import { PlayerComponent } from "../component/Player.component";
import { PositionComponent } from "../component/Position.component";
import { setupSystems } from "../system";
import { ComponentRegistry } from "../component/registry";
import { GameConfig } from "../dependency/config";
import { Rect } from "../utils/rect";
import { RenderableComponent } from "../component/Renderable.component";
import { glyph } from "../ascii";
import { BLACK, ORANGE } from "../palette";

export function setupEcs(renderer, config) {
	const world = new World();

	ComponentRegistry.forEach(([key, component]) => Component(key)(component))

	world.injectDependency(new GameConfig())
	const map = world.injectDependency(generateMap(config.world.x, config.world.y))
	world.injectDependency(renderer)

	world.addSystem(setupSystems)

	const [x, y] = Rect.center(map.rooms[0])
	world.createEntity(
		new PlayerComponent(),
		new PositionComponent({x, y}),
		new RenderableComponent(glyph('@', ORANGE, BLACK))
	)

	world.emit("onRender")
	return world
}