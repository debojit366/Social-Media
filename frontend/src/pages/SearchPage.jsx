import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const query = searchParams.get("q");

useEffect(() => {
  const getResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if(!token) {
          console.error("Token missing in local storage");
          setLoading(false);
          return;
      }

      const res = await axios.get(`http://localhost:8080/api/v1/users/search?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setResults(res.data);
      // console.log(res.data);
    } catch (err) {

      console.log("Search error info:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (query && query.trim() !== "") {
    getResults();
  } else {
    setResults([]);
  }
}, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          Search results for: <span className="text-indigo-600">"{query}"</span>
        </h1>

        {/* Loading State */}
        {loading && <p className="text-center text-gray-500">Searching...</p>}

        {/* Results List */}
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((user) => (
              <Link 
                to={`/profile/${user._id}`} 
                key={user._id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-xl bg-indigo-100 overflow-hidden flex-shrink-0">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600">
                      {user.firstName[0]}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>

                {/* View Profile Button */}
                <button className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  View Profile
                </button>
              </Link>
            ))
          ) : (
            !loading && <div className="text-center py-20 text-gray-400 font-medium">No users found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;