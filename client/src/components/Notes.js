import React, { useContext, useEffect, useRef, useState } from 'react';
import noteContext from "../context/notes/noteContext";
import Noteitem from './Noteitem';
import AddNote from './AddNote';
import { useNavigate } from 'react-router-dom';
import "../App.css"

const Notes = (props) => {
    const { showAlert } = props;
    const context = useContext(noteContext);
    const { notes, setNotes, getNotes, editNote } = context;
    let navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('auth-token')) {
            getNotes();
        } else {
            navigate('/login');
        }
    }, [getNotes, navigate]);

    const ref = useRef(null);
    const refClose = useRef(null);
    const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '', eimageUrl: '' });
    const [imageFile, setImageFile] = useState(null);

    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({
            id: currentNote._id,
            etitle: currentNote.title,
            edescription: currentNote.description,
            etag: currentNote.tag,
            eimageUrl: currentNote.imageUrl,
        });
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        setImageFile(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                document.querySelector('.profile-pic').setAttribute('src', event.target.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleClick = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            props.showAlert('Please select an image', 'danger');
            return;
        }

        const formData = new FormData();

        formData.append('title', note.etitle);
        formData.append('description', note.edescription);
        formData.append('tag', note.etag);
        formData.append('image', imageFile);  // Use 'image' as the key

        try {
            await editNote(note.id, note.etitle, note.edescription, note.etag, formData, notes, setNotes);
            refClose.current.click();
            props.showAlert('Updated Successfully', 'success');
        } catch (error) {
            console.error(error);
            props.showAlert('Error updating note', 'danger');
        }
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };
    return (
        <>
            <AddNote showAlert={showAlert} />
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="my-3">


                                <div className="ImageContainer">
                                    <div className="circle">
                                        <img src={`http://localhost:5000/${note.eimageUrl}`} alt="" className="profile-pic" onChange={onChange} />
                                    </div>
                                    <div className="profile-image" onClick={() => document.querySelector('.file-upload').click()}>
                                        <i className="fa fa-camera upload-button"></i>
                                        <input type="file" accept="image/*" className="file-upload" onChange={handleImageChange} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input type="text" className="form-control" id="etitle" name="etitle" value={note.etitle} aria-describedby="emailHelp" onChange={onChange} minLength={5} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <input type="text" className="form-control" id="edescription" name="edescription" value={note.edescription} onChange={onChange} minLength={5} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tag" className="form-label">Tag</label>
                                    <input type="text" className="form-control" id="etag" name="etag" value={note.etag} onChange={onChange} />
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button disabled={note.etitle.length < 5 || note.edescription.length < 5} onClick={handleClick} type="button" className="btn btn-primary">Update Note</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row my-3">
                <h2>Your Notes</h2>
                <div className="container mx-2">
                    {notes.length === 0 && 'No notes to display'}
                </div>
                {notes.map((note) => {
                    return <Noteitem key={note._id} updateNote={updateNote} note={note} showAlert={showAlert} />
                })}
            </div>
        </>
    )
}

export default Notes;