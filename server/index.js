const debug = require('debug')(`${process.env.APPNAME}:index`)
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const wss = require('./wss')

const HTTPPORT = 4000
const WSSPORT = 8090
const HOST = process.env.HOST || 'localhost'

wss.init(WSSPORT, HOST)

server.listen(HTTPPORT, HOST, () => {
    debug(`${process.env.APPNAME} is running on port: ${HTTPPORT}`)
    console.log(`HTTP server running on http://${HOST}:${HTTPPORT}`)
    console.log(`WebSocket signaling server running on ws://${HOST}:${WSSPORT}`)
})
