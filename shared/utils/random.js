const BIT_NOISE1 = 0xB5297A4D
const BIT_NOISE2 = 0x68E31DA4
const BIT_NOISE3 = 0x1B56C4E9
const PRIME1 = 198491317
const PRIME2 = 6542989

const toFloat = (number) => number / 0xFFFFFFF

export const Random = {
	range(min, max) {
		return Math.floor(Math.random() * (max - min) + min)
	},
	bool() {
		return Math.random() >= 0.5
	},
	next(state) {
		let mangled = state

		mangled *= BIT_NOISE1
		mangled += this.seed
		mangled ^= (mangled >> 8)
		mangled += BIT_NOISE2
		mangled ^= (mangled << 8)
		mangled *= BIT_NOISE3
		mangled ^= (mangled >> 8)

		return toFloat(mangled % 0xFFFFFFF)
	}
}