import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [favoriteCuisine, setFavoriteCuisine] = useState(user?.favoriteCuisine || '');
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user?.dietaryRestrictions || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setFavoriteCuisine(user.favoriteCuisine || '');
      setDietaryRestrictions(user.dietaryRestrictions || '');
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      await updateProfile({ name, favoriteCuisine, dietaryRestrictions });
      setStatus('Profile saved!');
    } catch (error) {
      setStatus(error.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-card">
        <h1>Profile</h1>
        <p>Update your account settings and preferences.</p>
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={user?.email || ''} disabled />
          </label>

          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label>
            Favorite cuisine
            <input
              type="text"
              value={favoriteCuisine}
              onChange={(event) => setFavoriteCuisine(event.target.value)}
              placeholder="Italian, Mexican, etc."
            />
          </label>

          <label>
            Dietary restrictions
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(event) => setDietaryRestrictions(event.target.value)}
              placeholder="Gluten-free, vegan, none"
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>

          {status && <p className="form-status">{status}</p>}
        </form>
      </div>
    </section>
  );
};

export default Profile;
