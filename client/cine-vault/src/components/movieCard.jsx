import React from "react";
import { useNavigate } from "react-router-dom";
import placeholder from "../assets/placeholder.jpg"
import '../pages/theme.css';

const MovieCard = ({movie, index}) => {

  const navigate = useNavigate();

  const handleOnClick = (id) => {
    navigate(`/movie/${id}`)
  }

  return (
    <div key={index} onClick={() => handleOnClick(movie.movie_id ? movie.movie_id : movie.id)} className="transition-all ease-in-out duration-500 transform hover:scale-110 min-w-[175px] max-w-[175px] bg-transparent flex-shrink-0 cursor-pointer ">
      <img src={movie.poster ? movie.poster : (movie.image ? movie.image : (movie.profile_picture ? movie.profile_picture : placeholder) )} alt={movie.title} className={`w-full object-cover mb-2 ${movie.profile_picture ? "rounded-full" : "rounded-3xl h-64"} `} />
      <h2 className={`text-md truncate mx-2 font-body font-semibold text-theme`}> {movie.title} </h2>
    </div>
  );
}

export default MovieCard;