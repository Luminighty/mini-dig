import { World } from "@luminight/ecs"
import { Socket, io } from "socket.io-client"
import { ClientOwned } from "@shared/component/network.component"
import { SharedComponentRegistry } from "@shared/component"
import { id } from "../../../shared/utils/id"
import { NETWORK_TEMPLATES } from "../../../shared/templates/network"
import { ServerOwned } from "../../../shared/component/network.component"

export class NetworkSocket {
	/** 
	 * @param {World} world 
	 * @param {Socket} socket
	 * @param {number} clientId
	 */
	constructor(world, socket, clientId) {
		this.world = world
		this.socket = socket
		this.clientId = clientId
		this.serverEntities = {}
		/** @type {{entity: import("@luminight/ecs").EntityId, clientOwned: ClientOwned}[]} */
		this.clientEntities = []
		attachListeners(socket, world, this)
	}

	emit(event, props={}) {
		props["client"] = this.clientId
		this.socket.emit("emit", event, props)
	}

	/** 
	 * @param {import("@luminight/ecs").EntityId} entity 
	 * @param {ClientOwned} clientOwned
	 */
	createEntity(entity, clientOwned) {
		clientOwned.id = id()
		this.clientEntities.push({entity, clientOwned})
		this.socket.emit("createEntity", clientOwned.templateId, clientOwned.id, getEntityData(this.world, entity, clientOwned))
	}


	syncAll() {
		const data = []
		for (const entity of this.clientEntities)
			data.push([entity.entity, getEntityData(this.world, entity.entity, entity.clientOwned)])
		this.socket.emit("syncAll", data)
	}

	/** 
	 * @param {import("@luminight/ecs").EntityId} entity 
	 * @param {ClientOwned} clientOwned
	 */
	sync(entity, clientOwned) {
		const data = getEntityData(this.world, entity, clientOwned)
		this.socket.emit("sync", clientOwned.templateId, clientOwned.id, data)
	}

	setup(serverData) {
		for (const entity of serverData) {
			if (!this.serverEntities[entity.owner])
				this.serverEntities[entity.owner] = {}
			const e = initServerEntity(this, this.world, entity.owner, entity.id, entity.template, entity.data)
			this.serverEntities[entity.owner][entity.id] = e
		}
	}
}


function getEntityData(world, entity, client) {
	const data = {}
	for (const Component of client.components)
		data[Component.COMPONENT_ID] = Object.entries(world.getComponent(entity, Component))
	return data
}

/**
 * @param {Socket} socket 
 * @param {World} world 
 * @param {NetworkSocket} network 
 */
function attachListeners(socket, world, network) {
	socket.on("emit", (event, props) => world.emit(event, props))

	socket.on("sync", (template, owner, id, data) => {
		let entityData = network.serverEntities[owner]?.[id]
		if (!entityData) {
			entityData = initServerEntity(network, world, owner, id, template, data)
			if (!network.serverEntities[owner])
				network.serverEntities[owner] = {}
			network.serverEntities[owner][id] = entityData
		}
		console.log(entityData);
		
		for (const [componentId, componentData] of Object.entries(data)) {
			const c = entityData[componentId]
			for (const [field, value] of componentData)
				c[field] = value
		}
	})

	socket.on("syncAll", (owner, data) => {
		if (!network.serverEntities[owner])
			network.serverEntities[owner] = {}
		for (const [id, entityData] of data) {
			const c = network.serverEntities[owner][id]
			if (!c)
				continue
				
			
			for (const [componentId, componentData] of Object.entries(entityData))
				for (const [field, value] of componentData)
					c[componentId][field] = value
			
		}
	})

	socket.on("createEntity", (template, owner, id, data) => {
		console.log(template, owner, id, data);
		if (!network.serverEntities[owner])
			network.serverEntities[owner] = {}

		network.serverEntities[owner][id] = initServerEntity(network, world, owner, id, template, data)

	})
}

/**
 * @param {Socket} socket 
 * @param {World} world 
 * @param {NetworkSocket} network 
 */
function initServerEntity(network, world, owner, id, template, data) {
	const Template = NETWORK_TEMPLATES[template]
	if (!Template)
		throw new Error(`Network Template '${template} not found when initializing network entity ${id}`)
	const entity = Template(world)

	const serverOwned = world.getComponent(entity, ServerOwned)
	serverOwned.owner = owner
	serverOwned.id = id

	const networkData = {}
	
	for (const [id, componentData] of Object.entries(data)) {
		const [_, Component] = SharedComponentRegistry.find(([key]) => key == id)
		const c = world.getComponent(entity, Component)
		networkData[id] = c
		for (const [field, value] of componentData)
			c[field] = value
	}
	return networkData
}

/** @returns {Promise<[Socket, number, Object]>} */
export async function connectToServer(url) {
	return new Promise((res, rej) => {
		console.log("Connecting...")
		const socket = io(url)
		
		socket.once("setup", (clientId, serverData) => {
			console.log("Setup received...")
			res([socket, clientId, serverData])
		})
	})
}