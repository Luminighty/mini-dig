import { createMiner } from "../templates"
import { SharedComponentRegistry } from "./registry"

export class ClientOwned {
	/** @param {...import("@luminight/ecs").ComponentClass} components  */
	constructor(templateId, ...components) {
		this.templateId = templateId
		this.components = components
		this.id = -1
		this.keepAlive = false
	}

	withKeepAlive() {
		this.keepAlive = true
		return this
	}
}

export class ServerOwned {
	/** @param {...import("@luminight/ecs").ComponentClass} components  */
	constructor(...components) {
		this.components = components
		this.template = null
		this.id = -1
		this.owner = -1
	}

	serialize() {
		return {
			template: this.template,
			id: this.id,
			owner: this.owner,
			components: this.components.map((Component) => Component.COMPONENT_ID)
		}
	}

	static deserialize(data) {
		const serverOwned = new ServerOwned()
		serverOwned.components = data.components.map((id) => SharedComponentRegistry.find(([key]) => key == id)[1])
		serverOwned.id = data.id
		serverOwned.owner = data.owner
		serverOwned.template = data.template
		return serverOwned
	}
}

export class NetworkEntity {
	constructor(id=-1) {
		this.id = id 
	}
}
