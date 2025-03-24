import { Random } from "../utils/random"
import { Rect } from "../utils/rect"
import { TILE, TILE_BLOCKING, TILE_OPAQUE } from "./tile"


export class Map {
	constructor(width, height) {
		this.width = width
		this.height = height
		this.tiles = Array(width * height).fill(TILE.STONE)
		this.visibleTiles = new Set()
		this.discoveredTiles = new Set()
		/** @type {Rect[]} */
		this.rooms = []
		this.target = null
		this.tileEntities = Array(width * height).fill([])
	}

	/** @param {Map} map */
	static deserialize(map, data) {
		if (!data)
			return console.warn("Tried to deserialize Map, but no data was present!")
		map.width = data.width
		map.height = data.height
		map.tiles = data.tiles
	}

	serialize() {
		return {
			width: this.width,
			height: this.height,
			tiles: this.tiles
		}
	}

	/** @param {Set} tiles  */
	setVisibleTiles(tiles) {
		this.visibleTiles.clear()
		for (const tile of tiles.values()) {
			this.visibleTiles.add(tile)
			this.discoveredTiles.add(tile)	
		}
	}

	isTileVisible(x, y) {
		return this.visibleTiles.has(`${x};${y}`)
	}
	
	isTileDiscovered(x, y) {
		return this.discoveredTiles.has(`${x};${y}`)
	}

	isTileOpaque(x, y) {
		return TILE_OPAQUE.includes(this.tiles[this.xyIndex(x, y)])
	}

	/** @returns {number} */
	xyIndex(x, y) {
		return x + (y * this.width)
	}

	isBlocked(x, y) {
		return TILE_BLOCKING.includes(this.tiles[this.xyIndex(x, y)])
	}
}


/** 
 * @param {Map} map  
 * @param {Rect} room
 */
function addRoom(map, room) {
	for (let x = room.x1+1; x <= room.x2; x++) {
		for (let y = room.y1+1; y <= room.y2; y++) {
			map.tiles[map.xyIndex(x, y)] = TILE.FLOOR
		}
	}
}

/** @param {Map} map  */
function addHorizontalTunnel(map, x1, x2, y) {
	for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
		map.tiles[map.xyIndex(x, y)] = TILE.FLOOR
	}
}

/** @param {Map} map  */
function addVerticalTunnel(map, y1, y2, x) {
	for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
		map.tiles[map.xyIndex(x, y)] = TILE.FLOOR
	}
}

function addBedrock(map, width, height) {
	for (let x = 0; x < width; x++) {
		map.tiles[map.xyIndex(x, 0)] = TILE.BEDROCK
		map.tiles[map.xyIndex(x, height - 1)] = TILE.BEDROCK
	}
	for (let y = 0; y < height; y++) {
		map.tiles[map.xyIndex(0, y)] = TILE.BEDROCK
		map.tiles[map.xyIndex(width - 1, y)] = TILE.BEDROCK
	}
}

export function generateMine(width, height) {
	const map = new Map(width, width)

	const room = Rect.new(Math.floor(width / 2) - 4, Math.floor(height / 2) - 4, 5, 5)
	map.rooms.push(room)
	addRoom(map, room)

	const [cx, cy] = Rect.center(room)
	map.tiles[map.xyIndex(cx-1, cy - 2)] = TILE.DIRT
	map.tiles[map.xyIndex(cx, cy - 2)] = TILE.COAL
	map.tiles[map.xyIndex(cx+1, cy - 2)] = TILE.IRON
	map.tiles[map.xyIndex(cx+2, cy - 2)] = TILE.DIAMOND

	addBedrock(map, width, height)
	return map
}

export function generateMap(width, height) {
	const map = new Map(width, height)

	const MAX_ROOM = 30
	const MIN_SIZE = 6
	const MAX_SIZE = 10

	for (let _i = 0; _i < MAX_ROOM; _i++) {
		const w = Random.range(MIN_SIZE, MAX_SIZE)
		const h = Random.range(MIN_SIZE, MAX_SIZE)
		const x = Random.range(2, map.width - 1 - w) - 1
		const y = Random.range(2, map.height - 1 - h) - 1
		const newRoom = Rect.new(x, y, w, h)

		if (map.rooms.some((room) => Rect.intersects(room, newRoom))) {
			continue
		}
		if (map.rooms.length > 0) {
			const [prevX, prevY] = Rect.center(map.rooms[map.rooms.length - 1])
			const [newX, newY] = Rect.center(newRoom)

			if (Random.bool()) {
				addHorizontalTunnel(map, prevX, newX, prevY)
				addVerticalTunnel(map, prevY, newY, newX)
			} else {
				addHorizontalTunnel(map, prevX, newX, newY)
				addVerticalTunnel(map, prevY, newY, prevX)
			}
		}
		addRoom(map, newRoom)
		map.rooms.push(newRoom)
	}

	addBedrock(map, width, height)
	return map
}

