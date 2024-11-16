const componentModules = import.meta.glob("./**/*.component.js", { eager: true })

const exclude = []

export const SharedComponentRegistry = []

for (const path in componentModules) {
	const mod = await componentModules[path]
	for (const key of Object.keys(mod)) {
		const component = mod[key]
		if (exclude.includes(component) || typeof(component) !== "function")
			continue
		SharedComponentRegistry.push([key, component])
	}
}
