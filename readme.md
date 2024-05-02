# Node.js, Express, and Socket.IO App with MongoDB

This project is a Node.js application using Express for the server, Socket.IO for real-time communication, and MongoDB for data storage. It connects to a local MongoDB database to store chat history.

## Table of Contents
- [Functionality](#functionality)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Functionality
The key features of this chat application are:

- **Welcome Message**: When a new user joins, a welcome message is displayed to them, and a notification is sent to all existing users.
- **User Profile Picture**: The notification for other users includes the new user's display picture.
- **User Count**: The app displays the current number of users in the chat. This updates when someone joins or leaves.
- **Chat History**: All messages are stored in a MongoDB database, allowing new users to see past messages when they join.
- **Typing Indicator**: A real-time indicator shows when a user is typing, allowing for a more interactive chat experience.

## Installation
To install and run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pragya016/Chatter-Up.git

2. **Navigate to the project directory:**
    cd Chatter-Up

3. **Install Dependecies:**
    npm install

4. **Start MongoDB:**
    Ensure MongoDB is installed and running locally. If needed, start it with:

5. **Run The App:**
    npm start

By default, the application runs on http://localhost:3000.

## Usage
Once the app is running, Open the Index.html file present in the src directory. Ensure the client-side code connects to the correct endpoint.

## Dependencies
Key dependencies for this project include:

Node.js
Express.js
Socket.IO
MongoDB
Mongoose (ODM for MongoDB)

## Contributing
Contributions are welcome! To contribute, fork the repository, create a branch for your feature or bug fix, and submit a pull request. Follow the existing coding style and commit message guidelines.

## License
All rights are reserved. This code cannot be used, copied, modified, or distributed without express permission from the owner. Contact the repository owner for any licensing-related questions or permissions.