import { Entities, World } from "@luminight/ecs"
import { NetworkSocket } from "../dependency/network"
import { ClientOwned } from "../../../shared/component/network.component"
import { Timer } from "../../../shared/utils/timer"

/** @param {World} world */
export function NetworkSystem(world) {
	const network = world.getDependency(NetworkSocket)

	world.listen("onEntityCreated", (data) => {
		console.log("created", data)
	})
	
	let sync = new Timer(30)
	world.listen("onLateUpdate", ({dt}) => {
		sync.step(dt)
		if (sync.done) {
			network.syncAll()
			sync.reset()
		}
	})

	world.listen("onInit", () => {
		for (const [client, entity] of world.query(ClientOwned, Entities))
			network.createEntity(entity, client)
	})
}