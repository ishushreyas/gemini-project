package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type JSONResponse struct {
	Message  string `json:"message"`
	Response any    `json:"response"`
	Code     int    `json:"code"`
}

func loadEnvVar(v string) string {
	// Load env only in development (optional)
	if os.Getenv("RAILWAY_ENVIRONMENT") == "" {
		err := godotenv.Load()
		if err != nil {
			log.Println("env not found in RAILWAY development")
		}
	}

	if os.Getenv("RENDER_SERVICE_ID") == "" { // (Render sets RENDER_SERVICE_ID in production)
                err := godotenv.Load()
                if err != nil {
                        log.Println("env not found in RENDER development")
                }
        }

	envVar := os.Getenv(v)
	if envVar == "" {
		log.Fatalf("%s not found in environment variables", v)
	}

	return envVar
}

// Middleware to add security headers like CSP
func addSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set the Content-Security-Policy header
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: cdn.jsdelivr.net;")

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

// Return JSON Response
func sendJSONResponse(w http.ResponseWriter, s int, d JSONResponse) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(s)
	if err := json.NewEncoder(w).Encode(d); err != nil {
		return err
	}
	return nil
}

// Getting Gemini Response
func generateHandler(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		client, err := genai.NewClient(ctx, option.WithAPIKey(loadEnvVar("API_KEY")))
		if err != nil {
			log.Fatal(err.Error())
		}
		model := client.GenerativeModel("gemini-1.5-flash")

	        if err := r.ParseForm(); err != nil {
		        http.Error(w, "Error parsing form", http.StatusBadRequest)
	        	return
	        }

		resp, err := model.GenerateContent(ctx, genai.Text(r.FormValue("q")))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		data := JSONResponse{Message: "Successful", Response: resp, Code: 0}
		err = sendJSONResponse(w, http.StatusOK, data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
}

func main() {
	// Serve static React files from ./frontend/build
	fs := http.FileServer(http.Dir("./frontend/dist"))
	http.Handle("/", addSecurityHeaders(fs))

	// Handle API routes here
	http.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("API response"))
	})

	http.HandleFunc("/api/generate", generateHandler)

	// Start the server
	http.ListenAndServe(":8080", nil)
}
