import { Client, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const FALLBACK_POSTER = "https://via.placeholder.com/300x450.png?text=No+Image";

// ✅ Update or create search entry
export const updateSearchCount = async (searchTerm, posterUrl, movieId) => {
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: (doc.count || 0) + 1,
      });

      console.log("✅ Updated count for:", searchTerm);
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        poster_url: posterUrl || FALLBACK_POSTER,
        movie_id: movieId || 0,
      });

      console.log("✅ Created new entry for:", searchTerm);
    }
  } catch (error) {
    console.error("❌ Error updating search count:", error.message);
  }
};

// ✅ Fetch top most searched movies (trending)
export const getMostSearched = async (limit = 10) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("count"),
      Query.limit(limit),
    ]);

    // Normalize into MovieCard-friendly format
    return response.documents.map((doc) => ({
      id: doc.movie_id || doc.$id,
      title: doc.searchTerm,
      poster_path: doc.poster_url
        ? doc.poster_url.replace("https://image.tmdb.org/t/p/w500", "")
        : null,
      poster_url: doc.poster_url || FALLBACK_POSTER,
    }));
  } catch (error) {
    console.error("❌ Error fetching most searched:", error.message);
    return [];
  }
};
