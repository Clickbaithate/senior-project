import { useEffect, useState } from "react";

const SearchPage = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch Movies
        const { data: moviesData, error: moviesError } = await supabase
          .from('Movies')
          .select()
          .ilike('title', `%${query}%`) // Case insensitive partial match
          .limit(10);

        if (moviesError) {
          console.warn('Error fetching movies:', moviesError);
        } else {
          setMovies(moviesData);
        }

        // Fetch Shows
        const { data: showsData, error: showsError } = await supabase
          .from('Shows')
          .select()
          .ilike('title', `%${query}%`) // Case insensitive partial match
          .limit(10);

        if (showsError) {
          console.warn('Error fetching shows:', showsError);
        } else {
          setShows(showsData);
        }

        // Fetch Users
        const { data: usersData, error: usersError } = await supabase
          .from('Users')
          .select()
          .ilike('username', `%${query}%`) // Case insensitive partial match for users
          .limit(10);

        if (usersError) {
          console.warn('Error fetching users:', usersError);
        } else {
          setUsers(usersData);
        }

      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResults();
  }, [query]); // Re-run when the query changes

  return (
    <div>
      {/* Display movies, shows, users here */}
      {/* Example: map through the results and render them */}
    </div>
  );
};

export default SearchPage;
