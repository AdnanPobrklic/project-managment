# Project Management System

- [LIVE PROJECT](https://evidencija-projekata.onrender.com)
- [YouTube video showcasing project functionalities](https://www.youtube.com/watch?v=r7zLRfbbAx4)

Project Management System is an application designed to assist in managing projects, the employees involved in those projects, as well as keeping track of working hours and user attendance within the system.

## Key Features

- **Various Roles:**
    - Administrator: Real-time system activity overview.
    - Managers: Creation and management of projects, teams, and tasks, as well as monitoring working hours and attendance.
    - Workers: Execution of assigned tasks, input of working hours.

- **Project Management:**
    - Addition and tracking of projects.
    - Formation of teams with defined leaders and members.

- **Tasks and Workers:**
    - Addition of tasks to projects with assignment to specific workers.
    - Input and tracking of completed tasks.

- **Attendance and Status:**
    - Monitoring attendance of all online and offline users and the time they were present.
    - Tracking user status.

- **Real-time Communication:**
    - Real-time notifications.
    - Ability to use chat for communication between users.

- **Sending Notifications:**
    - Sending notifications via email for important information and updates.

- **Report Generation:**
    - Generating PDF reports with data on working hours and attendance by users and projects.
    - Ability to download and send them via email.

## Installation
1. Install necessary modules: `npm install`

## Configuration

- Adjust the `.env` file to contain

    1. DBURI=mongoose_uri (if not provided, localhost will be used)
    2. PORT=number (if not provided, 3000 will be used)
    3. SESSION_SECRET=secret
    4. EMAIL=email
    5. EMAIL_PW=email_password

## Running

1. Start the application: `npm start`
2. The application will be available at http://localhost:3000/

## Resources

The following resources were used for this application:

- **Icons**
    1. [Font Awesome](https://fontawesome.com/)
    2. [Flaticon](https://www.flaticon.com/)

- **Background image**
    1. [Haikei](https://app.haikei.app/)
