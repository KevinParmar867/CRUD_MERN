import React, { useState, useEffect } from "react";

const About = () => {
    const apiUrl = "http://localhost:5000/api/auth/getuser";
    const [data, setData] = useState();
    const token = localStorage.getItem("auth-token");

    useEffect(() => {
        async function fetchData() {
            try {
                if (!token) {
                    console.error('User is not authenticated');
                    return;
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': `${token}`, // Include the token in the Authorization header
                    },
                });

                // Handle other status codes and parse the response as needed
                if (response.ok) {
                    const jsonData = await response.json(); // Parse the response
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, [token]);

    return (
        <div>
            {data ? (
                <div>
                    <p>name: {data.name}</p>
                    <p>email: {data.email}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default About;
