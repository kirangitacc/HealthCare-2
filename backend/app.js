import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors());
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data.db');
const upload = multer();

cloudinaryV2.config({
  cloud_name: 'du2oc6vif',
  api_key: '772991248664223',
  api_secret: 'F1wCoPH8kcFBGsuuyfMcIeB6I_k',
});

let db = null;
app.use(express.json());

const createTables = async () => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS userdetails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      gender TEXT,
      phone TEXT,
      address TEXT,
      role TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      scan_type TEXT NOT NULL,
      region TEXT NOT NULL,
      image_url TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      uploaded_by INTEGER,
      FOREIGN KEY (uploaded_by) REFERENCES userdetails(id)
    )
  `);
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await createTables(); // <-- Create tables

    app.listen(3001, () => {
      console.log('Server running at http://localhost:3001');
    });
  } catch (e) {
    console.error(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const tokenAuthentication = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid JWT Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401).send('Invalid JWT Token');
      } else {
        // Attach user info to request
        request.userId = payload.id;
        request.userRole = payload.role;
        next();
      }
    });
  }
};

app.get('/user/:id', tokenAuthentication, async (request, response) => {
  const { id } = request.params;
  try {
    const query = 'SELECT * FROM userdetails WHERE id = ?';
    const user = await db.get(query, [id]);
    if (user) {
      response.json(user);
    } else {
      response.status(404).send('User not found');
    }
  } catch (error) {
    response.status(500).send('Error fetching user data');
  }
});

app.post('/register', async (request, response) => {
  const { username, email, password, gender, phone, address, role } = request.body;
  console.log(request.body);
  if (!username || !email || !password || !gender || !phone || !address || !role) {
    return response.status(400).json({ message: 'All fields are required' });
  }
  if (password.length < 6) {
    return response.status(400).json({ message: 'Password is too short' });
  }
  try {
    const userDetails = await db.get(
      `SELECT * FROM userdetails WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (userDetails === undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const addUserQuery = `
        INSERT INTO userdetails (username, email, password, gender, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(addUserQuery, [username, email, hashedPassword, gender, phone, address, role]);
      response.json({ message: 'User Registered successfully' });
    } else {
      response.status(400).json({ message: 'User already exists' });
    }
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login', async (request, response) => {
  const { email, password } = request.body;
  console.log(request.body);
  try {
    const user = await db.get(`SELECT * FROM userdetails WHERE email = ?`, [email]);
    if (!user) {
      response.status(400).send('Invalid user');
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const payload = { id: user.id, role: user.role, username: user.username };
        const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN');
        response.send({ jwtToken, userId: user.id, role: user.role });
      } else {
        response.status(400).send('Invalid password');
      }
    }
  } catch (error) {
    response.status(500).send('Internal Server Error');
  }
});


app.post('/scans', tokenAuthentication, upload.single('image'), async (request, response) => {
  const { patient_name, patient_id, scan_type, region } = request.body;
  const upload_date = new Date().toISOString();
  const userId = request.userId;

  let image_url = '';
  if (request.file) {
    // Upload to Cloudinary
    try {
      const result = await cloudinaryV2.uploader.upload_stream(
        { resource_type: 'image' },
        async (error, result) => {
          if (error) {
            return response.status(500).json({ message: 'Image upload failed' });
          }
          image_url = result.secure_url;

          if (!patient_name || !patient_id || !scan_type || !region || !image_url) {
            return response.status(400).json({ message: 'All fields are required' });
          }

          await db.run(
            `INSERT INTO scans (patient_name, patient_id, scan_type, region, image_url, upload_date, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [patient_name, patient_id, scan_type, region, image_url, upload_date, userId]
          );
          response.json({ message: 'Scan uploaded successfully' });
        }
      );
      result.end(request.file.buffer);
    } catch (err) {
      return response.status(500).json({ message: 'Image upload error' });
    }
  } else {
    return response.status(400).json({ message: 'Image file is required' });
  }
});


app.get('/scans', tokenAuthentication, async (request, response) => {
  if (request.userRole !== 'Dentist') {
    return response.status(403).json({ message: 'Access denied' });
  }
  try {
    const scans = await db.all(`SELECT * FROM scans`);
    response.json(scans);
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' });
  }
});


export default app;
