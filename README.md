# Google Calendar MCP Server

A Model Context Protocol (MCP) server that provides access to Google Calendar data.

## Features

- Access to today's calendar events
- Weekly calendar view
- Custom calendar resources

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/Lucker631/google-calendar-mcp.git
   cd google-calendar-mcp
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure Google Calendar API credentials:

   - Create a service account in the Google Cloud Console
   - Download the service account key and save it as `service-account.json` in the project root
   - Create a `.env` file with the necessary environment variables (see `.env.example`)

4. Build the project:

   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

## Usage

This MCP server can be used with compatible MCP clients to access Google Calendar data.

## License

MIT
