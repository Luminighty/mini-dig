/** @returns {import("./ascii").RGBA} */
export function rgba(r, g, b, a=255) {
	return [r, g, b, a]
}

export const BLACK = rgba(0, 0, 0)
export const BROWN = rgba(0xA0, 0x52, 0x2D)
export const DARK_BROWN = rgba(0x8B, 0x45, 0x13)
export const WHITE = rgba(0xFF, 0xFF, 0xFF)
export const GRAY = (v) => rgba(v, v, v)
export const RED = rgba(0xBD, 0x00, 0x13)
export const GREEN = rgba(0x4A, 0xB1, 0x18)
export const ORANGE = rgba(0xE7, 0x74, 0x1E)
export const YELLOW = rgba(0xF5, 0xDD, 0x42)
export const BLUE = rgba(0x0F, 0x4A, 0xC6)
export const PURPLE = rgba(0x83, 0x08, 0xff)
