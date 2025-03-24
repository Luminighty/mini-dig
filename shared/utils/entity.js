import { Entity, World } from "@luminight/ecs"

/**
 * 
 * @param {World} world
 * @param {Object} data 
 * @param {Object} data.meta
 * @param {Object} data.components
 * @param {[string, Constructor][]} componentRegistry 
 */
export function createEntityFromData(world, data, componentRegistry) {
	const components = []
	for (const [componentId, componentData] of Object.entries(data.components)) {
		const Component = componentRegistry.find(([key]) => key == componentId)[1]
		if (!Component)
			return null
		components.push(deserializeComponent(Component, componentData))
	}
	return world.createEntity(...components)
}


function deserializeComponent(Component, componentData) {
	if (Component.deserialize)
		return Component.deserialize(componentData)

	const c = new Component()
	const entries = Object.entries(componentData)
	for (let i = 0; i < entries.length; i++) {
		const field = entries[i][0]
		const value = entries[i][1]
		c[field] = value
	}
	return c
}

/**
 * @param {Entity} entity 
 */
export function serializeEntity(entity) {
	const data = {
		components: {},
		meta: {}
	}
	const entries = Object.entries(entity.components)
	for (let i = 0; i < entries.length; i++) {
		const key = entries[i][0]
		const component = entries[i][1]
		if (component.serialize) {
			data.components[key] = component.serialize()
		} else {
			data.components[key] = component
		}
	}
	return data
}