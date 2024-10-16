import React, { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import Sidebar from "./Sidebar";
import SearchBar from "../components/SearchBar";
import HomePageCarousel from "../components/HomePageCarousel";
import './theme.css';
import HomeChallengeCard from "../components/MovieChallengeCard";
import HomeMovieCard from "../components/HomeMovieCard";
import SocialActivityCard from "../components/SocialActivityCard";
import { useNavigate } from "react-router-dom";

const HomePage = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn(sessionError);
        return;
      }

      if (session) {
        const { data, error } = await supabase
          .from('Users')
          .select('username, bio, profile_picture')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.warn('Error fetching profile:', error);
        } else if (data) {
        }
      }
    };

    fetchProfile();

    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("Movies")
          .select("movie_id, title, image, release_date, rating")
          .range(100,103)
          .limit(3); // Limiting to 3 movies for the Recently Visited section
        if (error) {
          console.error("Error fetching movies:", error);
        } else {
          setMovies(data);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  const activities = [
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has liked your playlist!",
      time: "5 minutes ago!"
    },
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has sent you a message!",
      time: "15 minutes ago!"
    },
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has sent you a friend request!",
      time: "30 minutes ago!"
    }
  ]

  return (
    <div className={`min-h-screen bg-theme `}>
      <Sidebar />
      <div className="ml-[100px]">
        <SearchBar placeholder="Search..."  />


        <div className="flex" >

          {/* Left Side */}
          <div className="bg-theme h-screen w-2/3 flex flex-col items-center justify-start space-y-6 ">
            <HomePageCarousel 
                images={[
                  "https://w0.peakpx.com/wallpaper/286/479/HD-wallpaper-suzume-no-tojimari-suzume-no-tojimari-2023-movies-netflix-animated-movies-anime-movies.jpg",
                  "https://wallpapers.com/images/hd/animation-movies-1197-x-704-wallpaper-nlgddr8e66de5g41.jpg",
                  "https://i.ytimg.com/vi/8zWK0tFUJ58/maxresdefault.jpg",
                  "https://wallpapers.com/images/hd/lego-ninjago-coloured-ninjas-tvvjxferzmu2gdx6.jpg",
                ]}
              />
              <div className="flex space-x-12 " >
                <HomeChallengeCard progress={75} challenge={"Sci-Fi"} />
                <HomeChallengeCard progress={50} challenge={"Comedy"} />
                <HomeChallengeCard progress={92} challenge={"Oscar-Nominated"} />
              </div>
          </div>

          {/* Right Side */}
          <div className="bg-theme h-[90%] w-1/3 flex items-center justify-center mt-4 " >
            <div className="accent w-[90%] h-[95%] px-12 py-8 rounded-3xl " >

              {/* Movie Activity */}
              <p className="text-xl font-body text-theme mb-6 " >Recently Visited</p>
              <div className="flex flex-col items-center justify-center space-y-4">
                {movies.map((movie, i) => (
                  <HomeMovieCard movie={movie} key={i}/>
                ))}
              </div>

              {/* Horizontal Bar */}
              <div className="w-full h-2 bg-theme my-8 rounded-full " />

              {/* Social Activity */}
              <p className="text-xl font-body text-theme mb-6 " >Recent Activity</p>
              <div className="space-y-6" >
                {activities.map((activity, i) => (
                  <SocialActivityCard activity={activity} key={i} />
                ))}
              </div>

              <div className="flex items-center justify-center py-4 " >
                <button onClick={() => {navigate("/friends")}} className="w-32 h-10 font-body bg-theme rounded-xl shadow-[rgba(0,0,15,0.5)_10px_5px_4px_0px] hover:scale-110 duration-500 " >
                  View All
                </button>
              </div>

            </div>
          </div>

        </div>


      </div>
    </div>
  );
};

export default HomePage;
