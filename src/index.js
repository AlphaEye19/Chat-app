const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage,generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join( __dirname , "../public")
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicDirectoryPath))

// CONNECTS TO THE CLIENT
io.on( 'connection' , (socket) =>{

    // JOINING ROOM WITH USERNAME AND ROOM

    socket.on('Join', ({username,room}, callback) => {
        const {error, user} = addUser({ id:socket.id, username,room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} joined`))
        io.to(user.room).emit( 'roomData' , {
            room : user.room,
            users : getUsersInRoom(user.room)
        } )
        callback()
    })

    // SENDING MESSAGES 
    socket.on('sendMessage',(message, callback) => {
        const roomId = socket.id
        const user = getUser(roomId)
        const filter =new Filter()

        io.to(user.room).emit('message', generateMessage(user.username,filter.clean(message))  )
        callback("Message deliverd ")       
    })

    // SEND LOCATION
    socket.on('sendLocation', ((coords, callback) => {
        
        const roomId = socket.id
        const user = getUser(roomId)
        const url = ('https://google.com/maps?q='+coords.lat+','+coords.long)
        

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,url))
        callback()
    }))

    // DISCONECT FROM THE SERVER
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.emit('message', generateMessage('Admin',`${user.username} left`))
            io.to(user.room).emit( 'roomData' , {
                room : user.room,
                users : getUsersInRoom(user.room)
            } )
        }
    })
})

server.listen(port , (req,res) => {
    console.log(" Server is up and running :) ")
})