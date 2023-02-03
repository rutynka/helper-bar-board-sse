<script lang="ts">
import BarManager from '@rutynka/helper-bar-board'
import {Api, start} from './api.js'
import Chat from './chat.svelte'
// import { onMount } from 'svelte';
import type {Config} from './config.js'


let bb:any
let appState: Config
let chatMsgDB: {color:number, user:string,text:string}[] = []
let forceChatReactivity =  (msgDB: {color:number, user:string,text:string}[]) => {
        chatMsgDB = msgDB;
    }
appState = {user:'Anon'}

export function BarBoardSSE(config?: Config): Api {
    const app = start()
    bb = new BarManager({target:document.body})
    app.set(Object.assign({ user: 'Anon', bbApp: bb,chatReactivityCallback: forceChatReactivity},config))


    appState = app.getState()

    app.connect()
    app.userEvents()

    // onMount(helpsWithInitialConnectionError, app);
    // https://geoffrich.net/posts/svelte-lifecycle-examples/

    return app
}


</script>

<!-- <BarManager bind:this={bb}/> -->
<Chat bind:c={appState} bind:msgDB={chatMsgDB}></Chat>

<style></style>