  import bbsse from './src/main'

  let whoAmI = ''
  const networkClickEvent = (e) => {
    console.log('callback fired' ,e.data)
    if (JSON.parse(e.data).user === whoAmI) {
      console.log('Skip my own actions - because I am:' + whoAmI)
      return false
    }
    document.getElementById('count').innerHTML = 1 + parseInt(document.getElementById('count').innerHTML)
  }
 
  const config = {
    sseKey:'1000000000000000a',
    salt:'salt' + Math.floor(Math.random() * 1000),
    user:'Anonymous' + Math.floor(Math.random() * 1000),
    sseServerURL:'http://localhost:4004/v2/multi/events/',
    chatPOSTURL:'http://localhost:4004/v2/multi/msg',
    actionGETURL:'http://localhost:4004/v2/multi/actions',
    msgDB: [],
    avatar: 'https://cdn.rutynka.io/img/avatar/martinez.svg',
    customSSEEvents:[{'network_click': networkClickEvent}]
  }

  const svelte = new bbsse({target:document.body,props:{}}) 
  const app = svelte.BarBoardSSE(config)
  whoAmI = app.getUser()

  document.getElementById('btn').addEventListener('click',()=> {
    app.brodcastAction({event:'network_click',value:'click button through sse event' + whoAmI,master: true})

    document.getElementById('msg').classList.toggle('hide')
    setTimeout(()=>{
      document.getElementById('msg').classList.toggle('hide')
    },8000)
  })
