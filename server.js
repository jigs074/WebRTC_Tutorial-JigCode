const express = require('express') 
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
const ejs = require('ejs')
console.log('Setting view engine to ejs...')
app.set('view engine', 'ejs')
console.log('View engine set successfully.')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    console.log('Rendering room:', req.params.room)
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected',userId)
    })
})

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});