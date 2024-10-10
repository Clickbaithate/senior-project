import React, {  } from 'react';
import MovieCard from './movieCard';
import GenreCard from './genreCard';
import UserCard from './userCard';

const VerticalList = ({ movies, genres, users, theme = 'light' }) => {

  return (

    <div className=" mx-12 pt-4">



      {/* List */}
      <div className={`grid-cols-5 gap-[10px] grid space-x-4 overflow-x-auto py-4 px-4`} >
        {/* Movie */}
        {
          movies ? (
            movies.map((movie, index) => (
              <MovieCard movie={movie} theme={theme} index={index} key={index} />
            ))
          ) : (
            genres ? 
            (
              genres.map((genre, index) => (
                <GenreCard genre={genre} theme={theme} index={index} key={index} />
              ))
            )
            :
            users.map((user, index) => (
              <UserCard user={user} theme={theme} index={index} key={index} />
            ))
          )
        }


      </div>


      
    </div>

  );
};

export default VerticalList;
