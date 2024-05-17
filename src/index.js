import { createAsciiRenderer } from "./ascii";
import { GameConfig } from "./dependency/config";
import { setupEcs } from "./ecs";
import bitmapUrl from "./pastiche_8x8.png"

const config = new GameConfig();

const canvas = document.createElement("canvas");
canvas.width = config.world.x * config.char.x
canvas.height = config.world.y * config.char.y
document.body.querySelector("#app").appendChild(canvas);

function resize() {
	const scaleY = Math.floor(window.innerHeight / (config.world.y * config.char.y))
	const scaleX = Math.floor(window.innerWidth / (config.world.x * config.char.x))
	const scale = Math.max(Math.min(scaleX, scaleY), 1)
	canvas.style.transform = `translate(-50%, -50%) scale(${scale})`
}

window.addEventListener("resize", resize)
resize()


createAsciiRenderer(bitmapUrl,
	canvas.getContext("2d"),
	{x: config.char.x, y: config.char.y},
	{x: config.bitmap.x, y: config.bitmap.y},
	{x: config.world.x, y: config.world.y}
)
.then((renderer) => {
	const ecs = setupEcs(renderer, config)

	window.addEventListener("keydown", (e) => {
		ecs.emit("onInput", {key: e.key})
	})

})