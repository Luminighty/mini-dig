import { Component, World } from "@luminight/ecs";
import { generateMap } from "../dependency/map";
import { setupSystems } from "../system";
import { GameConfig } from "../dependency/config";
import { glyph } from "../ascii";
import { BLACK, ORANGE } from "../palette";
import { Rect } from "../utils";
import { ComponentRegistry, PlayerComponent, PositionComponent, RenderableComponent } from "../component";

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