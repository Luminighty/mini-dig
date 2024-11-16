import { createMiner } from "../templates"

export class ClientOwned {
	/** @param {...import("@luminight/ecs").ComponentClass} components  */
	constructor(templateId, ...components) {
		this.templateId = templateId
		this.components = components
		this.id = -1
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
}