import express from "express";
import auth from "../middleware/auth.js";
import {
  createNote,
  getAllNotes,
  updateNote,
  deleteNote,
  getNoteDetails,
} from "../controllers/notesControllers.js";

const router = express.Router();

// create notes route
router.post("/create", auth, createNote);

// get all notes notes route
router.get("/all", auth, getAllNotes);

// update notes route
router.put("/update/:id", auth, updateNote);

// delete notes route 
router.delete("/delete/:id", auth, deleteNote);

// get particular notes details 
router.get("/details/:id", auth, getNoteDetails);

export default router;
