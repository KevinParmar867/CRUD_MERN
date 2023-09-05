import React, { useContext, useState } from 'react'
import noteContext from "../context/notes/noteContext"

const AddNote = (props) => {
    const context = useContext(noteContext);
    const { addNote } = context;

    const [note, setNote] = useState({ title: "", description: "", tag: "", imageUrl: "" });


    const onChange = (e) => {
        if (e.target.name === "imageUrl") {
            setNote({ ...note, [e.target.name]: e.target.files[0] });
        } else {
            setNote({ ...note, [e.target.name]: e.target.value });
        }
    };

    const handleClick = async(e) => {
       
        e.preventDefault();
        if (!note.imageUrl) {
            props.showAlert("Please select an image", "danger");
            return;
        }

        const formData = new FormData();

        formData.append("title", note.title);
        formData.append("description", note.description);
        formData.append("tag", note.tag);
        formData.append("imageUrl", note.imageUrl);

        console.log("Title:", formData.get("title"));
        console.log("Description:", formData.get("description"));
        console.log("Tag:", formData.get("tag"));
        console.log("imageUrl:", formData.get("imageUrl"));

        try {
            await addNote(formData);
            setNote({ title: "", description: "", tag: "", imageUrl: "" });
            document.getElementById('imageUrl').value = '';
            props.showAlert("Added Successfully", "success");

        } catch (error) {
            props.showAlert("Error adding note", "danger");
        }
    };

    return (
        <div className="container my-3">
            <h2>Add a Note</h2>
            <form className="my-3" method="POST" encType="multipart/form-data">
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input type="text" className="form-control" id="title" name="title" aria-describedby="emailHelp" value={note.title} onChange={onChange} minLength={5} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <input type="text" className="form-control" id="description" name="description" value={note.description} onChange={onChange} minLength={5} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="tag" className="form-label">Tag</label>
                    <input type="text" className="form-control" id="tag" name="tag" value={note.tag} onChange={onChange} minLength={5} required />
                </div>

                <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">Image</label>
                    <input type="file" className="form-control" id="imageUrl" name="imageUrl" onChange={onChange} />
                </div>
                <button
                    disabled={note.title.length < 5 || note.description.length < 5}
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleClick}
                >
                    Add Note
                </button>
            </form>
        </div>
    )
}

export default AddNote