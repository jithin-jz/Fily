import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount, getMostSearched } from "../appwrite";
import Slider from "react-slick"; // ✅ carousel

const API_KEY = import.meta.env.VITE_TMDB_API;
const API_BASE_URL = "https://api.themoviedb.org/3";

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [mostSearched, setMostSearched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Debounce user input
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovieList(data.results || []);

      // ✅ only track searches
      if (query && data.results?.length > 0) {
        const firstMovie = data.results[0];
        await updateSearchCount(
          query,
          firstMovie.poster_path
            ? `https://image.tmdb.org/t/p/w500${firstMovie.poster_path}`
            : null,
          firstMovie.id
        );
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch movies when debounced term changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // ✅ Fetch most searched
  useEffect(() => {
    const fetchMostSearched = async () => {
      try {
        const results = await getMostSearched();
        setMostSearched(results || []);
      } catch (err) {
        console.error("Error fetching most searched:", err);
      }
    };
    fetchMostSearched();
  }, []);

  // ✅ Slider settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    swipeToSlide: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024, // tablet
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 640, // mobile
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <main className="relative">
      {/* Global Overlay Spinner */}
      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <Spinner />
        </div>
      )}

      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* 🔥 Most Searched Section */}
        {mostSearched.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
            Trending Now
            </h2>

            <div className="mt-6">
              <Slider {...sliderSettings}>
                {mostSearched.map((movie) => (
                  <div key={movie.id} className="px-2">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </Slider>
            </div>
          </section>
        )}

        {/* ✅ All/Search Movies */}
        <section className="all-movies mt-10">
          <h2 className="mt-[40px]">
            {searchTerm ? "Search Results" : "All Movies"}
          </h2>

          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
