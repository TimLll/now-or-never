# Live Data Integration

## Overview
The application has been updated to fetch live tram departure data from an external API. This document outlines the changes made and how to configure the application for live data.

---

## Changes Made

### 1. `TramCountdown.vue`
- Updated the `fetchDepartures` function to use the API key from the `.env` file.
- The API key is accessed via `import.meta.env.VITE_API_KEY`.

### 2. `.env`
- A new `.env` file has been created to store the API key securely.
- Add your API key to the `.env` file:
  ```env
  VITE_API_KEY=your_api_key_here
  ```

### 3. `departures.ts`
- Updated the mock API to fetch real data from an external source.
- The API key is retrieved from `process.env.VITE_API_KEY`.
- Axios is used to make the HTTP request to the external API.
- Error handling is added to ensure the application remains functional if the API call fails.

---

## Configuration

1. Obtain an API key from the data provider.
2. Add the API key to the `.env` file:
   ```env
   VITE_API_KEY=your_api_key_here
   ```
3. Restart the development server to apply the changes.

---

## Notes
- Ensure the `.env` file is included in `.gitignore` to prevent exposing sensitive information.
- The application will display empty data if the API call fails.

---

## Dependencies
- **Axios**: Ensure Axios is installed in the project. If not, install it using:
  ```bash
  npm install axios
  ```