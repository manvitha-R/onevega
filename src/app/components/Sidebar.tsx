"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UrlObject, format } from 'url';
// import {  UrlObject } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ChevronDown, ChevronRight, Plus, Edit2, Trash2, ChartLine, ChevronLeft, X, User, Trash } from 'lucide-react';
import Popup from "./Popup";
import logo from '../../app/assets/logo.jpg';
import axios from 'axios';
// import PopupNotification from './PopupNotification';
// import ConfirmationDialog from './ConfirmationDialog';
import Spinner from './Spinner';
import './Toast.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define a type for the menu names
// type MenuName = 'dataAnalysis' | 'rag' | null;


// Define interfaces for our data structures
interface Board {
  name: string;
  is_active: boolean;
  path?: string; // Added path for dynamic routing
}

interface MainBoard {
  id(id: string): React.Key | null | undefined;
  main_board_id: string;
  name: string;

  boards: {
    [key: string]: Board;
  };
}

// Update the SelectedBoard type to match exactly what we're using
type SelectedBoard = {
  mainBoardId: string;
  boardId?: string;
  boardName?: string;

} | null;  // Allow null as a possible value

interface SidebarProps {
  clientUserId: string | number; // Explicitly define the type here
}
const Sidebar: React.FC<SidebarProps> = ({ }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default state for sidebar
  const [sidebarWidth, setSidebarWidth] = useState(isSidebarOpen ? 250 : 60); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  interface Collection {
    collection_name: string;
    id: string;
    name: string;
  }

  const [clientUserId, setClientUserId] = useState<string | null>(null);


  // const isDeleting = deletingBoards.size > 0; // Define isDeleting based on deletingBoards state
  // const [, setLoadingSubmenus] = useState<Record<string, boolean>>({});
  const [loadingMainBoard, setLoadingMainBoard] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setActiveCollectionId] = useState<string | null>(null);
  // Update the state definition to use the SelectedBoard type
  const [selectedBoard, setSelectedBoard] = useState<SelectedBoard>(null);
  const [navItems, setNavItems] = useState<MainBoard[]>([]);
  const [activeMainBoard, setActiveMainBoard] = useState<string | null>(null);
  // const [openMainBoards, setOpenMainBoards] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainBoardName, setMainBoardName] = useState("");
  // const [loading,] = useState(false);
  // const [, setIsBoardLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [, setMainBoardId] = useState(null);
  // Add state for popup notifications
  const [, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: 'info' | 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'info' // 'info', 'success', or 'error'
  });
  // Confirmation dialog state
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    message: '',
    boardId: '',
    mainBoardId: ''
  });

  // const userRole = localStorage.getItem('loggedInUserRole'); // Get userRole from localStorage
  console.log("User Role from localStorage:", userRole); // Debugging: Verify role value
  console.log("Sidebar Open:", isSidebarOpen); // Debugging: Verify sidebar state

  // Toggle function (for your existing toggle button)
  const toggleSidebar = () => {
    const newWidth = sidebarWidth > 100 ? 64 : 250; // Toggle between collapsed and expanded
    setSidebarWidth(newWidth);
    setIsSidebarOpen(newWidth > 100);
  };

 

// Add these event handlers
const startResizing = (e: { preventDefault: () => void; }) => {
  e.preventDefault();
  setIsResizing(true);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);
};


const handleMouseMove = (e: { clientX: any; }) => {
  if (isResizing) {
    const newWidth = e.clientX;
    // Set minimum and maximum width constraints
    if (newWidth >= 60 && newWidth <= 400) {
      setSidebarWidth(newWidth);
    }
  }
};

const stopResizing = () => {
  setIsResizing(false);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
};

// Add cleanup for event listeners in useEffect
useEffect(() => {
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };
}, [isResizing]); // Only re-run if isResizing changes

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = sessionStorage.getItem('currentUserData');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setUserRole(userData.userRole);
          setClientUserId(userData.userId);
          console.log("User Role from sessionStorage:", userData.userRole);
        } catch (error) {
          console.error("Error parsing user data from sessionStorage:", error);
        }
      }
    }
  }, []);




  // Function to show notification
  // const showNotification = (message: any, type: 'info' | 'success' | 'error' = 'info') => {
  //   setNotification({
  //     isOpen: true,
  //     message,
  //     type
  //   });
  // };

  // Function to close notification
  // const closeNotification = () => {
  //   setNotification(prev => ({
  //     ...prev,
  //     isOpen: false
  //   }));
  // };


  // Function to show confirmation dialog
  // const showConfirmation = (message: string, boardId: string, mainBoardId: string) => {
  //   setConfirmation({
  //     isOpen: true,
  //     message,
  //     boardId,
  //     mainBoardId
  //   });
  //   // Force a re-render to ensure the dialog appears
  //   setTimeout(() => {
  //     const dialogState = {
  //       isOpen: true,
  //       message,
  //       boardId,
  //       mainBoardId
  //     };
  //     setConfirmation(dialogState);
  //     console.log("Confirmation state updated:", dialogState);
  //   }, 0);
  // };

  // Function to close confirmation dialog
  // const closeConfirmation = () => {
  //   setConfirmation(prev => ({
  //     ...prev,
  //     isOpen: false
  //   }));
  // };


  // Use this effect to debug confirmation state changes
  React.useEffect(() => {
    console.log("Confirmation state changed:", confirmation);
  }, [confirmation]);

  useEffect(() => {
    if (activeMainBoard) {
      router.push("/Dashboard");
    }
  }, [activeMainBoard]);


  const handleSave = async () => {
    try {
      if (!mainBoardName.trim()) {
        toast.error("Please enter a name for the main board.");
        return;
      }

      // Get user data from sessionStorage with proper type checking
      let currentUserData: { userId?: string } = {};
      if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem('currentUserData');
        currentUserData = storedData ? JSON.parse(storedData) : {};
      }

      const clientUserId = currentUserData.userId;

      if (!clientUserId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      // Show the spinner
      // setIsLoading(true);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/main-boards/?client_user_id=${clientUserId}`;

      const requestBody = {
        client_user_id: parseInt(clientUserId),
        main_board_type: "ANALYSIS",
        name: mainBoardName,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
        },
        body: JSON.stringify(requestBody),
      });

      // Parse response JSON once and store it
      const data = await response.json();

      if (!response.ok) {
        console.error("Error saving main board:", data);
        toast.error(`Failed to save the main board: ${JSON.stringify(data)}`);
        return;
      }

      // Use the already parsed data
      console.log("Main board saved successfully:", data);
      toast.success("Main board saved successfully!");

      // Reset the main board name and ID
      setMainBoardName("");
      setMainBoardId(data.id);

      // Close the modal
      setIsModalOpen(false);

      // Fetch updated navigation items before navigation
      await fetchNavItems();

      // Navigate to the dashboard
      router.push("/Container");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please check your connection or try again later.");
    } finally {
      // Hide the spinner
      // setIsLoading(false);
    }
    // updateSidebarWidth();
  };

  // New function to generate dynamic page
  const generateDynamicPage = async (mainBoardId: string, boardId: string, boardName: string) => {
    try {
      // Get user data from sessionStorage with proper type checking
      let currentUserData: { userId?: string } = {};
      if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem('currentUserData');
        currentUserData = storedData ? JSON.parse(storedData) : {};
      }

      const userId = currentUserData.userId;
      if (!userId) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
          body: JSON.stringify({
            main_board_id: mainBoardId,
            board_id: boardId,
            name: boardName,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Server error:", errorBody);
        throw new Error(`Failed to create dynamic page: ${response.status}`);
      }

      const pageData = await response.json();

      // Update local state with new page path
      setNavItems((prevItems) =>
        prevItems.map((item) =>
          item.main_board_id === mainBoardId
            ? {
              ...item,
              boards: {
                ...item.boards,
                [boardId]: {
                  ...item.boards[boardId],
                  path: pageData.path,
                },
              },
            }
            : item
        )
      );

      return pageData.path;
    } catch (error) {
      console.error("Error creating dynamic page:", error);
      return null;
    }
  };


  const handleCreateBoard = async (boardData: { mainBoardId: string; boardName: string }) => {
    try {
      const userId = sessionStorage.getItem("loggedInUserId");
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        throw new Error("User ID not found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
          body: JSON.stringify({
            main_board_id: boardData.mainBoardId,
            name: boardData.boardName,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Server error:", errorBody);
        toast.error(`Failed to create board: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newBoard = await response.json();
      toast.success("Board created successfully!");

      // Set active board and switch to "Manage Tables" tab
      setActiveBoardId(newBoard.boardId);
      setActiveTab("prompts");

      // Navigate to container
      router.push("/Container");

      return newBoard;
    } catch (error) {
      console.error("Board creation error:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
      throw error;
    }
    // updateSidebarWidth();
  };


  const handleDeleteMainBoard = async (e: React.MouseEvent, mainBoardId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick

    // Use toast confirm instead of window.confirm
    toast.info(
      <div>
        <p>Are you sure you want to delete this main board? This action cannot be undone.</p>
        <div className="toast-actions">
          <button
            onClick={() => {
              deleteMainBoard(mainBoardId);
              toast.dismiss();
            }}
            className="confirm-btn"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: true,
        closeOnClick: false,
        draggable: false
      }
    );
  };

  // Track loading state
  const [deletingBoards, setDeletingBoards] = useState<{ [key: string]: boolean }>({});
  // const [refreshCounter, setRefreshCounter] = useState(0);

  // Separate function to handle the actual deletion


  const deleteMainBoard = async (mainBoardId: string) => {
    try {
      // Set loading state for this specific board
      setDeletingBoards(prev => ({ ...prev, [mainBoardId]: true }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/main-boards/main_board_delete_cascade/${mainBoardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success("Main board deleted successfully");

        // Trigger a refresh by incrementing the refresh trigger
        setRefreshTrigger(prev => prev + 1);

        // Reset active board if needed
        if (activeMainBoard === mainBoardId) {
          setActiveMainBoard('');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete main board");
      }
    } catch (error) {
      console.error("Error deleting main board:", error);
      toast.error("An error occurred while deleting the main board");
    } finally {
      // Clear loading state regardless of outcome
      setDeletingBoards(prev => {
        const updated = { ...prev };
        delete updated[mainBoardId];
        return updated;
      });
    }
  };

  const handlePlusClick = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    mainBoardId: string) => {
    event.stopPropagation();
    // Now TypeScript knows this is a valid SelectedBoard type
    setSelectedBoard({ mainBoardId });
    setShowModal(true);
  };

  const handleEditClick = (boardId: string, mainBoardId: string) => {
    // Ensure navItems is defined and is an array
    if (!Array.isArray(navItems)) {
      console.error("navItems is not an array");
      return;
    }

    // Find the main board with the matching main_board_id
    const mainBoard = navItems.find((item) => item.main_board_id === mainBoardId);

    if (!mainBoard) {
      console.error("Main board not found");
      return;
    }

    // Ensure boards is defined and is an object
    if (typeof mainBoard.boards !== "object" || mainBoard.boards === null) {
      console.error("Boards is not an object");
      return;
    }

    // Get the board data using boardId
    const boardData = mainBoard.boards[boardId];

    if (!boardData) {
      console.error("Board not found");
      return;
    }

    // Set the selected board data and open the modal
    setSelectedBoard({
      mainBoardId,
      boardId,
      boardName: boardData.name,
    });
    setShowModal(true);
  };

  // const handleEditClick = (boardId: string, mainBoardId: string) => {
  //   const boardData = navItems
  //     .find((item) => item.main_board_id === mainBoardId)
  //     ?.boards[boardId];

  //   if (boardData) {
  //     setSelectedBoard({
  //       mainBoardId,
  //       boardId,
  //       boardName: boardData.name,
  //     });
  //     setShowModal(true);
  //   }
  // };


  const closeModal = () => {
    setShowModal(false);
    setSelectedBoard(null);  // This is now properly typed
  };

  // Updated handleDelete function that uses the custom confirmation
  const handleDelete = async (boardId: string, mainBoardId: string) => {
    try {
      // Use toast for confirmation with custom buttons
      const confirmDelete = await new Promise((resolve) => {
        toast(
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-gray-800 mb-4">Are you sure you want to delete this board?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  resolve(false);
                  toast.dismiss();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  toast.dismiss();
                }}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>,
          {
            autoClose: false, // Don't auto-dismiss
            closeOnClick: false,
            draggable: false,
          }
        );
      });

      if (!confirmDelete) return;

      // Get user data from sessionStorage
      let currentUserData: { userId?: string } = {};
      if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem('currentUserData');
        currentUserData = storedData ? JSON.parse(storedData) : {};
      }

      const userId = currentUserData.userId;
      if (!userId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/${boardId}?user_id=${userId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete board:', errorData);
        toast.error(`Failed to delete board: ${errorData.message || "Unknown error"}`);
        return;
      }

      // Optimized state update
      setNavItems((prevNavItems) =>
        prevNavItems.map((item) =>
          item.main_board_id === mainBoardId
            ? {
              ...item,
              boards: Object.fromEntries(
                Object.entries(item.boards).filter(([key, board]) =>
                  key !== boardId && board.is_active
                ),
              )
            }
            : item
        )
      );

      toast.success("Board deleted successfully!");
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error("An error occurred while deleting the board.");
    }
  };


  const fetchNavItems = useCallback(async () => {
    try {
      console.log("Attempting to fetch nav items...");

      // Get the user ID from sessionStorage with detailed logging
      const userDataString = sessionStorage.getItem('currentUserData');
      console.log("User data string from sessionStorage:", userDataString);

      if (!userDataString) {
        console.error("User session data not found. Please log in again.");

        // Add fallback to localStorage for debugging
        const localStorageUserId = localStorage.getItem("loggedInUserId");
        console.log("Fallback - checking localStorage userId:", localStorageUserId);

        if (localStorageUserId) {
          console.log("Using fallback userId from localStorage");

          // Use the localStorage value temporarily to make it work
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/main-boards/get_all_info_tree?client_user_id=${localStorageUserId}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
              },
              cache: "no-store",
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Navigation items fetched successfully (fallback):", data);
            setNavItems(data);

            // Don't show error since we recovered
            return;
          }
        }

        toast.error("User session data not found. Please log in again.");
        return;
      }

      const userData = JSON.parse(userDataString);
      console.log("Parsed user data:", userData);

      // Debug which field name is used for the user ID
      console.log("Available fields:", Object.keys(userData));
      console.log("userId field:", userData.userId);
      console.log("user_id field:", userData.user_id);
      console.log("id field:", userData.id);

      // Try different possible field names
      const clientUserId = userData.userId || userData.user_id || userData.id;

      if (!clientUserId) {
        console.error("User ID not found in session data. Please log in again.");
        toast.error("User ID not found. Please log in again.");
        return;
      }

      console.log("Fetching navigation items for user ID:", clientUserId);

      // Fetch main boards and boards from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/get_all_info_tree?client_user_id=${clientUserId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
          cache: "no-store", // Prevent caching to always get fresh data
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Navigation items fetched successfully:", data);
        setNavItems(data); // Update state with fetched data
      } else {
        console.error("Failed to fetch main boards and boards:", response.statusText);
        toast.error("Failed to load navigation data");
      }
    } catch (error) {
      console.error("Error fetching main boards and boards:", error);
      toast.error("Error loading navigation data");
    }
  }, []);

  // Add a refreshTrigger state at the top of your component:


  // Then update the useEffect to include refreshTrigger in dependencies:
  useEffect(() => {
    fetchNavItems();
  }, [fetchNavItems, refreshTrigger]);

  // Add a forceRefresh function that can be called after board creation:
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };



  // Fetch collections when component mounts
  useEffect(() => {
    fetchCollections();
  }, []);

  const toggleMainBoard = (mainBoardId: string) => {
    setActiveMainBoard(prevState => prevState === mainBoardId ? null : mainBoardId);
    setShowSubMenu(false); // Close the Document Service submenu when a main board is clicked
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleBoardClick = async (boardId: string) => {
    // setLoadingSubmenus((prev) => ({ ...prev, [boardId]: true })); // Set loading state for the submenu
    setActiveBoardId(boardId);

    // Simulate an async operation (e.g., fetching board details)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
    } catch (error) {
      console.error('Error fetching board details:', error);
      toast.error('Error loading board details');
    } finally {
      // setLoadingSubmenus((prev) => ({ ...prev, [boardId]: false })); // Reset loading state after operation
    }
  };

  const toggleSubMenu = async () => {
    setShowSubMenu(!showSubMenu);

    // If submenu is opening and collections are not yet loaded
    if (!showSubMenu && collections.length === 0) {
      // setIsLoading(true);

      try {
        await fetchCollections(); // Replace with your API function
      } catch (error) {
        setError("Failed to load collections");
      } finally {
        // setIsLoading(false); // Hide loading once data is fetched
      }
    }
  };

  const openAddDialog = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    setShowAddDialog(true);
  };

  const closeAddDialog = () => {
    setShowAddDialog(false);
    setNewCollectionName('');
    setError(null);
  };




  // Function to fetch collections from API
  const fetchCollections = async () => {
    try {
      // setIsLoading(true);
      const response = await axios.get('http://143.110.180.27:8000/collections');
      console.log('Fetched collections:', response.data);
      setCollections(response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    } finally {
      // setIsLoading(false);
    }
  };


  const createCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    // setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://143.110.180.27:8000/collections', {}, {
        params: {
          collection_name: newCollectionName.trim()
        }
      });

      console.log('Collection created:', response.data);

      // Get the new collection data
      const newCollection = response.data;

      // Update the collections list
      const updatedCollections = [...collections, newCollection];
      setCollections(updatedCollections);

      // Close the dialog
      closeAddDialog();

      // Method 1: Using proper TypeScript typing with UrlObject
      const url: UrlObject = {
        pathname: '/chat',
        query: { collection_id: newCollection.id }
      };
      router.push(format(url));
      // Set as active collection
      setActiveCollectionId(newCollection.id);

    } catch (err) {
      console.error('Error creating collection:', err);

      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Failed to create collection');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      // setIsLoading(false);
    }
  };


  const handleCollectionClick = (collection: Collection) => {
    // Handle collection selection
    console.log('Selected collection:', collection);
    // Add your logic here (e.g., navigate to collection details)
  };


  return (


    <div
      ref={sidebarRef}
      className="h-screen bg-blue-900 text-white flex flex-col relative transition-all duration-300"
      style={{
        width: `${sidebarWidth}px`,
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Sidebar Toggle Button */}
      {/* <button onClick={toggleSidebar} className="p-2 text-white hover:bg-teal-800 focus:outline-none">
        <Menu className="w-6 h-6" />
      </button> */}
      {/* Logo Section */}
      {/* {isSidebarOpen && ( */}

      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {isSidebarOpen && (
          <Image src={logo} alt="GBUSINESS.AI Logo" width={150} height={150} />
        )}
        {/* <h1 className={`text-xl font-bold transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
          GBUSINESS.AI
        </h1> */}
        {/* Toggle Button (Always Visible) */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-white hover:bg-blue-800 focus:outline-none"
        >
          {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
      </div>
      {/* Add this resize handle at the end of the sidebar div */}




      {/* )} */}

      {/* Create Main Board Button */}
      {/* Button to Open Modal */}
      {/* Display the client user ID if needed */}
      {/* {clientUserId && (
        <p className="text-sm text-blue-300 mt-2">
          User ID: {clientUserId}
        </p>
      )} */}
      {isSidebarOpen && userRole?.toLowerCase() === 'admin' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 m-4 rounded"
        >
          Create Main Board
        </button>
      )}



      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create Main Board</h2>
            <input
              style={{ color: "black" }}
              type="text"
              value={mainBoardName}
              onChange={(e) => setMainBoardName(e.target.value)}
              placeholder="Enter Main Board Name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded`}
                disabled={isLoading}
              >
                Save

                {/* {isLoading ? "Saving..." : "Save"} */}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {isLoading && <Spinner />} */}
      {/* Navigation Section */}
      {/* {isSidebarOpen && ( */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <div className="mb-4">

            <div className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              <Link href="/Dashboard" passHref>
                {isSidebarOpen && <span className="ml-2">Dashboard</span>}
              </Link>
            </div>
            {navItems.map((item) => (
              <div key={String(item.main_board_id)} className="mb-4">
                {/* Main Board Header */}
                <div
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeMainBoard === String(item.main_board_id) ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => toggleMainBoard(String(item.main_board_id))}
                >
                  <div className="flex items-center">
                    {item.boards && Object.keys(item.boards).some((boardId) => item.boards[boardId].is_active) ? (
                      activeMainBoard === String(item.main_board_id) ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2"/>
                      )
                    ) : null}
                    {isSidebarOpen && <span className="ml-2">{item.name}</span>}
                  </div>
                  <div className="flex space-x-2">
                    <Plus
                      className="w-4 h-4 hover:text-blue-400"
                      onClick={(e) => handlePlusClick(e, String(item.main_board_id))}
                    />
                    {deletingBoards[String(item.main_board_id)] ? (
                      <Spinner /> // Your spinner component
                    ) : (
                      <Trash2
                        className="w-4 h-4 hover:text-red-400"
                        onClick={(e) => handleDeleteMainBoard(e, String(item.main_board_id))}
                      />
                    )}
                  </div>

                </div>

                {/* Boards Dropdown */}
                {activeMainBoard === String(item.main_board_id) && isSidebarOpen && (
                  <div className="ml-6 mt-2 space-y-2">
                    {loadingMainBoard === String(item.main_board_id) ? (
                      <div className="flex justify-center">
                        {/* <div className="spinner"></div>  */}
                      </div>
                    ) : (
                      // Render boards once loaded
                      Object.keys(item.boards)
                        .filter((boardId) => item.boards[boardId].is_active)
                        .map((boardId) => (
                          <div
                            key={boardId}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                              activeBoardId === boardId ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
                            }`}
                            onClick={() => handleBoardClick(boardId)}
                          >
                            {/* Board Link */}
                            <Link
                              href={{
                                pathname: '/Container',
                                query: {
                                  main_board_id: item.main_board_id,
                                  board_id: boardId,
                                },
                              }}
                              className="dropdown-link text-white"
                            >
                              {item.boards[boardId].name}
                            </Link>

                            {/* Edit and Delete Icons */}
                            <div className="flex space-x-2">
                              <Edit2
                                className="w-4 h-4 hover:text-blue-400 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(boardId, item.main_board_id);
                                }}
                              />
                              <Trash2
                                className="w-4 h-4 hover:text-red-400 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(boardId, item.main_board_id);
                                }}
                              />
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            ))}




            {isSidebarOpen && userRole?.toLowerCase() === "admin" && (
              <div className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                <Link href="/UserList" passHref className="ml-2">User</Link>
              </div>
            )}
          </div>
        </div>

      </div>


      {/* )} */}


      {/* Logout Section */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-gray-400 rounded text-white"
          >
            Logout
          </button>
        </div>
      )}


      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedBoard?.boardId ? 'Edit Board' : 'New Board'}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {/* Add your modal content here */}
            {showModal && selectedBoard && (
              <div
                className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                onClick={closeModal}
              >
                <div
                  className="modal-content bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="modal-close-btn absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                  <Popup
                    mainBoardId={selectedBoard.mainBoardId}
                    boardId={selectedBoard.boardId || null}
                    boardName={selectedBoard.boardName || ''}
                    onSubmit={handleCreateBoard}
                    closeModal={closeModal}
                    refreshNavItems={forceRefresh} // Use the forceRefresh function here
                  />
                </div>
              </div>
            )}

            {/* {showModal && selectedBoard && (
              <div className="modal-overlay" onClick={closeModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="modal-close-btn"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                  <Popup
                    mainBoardId={selectedBoard.mainBoardId}
                    boardId={selectedBoard.boardId || null}
                    boardName={selectedBoard.boardName || ''}
                    onSubmit={handleCreateBoard}
                    closeModal={closeModal}
                  />
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}





      {/* Add Collection Dialog */}
      {showAddDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center"
          onClick={closeAddDialog} // Close when clicking outside
        >
          {/* Dialog box - stop propagation to prevent closing when clicking inside */}
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 w-80 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Add New Collection</h3>
              <button
                onClick={closeAddDialog}
                className="p-1 hover:bg-gray-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Collection name"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                autoFocus // Automatically focus the input
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeAddDialog}
                className="px-3 py-1 mr-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* {isLoading ? 'Creating...' : 'Create'} */}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resize handle - positioned at the right edge */}

      <div
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-gray-700 opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={startResizing}
      />

    </div>



  )

};

export default Sidebar;




// function setMainBoardId(_id: string) {
//   throw new Error(`Setting main board ID to: ${_id}`);
// }

// function setBoards(arg0: (prevBoards: any) => any) {
//   throw new Error('Function not implemented.');
// }

// function setIsDragging(arg0: boolean) {
//   throw new Error('Function not implemented.');
// }

function setActiveTab(arg0: string) {
  throw new Error('Function not implemented.');
}

