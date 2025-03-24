import { Server } from "socket.io"
import { setupEcs } from "./ecs.js"
import express from "express"
import http from "http"


const PORT = process.env.PORT ?? 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ["GET", "POST"]
	}
})

const world = setupEcs(io)

console.log("Server started!")

let lastTime = Date.now()
setInterval(() => {
	const now = Date.now()
	const dt = now - lastTime
	lastTime = now
	world.emit("onUpdate", {dt})
	world.maintain()
}, 16)

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

export const viteNodeApp = app