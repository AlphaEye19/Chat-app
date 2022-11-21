const users = [ ]

//  VALIDATAE AND ADD USERS

const addUser=({id,username,room}) => {
     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

    if(!username  || !room){
        return {error : "Username and room is reuired"}
    }

    const existingUser = users.find( (user) => {         
            return  user.room === room  && user.username === username
    })
    
   if(existingUser){
      return  {error : "User already exists"}
   }

   const user = { id , username , room}
    users.push( user )
    return { user }
} 

// REMOVE USER 

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return id === user.id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

// GET ALL THE USERS BY ID

const getUser = (id) => {
    return users.find((user) => id === user.id )
}

// GET USERS IN A ROOM

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter( (user) => room === user.room )
}




// const res = addUser({id : 22, username: "Mrsbeast", room : "BeastBuys" })
// console.log(users)

// const resu = addUser({id : 23, username: "mrbeast", room : "BeastBuys" })
// console.log(resu)

// const USer = getUsersInRoom('BeastBuys')
// console.log(USer)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}