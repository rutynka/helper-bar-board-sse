// Golang HTML5 Server Side Events Example
//
// Run this code like:
//  > go run server.go
//
// Then open up your browser to http://localhost:8000
// Your browser must support HTML5 SSE, of course.

package main

import (
	"fmt"
	"log"
	"net/http"

	// 	"time"
	"math/rand"
	"strings"
	// "encoding/json"
)

// U user
// M message
var accessKeys = []string{"1000000000000000a"}

//key for connection to same pool && right to connect
//user
//salt to verify user message

type Client struct {
	ch   chan string
	key  string
	salt string
	user string
}

// A single Broker will be created in this program. It is responsible
// for keeping a list of which clients (browsers) are currently attached
// and broadcasting events (messages) to those clients.
type Broker struct {

	// Create a map of clients, the keys of the map are the channels
	// over which we can push messages to attached clients.  (The values
	// are just booleans and are meaningless.)
	//
	clients map[Client]bool

	// Channel into which new clients can be pushed
	//
	newClients chan Client

	// Channel into which disconnected clients should be pushed
	//
	defunctClients chan Client

	// Channel into which messages are pushed to be broadcast out
	// to attahed clients.
	//
	messages chan string
}

// This Broker method starts a new goroutine.  It handles
// the addition & removal of clients, as well as the broadcasting
// of messages out to clients that are currently attached.
func (b *Broker) Start() {

	// Start a goroutine
	//
	go func() {

		// Loop endlessly
		//
		for {

			// Block until we receive from one of the
			// three following channels.
			select {

			case s := <-b.newClients:

				// There is a new client attached and we
				// want to start sending them messages.
				// 				_, exist := b.clients[s]
				var allowAccess = false
				userList := []string{}

				for _, v := range accessKeys {
					if v == s.key {
						allowAccess = true
					}
				}
				if allowAccess {
					var clientExist = false
					for k, _ := range b.clients {
						if k.user == s.user {
							clientExist = true
							log.Println("client exist", k)
							break
						}
					}
					if !clientExist {
						b.clients[s] = true
						s.ch <- "event: meconnect\ndata: {\"username\": \"" + s.user + "\"}"
						for u := range b.clients {
							userList = append(userList, u.user)
						}
						for c := range b.clients {
							c.ch <- "event: userstatus\ndata: {\"users\": \"" + strings.Join(userList[:], ",") + "\"}"
						}
						log.Println("Added new client", s)
					}
				} else {
					log.Println("wrong api key ", s)
				}
			case s := <-b.defunctClients:
				userList := []string{}
				// A client has dettached and we want to
				// stop sending them messages.
				// 				time.Sleep(1500 * time.Millisecond)
				// 				time.Sleep(2 * time.Second)
				var userDis string = s.user
				delete(b.clients, s)
				close(s.ch)
				for u := range b.clients {
					userList = append(userList, u.user)
				}
				for c := range b.clients {
					c.ch <- "event: msg\ndata: {\"user\": \"" + userDis + "\",\"msg\":\"disconected\"}"
					c.ch <- "event: userstatus\ndata: {\"users\": \"" + strings.Join(userList[:], ",") + "\"}"
				}

				log.Println("Removed client")

			case msg := <-b.messages:

				// There is a new message to send.  For each
				// attached client, push the new message
				// into the client's message channel.

				//filter clients by key
				for s := range b.clients {
					s.ch <- msg
				}
				log.Printf("Broadcast message to %d clients", len(b.clients))
			}
		}
	}()
}

func auth(r *http.Request) Client {
	query := r.URL.Query()
	var user string = "Anon" + string(rand.Intn(1000))
	var userKey string = "wrongApiKey"
	var userSalt string = "salt9"
	ch := make(chan string)

	param, present := query["user"] 
	if present || len(param) > 0 {
		user = param[0]
	}

	paramKey, presentKey := query["key"] 
	if presentKey || len(paramKey) == 18 {
		userKey = paramKey[0]
	}

	paramSalt, presentSalt := query["salt"]
	if presentSalt || len(paramSalt) == 5 {
		userSalt = paramSalt[0]
	}

	client := Client{ch, userKey, userSalt, user}
	return client
}

// This Broker method handles and HTTP request at the "/events/" URL.
func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	// Make sure that the writer supports flushing.
	//
	f, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	client := auth(r)
	b.newClients <- client

	// Listen to the closing of the http connection via the CloseNotifier
	// notify := w.(http.CloseNotifier).CloseNotify()
	ctx := r.Context()
	go func() {
		// <-notify
		<-ctx.Done()
		// Remove this client from the map of attached clients
		// when `EventHandler` exits.
		b.defunctClients <- client
		log.Println("HTTP connection closed. v0.89")
	}()

	// Set the headers related to event streaming.
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	// w.Header().Set("Transfer-Encoding", "chunked")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Don't close the connection, instead loop endlessly.
	for {

		// Read from our messageChan.
		msg, open := <-client.ch

		if !open {
			// If our messageChan was closed, this means that the client has
			// disconnected.
			break
		}
		if msg[0:6] == "event:" {
			fmt.Fprintf(w, "%s\n\n", msg)
		}
		if msg[0:6] != "event:" {
			fmt.Fprintf(w, "event: msg\ndata: %s\n\n", msg)
		}
		f.Flush()
	}

	// Done.
	log.Println("Finished HTTP request at ", r.URL.Path)
}

func sseMessagePost(b *Broker) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		message := r.PostFormValue("message")
		//      verify user
		// 	    user := r.PostFormValue("user")
		// 	    salt := r.PostFormValue("salt")
		//      send to propser group of keys
		// 	    key := r.PostFormValue("key")

		// 		b.messages <- fmt.Sprint(key+message)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		b.messages <- fmt.Sprint(message)
		log.Printf("Recived message %s", message)
	}
}

func sseGameActionsToEventsGet(b *Broker) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		action := r.URL.Query().Get("a")
		value := r.URL.Query().Get("v")

		b.messages <- fmt.Sprint("event: " + action + "\n" + "data:" + value)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		log.Printf("Recived action %s%s", action, value)
	}
}

func main() {

	// Make a new Broker instance
	b := &Broker{
		make(map[Client]bool),
		make(chan (Client)),
		make(chan (Client)),
		make(chan string),
	}

	b.Start()

	http.Handle("/v2/multi/events/", b)
	http.HandleFunc("/v2/multi/msg", sseMessagePost(b))
	http.HandleFunc("/v2/multi/actions", sseGameActionsToEventsGet(b))

	http.ListenAndServe(":4004", nil)
}
