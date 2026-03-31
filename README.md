# Agri-Flow

Agri-Flow is a browser-based smart irrigation dashboard for monitoring farm conditions, tracking water allocation usage, and generating AI-assisted irrigation guidance.

The app combines:

- Live sensor data from Supabase
- A water licence tracker with manual irrigation logging
- A responsive 3D usage timeline
- Gemini-powered irrigation recommendations
- Gemini-powered short water-usage reports

The interface is currently implemented as a single static HTML application in [`AgriFlow.html`]

## Overview

Agri-Flow is designed to help a farmer or farm operator:

- View the latest sensor readings for temperature, humidity, and vapour pressure deficit
- Set a monthly water allocation limit
- Log irrigation usage events manually
- Visualize cumulative usage over time in a 3D-style timeline
- Generate a short AI irrigation recommendation based on sensor conditions and water usage
- Generate a short AI water-usage report after at least 3 logged usage events

## Features

### Live sensor monitoring

The dashboard pulls the latest available row from the `agrifarm_readings` table in Supabase and displays:

- Temperature
- Relative humidity
- Vapour pressure deficit
- Farm ID and farm type

If the preferred timestamp ordering fields are unavailable, the app falls back to a simpler fetch strategy.

### Water licence tracker

The tracker allows the user to:

- Set a monthly water limit
- Log water usage with a slider
- View total used water
- View remaining allocation
- See percentage of allocation used
- See a compliance badge that changes as usage approaches risk thresholds

The current implementation resets water usage state on refresh. It does not persist across page reloads.

### 3D usage timeline

Every logged irrigation event is added to a responsive 3D-style timeline.

- The first event is labeled `Timestamp 1`
- The second is labeled `Timestamp 2`
- And so on

Each column shows:

- The cumulative total at that point
- The added amount for that timestamp

### AI irrigation advisor

The AI irrigation advisor sends farm sensor values and water-usage summary data to Gemini and returns a short irrigation recommendation.

### AI water usage report

Once at least 3 usage events have been logged, the app enables a second AI action that sends the 3D timeline history to Gemini and generates a short report describing:

- The overall usage trend
- Whether the pattern appears controlled, increasing, or risky
- A practical recommendation for the farmer

## Project structure

```text
Agri-Flow/
├── AgriFlow.html
├── .env
├── .gitignore
├── config.js
├── package.json
├── package-lock.json
└── scripts/
    └── generate-config.js
```

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Supabase JavaScript client
- Google Gemini API
- Node.js for config generation

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Create a `.env` file in the project root with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Generate browser config

Because this project is a static browser app, it cannot read `.env` directly. Instead, it generates a browser-readable `config.js`.

Run:

```bash
node scripts/generate-config.js
```

Or:

```bash
npm run build:config
```

### 4. Open the app

Open [`AgriFlow.html`](c:/Users/thape/AgroFlow/Agri-Flow/AgriFlow.html) in your browser.

If you update `.env`, regenerate `config.js` before reloading the app.

## Configuration flow

The configuration flow works like this:

1. Secrets are stored locally in `.env`
2. `scripts/generate-config.js` parses `.env`
3. The script generates `config.js`
4. `AgriFlow.html` reads values from `window.APP_CONFIG`

This removes hardcoded keys from the HTML source file, but it does not fully hide browser-used keys from end users.

## NPM scripts

### `build:config`

Generates `config.js` from the values in `.env`.

```bash
npm run build:config
```

## How the app works

### Sensor data loading

On startup, the app:

- Reads runtime config from `config.js`
- Creates a Supabase client
- Fetches the latest farm reading
- Renders temperature, humidity, and VPD cards

### Water tracking

When the user logs usage:

1. The slider value is added to total used water
2. A history entry is created
3. The history entry is labeled `Timestamp N`
4. The progress bar and compliance state are recalculated
5. The 3D usage timeline is redrawn
6. The AI report availability is updated

### AI usage report gating

The water usage report button stays disabled until at least 3 water usage events exist in the in-memory history.

## AI prompts currently used

The project currently sends two kinds of prompts to Gemini:

- Irrigation recommendation prompt
- Water-usage summary prompt

Both are generated client-side in [`AgriFlow.html`](c:/Users/thape/AgroFlow/Agri-Flow/AgriFlow.html).

## Current limitations

### 1. Gemini API is still client-side

Even though keys are no longer hardcoded in the HTML file, the Gemini API key is still exposed to the browser through `config.js`.

That means:

- It is not truly secret
- It can be viewed by anyone using the app
- It should ideally be moved behind a backend endpoint

### 2. Water tracker state is not persistent

Water usage resets on refresh by design in the current version.

### 3. Static deployment model

This is a static HTML app, so any secure server-side processing would require introducing a backend or serverless function.

## Recommended next improvements

- Move Gemini requests to a backend or serverless API route
- Persist water usage history in Supabase or local storage if desired
- Add historical reporting by day, week, or month
- Add data export for compliance reporting
- Add authentication if multiple farms or users need isolated dashboards
- Add charts for humidity, temperature, and VPD trends over time

## Development notes

- `.env` and `config.js` are ignored by git
- The app depends on a valid Supabase table named `agrifarm_readings`
- The app expects browser network access to Supabase and Gemini endpoints
- The UI is optimized as a lightweight single-page dashboard

## Troubleshooting

### App says config is missing

Run:

```bash
npm run build:config
```

Then reload the page.

### Sensor data does not load

Check:

- Your `SUPABASE_URL`
- Your `SUPABASE_ANON_KEY`
- The existence of the `agrifarm_readings` table
- Your internet connection

### AI buttons fail

Check:

- Your `GEMINI_API_KEY`
- Your `GEMINI_MODEL`
- Your internet connection
- Browser console output for API errors

### Water usage report button stays disabled

The button is intentionally locked until at least 3 irrigation events are logged in the current page session.

## License

No license file is currently included in this repository.
