
/** 
 * @typedef {Object} Rect
 * @prop {number} x1
 * @prop {number} x2
 * @prop {number} y1
 * @prop {number} y2
 * 
 */


export const Rect = {
	/** @returns {Rect} */
	new: (x, y, w, h) => ({ 
		x1: x, 
		y1: y, 
		x2: x + w, 
		y2: y + h
	}),
	/**
	 * 
	 * @param {Rect} self 
	 * @param {Rect} other 
	 * @returns {bool}
	 */
	intersects: (self, other) => 
		self.x1 <= other.x2 && self.x2 >= other.x1 &&
			self.y1 <= other.y2 && self.y2 >= other.y1,
	/**
	 * 
	 * @param {Rect} self 
	 * @returns {[number, number]}
	 */
	center: (self) =>
		[
			Math.floor((self.x1 + self.x2) / 2),
			Math.floor((self.y1 + self.y2) / 2),
		]
}