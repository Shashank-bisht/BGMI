import React, { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const LoginPage = ({ setAuth }) => {
    const [name, setName] = useState('');
    const [bgmiId, setBgmiId] = useState('');
    const [pin, setPin] = useState('');
    const [isRegister, setIsRegister] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const url = `/api/auth/${isRegister ? 'register' : 'login'}`;
        let body;
        if (isRegister) {
            body = { name, bgmiId, pin };
        } else {
            body = { name, pin };
        }

        try {
            const res = await fetch(`${apiUrl}${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setAuth(data.user);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">{isRegister ? 'Register' : 'Login'}</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                {isRegister && (
                                    <div className="mb-3">
                                        <label htmlFor="bgmiId" className="form-label">BGMI ID (Numeric)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="bgmiId"
                                            value={bgmiId}
                                            onChange={(e) => setBgmiId(e.target.value)}
                                            required={isRegister}
                                        />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="pin" className="form-label">4-Digit PIN</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="pin"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        required
                                        maxLength="4"
                                        pattern="\d{4}"
                                        title="PIN must be 4 digits"
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">
                                        {isRegister ? 'Register' : 'Login'}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-3 text-center">
                                <button
                                    className="btn btn-link"
                                    onClick={() => setIsRegister(!isRegister)}
                                >
                                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
