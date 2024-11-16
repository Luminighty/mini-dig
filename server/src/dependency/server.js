import { Entities, World } from "@luminight/ecs"
import { Server, Socket } from "socket.io"
import { id } from "@shared/utils/id"
import { SharedComponentRegistry } from "@shared/component"
import { NETWORK_TEMPLATES } from "../../../shared/templates/network"
import { ServerOwned } from "../../../shared/component/network.component"

export class NetworkServer {
	/**
	 * @param {Server} server 
	 * @param {World} world
	 */
	constructor(server, world) {
		this.server = server
		this.world = world
		attachListeners(server, this, world)
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
	
	const entities = {}
	let clientId = id()
	socket.emit("setup", clientId, getSetupData(world))
	
	socket.on("emit", (event, props) => {
		world.emit(event, props)
		socket.broadcast.emit("emit", event, props)
	})

	socket.on("sync", (template, id, data) => {
		if (!entities[id])
			return console.warn(`Client tried to sync non existing entity! ${template}#${id}`)
		socket.broadcast.emit("sync", template, clientId, id, data)
	})

	socket.on("syncAll", (data) => {
		socket.broadcast.emit("syncAll", clientId, data)
	})

	socket.on("createEntity", (template, id, data) => {
		entities[id] = initServerEntity(network, world, clientId, id, template, data)
		console.log("createEntity")
		
		socket.broadcast.emit("createEntity", template, clientId, id, data)
	})
}

/**
 * @param {Socket} socket 
 * @param {World} world 
 * @param {NetworkSocket} network 
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
	for (const [entity, serverOwned] of world.query(Entities, ServerOwned)) {
		const entityData = {
			owner: serverOwned.owner,
			id: serverOwned.id,
			data: getEntityData(world, entity, serverOwned.components),
			template: serverOwned.template
		}
		data.push(entityData)
	}
	return data
}

function getEntityData(world, entity, components) {
	const data = {}
	for (const Component of components)
		data[Component.COMPONENT_ID] = Object.entries(world.getComponent(entity, Component))
	return data
}
