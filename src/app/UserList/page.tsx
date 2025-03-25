

"use client"; // Mark this as a Client Component

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  role: string;
  email: string;
  name: string;
  password: string;
  subscription: string;
  customer_number: string;
  customer_other_details: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching users from API..."); // Debug log
      
      try {
        // Make the fetch call, but track the raw response too
        const response = await fetch('https://llm-backend-new-35486280762.us-central1.run.app/client-users/', {
          headers: {
            Accept: 'application/json',
            'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
          },
        });
        
        console.log("API Response status:", response.status); // Debug log
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Try to parse the response and log it
        const rawText = await response.text();
        console.log("Raw API response:", rawText);
        
        let data;
        try {
          data = JSON.parse(rawText);
          console.log("Parsed data:", data);
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          throw new Error(`Failed to parse response: ${rawText.substring(0, 100)}...`);
        }
        
        // Check if data is actually an array
        if (!Array.isArray(data)) {
          console.error("Data is not an array:", data);
          if (data && typeof data === 'object') {
            // Maybe it's wrapped in another object?
            if (Array.isArray(data.users)) {
              data = data.users;
            } else if (data.data && Array.isArray(data.data)) {
              data = data.data;
            } else {
              throw new Error(`Response is not an array: ${JSON.stringify(data).substring(0, 100)}...`);
            }
          } else {
            throw new Error(`Response is not an array: ${JSON.stringify(data).substring(0, 100)}...`);
          }
        }
        
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle delete user
  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`https://llm-backend-new-35486280762.us-central1.run.app/client-users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
        },
      });

      if (response.ok) {
        // Remove the deleted user from the list
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit user
 // Handle edit user
const handleEdit = (userId: string) => {
    // Navigate to the edit page with query parameter
    router.push(`/EditUserPage/User?id=${userId}`);
  };
  // Debug component - shows API response for troubleshooting
  const DebugPanel = () => (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
      <h3 className="font-bold mb-2">Debug Information:</h3>
      <p>Loading state: {isLoading ? 'Loading...' : 'Completed'}</p>
      <p>Error state: {error || 'None'}</p>
      <p>User count: {users.length}</p>
      <div className="mt-2">
        <p className="font-bold">Raw user data:</p>
        <pre className="bg-gray-200 p-2 mt-1 overflow-auto max-h-40 text-xs">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">User List</h1>
          </div>
          <div className="bg-white shadow-md rounded-lg p-8 flex justify-center items-center">
            <div className="text-center">
              <p className="text-lg mb-4">Loading users...</p>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
          <DebugPanel />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">User List</h1>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Error loading users:</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
          <DebugPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">User List</h1>
          <Link
            href="/User"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create User
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{user.username || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.role || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-4">
                        {/* Edit Icon */}
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>

                        {/* Delete Icon */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* <DebugPanel /> */}
      </div>
    </div>
  );
};

export default UserList;