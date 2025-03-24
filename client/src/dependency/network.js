import { World } from "@luminight/ecs"
import { Socket, io } from "socket.io-client"
import { ClientOwned, NetworkEntity } from "@shared/component/network.component"
import { SharedComponentRegistry } from "@shared/component"
import { createEntityFromData, id } from "@shared/utils"
import { NETWORK_TEMPLATES } from "@shared/templates/network"
import { ServerOwned } from "@shared/component"

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
		this.networkEntities = {}
		this.serverEntities = {}
		/** @type {{entity: import("@luminight/ecs").EntityId, clientOwned: ClientOwned}[]} */
		this.clientEntities = []
		attachListeners(socket, world, this)
	}

	emit(event, props={}, emitLocally=true) {
		if (props.entity)
			props.networkEntity = this.networkEntities[props.entity]
		props["client"] = this.clientId
		this.socket.emit("emit", event, props)
		if (emitLocally)
			this.world.emit(event, props)
	}

	networkToLocalEntity(networkId) {
		for (const [entity, network] of this.networkEntities)
			if (network == networkId)
				return entity
		return null
	}

	/** 
	 * Creates an entity owned by the client
	 * @param {import("@luminight/ecs").EntityId} entity 
	 * @param {ClientOwned} clientOwned
	 */
	createClientEntity(entity, clientOwned) {
		clientOwned.id = id()
		this.clientEntities.push({entity, clientOwned})
		this.socket.emit(
			"createClientEntity", 
			clientOwned.templateId, 
			clientOwned.id, 
			clientOwned.keepAlive, 
			getEntityData(this.world, entity, clientOwned)
		)
	}

	/** 
	 * Creates an entity shared on the network, not owned by anyone
	 * @param {Function} template 
	 */
	createEntity(template, ...data) {
		const entity = template(this.world, ...data)
		const network = this.world.addComponent(entity, new NetworkEntity())
		this.socket.emit("createEntity", template.name, data, ({networkId}) => {
			network.id = networkId
			this.networkEntities[entity] = networkId
		})
	}


	syncAll() {
		const data = []
		for (const entity of this.clientEntities)
			data.push([entity.clientOwned.id, getEntityData(this.world, entity.entity, entity.clientOwned)])
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
		console.log("setup", serverData)
		
		for (const data of serverData.world) {
			const entity = createEntityFromData(this.world, data, SharedComponentRegistry)
			if (!entity) {
				console.warn(`Failed to initialize entity`, entity)
				continue
			}
			const serverOwned = this.world.getComponent(entity, ServerOwned)
			if (serverOwned) {
				const owner = serverOwned.owner
				const id = serverOwned.id
				if (!this.serverEntities[owner])
					this.serverEntities[owner] = {}
				
				const networkData = {}
				for (const [id, componentData] of Object.entries(data.components)) {
					const [_, Component] = SharedComponentRegistry.find(([key]) => key == id)
					const c = this.world.getComponent(entity, Component)
					networkData[id] = c
					for (const [field, value] of Object.entries(componentData))
						c[field] = value
				}
				this.serverEntities[owner][id] = networkData
			}
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
	socket.on("emit", (event, props) => {
		if (props.networkEntity)
			props.entity = network.networkToLocalEntity(props.networkEntity)
		world.emit(event, props)
	})

	socket.on("sync", (template, owner, id, data) => {
		let entityData = network.serverEntities[owner]?.[id]
		if (!entityData) {
			entityData = initServerEntity(network, world, owner, id, template, data)
			if (!network.serverEntities[owner])
				network.serverEntities[owner] = {}
			network.serverEntities[owner][id] = entityData
		}
		
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
			if (!c) {
				console.log("Missing entity!", owner, id, entityData)
				continue
			}
			
			for (const [componentId, componentData] of Object.entries(entityData)) {
				console.log(componentData)
				for (const [field, value] of componentData)
					c[componentId][field] = value
			}
		}
	})

	socket.on("createServerEntity", (template, owner, id, data) => {
		console.log(template, owner, id, data)
		if (!network.serverEntities[owner])
			network.serverEntities[owner] = {}

		network.serverEntities[owner][id] = initServerEntity(network, world, owner, id, template, data)
	})

	socket.on("createEntity", (template, data, networkId) => {
		const Template = NETWORK_TEMPLATES[template]
		if (!Template)
			throw new Error(`Template '${template} not found when initializing network entity ${id}`)
		const entity = Template(world, ...data)
		world.addComponent(entity, new NetworkEntity(networkId))
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
	return new Promise((res) => {
		console.log("Connecting...")
		const socket = io(url)
		
		socket.once("setup", (clientId, serverData) => {
			console.log("Setup received...")
			res([socket, clientId, serverData])
		})
	})
}