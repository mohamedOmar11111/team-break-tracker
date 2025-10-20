const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3001;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// I'm copying the user data here to avoid setting up a transpiler for the server.
const UserRole = {
  Admin: 'admin',
  Employee: 'employee',
};

const BreakStatus = {
  Available: 'Available',
  Requested: 'Requested',
  OnBreak: 'OnBreak',
};

let users = [
    // Admins
  { id: '1', name: 'ALi', username: 'ali', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '2', name: 'Atef', username: 'atef', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '3', name: 'Fadl', username: 'fadl', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '4', name: 'Fathy', username: 'fathy', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  // Employees
  { id: '5', name: 'Abdo Sayed', username: 'abdosayed', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '6', name: 'Mahmoud Waheed', username: 'mahmoudwaheed', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '7', name: 'Naira Ashraf', username: 'nairaashraf', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '8', name: 'Mo Esam', username: 'moesam', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '9', name: 'obaid', username: 'obaid', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '10', name: 'Abdelrahman Galal', username: 'abdelrahmangalal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '11', name: 'Ahmed Amir', username: 'ahmedamir', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '12', name: 'Ahmed Gamal', username: 'ahmedgamal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '13', name: 'Eman Gamal', username: 'emangamal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '14', name: 'Abdallh Refaat', username: 'abdallhrefaat', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '15', name: 'Ahmed Hany', username: 'ahmedhany', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '16', name: 'Hossam Ehab', username: 'hossamehab', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '17', name: 'Shahd Nabil', username: 'shahdnabil', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '18', name: 'Nedal Elsobky', username: 'nedalsobky', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '19', name: 'Rahma Seif', username: 'rahmaseif', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '20', name: 'Hana Khaled', username: 'hanakhaled', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
  { id: '21', name: 'Youssry', username: 'youssry', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
];

let breakDuration = 15;

const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', ws => {
  console.log('Client connected');
  // Send the initial state to the new client
  ws.send(JSON.stringify({ type: 'INIT', payload: { users, breakDuration } }));

  ws.on('message', message => {
    const { type, payload } = JSON.parse(message);
    console.log(`Received message: ${type}`, payload);

    switch (type) {
      case 'REQUEST_BREAK':
        users = users.map(u =>
          u.id === payload.userId ? { ...u, breakStatus: BreakStatus.Requested } : u
        );
        break;
      case 'CANCEL_REQUEST':
        users = users.map(u =>
          u.id === payload.userId ? { ...u, breakStatus: BreakStatus.Available } : u
        );
        break;
      case 'APPROVE_BREAK':
        users = users.map(u =>
          u.id === payload.userId
            ? {
                ...u,
                breakStatus: BreakStatus.OnBreak,
                breaksTaken: u.breaksTaken + 1,
                breakEndTime: Date.now() + breakDuration * 60 * 1000,
              }
            : u
        );
        break;
      case 'DENY_BREAK':
        users = users.map(u =>
          u.id === payload.userId ? { ...u, breakStatus: BreakStatus.Available } : u
        );
        break;
      case 'CHANGE_BREAK_DURATION':
        breakDuration = payload.duration;
        break;
      case 'RESET_DATA':
        users = [
            // Admins
          { id: '1', name: 'ALi', username: 'ali', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '2', name: 'Atef', username: 'atef', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '3', name: 'Fadl', username: 'fadl', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '4', name: 'Fathy', username: 'fathy', password: 'password', role: UserRole.Admin, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          // Employees
          { id: '5', name: 'Abdo Sayed', username: 'abdosayed', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '6', name: 'Mahmoud Waheed', username: 'mahmoudwaheed', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '7', name: 'Naira Ashraf', username: 'nairaashraf', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '8', name: 'Mo Esam', username: 'moesam', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '9', name: 'obaid', username: 'obaid', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '10', name: 'Abdelrahman Galal', username: 'abdelrahmangalal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '11', name: 'Ahmed Amir', username: 'ahmedamir', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '12', name: 'Ahmed Gamal', username: 'ahmedgamal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '13', name: 'Eman Gamal', username: 'emangamal', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '14', name: 'Abdallh Refaat', username: 'abdallhrefaat', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '15', name: 'Ahmed Hany', username: 'ahmedhany', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '16', name: 'Hossam Ehab', username: 'hossamehab', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '17', name: 'Shahd Nabil', username: 'shahdnabil', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '18', name: 'Nedal Elsobky', username: 'nedalsobky', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '19', name: 'Rahma Seif', username: 'rahmaseif', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '20', name: 'Hana Khaled', username: 'hanakhaled', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
          { id: '21', name: 'Youssry', username: 'youssry', password: 'password', role: UserRole.Employee, breakStatus: BreakStatus.Available, breaksTaken: 0, breakEndTime: null },
        ];
        breakDuration = 15;
        break;
    }

    broadcast({ type: 'UPDATE', payload: { users, breakDuration } });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
