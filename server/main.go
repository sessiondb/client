// Package main runs a small HTTP server that serves the SessionDB React UI (static files).
// Build: copy repo root dist/ into server/dist, then run from repo root:
//   cp -r dist server/ && go build -C server -o sessiondb-ui .
package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

// dist must be present as server/dist at build time (CI copies dist into server/ before go build).
//
//go:embed all:dist
var distEmbed embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	distRoot, err := fs.Sub(distEmbed, "dist")
	if err != nil {
		log.Fatalf("embed dist: %v", err)
	}
	http.Handle("/", http.FileServer(http.FS(distRoot)))

	log.Printf("SessionDB UI listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
