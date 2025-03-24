import { Entities, World } from "@luminight/ecs"
import { Server, Socket } from "socket.io"
import { id, serializeEntity } from "@shared/utils"
import { SharedComponentRegistry, ServerOwned, NetworkEntity } from "@shared/component"
import { NETWORK_TEMPLATES } from "@shared/templates/network"
import { Map } from "@shared/dependency"

export class NetworkServer {
	/**
	 * @param {Server} server 
	 * @param {World} world
	 */
	constructor(server, world) {
		this.server = server
		this.world = world
		this.networkEntities = {}
		attachListeners(server, this, world)
	}

	networkToLocalEntity(networkId) {
		for (const [entity, network] of this.networkEntities)
			if (network == networkId)
				return entity
		return null
	}

}

/**
 * @param {Server} server 
 * @param {NetworkServer} network 
 * @param {World} world 
 */
function attachListeners(server, network, world) {
	server.on("connection", (socket) => onClientConnection(server, network, world, socket))
}


/**
 * @param {Server} server 
 * @param {Socket} socket
 * @param {NetworkServer} network 
 * @param {World} world 
 */
function onClientConnection(server, network, world, socket) {
	console.log("Client connected")
	const killOnDisconnect = []
	const entities = {}
	let clientId = id()

	socket.emit("setup", clientId, {
		world: getSetupData(world),
		map: world.getDependency(Map).serialize()
	})

	socket.on("disconnect", (reason) => {
		console.log(`Client disconnected: ${reason}`)
		socket.broadcast.emit("emit", "onClientDisconnected", { owner: clientId, killOnDisconnect })
		for (const [entity, serverOwned] of world.query(Entities, ServerOwned)) {
			if (serverOwned.owner != clientId || !killOnDisconnect.includes(serverOwned.id))
				continue
			world.deleteEntity(entity)
		}
	})
	
	socket.on("emit", (event, props) => {
		if (props.networkEntity)
			props.entity = network.networkToLocalEntity(props.networkEntity)
		world.emit(event, props)
		socket.broadcast.emit("emit", event, props)
	})

	socket.on("sync", (template, id, data) => {
		if (!entities[id])
			return console.warn(`Client tried to sync non existing entity! ${template}#${id}`)
		const entity = entities[id]
		for (const [componentId, componentData] of Object.entries(data)) {
			const c = entity[componentId]
			for (const [field, value] of componentData)
				c[field] = value
		}
		socket.broadcast.emit("sync", template, clientId, id, data)
	})

	socket.on("syncAll", (data) => {
		for (const [id, entityData] of data) {
			const c = entities[id]
			if (!c)
				continue
			for (const [componentId, componentData] of Object.entries(entityData))
				for (const [field, value] of componentData)
					c[componentId][field] = value
		}
		socket.broadcast.emit("syncAll", clientId, data)
	})

	socket.on("createClientEntity", (template, id, keepAlive, data) => {
		entities[id] = initServerEntity(network, world, clientId, id, template, data)
		if (!keepAlive)
			killOnDisconnect.push(id)
		socket.broadcast.emit("createServerEntity", template, clientId, id, data)
	})

	socket.on("createEntity", (template, data, ack) => {
		const Template = NETWORK_TEMPLATES[template]
		if (!Template)
			throw new Error(`Template '${template} not found when initializing network entity ${id}`)
		/** @type {import("@luminight/ecs").EntityId} */
		const entity = Template(world, ...data)
		const networkEntity = world.addComponent(entity, new NetworkEntity(id()))
		network.networkEntities[entity] = networkEntity.id
		socket.broadcast.emit("createEntity", template, data, networkEntity.id)
		ack({networkId: networkEntity.id})
	})
}

/**
 * @param {Socket} socket 
 * @param {World} world 
 * @param {NetworkServer} network 
 */
function initServerEntity(network, world, clientId, id, template, data) {
	const Template = NETWORK_TEMPLATES[template]
	if (!Template)
		throw new Error(`Network Template '${template} not found when initializing network entity ${id}`)
	const entity = Template(world)

	const serverOwned = world.getComponent(entity, ServerOwned)
	serverOwned.id = id
	serverOwned.owner = clientId
	serverOwned.template = template
	
	const networkData = {}
	for (const [id, componentData] of Object.entries(data)) {
		const [_, Component] = SharedComponentRegistry.find(([key]) => key == id)
		const c = world.getComponent(entity, Component)
		networkData[id] = c
	}
	return networkData
}

/** @param {World} world  */
function getSetupData(world) {
	const data = []
	for (const entity of Object.values(world.entities.entities))
		data.push(serializeEntity(entity))
	return data
}

function getEntityData(world, entity, components) {
	const data = {}
	for (const Component of components)
		data[Component.COMPONENT_ID] = Object.entries(world.getComponent(entity, Component))
	return data
}
