import React from "react";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({
  movie: { title, vote_average, poster_path, release_date, original_language },
}) => {
  // Extract year from release_date (if available)
  const releaseYear = release_date
    ? new Date(release_date).getFullYear()
    : "N/A";

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Poster */}
      <img
        src={poster_path ? `${IMAGE_BASE_URL}${poster_path}` : "/no-image.png"}
        alt={title}
        className="w-full h-[400px] object-cover"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Movie Info */}
      <div className="absolute bottom-0 w-full p-4 text-white">
        <h3 className="text-lg font-bold truncate">{title}</h3>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm mt-1 text-gray-300">
          <span>⭐ {vote_average?.toFixed(1)}</span>
          <span>🎬 {releaseYear}</span>
          <span>🌐 {original_language?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
