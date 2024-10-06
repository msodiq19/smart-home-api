# Smart Home Automation API

A web API that allows users to remotely control their smart home devices, such as lights and thermostats.

## Scope

### 1. **List of Supported Devices**

The first step is to identify the types of devices the API will manage. This will define the functionalities and interactions the API must support. Common smart home devices include:

#### **1.1 Lights:**

- **Controls**: On/Off, brightness, color (for smart bulbs).
- **Attributes**:
  - `deviceId`: Unique ID of the light.
  - `status`: On/Off.
  - `brightness`: Brightness level (0-100%).
  - `color`: RGB or hex value for color.

#### **1.2 Thermostats:**

- **Controls**: Set temperature, turn heating/cooling on/off, adjust mode (heating, cooling, auto).
- **Attributes**:
  - `deviceId`: Unique ID of the thermostat.
  - `status`: On/Off.
  - `temperature`: Current and target temperature.
  - `mode`: Heating, cooling, or auto.

#### **1.3 Cameras:**

- **Controls**: Enable/disable, view live stream, adjust angle (if supported).
- **Attributes**:
  - `deviceId`: Unique ID of the camera.
  - `status`: Enabled/disabled.
  - `feedUrl`: URL for the live stream.
  - `recording`: Whether the camera is currently recording.

#### **1.4 Locks:**

- **Controls**: Lock/unlock, status check.
- **Attributes**:
  - `deviceId`: Unique ID of the lock.
  - `status`: Locked/unlocked.

---

### 2. **Define APIs to Control Devices**

Next, define the API endpoints that will control these devices. These APIs should expose the necessary functions for interacting with devices, and each device type will have specific actions that can be performed on them.

#### **2.1 General API Design:**

- **GET /devices**: Retrieve all devices connected to the user’s account.
- **GET /devices/:id**: Get details of a specific device.
- **POST /devices**: Add a new device.
- **PUT /devices/:id**: Update settings for a device.
- **DELETE /devices/:id**: Remove a device.

#### **2.2 Device-Specific APIs:**

- **Lights**:
  - **PUT /devices/:id/action**: `{ "action": "on" }` or `{ "action": "off" }`.
  - **PUT /devices/:id/brightness**: `{ "brightness": 70 }` (set brightness level).
  - **PUT /devices/:id/color**: `{ "color": "#FF5733" }` (set light color).

- **Thermostats**:
  - **PUT /devices/:id/action**: `{ "action": "on" }` or `{ "action": "off" }`.
  - **PUT /devices/:id/temperature**: `{ "temperature": 72 }` (set target temperature).
  - **PUT /devices/:id/mode**: `{ "mode": "cooling" }` (change to heating/cooling/auto).

- **Cameras**:
  - **PUT /devices/:id/action**: `{ "action": "enable" }` or `{ "action": "disable" }`.
  - **GET /devices/:id/feed**: Returns the live feed URL.
  - **PUT /devices/:id/recording**: `{ "recording": true }` (start recording) or `{ "recording": false }` (stop recording).

- **Locks**:
  - **PUT /devices/:id/action**: `{ "action": "lock" }` or `{ "action": "unlock" }`.

#### **2.3 General Considerations:**

- **Error handling**: Return appropriate status codes (e.g., `200 OK`, `404 Not Found`, `400 Bad Request`).
- **Real-time control**: Consider using WebSockets for real-time updates or status changes, especially for cameras and locks.

---

### 3. **Define Data Structure for Devices and User Accounts**

The data models will define how devices, users, and their interactions are stored in the database. Here’s a proposed schema:

#### **3.1 Device Model:**

```json
{
  "deviceId": "1234-5678-9012",
  "type": "light",
  "status": "on",
  "settings": {
    "brightness": 75,
    "color": "#FFFFFF"
  },
  "userId": "user-001"
}
```

- `deviceId`: Unique identifier for each device.
- `type`: Device type (light, thermostat, camera, lock).
- `status`: Current status (e.g., on/off for lights, locked/unlocked for locks).
- `settings`: Device-specific settings (brightness, color, temperature, etc.).
- `userId`: The user who owns or controls the device.

#### **3.2 User Model:**

```json
{
  "userId": "user-001",
  "email": "user@example.com",
  "passwordHash": "hashed_password",
  "devices": ["device-001", "device-002", "device-003"]
}
```

- `userId`: Unique identifier for the user.
- `email`: User’s email.
- `passwordHash`: Hashed password for secure authentication.
- `devices`: Array of `deviceId`s that belong to this user.

#### **3.3 Scheduling Model (for Automation):**

```json
{
  "scheduleId": "schedule-001",
  "deviceId": "device-001",
  "userId": "user-001",
  "action": "on",
  "time": "2024-09-25T19:00:00Z"
}
```

- `scheduleId`: Unique ID for the schedule.
- `deviceId`: The device to control.
- `userId`: User who created the schedule.
- `action`: Action to perform (e.g., turn on, off, adjust settings).
- `time`: The time when the action should occur.

---

### 4. **Plan Authentication (Use JWT)**

Security is a crucial aspect of any API, especially when dealing with sensitive systems like home automation. JWT (JSON Web Tokens) is a commonly used authentication mechanism for APIs because it is stateless and lightweight.

#### **4.1 How JWT Works:**

- **Login**: User logs in by providing credentials (email and password).
- **Token Generation**: If credentials are valid, the server generates a JWT, signs it with a secret key, and sends it to the user.
- **Token Structure**: The JWT consists of three parts:
  - **Header**: Contains metadata, such as the signing algorithm.
  - **Payload**: Contains user information (userId, email, etc.).
  - **Signature**: The encoded header and payload, signed using a secret key.
  
- **Authorization**: For every subsequent request, the user must include the JWT in the HTTP header (`Authorization: Bearer <token>`).
- **Token Validation**: The server validates the JWT by checking its signature. If the token is valid, the request proceeds.

#### **4.2 Setup JWT Authentication:**

- **Sign in Endpoint**: Validate user credentials and issue a token.
- **Protected Routes**: Middleware to verify the JWT for protected routes (e.g., `/devices`, `/schedule`).

---

### 5. **Plan Device Scheduling (With Cron Jobs)**

Device scheduling allows users to automate actions at specific times, such as turning lights on at sunset or adjusting the thermostat at night. Cron jobs are useful for scheduling these tasks.

#### **5.1 Use `node-cron` for Scheduling:**

- **Cron Jobs** allow you to run scheduled tasks in Node.js. You can set up cron jobs for scheduled device actions.

  ```bash
  npm install node-cron
  ```
  
#### **5.2 Example of a Cron Job for Turning Lights On/Off:**

```js
const cron = require('node-cron');
const { controlDevice } = require('./services/deviceService');

// Schedule light to turn on every day at 7 PM
cron.schedule('0 19 * * *', () => {
  controlDevice('device-001', 'on');
});
```

- **Pattern**: `0 19 * * *` means at 7:00 PM every day.
- **Device Control**: The `controlDevice` function will turn the light on when the cron job runs.

#### **5.3 Managing User-Defined Schedules:**

- Users can define their own schedules via the API.
- Store schedule data in the database, and periodically check upcoming schedules using cron jobs or at regular intervals.
  
- Example API:
  - **POST /schedules**: Create a new schedule.
  - **DELETE /schedules/:id**: Remove a schedule.
