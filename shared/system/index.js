import { World } from "@luminight/ecs"

const systemModules = import.meta.glob("./*.system.js", { eager: true })
const systems = []

for (const path in systemModules) {
	const mod = await systemModules[path]
	const systemKey = Object.keys(mod).filter((component) => component.endsWith("System"))[0]
	const system = mod[systemKey]
	systems.push(system)
}

/** @param {World} world  */
export function setupSharedSystems(world) {
	const sorted = systems.filter(Boolean).sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))
	for (const system of sorted)
		world.addSystem(system)
}
