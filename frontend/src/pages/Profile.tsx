import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';
import axios from 'axios';

interface UserProfile {
    id: number;
    email: string;
    username: string;
    avatar: string | null;
    createdAt: string;
}

export default function Profile() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form states
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile(response.data);
            setUsername(response.data.username || '');
            setAvatar(response.data.avatar || '');
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 500000) {
            setError('Image too large, max 500KB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setAvatar(base64);
            // Auto save avatar immediately
            const token = localStorage.getItem('token');
            axios.put('/api/user/profile', { avatar: base64 }, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => {
                    setMessage('Avatar updated!');
                    setTimeout(() => setMessage(''), 3000);
                })
                .catch(() => setError('Failed to update avatar'));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveUsername = async () => {
        setUsernameError('');
        setUsernameSuccess('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                '/api/user/username',
                { username },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile(response.data.user);
            setUsernameSuccess('Username updated successfully!');
        } catch (err: any) {
            console.error('Failed to update username:', err);
            setUsernameError(err.response?.data?.error || 'Failed to update username');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {!isMobile && (
                <div className="sidebar">
                    <Sidebar user={profile || undefined} onLogout={handleLogout} />
                </div>
            )}

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    marginTop: isMobile ? '52px' : 0,
                    marginBottom: isMobile ? '60px' : 0,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'var(--surface)',
                        borderBottom: '1px solid var(--border)',
                        padding: '16px 24px',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: 20,
                            color: 'var(--ink)',
                            margin: 0,
                        }}
                    >
                        Profile Settings
                    </h1>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '24px', maxWidth: '600px' }}>
                    {/* Messages */}
                    {message && (
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: '#d4edda',
                                color: '#155724',
                                marginBottom: '16px',
                                fontSize: '13px',
                            }}
                        >
                            {message}
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: '#f8d7da',
                                color: '#721c24',
                                marginBottom: '16px',
                                fontSize: '13px',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Avatar Upload */}
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                width:'100px', height:'100px', borderRadius:'50%',
                                background: avatar ? 'transparent' : '#c8401a',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                cursor:'pointer', overflow:'hidden',
                                border:'3px solid var(--border)',
                                position:'relative'
                            }}>
                            {avatar
                                ? <img src={avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" />
                                : <span style={{color:'white', fontSize:'36px', fontWeight:700}}>
                                    {(username || '?').charAt(0).toUpperCase()}
                                </span>
                            }
                            {/* Camera overlay on hover */}
                            <div style={{
                                position:'absolute', inset:0, background:'rgba(0,0,0,0.4)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                opacity:0, transition:'opacity 0.2s',
                                borderRadius:'50%'
                            }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0')}
                            >
                                <span style={{fontSize:'24px'}}>📷</span>
                            </div>
                        </div>
                        <p style={{fontSize:'12px', color:'var(--ink3)'}}>Click to change avatar (max 500KB)</p>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
                    </div>

                    {/* Profile Info */}
                    <div
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px',
                        }}
                    >
                        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
                            Account Information
                        </h2>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '4px' }}>
                                Email
                            </label>
                            <div style={{ fontSize: '14px', color: 'var(--ink)' }}>{profile?.email}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '4px' }}>
                                Member Since
                            </label>
                            <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '4px' }}>
                                User ID
                            </label>
                            <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
                                {profile?.id ? String(profile.id).substring(0, 8) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Update Username */}
                    <div
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px',
                        }}
                    >
                        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
                            Username
                        </h2>

                        {usernameError && (
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    background: '#f8d7da',
                                    color: '#721c24',
                                    marginBottom: '16px',
                                    fontSize: '13px',
                                }}
                            >
                                {usernameError}
                            </div>
                        )}

                        {usernameSuccess && (
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    background: '#d4edda',
                                    color: '#155724',
                                    marginBottom: '16px',
                                    fontSize: '13px',
                                }}
                            >
                                {usernameSuccess}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg)',
                                    fontSize: '14px',
                                    color: 'var(--ink)',
                                }}
                            />
                            <button
                                onClick={handleSaveUsername}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#c8401a',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.6 : 1,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
