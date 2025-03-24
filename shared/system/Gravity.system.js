import { Entities, World } from "@luminight/ecs"
import { Timer } from "../utils/timer"
import { Gravity, Ladder, Position, Viewshed } from "../component"
import { Map } from "../dependency"

/** @param {World} world  */
export function GravitySystem(world) {
	const tick = new Timer(100)
	const map = world.getDependency(Map)

	world.listen("onUpdate", ({dt}) => {
		tick.step(dt)
		if (!tick.done)
			return
		tick.reset()

		const ladders = world.query(Position, Ladder).map(([position]) => position)

		for (const [position, gravity, entity] of world.query(Position, Gravity, Entities)) {
			if (gravity.enabled) {
				const newY = position.y + 1
				const blocked = map.isBlocked(position.x, newY) || 
					ladders.findIndex((p) => p.x == position.x && (p.y == position.y || p.y == position.y + 1)) > -1
				gravity.onGround = blocked
				if (!blocked)
					position.y = newY

				const viewshed = world.getComponent(entity, Viewshed)
				if (viewshed)
					viewshed.isDirty = true
			}
		}
	})

}