// Package main runs a small HTTP server that serves the SessionDB React UI (static files).
// Build: copy repo root dist/ into server/dist, then run from repo root:
//   cp -r dist server/ && go build -C server -o sessiondb-ui .
//
// Runtime config: API URL comes from (1) API_URL env, (2) config.toml [ui] api_url when
// SESSIONDB_CONFIG_DIR is set, (3) default. Served as /env-config.js so the app reads window._env_.API_URL.
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// dist must be present as server/dist at build time (CI copies dist into server/ before go build).
//
//go:embed all:dist
var distEmbed embed.FS

// apiURLFromConfigTOML reads [ui] api_url from config.toml in configDir. Returns empty if not found or on error.
func apiURLFromConfigTOML(configDir string) string {
	if configDir == "" {
		return ""
	}
	path := filepath.Join(configDir, "config.toml")
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	// Find [ui] section and then api_url = "..." or api_url = '...'
	re := regexp.MustCompile(`(?m)^\s*api_url\s*=\s*["']([^"']+)["']`)
	inUI := false
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "[ui]" {
			inUI = true
			continue
		}
		if inUI {
			if strings.HasPrefix(line, "[") {
				break
			}
			if m := re.FindStringSubmatch(line); len(m) > 1 {
				return strings.TrimRight(m[1], "/")
			}
		}
	}
	return ""
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// API URL: env API_URL, then config.toml [ui] when SESSIONDB_CONFIG_DIR set, then default.
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = apiURLFromConfigTOML(os.Getenv("SESSIONDB_CONFIG_DIR"))
	}
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
