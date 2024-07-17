# ERP_prototype

ERP prototype built with [Blueprint.js](https://blueprintjs.com/) for the frontend, [Express](https://expressjs.com/) for the backend, and packaged with [Electron](https://www.electronjs.org/).

## Introduction

The goal of the project was to build a on-premise running cross-platform procurement ERP.

## Project Structure

- `db_migration.py` Exports tables from firebird 2.5 database to csv files and then import each csv file as a table into PostgreSQL database.
- `/public/electron.js` Electron's main process file.
- `/public/preload.js` Connects Electron's main and renderer process.
- `/src/index.js` Renders the root component of the React app.
- `/src/server.js` Express application that handles HTTP requests from the frontend.
- `/src/pages` Individual react components for each page of the application.

## Implemented Features

- Search existing part, customer, vendor, customer & vendor purchase orders (CPO & VPO), and request for quotation (CRFQ) history.
- Create new part, customer, vendor, and CRFQ.
- Edit existing part, customer, vendor, and CRFQ.
