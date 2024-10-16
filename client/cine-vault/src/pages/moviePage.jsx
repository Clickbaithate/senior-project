import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faFolderPlus, faEyeSlash, faEye, faEnvelope, faE, } from "@fortawesome/free-solid-svg-icons";
import HorizontalList from "../components/HorizontalList";
import { useNavigate } from "react-router-dom";
import bannerPlaceholder from "../assets/placeholder.jpg";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./theme.css";

const MoviePage = () => {

  const { id } = useParams();

  const navigate = useNavigate();
  const [temp, setTemp] = useState("text-black");
  const [user, setUser] = useState(null);
  const [isToggled, setIsToggled] = useState(localStorage.getItem("theme") === "dark");
  const [movie, setMovie] = useState();
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState();

  useEffect(() => {

    setMovie(null);
    setLoading(false);
    setTrendingMovies(null);
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn(sessionError);
        return;
      }

      if (session) {
        const { data, error } = await supabase
          .from("Users")
          .select()
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.warn("Error fetching profile:", error);
        } else if (data) {
          setUser(data);
          const userTheme = data.theme_settings;
          setIsToggled(userTheme);
        }
      }

      if (true) {
        const { data, error } = await supabase
        .from("Movies")
        .select()
        .eq("movie_id", id)
        .single();
        if (error) {
          console.warn("Error Fetching Movie: ", error);
        }
        else if (data) {
          setMovie(data);
          setLoading(true);
        }
      }

      const randomOffset = Math.floor(Math.random() * Math.max(0, 100000 - 20));
      const { data, error } = await supabase
      .from("Movies")
      .select()
      .range(randomOffset, randomOffset + 19)
      if (error) {
        console.warn("Error Fetching Trending Movies: ", error);
      }
      else if (data) {
        setTrendingMovies(data);
      }

    };

    fetchProfile();
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dark #2D2E39
  // Dark Contrast #25262F

  // Light #FFFFFF
  // Light Contrast #E4E4E4

  return (
    loading ? 
    <div className={``}>
      <div className={`relative h-[1000px] flex flex-col `} >
        {/* Top Half */}
        <div className="relative flex flex-1 justify-end items-start rounded-br-3xl rounded-bl-3xl">
          {/* Background Image */}
          <div className={`opacity-25 w-full h-full rounded-br-3xl rounded-bl-3xl`} style={{ background: `url(${movie.banner ? movie.banner : bannerPlaceholder})`, backgroundSize: "contain" }} ></div>

          {/* Exit Button */}
          <button onClick={() => handleClose()} className="absolute top-8 right-12 z-20" >
            {" "}
            {/* Increased z-index */}
            <FontAwesomeIcon className={`w-12 h-12 transition-all ease-in-out duration-500 transform hover:scale-125  `} icon={faCircleXmark} />
          </button>
        </div>

        {/* Bottom Half */}
        <div className={`flex flex-col flex-1 overflow-hidden `} >
          <div className="flex-1 flex items-center overflow-y-auto">
            {/* Content Section */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center">
              <img src={movie.image} className="shadow-[rgba(0,0,15,0.5)_10px_15px_4px_0px] min-h-[540px] max-h-[540px] max-w-[380px] rounded-2xl ml-20" />
              <div className={`flex flex-col ml-10 mr-4 font-body ${movie.overview.length > 440 ? "mt-96" : "mt-72"} `}>
                {/* Row for title and buttons */}
                <div className="flex items-center space-x-12">
                  <div className={`text-5xl max-w-[600px] `}>
                    {movie.title}
                  </div>
                  <button onClick={() => handleClose()} className={`transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full  shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]`} >
                    <FontAwesomeIcon className={`w-6 h-6 `} icon={faFolderPlus} />
                  </button>
                  <button onClick={() => handleClose()} className={`transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full  shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]`} >
                    <FontAwesomeIcon className={`w-6 h-6 `} icon={faEye} />
                  </button>
                  <button onClick={() => handleClose()} className={`transition-all ease-in-out duration-500 transform hover:scale-110 px-3 py-3 flex rounded-full  shadow-[rgba(0,0,0,0.5)_5px_10px_4px_0px]`} >
                    <FontAwesomeIcon className={`w-6 h-6 `} icon={faEnvelope} />
                  </button>
                </div>
                <div className="flex items-center space-x-4 mt-8">
                  <div className={``}>{movie.release_date}</div> 
                  <div className={``}>*</div>
                  <div className={``}>
                    {movie.genres}
                  </div>
                  <div className={``}>*</div>
                  <div className={``}>
                    {movie.runtime} Minutes
                  </div>
                  <div className={``}>*</div>
                  <div className={``}>
                    {movie.rating} / 10 ⭐
                  </div>
                </div>
                <div className={`text-gray-400 py-2`}>
                  {movie.tagline}
                </div>
                <div className={` text-2xl`}>Overview</div>
                <div className={` text-wrap py-2`}>{movie.overview}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      <div
        className={` relative z-10 mt-[-100px] pl-3.5`} >
        <h1 className={` text-4xl font-body ml-16`}>Similar Movies</h1>
        {trendingMovies 
        ?
        <HorizontalList className="" movies={trendingMovies} /> 
        :
        <div className="flex items-center justify-center" >
          <DotLottieReact src="https://lottie.host/beb1704b-b661-4d4c-b60d-1ce309d639d5/7b3aX5rJYc.json" loop autoplay className="w-32 h-32" />
        </div>
        }
      </div>
    </div>
    :
    <div className=" flex flex-col justify-center items-center h-screen" >
      <DotLottieReact src="https://lottie.host/b7f01c92-fc7a-4e49-9153-2e457a694eb2/bHswRE20Tl.json" loop autoplay className="w-56 h-56" />
    </div>
  );
};

export default MoviePage;
