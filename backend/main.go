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

// JSONResponse defines the structure of your API response
type JSONResponse struct {
	Message  string `json:"message"`
	Response any    `json:"response"`
	Code     int    `json:"code"`
}

// RequestBody defines the expected structure of the incoming JSON request body
type RequestBody struct {
	Q string `json:"q"`
}

func generateHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(loadEnvVar("API_KEY")))
	if err != nil {
		log.Fatal(err.Error())
	}

	model := client.GenerativeModel("gemini-1.5-flash")

	// Parse the JSON request body
	var requestBody RequestBody
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Error parsing JSON request body", http.StatusBadRequest)
		return
	}

	// Generate content using the value of 'q'
	resp, err := model.GenerateContent(ctx, genai.Text(requestBody.Q))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data := JSONResponse{Message: "Successful", Response: resp, Code: 0}
	if err := sendJSONResponse(w, http.StatusOK, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// sendJSONResponse writes the JSON response to the http.ResponseWriter
func sendJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(data)
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
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ;")

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Serve static React files from ./frontend/dist
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
