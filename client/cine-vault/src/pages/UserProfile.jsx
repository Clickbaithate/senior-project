import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabaseClient";
import Sidebar from './Sidebar';
import SearchBar from '../components/SearchBar.jsx';
import HorizontalList from '../components/HorizontalList';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const UserProfile = () => {
  const { id } = useParams(); // Get user_id from URL params
  const [user, setUser] = useState(null); // this is the user were visiting
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedShows, setWatchedShows] = useState([]);
  const [theme, setTheme] = useState('light'); // Default theme
  const [thisUser, setThisUser] = useState(null); // this is the user visiting
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);

  // Fetch User Profile Data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("user_id, username, profile_picture, bio, theme_settings")
          .eq("username", id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }

        setUser(userData);

        // Apply theme settings
        const userTheme = userData.theme_settings ? 'dark' : 'light';
        setTheme(userTheme);
        document.body.classList.toggle('dark', userTheme === 'dark');

        // Fetch Watched Movies
        const { data: watchedMoviesData, error: moviesError } = await supabase
          .from("Watched_Movies")
          .select("movie_id")
          .eq("user_id", userData.user_id);

        if (moviesError) console.error("Error fetching watched movies:", moviesError);
        else {
          const movieIds = watchedMoviesData.map((movie) => movie.movie_id);
          const { data: movieDetails, error: movieError } = await supabase
            .from("Movies")
            .select("*")
            .in("movie_id", movieIds);

          if (!movieError) setWatchedMovies(movieDetails);
        }

        // Fetch Watched Shows
        const { data: watchedShowsData, error: showsError } = await supabase
          .from("Watched_Shows")
          .select("show_id")
          .eq("user_id", userData.user_id);

        if (showsError) console.error("Error fetching watched shows:", showsError);
        else {
          const showIds = watchedShowsData.map((show) => show.show_id);
          const { data: showDetails, error: showError } = await supabase
            .from("Shows")
            .select("*")
            .in("show_id", showIds);

          if (!showError) setWatchedShows(showDetails);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [id]);

  useEffect(() => {
    const fetchAuthenticatedUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return;
  
      setThisUser(session.user.id); // Set the current user's ID
    };
  
    fetchAuthenticatedUser();
  }, []);
  
  useEffect(() => {
    const fetchFriendRequestStatus = async () => {
      try {
        if (!thisUser || !user) return;
  
        // Fetch rows involving both users
        const { data: friendRequestData, error: friendRequestError } = await supabase
          .from("Friends")
          .select("status, user_id, friend_id")
          .or(`user_id.eq.${thisUser},friend_id.eq.${thisUser}`)
          .or(`user_id.eq.${user.user_id},friend_id.eq.${user.user_id}`);
  
        if (friendRequestError) {
          console.error("Error fetching friend request status:", friendRequestError);
          return;
        }
  
        // Filter rows relevant to the relationship between `thisUser` and `user.user_id`
        const filteredRequests = friendRequestData.filter(
          (row) =>
            (row.user_id === thisUser && row.friend_id === user.user_id) ||
            (row.user_id === user.user_id && row.friend_id === thisUser)
        );
  
        if (filteredRequests.length === 0) {
          setFriendRequestStatus("none");
          return;
        }
  
        const request = filteredRequests[0]; // Assume one relationship exists
  
        // Check the relationship status
        if (request.status === "accepted") {
          setFriendRequestStatus("accepted");
        } else if (request.status === "pending") {
          if (request.user_id === thisUser) {
            setFriendRequestStatus("pending"); // Current user sent the request
          } else {
            setFriendRequestStatus("respond"); // Current user received the request
          }
        } else if (request.status === "rejected") {
          setFriendRequestStatus(
            request.user_id === thisUser ? "Request Rejected" : "Rejected Request"
          );
        }
      } catch (err) {
        console.error("Error fetching friend request status:", err);
      }
    };
  
    fetchFriendRequestStatus();
  }, [user, thisUser]);
  
  const handleNotificationUpdate = (s) => {
    setFriendRequestStatus(s);
  }

  const sendFriendRequest = async (currentUserId, targetUserId) => {
    try {
      const { data, error } = await supabase
        .from("Friends")
        .insert([{ user_id: currentUserId, friend_id: targetUserId, status: "pending" }]);

      if (error) {
        console.error("Error sending friend request:", error.message);
        return;
      }

      console.log("Friend request sent successfully:", data);
      setFriendRequestStatus("pending"); // Update state to show "Request Sent"
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  // Render Loading State
  if (!user) {
    return (
      <div className="flex justify-center bg-theme items-center min-h-screen">
        <DotLottieReact
          src="https://lottie.host/beb1704b-b661-4d4c-b60d-1ce309d639d5/7b3aX5rJYc.json"
          loop
          autoplay
          className="w-12 h-12"
        />
      </div>
    );
  }

  return (
    <div className={`ml-[100px] min-h-screen ${theme === 'dark' ? 'bg-theme ' : 'bg-theme '}`}>
      <Sidebar />
      <SearchBar placeholder="SEARCH..." handleNotificationUpdate={handleNotificationUpdate} />
      <div className="max-w-3xl mx-auto py-8">
        {/* User Profile Header */}
        <header className={`p-4 mb-8 ${theme === 'dark' ? 'bg-theme' : 'bg-theme'} text-center`}>
          <h1 className="text-xl font-bold">{user.username}</h1>
        </header>

        {/* Profile Picture and Username */}
        <div className="flex justify-center items-center flex-col mb-8">
          <img
            src={user.profile_picture || "https://via.placeholder.com/150"}
            alt="Profile"
            className="rounded-full h-40 w-40 object-cover mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">{user.username}</h2>
          {/* Display Bio */}
          <p className="text-lg text-center mb-4">{user.bio || "No bio available."}</p>

          {/* Check for the correct friend request state */}
          {
            user.user_id !== thisUser && (
              friendRequestStatus === "pending" ? (
                <button
                  disabled
                  className="px-4 py-2 mt-4 text-white bg-gray-500 rounded-full"
                >
                  Pending
                </button>
              ) : friendRequestStatus === "respond" ? (
                <button
                  onClick={() => {
                    const element = document.querySelector(".noti");
                    if (element) {
                      const isClicked = element.classList.contains("active");

                      if (isClicked) {
                        element.classList.remove("active");
                      } else {
                        element.classList.add("active");
                        element.click();
                      }
                    }
                  }}
                  className="px-4 py-2 mt-4 text-white bg-yellow-500 rounded-full hover:bg-yellow-600"
                >
                  Respond to Request
                </button>
              ) : friendRequestStatus === "accepted" ? (
                <button
                  disabled
                  className="px-4 py-2 mt-4 text-white bg-green-500 rounded-full"
                >
                  Friends
                </button>
              ) : friendRequestStatus === "Request Rejected" ? (
                <button
                  disabled
                  className="px-4 py-2 mt-4 text-white bg-red-500 rounded-full"
                >
                  Request Rejected
                </button>
              ) : friendRequestStatus === "Rejected Request" ? (
                <button
                  disabled
                  className="px-4 py-2 mt-4 text-white bg-red-500 rounded-full"
                >
                  Rejected Request
                </button>
              ) : friendRequestStatus === "rejected" ? (
                <button
                  disabled
                  onClick={() => sendFriendRequest(thisUser, user.user_id)} // Enable the user to send a new friend request after rejection
                  className="px-4 py-2 mt-4 text-white bg-red-500 rounded-full"
                >
                  rejected
                </button>
              ) : (
                <button
                  onClick={() => sendFriendRequest(thisUser, user.user_id)}
                  className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-full"
                >
                  Add Friend
                </button>
              )
            )
          }

          <div className="flex justify-around w-full max-w-3xl">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Movies</h3>
              <p className="text-lg">{watchedMovies.length}</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Shows</h3>
              <p className="text-lg">{watchedShows.length}</p>
            </div>
          </div>
        </div>

        {/* Watched Movies */}
        <h3 className="text-2xl font-semibold mb-4">Watched Movies</h3>
        {watchedMovies.length > 0 ? (
          <HorizontalList movies={watchedMovies} />
        ) : (
          <p>No movies watched yet.</p>
        )}

        {/* Watched Shows */}
        <h3 className="text-2xl font-semibold mb-4 mt-8">Watched Shows</h3>
        {watchedShows.length > 0 ? (
          <HorizontalList shows={watchedShows} />
        ) : (
          <p>No shows watched yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
