import NoteContext from "./noteContext";
import { useState } from "react";

const NoteState = (props) => {
    const host = "http://localhost:5000";
    const token = localStorage.getItem("auth-token");
    const notesInitial = []
    const [notes, setNotes] = useState(notesInitial)

    // Get all Notes
    const getNotes = async () => {
        try {
            // Retrieve the authentication token from storage
            if (!token) {
                // Handle the case when the user is not authenticated
                // Redirect to login or show an error message
                console.error('User is not authenticated');
                return;
            }

            const response = await fetch(`${host}/api/notes/fetchAllNotes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${token}`, // Include the token in the Authorization header
                },
            });

            if (response.status === 401) {
                // Handle the case when the token is expired or invalid
                // Redirect to login or show an error message
                console.error('User is not authorized');
                return;
            }

            // Handle other status codes and parse the response as needed
            if (response.ok) {
                const json = await response.json();
                setNotes(json);
            } else {
                console.error('Error fetching notes:', response.status, response.statusText);
                // Handle the error case or set notes to an empty array
                setNotes([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            // Handle the error case or set notes to an empty array
            setNotes([]);
        }
    };


    // Add a Note
    const addNote = async (formData) => {
        // API Call 

        const response = await fetch(`${host}/api/notes/addNotes`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                "auth-token": `${token}`
            },
            body: formData
        });

        const note = await response.json();

        // Update the state with the new note
        setNotes(notes.concat(note));
    }

    // Delete a Note
    const deleteNote = async (id, imageUrl) => {
        try {
            const response = await fetch(`${host}/api/notes/deleteNote/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": `${token}`
                },
                body: JSON.stringify({ imageUrl })
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                // Update the state only if the note was successfully deleted on the server
                const newNotes = notes.filter((note) => note._id !== id);
                setNotes(newNotes);

            } else {
                // Show error alert
                console.log("Error deleting note", "error");
            }
        } catch (error) {
            console.error('Delete note error:', error);
        }
    };


    // Edit a Note
    // const editNote = async (id, title, description, tag, imageUrl, notes, setNotes) => {
    //     // API Call 
    //     const response = await fetch(`${host}/api/notes/updateNote/${id}`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             "auth-token": `${token}`
    //         },
    //         body: JSON.stringify({ title, description, tag, imageUrl }) // Include imageUrl in the request body
    //     });
    //     const json = await response.json();

    //     console.log(json);

    //     let newNotes = JSON.parse(JSON.stringify(notes));
    //     // Logic to edit in client
    //     for (let index = 0; index < newNotes.length; index++) {
    //         const element = newNotes[index];
    //         if (element._id === id) {
    //             newNotes[index].title = title;
    //             newNotes[index].description = description;
    //             newNotes[index].tag = tag;
    //             newNotes[index].imageUrl = imageUrl; // Update imageUrl in the client
    //             break;
    //         }
    //     }
    //     setNotes(newNotes);
    // }

    const editNote = async (id, title, description, tag, formData, notes, setNotes) => {
        // API Call
        try {
            const response = await fetch(`${host}/api/notes/updateNote/${id}`, {
                method: 'PUT',
                headers: {
                    "auth-token": `${token}`
                },
                body: formData,
            });

            if (response.ok) {
                const json = await response.json();
                let newNotes = JSON.parse(JSON.stringify(notes));
                // Logic to edit in client
                for (let index = 0; index < newNotes.length; index++) {
                    const element = newNotes[index];
                    if (element._id === id) {
                        newNotes[index].title = title;
                        newNotes[index].description = description;
                        newNotes[index].tag = tag;
                        newNotes[index].imageUrl = json.note.imageUrl; 
                        break;
                    }
                }
                setNotes(newNotes);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error(error);
            throw new Error('Update failed');
        }
    };

    return (
        <NoteContext.Provider value={{ notes, setNotes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    )

}
export default NoteState;