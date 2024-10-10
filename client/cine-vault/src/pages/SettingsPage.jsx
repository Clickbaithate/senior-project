import React, { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import Sidebar from './Sidebar';
import Switch from '../components/Switch.jsx';
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSun, faMoon} from "@fortawesome/free-solid-svg-icons";


const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [message, setMessage] = useState('');
  const [isToggled, setIsToggled] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Fetch profile and theme settings from Supabase
  useEffect(() => {

    const fetchProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn(sessionError);
        setLoading(false);
        return;
      }

      if (session) {
        const { data, error } = await supabase
          .from('Users')
          .select('username, bio, profile_picture, theme_settings')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.warn('Error fetching profile:', error);
        } else if (data) {
          setUsername(data.username);
          setBio(data.bio);
          setProfilePicture(data.profile_picture);
          setIsToggled(data.theme_settings); // Set the toggle state based on database value
          const theme = data.theme_settings ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme); // Sync local storage with database value
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Update the theme on the page when the toggle changes
  useEffect(() => {
    const theme = isToggled ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Save the theme preference
  }, [isToggled]);

  // Update theme settings in Supabase when toggled
  const handleThemeToggle = async () => {
    setIsToggled(!isToggled);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('Users')
        .update({ theme_settings: !isToggled }) // Update the theme setting in the database
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error updating theme settings:', error);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

// Handle profile update
const handleProfileUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Fetch the session to get user information
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn('Session error:', sessionError);
      setMessage(`Error: ${sessionError.message}`);
      setLoading(false);
      return;
    }

    // Get email from session data
    const email = session.user.email;

    // Perform the upsert operation, including the email field
    const { error } = await supabase
      .from('Users')
      .upsert({
        user_id: session.user.id,
        email: email, // Ensure the email is included here
        username: username,
        bio: bio,
        profile_picture: profilePicture,
      });

    if (error) throw error;

    setMessage('Profile updated successfully!');
    // Re-fetch the updated profile data to refresh state
  } catch (error) {
    setMessage(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={`flex min-h-screen flex-col ml-[100px] pt-4 overflow-hidden ${isToggled ? "bg-[#2D2E39]" : "bg-[#FFFFFF]"}`} >
      <Sidebar />
      <div className="flex flex-1">
        <div className={`flex flex-col w-4/12 pl-10 justify-start ${isToggled ? "text-white" : "text-black"}`}>
          <h2 className="text-4xl font-bold mb-6 left-0">Settings</h2>
          <h2 className="text-xl mb-4 ml-8">Basic Details</h2>
          <h2 className="text-xl mb-2 ml-8 absolute top-3/4">Theme Settings</h2>
        </div>

        <div className="flex flex-1 justify-end pr-20 mt-24">
          <div className="w-full max-w-lg">
            <div className="flex mb-6">
              <img
                src={profilePicture || 'https://via.placeholder.com/100'}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-blue-400 object-cover"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="profilePicture" className={`block text-sm font-medium mb-1 ${isToggled ? "text-white" : "text-black"}`}>
                Profile Picture URL
              </label>
              <input
                id="profilePicture"
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="h-10 w-full settings-input rounded-md px-3"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="username" className={`block text-sm font-medium mb-1 ${isToggled ? "text-white" : "text-black"}`}>
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 w-full settings-input rounded-md px-3"
              />
            </div>

            <div className="mb-4 ">
              <label htmlFor="bio" className={`block text-sm font-medium mb-1 ${isToggled ? "text-white" : "text-black"}`}>
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-24 w-full settings-input rounded-md px-3"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                onClick={handleProfileUpdate}
                className="px-4 py-2 saveprofile bg-blue-500 rounded-md "
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {/* Toggle Switch */}
            <div className='h-10 w-full relative top-[165px] settings-input rounded-md '>
              <h2 className="flex pt-[5px] pl-[5px] items-center">
                {isToggled ? (
                  <FontAwesomeIcon icon={faMoon} className="mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faSun} className="mr-2" />
                )}
                {isToggled ? 'Dark Mode' : 'Light Mode'}
              </h2>
              <Switch isToggled={isToggled} onToggled={handleThemeToggle} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        {message && <p className="text-green-500">{message}</p>}
      </div>
    </div>
  );
};

export default SettingsPage;
