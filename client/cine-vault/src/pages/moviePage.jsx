import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faFolderPlus, faEye, faEnvelope, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import bannerPlaceholder from "../assets/placeholder.jpg";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from "axios"; // Import axios for making HTTP requests
import "./theme.css";
import MovieCard from "../components/movieCard";
import HorizontalList from "../components/HorizontalList";

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isToggled, setIsToggled] = useState(localStorage.getItem("theme") === "dark");
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [trendingArray, setTrendingArray] = useState([]);
  const [hasWatched, setHasWatched] = useState(false);

  // Fetch user profile and movie details
  useEffect(() => {
    setMovie(null);
    setLoading(true);
    setTrendingArray([]);  // Reset trending array on movie change

    const fetchProfileAndMovie = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn("Session error:", sessionError);
          return;
        }

        if (session) {
          const { data, error } = await supabase
            .from("Users")
            .select()
            .eq("user_id", session.user.id)
            .maybeSingle();
          if (data) {
            setUser(data.user_id);
            setIsToggled(data.theme_settings);
          } else {
            console.warn("No user found with the given session ID.");
          }
        }

        // Fetch movie details based on the movie ID
        const { data: movieData, error: movieError } = await supabase
          .from('Movies')
          .select('*')
          .eq("movie_id", id)
          .maybeSingle();

        if (movieData) {
          setMovie(movieData); // Set the movie
        } else {
          console.error(movieError);
        }

        // Check if the user has watched this movie
        if (session) {
          const { data: watchedData } = await supabase
            .from("Watched_Movies")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("movie_id", id)
            .maybeSingle();
          setHasWatched(Boolean(watchedData));
        }

      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchProfileAndMovie();
  }, [id]);

  const calculateMovieRecommendations = async () => {
      try {
          const { error } = await supabase
              .from("Users")
              .update({ movie_recommendations: trendingArray }) // Update field
              .eq("user_id", user);

          if (error) {
              console.error("Error updating movie recommendations:", error);
          } else {
              console.log("Movie recommendations updated successfully.");
          }
      } catch (error) {
          console.error("Error during Supabase operation:", error);
      }
  };

  // Fetch recommendations only when movie data is available and loading is complete
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!movie) return; // If movie data is not available, do not call the API

      try {
        const mid = Number(id);
        const data = { data: [mid] }
        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.post(
          `https://gaelguzman.us-east-1.aws.modelbit.com/v1/get_recommendations_chunked/latest`,
          data,
          { headers }
        );

        // Make sure the response data is an array before setting it
        if (Array.isArray(response.data.data)) {
          setTrendingArray(response.data.data);
        } else {
          console.error("Received data is not an array", response.data);
          setTrendingArray([]);  // Set it to an empty array in case of invalid data
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setTrendingArray([]); // In case of error, set it to an empty array
      }
      
    };

    if (loading && movie) { // Only fetch recommendations when movie is available
      fetchRecommendations();
    }
  }, [id, movie, loading]); // Add `loading` and `movie` as dependencies

  const handleClose = () => {
    navigate(-1);
  };

  // Keeps track of movies visited locally
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleWatchedStatus = async () => {
    if (!user) return;

    if (hasWatched) {
      await supabase
        .from("Watched_Movies")
        .delete()
        .eq("user_id", user)
        .eq("movie_id", id);
      setHasWatched(false);
    } else {
      await supabase.from("Watched_Movies").insert({
        user_id: user,
        movie_id: id,
      });
      setHasWatched(true);
    }
    calculateMovieRecommendations();
  };

  // Handle recently visited movies
  useEffect(() => {
    const updateRecentlyVisited = async () => {
      if (movie && movie.movie_id && user) {
        try {
          const { data, error } = await supabase
            .from("Recently_Visited")
            .select("visited_1, visited_2, visited_3")
            .eq("user_id", user)
            .single();
  
          if (error && error.code !== "PGRST116") {
            console.error("Error Fetching Recently Visited:", error);
            return;
          }
  
          const newVisited = { id: movie.movie_id, type: "movie" };
  
          if (data) {
            // Check if the movie is already in any of the visited slots
            let isAlreadyVisited = false;
            let updatedVisited_1 = data.visited_1;
            let updatedVisited_2 = data.visited_2;
            let updatedVisited_3 = data.visited_3;
  
            // Handle the case where we have less than 3 movies
            if (JSON.stringify(data.visited_1) === JSON.stringify(newVisited)) {
              isAlreadyVisited = true; // Already at the top, no need to update
            } else if (JSON.stringify(data.visited_2) === JSON.stringify(newVisited)) {
              updatedVisited_1 = data.visited_2;
              updatedVisited_2 = data.visited_1;
              isAlreadyVisited = true; // Found in visited_2, move it to top
            } else if (JSON.stringify(data.visited_3) === JSON.stringify(newVisited)) {
              updatedVisited_1 = data.visited_3;
              updatedVisited_2 = data.visited_1;
              updatedVisited_3 = data.visited_2;
              isAlreadyVisited = true; // Found in visited_3, move it to top
            }
  
            // If not already visited, shift slots and place the new movie at the top
            if (!isAlreadyVisited) {
              if (!updatedVisited_1) {
                updatedVisited_1 = newVisited; // First slot is empty
              } else if (!updatedVisited_2) {
                updatedVisited_2 = newVisited; // Second slot is empty
              } else if (!updatedVisited_3) {
                updatedVisited_3 = newVisited; // Third slot is empty
              } else {
                updatedVisited_3 = updatedVisited_2;
                updatedVisited_2 = updatedVisited_1; // Shift others down
                updatedVisited_1 = newVisited; // Place new movie at the top
              }
            }
  
            // Update the Recently_Visited table with the shifted slots
            await supabase
              .from("Recently_Visited")
              .update({
                visited_1: updatedVisited_1,
                visited_2: updatedVisited_2,
                visited_3: updatedVisited_3,
              })
              .eq("user_id", user);
          } else {
            // If no record exists, create a new one with this movie as visited_1
            await supabase
              .from("Recently_Visited")
              .insert([{
                user_id: user,
                visited_1: newVisited,
              }]);
          }
        } catch (err) {
          console.error("Error updating Recently Visited:", err);
        }
      }
    };
  
    updateRecentlyVisited();
  }, [movie, user]);
  
  

  return (
    loading ? (
      <div className="">
        <div className="relative h-[850px] flex flex-col">
          <div className="relative flex flex-1 justify-end items-start rounded-br-3xl rounded-bl-3xl">
            <div
              className="opacity-25 w-full h-full rounded-br-3xl rounded-bl-3xl"
              style={{
                backgroundImage: `url(${movie?.banner || bannerPlaceholder})`,
                backgroundSize: "contain", // Separate backgroundSize from background shorthand
                backgroundPosition: "center",
              }}
            ></div>

            <button onClick={handleClose} className="absolute top-8 right-12 z-20">
              <FontAwesomeIcon
                className="w-12 h-12 transition-all ease-in-out duration-500 transform hover:scale-125"
                icon={faCircleXmark}
              />
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 flex items-center overflow-y-auto">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center">
                <img
                  src={movie?.image || bannerPlaceholder}
                  className="shadow-[rgba(0,0,15,0.5)_10px_15px_4px_0px] min-h-[540px] max-h-[540px] max-w-[380px] rounded-2xl ml-20"
                />
                <div className={`flex flex-col ml-10 mr-4 font-body ${movie?.overview?.length > 440 ? "mt-96" : "mt-72"}`}>

                  <div className="flex items-center space-x-12">
                    <div className="text-5xl max-w-[600px]">{movie?.title}</div>
                    <button onClick={toggleWatchedStatus} className="transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]">
                      <FontAwesomeIcon className="w-6 h-6" icon={hasWatched ? faEyeSlash : faEye} />
                      <span className="ml-2">{hasWatched ? "Has Watched" : "Watch"}</span>
                    </button>
                    <button className="transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]">
                      <FontAwesomeIcon className="w-6 h-6" icon={faFolderPlus} />
                    </button>
                    <button className="transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]">
                      <FontAwesomeIcon className="w-6 h-6" icon={faEnvelope} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 mt-8">
                    <div>{movie?.release_date}</div>
                    <div>*</div>
                    <div>{movie?.genres}</div>
                    <div>*</div>
                    <div>{movie?.runtime} Minutes</div>
                    <div>*</div>
                    <div>{movie?.rating} / 10 ⭐</div>
                  </div>
                  <div className="text-gray-400 py-2">{movie?.tagline}</div>
                  <div className="text-2xl">Overview</div>
                  <div className="text-wrap py-2">{movie?.overview}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-[-100px] pl-3.5">
          <h1 className="text-4xl font-body ml-16">Similar Movies</h1>
          {trendingArray && trendingArray.length > 0
            ? 
              <HorizontalList movies={trendingArray} recommendations={true} />
            : 
              <div className="flex flex-col justify-center items-center">
                <DotLottieReact src="https://lottie.host/beb1704b-b661-4d4c-b60d-1ce309d639d5/7b3aX5rJYc.json" loop autoplay className="w-12 h-12"/>
              </div>
          }
        </div>
      </div>
    ) : null
  );
};

export default MoviePage;
