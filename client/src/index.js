import { World } from "@luminight/ecs"
import { createAsciiRenderer } from "./ascii"
import { GameConfig, Map } from "@shared/dependency"
import { setupEcs } from "./ecs"
import bitmapUrl from "./pastiche_8x8.png"
import { connectToServer, NetworkSocket } from "./dependency/network"
import { Input } from "./dependency/input"

const config = new GameConfig()

const canvas = document.createElement("canvas")
canvas.width = config.screen.x * config.char.x
canvas.height = config.screen.y * config.char.y
document.body.querySelector("#app").appendChild(canvas)

function resize() {
	const scaleY = Math.floor(window.innerHeight / (config.screen.y * config.char.y))
	const scaleX = Math.floor(window.innerWidth / (config.screen.x * config.char.x))
	const scale = Math.max(Math.min(scaleX, scaleY), 1)
	canvas.style.transform = `translate(-50%, -50%) scale(${scale})`
}

window.addEventListener("resize", resize)
resize()

const asciiRendererPromise = createAsciiRenderer(
	bitmapUrl,
	canvas.getContext("2d"),
	{x: config.char.x, y: config.char.y},
	{x: config.bitmap.x, y: config.bitmap.y},
	{x: config.screen.x, y: config.screen.y}
)

const networkPromise = connectToServer("http://localhost:3000")

Promise.all([networkPromise, asciiRendererPromise])
.then(([[socket, clientId, serverData], renderer]) => {
	console.log(serverData)
	ecs = setupEcs(renderer, socket, clientId)

	input = ecs.getDependency(Input)
	ecs.getDependency(NetworkSocket).setup(serverData)
	Map.deserialize(ecs.getDependency(Map), serverData.map)

	window.addEventListener("keydown", (e) => {
		if (!e.repeat) {
			input.press(e.key)
			ecs.emit("onInputDown", {key: e.key})
		}
	})

	window.addEventListener("keyup", (e) => {
		if (!e.repeat) {
			input.release(e.key)
			ecs.emit("onInputUp", {key: e.key})
		}
	})
	requestAnimationFrame(tick)

	ecs.emit("onInit")
})

/** @type {World} */
let ecs
let lastTick = 0
let input
function tick(time=0) {
	const dt = time - lastTick
	lastTick = time
	
	input.updateKeys()
	ecs.emit("onUpdate", {dt, time})
	ecs.emit("onLateUpdate", {dt, time})
	ecs.emit("onRender")
	ecs.maintain()

	requestAnimationFrame(tick)
}
