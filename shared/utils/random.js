export const Random = {
	range(min, max) {
		return Math.floor(Math.random() * (max - min) + min)
	},
	bool() {
		return Math.random() >= 0.5
	}
}