# Adaptive Learning and Maternal Health Companion

## About the Project

The Adaptive Learning and Maternal Health Companion is a web application designed to support mothers during pregnancy by bringing learning resources, health reminders, appointments, and useful information together in one place.

The goal is to make it easier for mothers to follow their pregnancy journey, learn about maternal health, and keep track of important activities.

This project is currently being developed as a frontend application.

## Technologies Used

The project is built using:

- **React 19** – for building the user interface.
- **Vite 8** – for running and developing the application.
- **CSS** – for styling and page layouts.
- **Font Awesome** – for icons.
- **JavaScript** – for page interactions and functionality.

## What I Have Worked On

### 1. Dashboard

I created the main dashboard to give users an overview of their maternal health journey.

The dashboard includes:

- A sidebar for navigation.
- A welcome message and notification icon.
- A pregnancy stage section showing the current trimester.
- A next appointment section.
- A reminder for upcoming checkups.
- Learning progress showing completed and remaining lessons.
- Upcoming appointments.
- Quick action buttons.
- A personal diary section.
- Healthcare facilities information.
- Helpful articles and quizzes.

I also worked on improving the layout, spacing, colours, and responsiveness so that the dashboard can be viewed on different screen sizes.

### 2. Login Page

I created a Login page where users can enter their email address and password to access the application.

It includes:

- Email and password fields.
- Show and hide password functionality.
- A remember me option.
- A forgot password link.
- A link to create an account.

### 3. Create Account Page

I added a registration page for new users.

It includes:

- Full name.
- Email address.
- Phone number.
- Password.
- Confirm password.
- Show and hide password options.
- Password validation.
- A link back to the Login page.

### 4. Forgot Password Page

I created a password recovery page to help users who cannot remember their passwords.

Users can enter their email address and submit a reset request. The page then displays a confirmation message.

### 5. Notifications Page

I created a separate page where users can view their notifications.

The page includes:

- Appointment reminders.
- Health reminders.
- Learning reminders.
- An unread notification counter.
- Mark individual notifications as read.
- Mark all notifications as read.
- Delete notifications.
- An empty state when there are no notifications left.

### 6. Logout Functionality

I added a Logout option beside the profile icon in the dashboard header.

Before leaving the application, users see a confirmation pop-up asking whether they are sure they want to log out.

They can either cancel or confirm their decision.

## Design and User Experience

I used a warm and simple colour combination throughout the application:

- Beige
- Cream
- Brown
- Light brown

The aim is to keep the application clean, comfortable to use, and easy to understand.

I also worked on responsive layouts, hover effects, and keyboard focus styles to improve the user experience.

## Running the Project Locally

To run the project on your computer:

**1. Clone the repository**

```bash
git clone <your-repository-link>
```

**2. Open the project folder**

```bash
cd adaptive-learning-maternal-health-companion-frontend
```

**3. Install the dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal to view the application in your browser.

## Current Project Status

The main frontend pages and their basic interactions have been developed.

Some features currently use sample information or frontend-only functionality. For example:

- Login and registration are not yet connected to a real authentication system.
- Password reset does not send an actual email.
- Notifications currently use sample data and are not stored permanently.
- Dashboard appointments, learning progress, and other information still need to be connected to real data.

These features can be connected to the backend as development continues.

## Future Improvements

Some of the next improvements planned for the project include:

- Connecting the application to a backend.
- Implementing real user registration and login.
- Adding actual password recovery through email.
- Saving user information and notifications.
- Making appointments and reminders fully functional.
- Connecting learning resources and tracking lesson progress.
- Improving the diary and other dashboard features.

## Conclusion

This project has helped me practise building a multi-page application with React, managing components and state, styling with CSS, and connecting different pages through navigation.

I will continue improving the application by adding more functionality and connecting the frontend to the backend.