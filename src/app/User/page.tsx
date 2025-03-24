"use client"
import React, { useState, useEffect } from 'react';

// This is for client component props
interface UserPageProps {
    params?: { userId?: string | undefined };
  }
export default function UserPage({ params }: UserPageProps) {

  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    client_number: '001',
    customer_number: '',
    customer_other_details: '',
    email: '',
    name: '',
    password: '',
    role: '',
    subscription: 'Gold',
    username: '',
  });

  // Determine if we're in edit mode based on URL parameter
  useEffect(() => {
    if (params?.userId) {
      setIsEditMode(true);
      fetchUserData(params.userId);
    }
  }, [params]);
  
  // Fetch user data if in edit mode
  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-users/${userId}`, {
        headers: {
          Accept: "application/json",
          "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Update form with user data
        setFormData({
          client_number: userData.client_number || '001',
          customer_number: userData.customer_number || '',
          customer_other_details: userData.customer_other_details || '',
          email: userData.email || '',
          name: userData.name || '',
          // Don't prefill password for security reasons
          password: '',
          role: userData.role || '',
          subscription: userData.subscription || 'Gold',
          username: userData.username || '',
        });
      } else {
        console.error('Failed to fetch user data');
        alert('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('An error occurred while fetching user data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Determine if this is a create or update request
      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/client-users/${params?.userId}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/client-users/`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Create submission data, conditionally including password
      let submissionData;
      if (isEditMode && !formData.password) {
        // If in edit mode and password is empty, omit the password field entirely
        const { password, ...dataWithoutPassword } = formData;
        submissionData = dataWithoutPassword;
      } else {
        // Otherwise include all fields
        submissionData = { ...formData };
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const successMessage = isEditMode ? 'User updated successfully!' : 'User created successfully!';
        alert(successMessage);
        
        // Redirect back to users list
        window.location.href = '/UserList';
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || (isEditMode ? 'Failed to update user' : 'Failed to create user')}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    window.location.href = '/UserList';
  };

  // Handle adding a custom role
  const handleAddRole = () => {
    if (newRole.trim()) {
      setFormData(prevData => ({
        ...prevData,
        role: newRole.trim()
      }));
      setNewRole('');
      setShowAddRole(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isEditMode ? 'Edit User' : 'Create User'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Client Number and Customer Number */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Client Number</label>
            <input
              type="text"
              name="client_number"
              value={formData.client_number}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Customer Number</label>
            <input
              type="text"
              name="customer_number"
              value={formData.customer_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 2: Email and Name */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 3: Username and Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password {isEditMode && "(Leave blank to keep current password)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  // Eye icon (crossed) when password is visible
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Eye icon when password is hidden
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Row 4: Role and Subscription */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <div className="flex items-center space-x-2">
              {!showAddRole ? (
                <>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    {formData.role && formData.role !== "ADMIN" && formData.role !== "USER" ? (
                      <option value={formData.role}>{formData.role}</option>
                    ) : null}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddRole(true)}
                    className="bg-blue-600 text-white p-2 rounded-lg  focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    +
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Enter role"
                    className="flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="bg-blue-600 text-white p-2 rounded-lg  focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRole(false)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Subscription</label>
            <input
              type="text"
              name="subscription"
              value={formData.subscription}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 5: Customer Other Details (Optional) */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Customer Other Details (Optional)</label>
            <input
              type="text"
              name="customer_other_details"
              value={formData.customer_other_details}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}