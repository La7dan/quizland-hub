
# Environment Setup

This application uses environment variables to configure its behavior. You can set these variables in a `.env.local` file in the root of the project.

## Available Variables

- `VITE_API_BASE_URL`: The base URL for the API server (default: `http://209.74.89.41:8080/api`)
- `VITE_DEBUG`: Enable debug mode logging (`true` or `false`, default: `false`)

## Setup Instructions

1. Create a `.env.local` file in the root of the project
2. Add the following content, adjusting the values as needed:

```
# API base URL - set this to your backend server address
VITE_API_BASE_URL=http://209.74.89.41:8080/api

# Debug mode
VITE_DEBUG=true
```

3. Restart the development server to apply the changes

## For Production

In production environments, you should set these environment variables on your hosting platform rather than in files.
