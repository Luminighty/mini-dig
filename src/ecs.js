import { Component, World } from "@luminight/ecs";
import { generateMap } from "./dependency/map";
import { setupSystems } from "./system";
import { GameConfig } from "./dependency/config";
import { Rect } from "./utils";
import { ComponentRegistry } from "./component";
import { PlayerEntity } from "./dependency/player";
import { createPlayer } from "./templates";

export function setupEcs(renderer, config) {
	console.log("setup");
	const world = new World();

	ComponentRegistry.forEach(([key, component]) => {
		Component(key)(component)
		console.log(`Registered ${key}`);
	})

	world.injectDependency(new GameConfig())
	const map = world.injectDependency(generateMap(config.world.x, config.world.y))

	const player = createPlayer(world, ...Rect.center(map.rooms[0]))
	world.injectDependency(new PlayerEntity(player));
	world.injectDependency(renderer)

	world.addSystem(setupSystems)

	return world
}