import { Entities, World } from "@luminight/ecs"
import { createExplosion, explosionGlyph } from "../templates"
import { Map as GameMap } from "../dependency/map"
import { Explosion, Explosive, Position, Renderable } from "../component"
import { Random } from "../utils/random"
import { ORANGE, RED, YELLOW } from "@shared/utils"
import { TILE } from "../dependency/tile"


/** @param {World} world */
export function ExplosionSystem(world) {
	const map = world.getDependency(GameMap)

	world.listen("onUpdate", () => {
		const newExplosions = new Map()
		const explosives = new Map()

		function addExplosion(x, y, radius) {
			const key = `${x};${y}`
			const expl = newExplosions.get(key)
			if (!expl) {
				newExplosions.set(key, {x, y, radius})
				return
			} 
			expl.radius = Math.max(expl.radius, radius)
		}

		function triggerExplosive(x, y, explosive, entity) {
			world.deleteEntity(entity)
			const radius = explosive.radius + Random.range(explosive.volatility, explosive.volatility * 1.5)
			createExplosion(world, x, y, radius)
		}


		for (const [entity, explosive, position] of world.query(Entities, Explosive, Position)) {
			if (!explosive.ignited)
				continue
			if (explosive.delay-- > 0) {
				const key = `${position.x};${position.y}`
				const exps = explosives.get(key)
				if (!exps) {
					explosives.set(key, [{position, explosive, entity}])
				} else {
					exps.push({position, explosive, entity})
				}

				const renderable = world.getComponent(entity, Renderable)
				if (renderable)
					renderable.glyph.fg = Math.floor(explosive.delay / 4) % 2 ? ORANGE : RED

				continue
			}
			const reallyFun = Random.range(0, 1000) ? 0 : 30
			const sadness = Random.range(0, 10) == 0
			if (sadness) {
				explosive.radius = 3
				explosive.volatility = 0
			}
			explosive.radius += reallyFun
			triggerExplosive(position.x, position.y, explosive, entity)
		}


		for (const [entity, explosion, position] of world.query(Entities, Explosion, Position)) {
			if (explosion.radius <= 0) {
				world.deleteEntity(entity)
				continue
			}
			explosion.radius -= Random.range(1, 3)

			if (map.tiles[map.xyIndex(position.x, position.y)] == TILE.STONE) {
				map.tiles[map.xyIndex(position.x, position.y)] = TILE.FLOOR
				explosion.radius = 0
			}

			const renderable = world.getComponent(entity, Renderable)
			if (renderable)
				renderable.glyph = explosionGlyph(explosion.radius - Random.range(0, 3))

			if (explosion.radius > 1) {
				addExplosion(position.x - 1, position.y, explosion.radius - Random.range(1, 4))
				addExplosion(position.x + 1, position.y, explosion.radius - Random.range(1, 4))
				addExplosion(position.x, position.y - 1, explosion.radius - Random.range(1, 4))
				addExplosion(position.x, position.y + 1, explosion.radius - Random.range(1, 4))
				// make it even smaller
			}
			const DIAGONAL = 1.41
			if (explosion.radius > DIAGONAL) {
				addExplosion(position.x - 1, position.y - 1, explosion.radius - Random.range(DIAGONAL, DIAGONAL * 3))
				addExplosion(position.x + 1, position.y + 1, explosion.radius - Random.range(DIAGONAL, DIAGONAL * 3))
				addExplosion(position.x + 1, position.y - 1, explosion.radius - Random.range(DIAGONAL, DIAGONAL * 3))
				addExplosion(position.x - 1, position.y + 1, explosion.radius - Random.range(DIAGONAL, DIAGONAL * 3))
			}

			if (explosion.radius > 4) {
				addExplosion(position.x - 2, position.y, explosion.radius - 4 - Random.range(1, 4))
				addExplosion(position.x + 2, position.y, explosion.radius - 4 - Random.range(1, 4))
				addExplosion(position.x, position.y - 2, explosion.radius - 4 - Random.range(1, 4))
				addExplosion(position.x, position.y + 2, explosion.radius - 4 - Random.range(1, 4))
			}

		}

		for (const value of newExplosions.values()) {
			const expls = explosives.get(`${value.x};${value.y}`) ?? []
			for (const {position, entity, explosive} of expls) {
				triggerExplosive(position.x, position.y, explosive, entity)
			}
			createExplosion(world, value.x, value.y, value.radius)
		}
	})

}