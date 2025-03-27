
# PostgreSQL Database Manager

A tool for managing PostgreSQL database tables with functionality to clear tables and create new ones.

## Project info

**URL**: https://lovable.dev/projects/a7d90f27-0dce-4ed5-8286-2add587a1e34

## Features

- Connect to a PostgreSQL database
- View all tables in the database
- Clear individual tables
- Clear all tables at once
- Create new tables with custom columns
- Run custom SQL queries

## Database Connection Details

The application is configured to connect to:
- Host: 209.74.89.41
- Database: quiz
- User: quiz
- Password: Lal@13161
- Port: 5432

## Running the Project

To run this project, you need to run both the frontend and backend server.

### Running the Backend Server

The backend server is an Express.js application that connects to PostgreSQL.

```sh
# From the project root
node server.js
```

### Running the Frontend

```sh
# From the project root, in a separate terminal
npm run dev
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a7d90f27-0dce-4ed5-8286-2add587a1e34) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the backend server.
node server.js

# Step 5: In a separate terminal, start the frontend development server.
npm run dev
```
