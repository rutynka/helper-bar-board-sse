import {Config, configure, defaultConfig } from './config.js'
import {sseServerConnect, setUserNameFromAPI, brodcastEvents} from './connections.js'
import { userEvents, attachCustomEvents } from './sseEvents.js';
import type {actionEvent} from './connections.js'

export interface Api {
    set(config: Config|undefined): void;
    getState(): Config;
    debug(key?: string): void;
    connect(): Promise<EventSource>
    userEvents():void
    resetPosition(): void
    push(msg: {color:number, user:string,text:string}):void
    brodcastAction(action:actionEvent):void
    getUser():string
}

export function start(): Api {
    let state: Config = defaultConfig
    return {
        set(config: Config): void {
            state = configure(config)
            setUserNameFromAPI(state)
        },
        getState():Config {
            return state
        },
        getUser():string {
            return state.user
        },
        debug(): void {
            console.log("debug", state)
        },
        connect(): Promise<EventSource> {
            if (! (state.sseConnection instanceof EventSource)) {
                state.sseConnection = sseServerConnect(state)
            }
            return state.sseConnection
        },
        userEvents(): void {
            userEvents(state)
            attachCustomEvents(state)
        },
        resetPosition(): void {
            for (const user in state.usersToBars) {
                state.bbApp.set({position:0}, state.usersToBars.get(user))
            }
        },
        push(msg: {color:number, user:string,text:string}):void {
            if (state) {
                state?.msgDB?.push(msg)
            }
        },
        brodcastAction(action: actionEvent) {
            brodcastEvents(action, state)
        }
    }

}