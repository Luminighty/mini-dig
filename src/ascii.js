
export function glyph(char, fg, bg) {
	return { c: char.charCodeAt(0), fg, bg }
}


/**
 * 
 * @param {string} char 
 * @param {} fg 
 * @param {*} bg 
 * @returns 
 */
async function loadImage(src) {
	return new Promise((res, rej) => {
		const img = new Image();
		img.onload = () => res(img);
		img.onerror = rej;
		img.src = src;
	})
}

/** @param {Image} image  */
function getImageData(image) {
	const offscreen = document.createElement("canvas")
	offscreen.width = image.width
	offscreen.height = image.height
	const context = offscreen.getContext("2d")
	context.drawImage(image, 0, 0)
	return context.getImageData(0, 0, image.width, image.height)
}

/** @param {ImageData} imageData */
function parseImageData(imageData, charDimensions, bitmapDimensions) {
	const bitmap = []
	const width = charDimensions.x * bitmapDimensions.x
	const charPadding = charDimensions.x * charDimensions.y
	for (let i = 0; i < imageData.data.length; i += 4) {
		const data = imageData.data[i] > 128
		const index = i / 4
		const x = index % width
		const y = Math.floor(index / width)

		const cx = Math.floor(x / charDimensions.x)
		const cy = Math.floor(y / charDimensions.y)
		const characterIndex = cx + cy * bitmapDimensions.x;

		const withinCharX = x % charDimensions.x;
		const withinCharY = y % charDimensions.y;
		const pixelIndex = withinCharY * charDimensions.x + withinCharX;

		bitmap[charPadding * characterIndex + pixelIndex] = data
	}
	return bitmap
}

export async function createAsciiRenderer(bitmapSrc, context, charDimensions, bitmapDimensions, canvasDimensions) {
	const image = await loadImage(bitmapSrc);
	const bitmap = parseImageData(getImageData(image), charDimensions, bitmapDimensions);
	return new AsciiRenderer(bitmap, context, charDimensions, bitmapDimensions, canvasDimensions)
}

export class AsciiRenderer {

	/**
	 * @param {CanvasRenderingContext2D} context 
	 */
	constructor(bitmap, context, charDimensions, bitmapDimensions, canvasDimensions) {
		this.width = canvasDimensions.x;
		this.height = canvasDimensions.y;
		this.charWidth = charDimensions.x;
		this.charHeight = charDimensions.y;
		this.bitmapWidth = bitmapDimensions.x;
		this.bitmapHeight = bitmapDimensions.y;

		this.context = context;
		context.fillStyle = "red"
		context.imageSmoothingEnabled = false;
		context.canvas.width = this.width * this.charWidth;
		context.canvas.height = this.height * this.charHeight;

		this.glyphs = Array(this.width * this.height).fill(null);
		this.bitmap = bitmap;
		this.imageData = new ImageData(context.canvas.width, context.canvas.height);
	}

	set(x, y, glyph) {
		this.glyphs[x + y * this.width] = glyph;
	}

	/** @param {string} text  */
	text(x, y, fg, bg, text) {
		for (let i = 0; i < text.length; i++) {
			const c = text.charCodeAt(i)
			this.set(x + i, y, {
				c, fg, bg
			})
		}
	}

	render() {
		const characterPadding = this.charWidth * this.charHeight;
		for (let i = 0; i < this.glyphs.length; i++) {
			const glyph = this.glyphs[i];
			if (!glyph)
				continue;
			const x = i % this.width;
			const y = Math.floor(i / this.width);

			for (let j = 0; j < characterPadding; j++) {
				const cx = x * this.charWidth + j % this.charWidth;
				const cy = y * this.charHeight + Math.floor(j / this.charHeight);

				const bitmapIndex = characterPadding * glyph.c + j;
				const data = this.bitmap[bitmapIndex];
				const color = data ? glyph.fg : glyph.bg;
				const imageIndex = (cx + cy * this.width * this.charWidth) * 4;
				this.imageData.data[imageIndex + 0] = color[0]
				this.imageData.data[imageIndex + 1] = color[1]
				this.imageData.data[imageIndex + 2] = color[2]
				this.imageData.data[imageIndex + 3] = color[3]
			}
		}
		this.context.putImageData(this.imageData, 0, 0)
	}
}
