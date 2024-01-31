import Note from "../models/notesModel.js";
import moment from 'moment-timezone';
import nodemailer from 'nodemailer';
import schedule from 'node-schedule';
import { scheduledJobs, scheduleJob } from 'node-schedule';


// Create new notes Controlers 
export const createNote = async (req, res) => {
  const { title, description, deadline } = req.body;
  const userId = req.userId;

  try {
    // Store the note with consistent date formatting and store in UTC
    const newNote = await Note.create({
      title,
      description,
      deadline: moment.tz(deadline, 'Asia/Kolkata').format(),
      userId,
    });

    // Convert the deadline to local timezone before sending the response
    const localDeadline = moment(newNote.deadline).tz('Asia/Kolkata').format();

    // Schedule the email reminder task
    if (newNote.isRemainderOn) {
      schedule.scheduleJob(new Date(newNote.deadline), async () => {
        // Configure your email transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sanjaikannang@gmail.com', // Replace with your email
            pass: 'rmop fyel onrs kykk', // Replace with your email password
          },
        });

        // Content inside the mail
        const mailContent = `
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              color: #333;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              max-width: 600px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 20px;
              text-align: center;
            }
            h1 {
              color: #4285f4;
            }
            h3 {
              line-height: 1.6;
              color: #333;
            }
            p {
              margin: 10px 0;
              line-height: 1.6;
              color: #555;
            }
            strong {
              color: #4285f4;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Note Reminder</h1>
            <h3>Hello ${req.user.name},</h3>
            <p>This is a reminder for your note: <strong>${title}</strong>.</p>
            <p>The deadline is ${moment(localDeadline).format("MMMM Do YYYY, h:mm:ss a")}.</p>
            <p>The deadline for the particular note is approaching. Please take action accordingly.</p>
            <p>If you want to turn off the reminder, go to the app and disable it for this note.</p>
            <p>Best regards,<br/>Notes App System</p>
          </div>
        </body>
      </html>
    
        `;

        const mailOptions = {
          from: 'notesappsystem@gmail.com', // Replace with your email
          to: req.user.email,
          subject: 'Note Reminder',
          html: mailContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            // console.log('Email sent: ' + info.response);
          }
        });
      });
    }

    // Sending the response with local deadline
    res.status(201).json({
      ...newNote.toObject(),
      deadline: localDeadline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// get all notes controllers
export const getAllNotes = async (req, res) => {
  const userId = req.userId;

  try {
    const allNotes = await Note.find({ userId });

    // Convert deadline to Asia/Kolkata time zone
    const notesInTimeZone = allNotes.map(note => {
      return {
        ...note._doc,
        deadline: moment(note.deadline).tz('Asia/Kolkata').format(),
      };
    });

    res.status(200).json(notesInTimeZone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get particular notes details
export const getNoteDetails = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      // If note is not found, send a 404 Not Found response
      return res.status(404).json({ message: 'Note not found' });
    }

    // Convert deadline to Asia/Kolkata time zone
    const noteInTimeZone = {
      ...note._doc,
      deadline: moment(note.deadline).tz('Asia/Kolkata').format(),
    };

    res.status(200).json(noteInTimeZone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create an object to store job references
const jobReferences = {};

// update the notes controllers
export const updateNote = async (req, res) => {
  const { title, description, deadline } = req.body;
  const noteId = req.params.id;
  const userId = req.userId;

  try {
    // Find the existing note
    const existingNote = await Note.findById(noteId);

    // Cancel the existing scheduled job if any
    const existingJob = jobReferences[existingNote.id];
    if (existingJob) {
      existingJob.cancel();
    }

    // Remove the existing time and update the new deadline time
    existingNote.deadline = moment(deadline).tz('Asia/Kolkata').format();
    existingNote.title = title;
    existingNote.description = description;

    // Save the updated note in the database
    const updatedNote = await existingNote.save();

    // Schedule the email reminder task for the updated deadline
    if (updatedNote.isRemainderOn) {
      const newJob = scheduleJob(new Date(updatedNote.deadline), async () => {
        // Configure your email transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sanjaikannang@gmail.com', // Replace with your email
            pass: 'rmop fyel onrs kykk', // Replace with your email password
          },
        });

         // Content inside the mail
      const mailContent = `
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
          }
          h1 {
            color: #4285f4;
          }
          p {
            margin: 10px 0;
            line-height: 1.6;
            color: #555;
          }
          strong {
            color: #4285f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Updated Note Reminder</h1>
          <p>Hello ${req.user.name},</p>
          <p>This is a reminder for your updated note: <strong>${title}</strong>.</p>
          <p>The new deadline is ${moment(localDeadline).format("MMMM Do YYYY, h:mm:ss a")}.</p>
          <p>If you want to turn off the reminder, go to the app and disable it for this note.</p>
          <p>Best regards,<br/>Notes App System</p>
        </div>
      </body>
    </html>
    `;

        const mailOptions = {
          from: 'notesappsystem@gmail.com', // Replace with your email
          to: req.user.email,
          subject: 'Updated Note Reminder',
          html: mailContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            // console.log('Email sent: ' + info.response);
          }
        });
      });

      // Save the job reference in the object
      jobReferences[updatedNote.id] = newJob;
    }

    // Sending the response with Asia/Kolkata deadline time
    const localDeadline = moment(updatedNote.deadline).tz('Asia/Kolkata').format();
    res.status(200).json({
      ...updatedNote.toObject(),
      deadline: localDeadline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// delete the notes controllers
export const deleteNote = async (req, res) => {
  const noteId = req.params.id;

  try {
    await Note.findByIdAndDelete(noteId);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



