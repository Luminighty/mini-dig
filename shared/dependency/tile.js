import { glyph, glyphCode } from "../../client/src/ascii"
import { GRAY, BLACK, BROWN, DARK_BROWN, RED, BLUE } from "@shared/utils"
import { createCoalOre, createDiamondOre, createIronOre } from "../templates/ores"

export const TILE = {
	FLOOR: 0,
	DIRT: 1,
	STONE: 2,
	COAL: 3,
	IRON: 4,
	DIAMOND: 5,
	BEDROCK: 6
}

export const TILE_GLYPH = {
	[TILE.FLOOR]: glyph('.', GRAY(0x80), BLACK),
	[TILE.DIRT]: glyphCode(0xB1, BROWN, DARK_BROWN),
	[TILE.STONE]: glyphCode(0xDB, GRAY(0x69), GRAY(0x69)),
	[TILE.COAL]: glyphCode(0x0F, BLACK, GRAY(0x69)),
	[TILE.IRON]: glyphCode(0x9C, RED, GRAY(0x69)),
	[TILE.DIAMOND]: glyphCode(0x0F, BLUE, GRAY(0x69)),
	[TILE.BEDROCK]: glyphCode(0xB0, GRAY(0x20), BLACK),
}

export const ORE_DROP = {
	[TILE.COAL]: createCoalOre,
	[TILE.IRON]: createIronOre,
	[TILE.DIAMOND]: createDiamondOre,
}

export const TILE_DIGGABLE = [TILE.STONE, TILE.IRON, TILE.COAL, TILE.DIAMOND, TILE.DIRT]
export const TILE_OPAQUE = [TILE.BEDROCK, ...TILE_DIGGABLE]
export const TILE_BLOCKING = [TILE.BEDROCK, ...TILE_DIGGABLE]
