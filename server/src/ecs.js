import { Component, World } from "@luminight/ecs"
import { SharedComponentRegistry } from "@shared/component"
import { Server } from "socket.io"
import { GameConfig, generateMine } from "@shared/dependency"
import { setupSharedSystems } from "@shared/system"
import { NetworkServer } from "./dependency/server"

/**
 * @param {Server} server 
 */
export function setupEcs(server) {
	const world = new World()

	SharedComponentRegistry.forEach(([key, component]) => {
		Component(key)(component)
		console.log(`Registered shared/${key}`)
	})

	world.injectDependency(new NetworkServer(server, world))
	const config = world.injectDependency(new GameConfig())
	const map = world.injectDependency(generateMine(config.world.x, config.world.y))

	world.addSystem(setupSharedSystems)

	return world
}