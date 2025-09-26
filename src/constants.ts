"use client";

let API_URL = "http://www.jetpans.com/api"; // default for production

if (typeof window !== "undefined") {
  // Runs only on the client
  if (window.location.hostname === "localhost") {
    API_URL = "http://localhost:5000";
  }
}

export { API_URL };