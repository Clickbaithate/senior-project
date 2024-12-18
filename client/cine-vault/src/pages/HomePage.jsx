import React, { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import Sidebar from "./Sidebar";
import SearchBar from "../components/SearchBar";
import HomePageCarousel from "../components/HomePageCarousel";
import "./theme.css";
import ChallengeCard from "../components/ChallengeCard";
import SocialActivityCard from "../components/SocialActivityCard";
import { useNavigate } from "react-router-dom";
import HomeMovieCard from "../components/HomeMovieCard";
import HomeShowCard from "../components/HomeShowCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [recentlyVisitedItems, setRecentlyVisitedItems] = useState([]);
  const [visitedItems, setVisitedItems] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn("Session error:", sessionError);
          return;
        }

        if (session) {
          const { data, error } = await supabase
            .from("Users")
            .select("user_id")
            .eq("user_id", session.user.id);

          if (error) {
            console.warn("Error fetching user:", error);
            return;
          }

          if (data && data.length > 0) {
            setUser(data[0].user_id);
          } else {
            console.warn("No user found with the given session ID.");
          }
        }

        // Fetch challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from("Challenges")
          .select("*");

        if (challengesError) {
          console.error("Error fetching challenges:", challengesError);
          setError("Failed to load challenges");
        } else {
          setChallenges(challengesData);
        }

        // Fetch recently visited data if user is available
        if (user) {
          const { data: visitedData, error: visitedError } = await supabase
            .from("Recently_Visited")
            .select("visited_1, visited_2, visited_3")
            .eq("user_id", user)
            .single();

          if (visitedError) {
            console.error("Error fetching recently visited:", visitedError);
          } else if (visitedData) {
            const visitedItems = [
              visitedData.visited_1,
              visitedData.visited_2,
              visitedData.visited_3,
            ].filter(Boolean);

            // Update the state with visited items
            setVisitedItems(visitedItems);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred");
      }
    };

    fetchData();
  }, [user]); // Only run when user state changes

  const activities = [
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has liked your playlist!",
      time: "5 minutes ago!",
    },
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has sent you a message!",
      time: "15 minutes ago!",
    },
    {
      pfp: "https://i.pinimg.com/736x/09/bc/4f/09bc4f197d4b954573756f457d3ab788.jpg",
      message: "Iron Man has sent you a friend request!",
      time: "30 minutes ago!",
    },
  ];

  return (
    <div className={`min-h-screen bg-theme`}>
      <Sidebar />
      <div className="ml-[100px]">
        <SearchBar placeholder="Search..." />

        <div className="flex">
          {/* Left Side */}
          <div className="bg-theme h-screen w-2/3 flex flex-col items-center justify-start space-y-6">
            <HomePageCarousel
              images={[
                "https://images8.alphacoders.com/137/1374985.jpg",
                "https://wallpapers.com/images/hd/animation-movies-1197-x-704-wallpaper-nlgddr8e66de5g41.jpg",
                "https://i.ytimg.com/vi/8zWK0tFUJ58/maxresdefault.jpg",
                "https://wallpapers.com/images/hd/lego-ninjago-coloured-ninjas-tvvjxferzmu2gdx6.jpg",
              ]}
            />

            <div className="flex space-x-12">
              {challenges.slice(0, 3).map((challenge, index) => (
                <ChallengeCard key={index} challenge={challenge} />
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-theme h-[90%] w-1/3 flex items-center justify-center mt-4">
            <div className="accent w-[90%] h-[95%] px-12 py-8 rounded-3xl">
              {/* Recently Visited Items */}
              <p className="text-xl font-body text-theme mb-6">Recently Visited</p>
              <div className="flex flex-col items-center justify-center space-y-4">
                {visitedItems.length > 0 ? (
                  visitedItems.map((item, i) =>
                    item.type === "movie" ? (
                      <HomeMovieCard movie={item.id} key={i} />
                    ) : (
                      <HomeShowCard show={item.id} key={i} />
                    )
                  )
                ) : (
                  <p>No recently visited items</p>
                )}
              </div>

              {/* Horizontal Bar */}
              <div className="w-full h-2 bg-theme my-8 rounded-full" />

              {/* Social Activity */}
              <p className="text-xl font-body text-theme mb-6">Recent Activity</p>
              <div className="space-y-6">
                {activities.map((activity, i) => (
                  <SocialActivityCard activity={activity} key={i} />
                ))}
              </div>

              <div className="flex items-center justify-center py-4">
                <button
                  onClick={() => {
                    navigate("/friends");
                  }}
                  className="w-32 h-10 font-body bg-theme rounded-xl shadow-[rgba(0,0,15,0.5)_10px_5px_4px_0px] hover:scale-110 duration-500"
                >
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