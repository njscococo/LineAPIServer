let userStates = [];


const addUserState = function (userId) {
    if(!userStates[userId]){
        userStates[userId] = {};
        userStates[userId].userId = userId;
    }
}

const deleteUserState = function (userId) {
    if(userStates[userId]){
        delete userStates[userId];
    }
}

//get userState, if no userState of the id , add a new one 
const getUserState = function (userId) {
    addUserState(userId);    
    return userStates[userId];
}



module.exports = {
    userStates: userStates,
    addUserState: addUserState,
    deleteUserState: deleteUserState,
    getUserState: getUserState

}