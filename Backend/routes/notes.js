const express = require('express');
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const { body, validationResult } = require('express-validator');
const upload = require("../middleware/multer");
const path = require('path');
const fs = require("fs")

router.get('/fetchAllNotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })

        // Map notes to include image URLs
        const notesWithImages = notes.map(note => {
            return {
                _id: note._id,
                title: note.title,
                description: note.description,
                tag: note.tag,
                imageUrl: note.imageUrl ? `${note.imageUrl}` : null
            };
        });

        res.json(notesWithImages);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Routes:2 Add New Notes Using : POST "/api/notes/addNotes" .Login Required

router.post('/addNotes', fetchUser, upload.single('imageUrl'), [
    body("title", "Enter a Valid Title").isLength({ min: 3 }),
    body("description", "Description Must be 5 Characters").isLength({ min: 5 }),
], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body;

        const note = new Note({
            title,
            description,
            tag,
            user: req.user.id,
            imageUrl: req.file ? req.file.filename : null,
        });

        const saveNote = await note.save();

        res.json(saveNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

///Routes:3 Update Notes Using : PUT "/api/notes/updateNote/:id" .Login Required

router.put('/updateNote/:id', fetchUser, upload.single('image'), async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newNote = {};

        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        if (req.file) { newNote.imageUrl = req.file.filename };

        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Not Found" });
        }

        // Delete old image file if a new image is provided
        if (req.file && note.imageUrl) {
            const oldImagePath = path.join(__dirname, '../public/upload', note.imageUrl);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                }
            });
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


//Routes:4 Delete Notes Using : DELETE "/api/notes/deleteNote/:id" .Login Required

router.delete('/deleteNote/:id', fetchUser, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).send("Not Found");
        }

        // if (note.user.toString() !== req.user.id) {
        //     return res.status(401).send("Not Allowed");
        // }

        if (note.imageUrl) {
            // Delete image from server folder (if exists)
            const imagePath = path.join(__dirname, '../public/upload/', note.imageUrl); // Adjust the path to your image folder
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.error('Image not found:', imagePath);
            }
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ success: "Note has been deleted" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;