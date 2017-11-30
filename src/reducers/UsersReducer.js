
export default function (state = [], action) {
    console.log("left", action);
    
    switch (action.type) {
        case 'USER_JOINED':
        case 'USER_LEFT':
            const us = action.users && action.users.length > 0 ? action.users : [];
            return us;
    }

    return state;
}