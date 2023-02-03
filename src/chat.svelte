<script lang="ts">
import {handleMessageFormSubmit, handleEnterMessageFormSubmit} from './connections'

export let c:any;
export let msgDB:any;

</script>

<sse-chat class="chat">
    {#if c.start}
        <div class="chat-board">
            <div class="chat-channel {c.chatOpen ? 'open' : 'hidden'}">
                <form on:submit|preventDefault={(e) => handleMessageFormSubmit(e,c)} on:keydown={(e) => handleEnterMessageFormSubmit(e)} name="message">
                    <input type="text" name="user" value="{c.user}" hidden>
                    <textarea name="msg"></textarea>
                    <button type="submit">send</button>
                </form>
                <div class="msg">
                    {#each msgDB as msg }
                        <li><span style="color:hsl({msg.color},90%,40%)">{msg.user}</span>
                            <span>{@html msg.text}</span>
                        </li>
                    {/each}
                </div>
            </div>
            <button on:click={() => c.chatOpen = !c.chatOpen} class="chat-btn"  type="button" >{"☎️"}</button>
        </div>
    {/if}
</sse-chat>

<style>
    .chat {
        position: fixed;
        top:30vh;
        display: block;
    }
    .chat button {display: block;}
    .chat-board {
        background-color: hsla(180,90%,90%,0.5);
        border-radius: 10px 10px 10px 10px;
        padding:10px;
    }
    .hidden {display:none;}
    .open {width:30vw;}
    .chat-channel {
        position: relative;
    }
    .chat .open + .chat-btn {
        right: 0 !important;
        left: auto;
    }
    .chat-btn {
        position: absolute;
        top: 0;
        left: 0;
        font-size:24px
    }

	@media only screen and (min-width : 320px) and (max-width: 768px) {
        .open {width:100%}
	}
</style>