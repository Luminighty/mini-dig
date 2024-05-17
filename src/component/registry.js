const componentModules = import.meta.glob("./**/*.component.js", { eager: true })

export const ComponentRegistry = []

for (const path in componentModules) {
	const mod = await componentModules[path]
	const componentKey = Object.keys(mod).filter((component) => component.endsWith("Component"))[0]
	const component = mod[componentKey]
	ComponentRegistry.push([componentKey, component])
}
