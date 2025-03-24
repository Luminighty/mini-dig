export class Player {
	jump = 0
	dig = {x: 0, y: 0}
	hp = 4
	maxHp = 6
	inventory = new Inventory(9)
}

class Inventory {
	constructor(size, ...items) {
		this.items = items.map(([item, weight]) => ({item, weight}))
		this.size = size
		this.remaining = this.items.reduce((prev, acc) => prev - acc.weight, size)
	}

	findIndex(item) {
		for (let i = 0; i < this.item.length; i++) {
			const entry = this.item[i]
			if (entry.equals(item))
				return i
		}
		return -1
	}

	add(item, weight) {
		if (weight > this.remaining)
			return false
		this.remaining -= weight
		this.items.push({item, weight})
		return true
	}

	remove(index) {
		const [removed] = this.items.splice(index, 1)
		this.remaining += removed.weight
		return removed.item
	}

}