import type { Config } from './config'

export async function userEvents(state: Config): Promise<void> {
    // const sse = sseServerConnect(state)
    console.log('atach user events',state.sseConnection)
    Promise.resolve(state.sseConnection).then((sse) => {
        sse.addEventListener("meconnect", function(e:any) {
            console.log('user connected', e.data)
            let userId = state.bbApp.init({mini:true,settings:{img:state.avatar,text:state.user,progress:100,color:wordToColor(state.user)}})
            state.usersToBars?.set(state.user, userId)
        })

        sse.addEventListener("userstatus", function(e:any) {
            let users = JSON.parse(e.data)
            manageUsersVisibility(users, state)
        })
        sse.addEventListener("msg", function(e:any) {
            console.log('new chat event', e.data)
            let parsed = JSON.parse(e.data)
            
            state.msgDB?.push({color:wordToColor(parsed.user), user: parsed.user +":",text:parsed.msg })
            state.chatReactivityCallback && state.msgDB ? state.chatReactivityCallback(state.msgDB) : null
        })
        sse.addEventListener("leet", function(e:any) {
            console.log('leet action on the way',e)
        })
    })   
}


export async function attachCustomEvents(state:Config) {
    Promise.resolve(state.sseConnection).then((sse) => {
        state?.customSSEEvents?.forEach((objEvent) => {
            sse.addEventListener(Object.keys(objEvent)[0], Object.values(objEvent)[0])
        })
    })
}

function manageUsersVisibility(userStatusResponse: any, state: Config) {
    let actualUserList = userStatusResponse.users.split(',')
    actualUserList.forEach((userName: string) => {
        if (!state.usersToBars?.has(userName)) {
            let id = state.bbApp.init({mini:true,settings:{img:state.avatar,text:userName,progress:100,color:wordToColor(userName)}})
            state.usersToBars?.set(userName,id)
        }
    })
    if (state.usersToBars) {
        for (let [user,_] of state.usersToBars) {
            if (!actualUserList.includes(user)) {
                state.bbApp.del(state.usersToBars.get(user))
                state.usersToBars.delete(user)
            }
        }
    }
    console.log('users status event: ', userStatusResponse)
}

function wordToColor(word:string = 'anon'):number {
    return word.split('').reduce((acc,v) => acc + v.charCodeAt(0) ** 3, 0) % 360
}