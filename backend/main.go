package main

import (
	"net/http"
)

func main() {
	// Serve static React files from ./frontend/build
	fs := http.FileServer(http.Dir("./frontend/dist"))
	http.Handle("/", fs)

	// Handle API routes here
	http.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("API response"))
	})

	// Start the server
	http.ListenAndServe(":8080", nil)
}
