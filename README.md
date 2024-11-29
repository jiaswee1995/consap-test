# Node.js CSV Upload and Pagination API

This is a Node.js application that handles CSV file uploads and pagination. The app includes file upload functionality, uses Express.js as the web framework, and utilizes Jest for unit testing.

## Installation and Setup

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <repository_url>
cd <project_directory>
```

### 2. Install Dependencies

The project uses npm for dependency management. Run the following command to install all dependencies:

```bash
npm install
```

### 3. Start the Server

To start the server locally, use the following command:

```bash
npm start
```

By default, the server will run on http://localhost:3000. You can visit this URL to test the application.

## Unit Testing

You can run all the unit tests with the following command:

```bash
npm test
```

## Project Structure

```bash
/project
│
├── /test                 # Test files
│   └── index.test.ts     # Unit test file
│
├── index.ts              #  Express app entry point
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest configuration
└── README.md             # This document
```

