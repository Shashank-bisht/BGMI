import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';

const authHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': 'Bearer ' + token };
    } else {
        return {};
    }
};

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
    const [auth, setAuth] = useState(null);
    const [users, setUsers] = useState([]);
    const [timeSlots, setTimeSlots] = useState([{ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], start: '17:00', end: '18:00' }]);

    const timeOptions = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            timeOptions.push(`${hour}:${minute}`);
        }
    }
    
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: authHeader()
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAuth(data);
                    } else {
                        // Token is invalid
                        localStorage.removeItem('token');
                    }
                } catch (err) {
                    // Server is not reachable
                    console.error("Error verifying login status:", err);
                }
            }
        };
        checkLoggedIn();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (auth) {
                try {
                    const res = await fetch(`${apiUrl}/api/users`, { headers: authHeader() });
                    const data = await res.json();
                    if(res.ok) {
                        setUsers(data);
                    }
                } catch (err) {
                    console.error("Error fetching users:", err);
                }
            }
        };
        fetchUsers();
    }, [auth]);

    const handleUpdateAvailability = async (e) => {
        e.preventDefault();
        for (const slot of timeSlots) {
            if (new Date(slot.startDate) > new Date(slot.endDate)) {
                alert('Start date cannot be after end date.');
                return;
            }
        }
        try {
            const res = await fetch(`${apiUrl}/api/users/availability`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...authHeader() 
                },
                body: JSON.stringify({ availability: timeSlots }),
            });
            const updatedUser = await res.json();
            if(res.ok) {
                setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
            } else {
                console.error("Failed to update availability:", updatedUser.message);
            }
        } catch (err) {
            console.error("Error updating availability:", err);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        setAuth(null);
    }

    const addSlot = () => setTimeSlots([...timeSlots, { startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], start: '17:00', end: '18:00' }]);
    const removeSlot = (index) => setTimeSlots(timeSlots.filter((_, i) => i !== index));
    const handleSlotChange = (index, field, value) => {
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index][field] = value;
        setTimeSlots(newTimeSlots);
    };

    if (!auth) {
        return <LoginPage setAuth={setAuth} />;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>BGMI Availability</h1>
                <div>
                    <span className="me-3">Welcome, {auth.name}!</span>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Update Your Availability</h5>
                    <form onSubmit={handleUpdateAvailability}>
                        {timeSlots.map((slot, index) => (
                            <div key={index} className="d-flex align-items-center mb-2">
                                <input type="date" className="form-control me-2" value={slot.startDate} onChange={e => handleSlotChange(index, 'startDate', e.target.value)} />
                                <input type="date" className="form-control me-2" value={slot.endDate} onChange={e => handleSlotChange(index, 'endDate', e.target.value)} />
                                <select className="form-select me-2" value={slot.start} onChange={e => handleSlotChange(index, 'start', e.target.value)}>
                                    {timeOptions.map(t => <option key={t + '-start'} value={t}>{t}</option>)}
                                </select>
                                <span className="me-2">to</span>
                                <select className="form-select me-2" value={slot.end} onChange={e => handleSlotChange(index, 'end', e.target.value)}>
                                    {timeOptions.map(t => <option key={t + '-end'} value={t}>{t}</option>)}
                                </select>
                                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeSlot(index)}>X</button>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary me-2" onClick={addSlot}>+ Add Slot</button>
                        <button className="btn btn-primary" type="submit">Update Availability</button>
                    </form>
                </div>
            </div>

            <div>
                {users.map(user => (
                    <div className="card mb-3" key={user._id}>
                        <div className="card-body">
                            <h5 className="card-title">{user.name}</h5>
                            {user.availability && user.availability.length > 0 ? (
                                user.availability.map((slot, index) => (
                                    <p className="card-text" key={index}>
                                        Available from <strong>{slot.startDate && new Date(slot.startDate).toLocaleDateString()}</strong> to <strong>{slot.endDate && new Date(slot.endDate).toLocaleDateString()}</strong> between <strong>{slot.start}</strong> to <strong>{slot.end}</strong>
                                    </p>
                                ))
                            ) : (<p className="card-text">Not available</p>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;