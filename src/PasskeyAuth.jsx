import React, { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// const API_BASE = 'http://localhost:3351/api';
const API_BASE = 'https://787f-115-85-93-124.ngrok-free.app/api';

export default function PasskeyAuth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function register() {
    console.log('Register: start with email', email);
    if (!email) return alert('Email is required');

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/admin/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const optionsJSON = await resp.json();
      console.log('Register: options', optionsJSON);

      console.log('optionsJSON to send: ', optionsJSON);

      let attResp;
      try {
        // Pass the optionsJSON to the authenticator and wait for a response
        attResp = await startRegistration({ optionsJSON });
      } catch (error) {
        console.error('Registration error:', error);
        // Some basic error handling
        throw error;
      }

      console.log('Register: received attestation', attResp);

      const verifyResp = await fetch(`${API_BASE}/admin/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, credential: attResp }),
      });

      const result = await verifyResp.json();
      console.log('Register: result', result);
      if (result && result.verified) {
        alert('Registrasi berhasil!');
      } else {
        alert('Registrasi gagal!');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration error');
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    if (!email) return alert('Email is required');

    setLoading(true);
    try {
      console.log('Login: sending request to', `${API_BASE}/admin/login/options`);
      const resp = await fetch(`${API_BASE}/admin/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const options = await resp.json();
      console.log('Login: received options', options);

      let asseResp;
      try {
        // Pass the options to the authenticator and wait for a response
        asseResp = await startAuthentication({ optionsJSON: options });
      } catch (error) {
        // Some basic error handling
        console.error('start authentication error:', error);
        throw error;
      }

      console.log('Login: received assertion', asseResp);

      const verifyResp = await fetch(`${API_BASE}/admin/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email: email, credential: asseResp}),
      });

      const result = await verifyResp.json();
      console.log('Login: result', result);
      if (result && result.verified) {
        alert('Login sukses!');
      } else {
        alert('Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', textAlign: 'center' }}>
      <h2>Passkey Auth with Email</h2>
      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8, fontSize: 16, marginBottom: 20 }} disabled={loading} />
      <div>
        <button onClick={register} disabled={loading} style={{ marginRight: 10 }}>
          Register
        </button>
        <button onClick={login} disabled={loading}>
          Login
        </button>
      </div>
      {loading && <p>Processing...</p>}
    </div>
  );
}
