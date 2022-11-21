
const socket = io()

// ELEMENTS ( of index.html form)
const messageForm = document.querySelector('#message-form')
const messageFormInput = document.getElementById('message')
const messageFormButton = document.querySelector('#message-send-button')
const messageFormLocationBtn = document.querySelector('#send-location')
const messagesDisplay = document.querySelector('#messages-display')
const sidebarDisplay = document.querySelector('#sidebar')

//-- Templates
const messagesTemplate = document.querySelector('#messages-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

console.log(username, room)

const autoScroll = () => {
    //---- The new message element 
    const $newMessage = messagesDisplay.lastElementChild

    //---- Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    //--- Getting the padding of "text__message"
    const newTextMessageStyle = getComputedStyle($newMessage.lastElementChild)
    const newTextMessagePadding = parseInt(newTextMessageStyle.paddingTop) + parseInt(newTextMessageStyle.paddingBottom) 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin + newTextMessagePadding

    //---- visible (scrollbar) height
    const visibleHeight = messagesDisplay.offsetHeight 

    //---- height of the messages container
    const containerHeight = messagesDisplay.scrollHeight

    //---- scrolled height
    const scrolloffset = messagesDisplay.scrollTop + visibleHeight

    if( containerHeight - newMessageHeight<= scrolloffset ){
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight
    }
}

// ------------ SENDING MESSAGES TO THE USERS
socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messagesTemplate,{
        username : message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format(" h:mm a")
    })
    messagesDisplay.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
  
// ------------ SENDING LOCATION TO THE USERS
 socket.on('locationMessage',(message) =>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format(" h:mm a")
    })
    messagesDisplay.insertAdjacentHTML('beforeend',html)
    autoScroll()
 })

//  ---------------- SIDEBAR USERS INFO

socket.on('roomData', ({room, users}) =>  {
    // console.log(message)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebarDisplay.innerHTML = html
})


// ------------ ON CLIKING THE {SEND} BUTTON
messageForm.addEventListener('submit' , (e) =>{
    e.preventDefault()

    //------ Disable the send button
    messageFormButton.setAttribute('disabled', 'disabled')

    const message =e.target.elements.message.value
    socket.emit('sendMessage', message, (callback) => {
              //-------- Enable the send button
              messageFormButton.removeAttribute('disabled')
              messageFormInput.value = ''
              messageFormInput.focus()

        console.log(callback)
    })
})

//------------ ON CLICKING THE {SEND LOCATION} BUTTON
messageFormLocationBtn.addEventListener('click',(e) => {
    e.preventDefault()

    messageFormLocationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        messageFormLocationBtn.removeAttribute('disabled')
        socket.emit('sendLocation',{
            lat : position.coords.latitude,
            long:position.coords.longitude
        }, () => {
            console.log('Location shared')
        })
    })

})

// JOIN THE ROOM

socket.emit('Join', {username, room},(error) =>{
    if(error){
        alert(error)
        location.href='/'
    }
}) 