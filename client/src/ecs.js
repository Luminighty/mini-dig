import { Component, World } from "@luminight/ecs"
import { setupSharedSystems } from "@shared/system"
import { Rect } from "@shared/utils"
import { SharedComponentRegistry } from "@shared/component"
import { PlayerEntity, Camera, generateMine, Input, GameConfig } from "@shared/dependency"
import { createPlayer } from "./templates"
import { ComponentRegistry } from "./component/registry"
import { setupSystems } from "./system"
import { NetworkSocket } from "./dependency/network"
import { AsciiRenderer } from "./ascii"
import { Socket } from "socket.io-client"

/**
 * @param {AsciiRenderer} renderer 
 * @param {Socket} socket 
 * @param {number} clientId 
 * @returns 
 */
export function setupEcs(renderer, socket, clientId) {
	console.log("setup")
	const world = new World()

	SharedComponentRegistry.forEach(([key, component]) => {
		Component(key)(component)
		console.log(`Registered shared/${key}`)
	})
	ComponentRegistry.forEach(([key, component]) => {
		Component(key)(component)
		console.log(`Registered ${key}`)
	})

	const config = world.injectDependency(new GameConfig())
	world.injectDependency(new Input())
	const map = world.injectDependency(generateMine(config.world.x, config.world.y))

	const player = createPlayer(world, ...Rect.center(map.rooms[0]))
	world.injectDependency(new PlayerEntity(player))
	world.injectDependency(new Camera(player))
	world.injectDependency(renderer)
	if (socket)
		world.injectDependency(new NetworkSocket(world, socket, clientId))

	world.addSystem(setupSharedSystems)
	world.addSystem(setupSystems)

	window["world"] = world

	return world
}