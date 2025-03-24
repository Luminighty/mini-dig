import { Entities, World } from "@luminight/ecs"
import { NetworkSocket } from "../dependency/network"
import { ClientOwned, ServerOwned } from "@shared/component/network.component"
import { Timer } from "@shared/utils"

/** @param {World} world */
export function NetworkSystem(world) {
	const network = world.getDependency(NetworkSocket)

	let sync = new Timer(30)
	world.listen("onLateUpdate", ({dt}) => {
		sync.step(dt)
		if (sync.done) {
			network.syncAll()
			sync.reset()
		}
	})

	world.listen("onClientDisconnected", ({owner, killOnDisconnect}) => {
		for (const [entity, serverOwned] of world.query(Entities, ServerOwned)) {
			if (serverOwned.owner != owner || !killOnDisconnect.includes(serverOwned.id))
				continue
			world.deleteEntity(entity)
		}
	})

	world.listen("onInit", () => {
		for (const [client, entity] of world.query(ClientOwned, Entities))
			network.createClientEntity(entity, client)
	})
}