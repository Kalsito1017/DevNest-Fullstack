# DevNest

DevNest is a full-stack job platform built with React, .NET, SQL Server, and Docker.
It provides job discovery, company profiles, search functionality, and event-based features such as email notifications.

The goal of DevNest is to demonstrate clean architecture, scalable backend design, and modern frontend practices in a real-world application.
<img width="1883" height="911" alt="image" src="https://github.com/user-attachments/assets/c52546e1-4b55-499f-a835-ac9ebaec3f3e" />




# Tech Stack
##  Frontend

React

React Router

CSS Modules

Axios

## Backend

ASP.NET Core Web API

Entity Framework Core

SQL Server

Event-driven email system

## Infrastructure

Docker

Docker Compose

# Features

Job listing and search

Company profiles

Categorized job browsing

Homepage sections (featured, trending, etc.)

Email notifications for events

Image support for companies and jobs

Dockerized local development

# Email System

DevNest uses an event-driven approach for email sending.
When specific actions occur (e.g., user reserves a spot for an event), an event is triggered and handled by the email service.

This keeps controllers clean and business logic modular.

# License

This project is for educational and portfolio purposes.
