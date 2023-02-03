import type { Config } from './config.js'
export type actionEvent = {event: string, value: string, master?: boolean}

export const sseServerConnect = async (state: Config) => {
    if (state.sseServerURL) {
        console.warn('sseServerURL not found')
    }

    const params:any = { 'user': state.user, 'key': state.sseKey, 'salt': state.salt };
    const querystring = new URLSearchParams(params);
    // const sse = new EventSource(config + "/v2/multi/events/?" + querystring)
    const sse = new EventSource(state.sseServerURL + "?" + querystring)


    sse.onerror = (err) => {
        console.error("EventSource failed:", err);
      };
    sse.onopen = (e) => {
        console.warn("EventSource open:", e);
      };

    return sse
}
export function handleEnterMessageFormSubmit(ev: KeyboardEvent) {
    if (ev.key && ev.key === 'Enter') {
        ev.preventDefault()
        const target = ev.target as HTMLTextAreaElement
        target.form?.requestSubmit()
        console.log('Enter key pressed')
    }
}

export function handleMessageFormSubmit(ev: Event, state: Config) {

    const target = ev.target as HTMLFormElement
    if (!target) {
        return false
    }

    let formData:any = new FormData(target)
    // let msg = {"user":userName,"msg":form.get('message')}
    // let data:{[key: string]: string} = {}
    let data: Record<string, string> = {}
    for (const field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    let msg = JSON.stringify(data)
    if (leetSpeekDetect(msg)) {
        brodcastEvents({event:'leet',value:msg, master:true}, state)
    }
    // postData('/v2/multi/msg' +,"key="+sseKey + "&message=" + msg).then(data => {
    postData(state.chatPOSTURL,"key="+state.sseKey + "&message=" + msg).then(data => {
        console.log("sended", data);
    });
    if (ev.target instanceof Element) {
        const textArea = ev?.target?.querySelectorAll('textarea')
        if (textArea.length) {
            textArea[0].value = ''
        }
    }
    return true
}

function leetSpeekDetect(msg: string) {
    return msg.indexOf('leet') !== -1 ? true : false
}


export async function brodcastEvents(action: actionEvent, state: Config) {
    console.log('custom action: ', action.value)
    if (!action.master) return false
    const v = {
        user:state.user,
        val:action.value
    }
    fetch(state.actionGETURL + '?a='+action.event+'&v=' + JSON.stringify(v), {
        // credentials: 'include',
        mode: 'cors'
    }).catch((e) => {console.log(e)})
    return true
}

async function postData(url: string = '',data: string = '') {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST',
        // credentials: 'include',
        mode:'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    });
    return response;
}

export async function setUserNameFromAPI(state: Config) {
    if (state.apiUserURL) {
        await fetch(state.apiUserURL, {
            credentials: 'include',
            mode:'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => response.json()).then(data =>{
            if (data.user)  state.user = data.user
            if (data.avatar)  state.avatar = data.avatar
            console.log('use name and avater mu be set before state init')
        }).catch((e) => {console.log(e)})
    }
}