// Package main runs a small HTTP server that serves the SessionDB React UI (static files).
// Build: copy repo root dist/ into server/dist, then run from repo root:
//   cp -r dist server/ && go build -C server -o sessiondb-ui .
//
// Runtime config: set API_URL (e.g. http://your-api:8080/v1) so the embedded frontend
// points to the correct API. Served as /env-config.js so the app can read window._env_.API_URL.
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
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

	// Runtime env config for the frontend (must be before static file server).
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080/v1"
	}
	apiURL = strings.TrimRight(apiURL, "/")
	envConfigJS := fmt.Sprintf("window._env_={API_URL:%q};", apiURL)
	http.HandleFunc("/env-config.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/javascript")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write([]byte(envConfigJS))
	})

	distRoot, err := fs.Sub(distEmbed, "dist")
	if err != nil {
		log.Fatalf("embed dist: %v", err)
	}
	http.Handle("/", http.FileServer(http.FS(distRoot)))

	log.Printf("SessionDB UI listening on :%s (API_URL=%s)", port, apiURL)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
