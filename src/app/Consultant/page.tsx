"use client"
import Head from 'next/head';
import Image from 'next/image';
import './consultant.css'
import loginImage from '../assets/logo.jpg';
import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Settings, User } from 'lucide-react';

export default function page() {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const [user, setUser] = useState({
        name: "",
        email: "",
        id: "",
        role: "",
    });

    const goToConsultantScreen = () => {
        router.push('/Dashboard');
    };

    const goToCXOScreen = () => {
        router.push('/CXO');
    };

    const handleLogout = () => {
        router.push('/');
    };
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };



    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUser({
                name: localStorage.getItem("loggedInUserName") || "",
                email: localStorage.getItem("loggedInUserEmail") || "",
                id: localStorage.getItem("loggedInUserId") || "",
                role: localStorage.getItem("loggedInUserRole") || "",
            });
        }
    }, []);
    return (
        <div>
            <div className="min-h-screen flex flex-col bg-gray-100">


                {/* Header/Navigation */}
                <header className="bg-gray-200 py-2 px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        {/* <div className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
            X
          </div> */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 cursor-pointer"
                                onClick={toggleDropdown} >
                                <User className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2" /> {/* User icon */}
                                <span className="text-black">{user.name || "Guest"}</span> {/* User email */}
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <a href="/Dashboard" className="text-blue-700 text-sm hover:underline">Consultant Screen</a>
                                <a href="/CXO" className="text-blue-700 text-sm hover:underline">CXO Screen</a>
                            </div>
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute left-0 top-16 w-88 bg-white border rounded-lg shadow-lg p-4 text-sm z-50"
                                >
                                    <p className="font-semibold text-gray-700">User Info</p>
                                    <hr className="my-2" />
                                    <p>Name: {user.name || "N/A"}</p>
                                    <p>Email: {user.email || "N/A"}</p>
                                    <p>ID: {user.id || "N/A"}</p>
                                    <p>Role: {user.role || "N/A"}</p>
                                </div>
                            )}

                        </div>
                    </div>


                    <div >
                        <button
                            onClick={handleLogout}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-red-400 rounded text-white"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-2">
                            <div >
                            <Image src={loginImage} alt="Login" className="logo" />
                            </div>
                        </div>
                        {/* <h1 className="text-2xl font-bold text-blue-700 mb-1">ONEVEGA Systems (India) Pvt. Ltd.</h1>
                        <p className="text-sm text-orange-500">Analytics Consulting & AI Business Solutions</p> */}
                    </div>

                    {/* Screen Options */}
                    <div className="flex justify-center gap-6 w-full max-w-3xl">
                        {/* Consultant Screen Card */}
                        <div className="  border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div
                                className="border rounded-md p-8 bg-white w-64 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                                onClick={goToConsultantScreen}
                            >
                                <h2 className="text-lg font-medium text-center mb-4">Consultant Screen</h2>
                                <div className="relative w-32 h-32">
                                    <div className="w-full h-full">
                                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                            <rect x="15" y="15" width="70" height="70" rx="10" fill="#C7D9FF" />
                                            <circle cx="35" cy="45" r="10" fill="#4F7BFF" />
                                            <circle cx="65" cy="45" r="10" fill="#4F7BFF" />
                                            <rect x="25" y="60" width="50" height="20" rx="10" fill="#4F7BFF" />
                                            <rect x="30" y="10" width="15" height="15" rx="2" fill="#4F7BFF" />
                                            <rect x="55" y="10" width="15" height="15" rx="2" fill="#4F7BFF" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CXO Screen Card */}
                        <div className="  border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div
                                className="border rounded-md p-8 bg-white w-64 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                                onClick={goToCXOScreen}
                            >
                                <h2 className="text-lg font-medium text-center mb-4">CXO Screen</h2>
                                <div className="relative w-32 h-32">
                                    <div className="w-full h-full">
                                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                            <circle cx="50" cy="35" r="15" fill="#4F7BFF" stroke="#C7F0E0" strokeWidth="4" />
                                            <path d="M30 75 Q50 55 70 75" stroke="#C7F0E0" strokeWidth="4" fill="none" />
                                            <rect x="35" y="50" width="30" height="35" rx="5" fill="#4F7BFF" />
                                            <rect x="40" y="55" width="20" height="5" fill="white" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

        </div>
    )
}
// pages/index.js