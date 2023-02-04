// type ChatOpen = "open" | "hidden";
// interface chatCallBack { (msg:{color:number, user:string,text:string}): void }
// import type { actionEvent } from "./connections";

export interface Config {
    /** all app options */
    
    bbApp?:any
    avatar?:string
    start?:boolean
    user:string
    salt?:string
    sseKey?: string
    chatOpen?:boolean
    userSource?:string
    destEvent?: string
    chatPOSTURL?: string
    apiUserURL?: string
    actionGETURL?: string
    sseServerURL?:string
    msgDB?: {color:number, user:string,text:string}[]
    sseConnection?: Promise<any>
    chatReactivityCallback?: chatCallBack
    usersToBars?: Map<string, number>
    customSSEEvents?: actionEvent[]
    pushChatMsg?(): void
}

export let defaultConfig: Config = {
    start: true,
    salt: "",
    user: "anon",
    sseKey: "",
    chatOpen:true,
    chatReactivityCallback: () => {},
    usersToBars: new Map(),
}

export function configure(config?: Config): Config {
 
    //structuredCloned
    return Object.assign(defaultConfig,config)
    
}


