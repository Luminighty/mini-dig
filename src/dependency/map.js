import { glyph } from "../ascii"
import { BLACK, GRAY, GREEN } from "../palette"
import { Random } from "../utils/random"
import { Rect } from "../utils/rect"

export const TILE = {
	FLOOR: 0,
	WALL: 1,
}

export const TILE_GLYPH = {
	[TILE.FLOOR]: glyph('.', GRAY(0x40), BLACK),
	[TILE.WALL]: glyph('#', GREEN, BLACK),
}

export class Map {
	constructor(width, height) {
		this.width = width
		this.height = height
		this.tiles = Array(width * height).fill(TILE.WALL)
		/** @type {Rect[]} */
		this.rooms = []
	}

	xyIndex(x, y) {
		return x + (y * this.width)
	}

	isBlocked(x, y) {
		return this.tiles[this.xyIndex(x, y)] == TILE.WALL
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

export function generateMap(width, height) {
	const map = new Map(width, height);

	const MAX_ROOM = 30;
	const MIN_SIZE = 6;
	const MAX_SIZE = 10;

	for (let _i = 0; _i < MAX_ROOM; _i++) {
		const w = Random.range(MIN_SIZE, MAX_SIZE);
		const h = Random.range(MIN_SIZE, MAX_SIZE);
		const x = Random.range(2, map.width - 1 - w) - 1;
		const y = Random.range(2, map.height - 1 - h) - 1;
		const newRoom = Rect.new(x, y, w, h);

		if (map.rooms.some((room) => Rect.intersects(room, newRoom))) {
			continue;
		}
		if (map.rooms.length > 0) {
			const [prevX, prevY] = Rect.center(map.rooms[map.rooms.length - 1])
			const [newX, newY] = Rect.center(newRoom);

			if (Random.bool()) {
				addHorizontalTunnel(map, prevX, newX, prevY);
				addVerticalTunnel(map, prevY, newY, newX);
			} else {
				addHorizontalTunnel(map, prevX, newX, newY);
				addVerticalTunnel(map, prevY, newY, prevX);
			}
		}
		addRoom(map, newRoom);
		map.rooms.push(newRoom)
	}
	return map
}

