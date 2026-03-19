import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';
import axios from 'axios';

interface UserProfile {
    id: number;
    email: string;
    username: string;
    displayName: string | null;
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
    const [displayName, setDisplayName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

            setProfile(response.data.data);
            setUsername(response.data.data.username || '');
            setDisplayName(response.data.data.displayName || '');
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                '/api/user/profile',
                { displayName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile(response.data.user);
            setMessage('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                '/api/user/username',
                { username },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile(response.data.user);
            setMessage('Username updated successfully!');
        } catch (err: any) {
            console.error('Failed to update username:', err);
            setError(err.response?.data?.error || 'Failed to update username');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                '/api/user/password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Failed to change password:', err);
            setError(err.response?.data?.error || 'Failed to change password');
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

                        <div>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '4px' }}>
                                Member Since
                            </label>
                            <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Update Username */}
                    <form
                        onSubmit={handleUpdateUsername}
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

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '8px' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg)',
                                    fontSize: '14px',
                                    color: 'var(--ink)',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
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
                            }}
                        >
                            {saving ? 'Saving...' : 'Update Username'}
                        </button>
                    </form>

                    {/* Update Display Name */}
                    <form
                        onSubmit={handleUpdateProfile}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px',
                        }}
                    >
                        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
                            Display Name
                        </h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '8px' }}>
                                Display Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter display name"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg)',
                                    fontSize: '14px',
                                    color: 'var(--ink)',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
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
                            }}
                        >
                            {saving ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>

                    {/* Change Password */}
                    <form
                        onSubmit={handleChangePassword}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '20px',
                        }}
                    >
                        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
                            Change Password
                        </h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '8px' }}>
                                Current Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        fontSize: '14px',
                                        color: 'var(--ink)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                    }}
                                >
                                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '8px' }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        fontSize: '14px',
                                        color: 'var(--ink)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                    }}
                                >
                                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--ink2)', display: 'block', marginBottom: '8px' }}>
                                Confirm New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        fontSize: '14px',
                                        color: 'var(--ink)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                    }}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
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
                            }}
                        >
                            {saving ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
