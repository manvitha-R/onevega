"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ChevronDown, ChevronRight, Settings, Plus, Database, BookOpen, BarChart3, Edit2, Trash2, X, ChartLine, Menu, ChevronLeft } from 'lucide-react';
import Popup from "./Popup";

// Define a type for the menu names
// type MenuName = 'dataAnalysis' | 'rag' | null;


// Define interfaces for our data structures
interface Board {
  name: string;
  is_active: boolean;
  path?: string; // Added path for dynamic routing
}

interface MainBoard {
  id(id: any): React.Key | null | undefined;
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
const Sidebar: React.FC<SidebarProps> = ({ clientUserId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  // Update the state definition to use the SelectedBoard type
  const [selectedBoard, setSelectedBoard] = useState<SelectedBoard>(null);
  const [navItems, setNavItems] = useState<MainBoard[]>([]);
  const [activeMainBoard, setActiveMainBoard] = useState<string | null>(null);
  const [openMainBoards, setOpenMainBoards] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainBoardName, setMainBoardName] = useState("");
  const [loading, setLoading] = useState(false);



  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const handleSave = async () => {
    try {
      if (!mainBoardName.trim()) {
        alert("Please enter a name for the main board.");
        return;
      }

      const clientUserId = localStorage.getItem("loggedInUserId");
      if (!clientUserId) {
        alert("User ID not found. Please log in again.");
        return;
      }

      const url = `http://143.110.180.27:8002/main-boards/?client_user_id=${clientUserId}`;

      const requestBody = {
        client_user_id: parseInt(clientUserId),
        main_board_type: "ANALYSIS",
        name: mainBoardName
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
        alert(`Failed to save the main board: ${JSON.stringify(data)}`);
        return;
      }

      // Use the already parsed data
      console.log("Main board saved successfully:", data);
      alert("Main board saved successfully!");
      setMainBoardName("");
      setMainBoardId(data.id);

    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please check your connection or try again later.");
    }
  };

  // New function to generate dynamic page
  const generateDynamicPage = async (mainBoardId: string, boardId: string, boardName: string) => {
    try {
      const userId = localStorage.getItem("loggedInUserId"); // Get user ID from localStorage
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const response = await fetch(
        `http://143.110.180.27:8002/main-boards/boards/?user_id=${userId}`,
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
      const userId = localStorage.getItem("loggedInUserId"); // Get user ID from localStorage
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const response = await fetch(
        `http://143.110.180.27:8002/main-boards/boards/?user_id=${userId}`,
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

      // Enhanced error handling
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Server error:", errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newBoard = await response.json();

      // Generate dynamic page
      const pagePath = await generateDynamicPage(
        boardData.mainBoardId,
        newBoard.boardId,
        boardData.boardName
      );

      // Update navigation items
      setNavItems((prevItems) =>
        prevItems.map((item) =>
          item.main_board_id === boardData.mainBoardId
            ? {
              ...item,
              boards: {
                ...item.boards,
                [newBoard.boardId]: {
                  name: boardData.boardName,
                  is_active: true,
                  path: pagePath,
                },
              },
            }
            : item
        )
      );

      closeModal();

      // Optionally navigate to the new page
      if (pagePath) {
        router.push("/Dashboard");
      }
    } catch (error) {
      console.error("Board creation error:", error);
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

  // Rest of your component code remains the same...
  const handleDelete = async (boardId: string, mainBoardId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this board?");
    if (!confirmDelete) return;

    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem("loggedInUserId");
      if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
      }

      // Construct the URL with boardId and userId as query parameters
      const url = `http://143.110.180.27:8002/main-boards/boards/${boardId}?user_id=${userId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp', // Add API Key
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete board:', errorData);
        alert(`Failed to delete board: ${errorData.message || "Unknown error"}`);
        return;
      }

      // Update the frontend state to remove the deleted board
      setNavItems((prevNavItems) => {
        return prevNavItems.map((item) => {
          if (item.main_board_id === mainBoardId) {
            const updatedBoards = Object.keys(item.boards)
              .filter((key) => key !== boardId && item.boards[key].is_active)
              .reduce((acc, key) => {
                acc[key] = item.boards[key];
                return acc;
              }, {} as { [key: string]: Board });

            return { ...item, boards: updatedBoards };
          }
          return item;
        });
      });

      alert("Board deleted successfully!");
    } catch (error) {
      console.error('Error deleting board:', error);
      alert("An error occurred while deleting the board.");
    }
  };

  // useEffect(() => {
  //   const fetchNavItems = async () => {
  //     try {
  //       // const response = await fetch(
  //       //   `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/get_all_info_tree`,
  //       //   {
  //       //     method: "GET",
  //       //     headers: {
  //       //       Accept: "application/json",
  //       //     },
  //       //   }
  //       // );
  //       const response = await fetch('http://143.110.180.27:8002/main-boards/?client_user_id=001', {
  //         method: 'GET',
  //         headers: {
  //           'Accept': 'application/json',
  //           'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp', // Add the key here
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setNavItems(data); // Update the state with fetched data
  //       } else {
  //         console.error('Failed to fetch main boards:', response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching main boards:', error);
  //     }
  //   };

  //   fetchNavItems();
  // }, []);

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        // Get the clientUserId from localStorage
        const clientUserId = localStorage.getItem("loggedInUserId");
        if (!clientUserId) {
          console.error("User ID not found. Please log in again.");
          return;
        }

        // Fetch main boards and boards from the API
        const response = await fetch(
          `http://143.110.180.27:8002/main-boards/get_all_info_tree?client_user_id=${clientUserId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNavItems(data); // Update state with fetched data
        } else {
          console.error("Failed to fetch main boards and boards:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching main boards and boards:", error);
      }
    };

    fetchNavItems();
  }, []);
  // useEffect(() => {
  //   const fetchNavItems = async () => {
  //     try {
  //       const response = await fetch(`https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/get_all_info_tree`, {
  //         method: 'GET',
  //         headers: {
  //           'Accept': 'application/json',
  //         },
  //       });

  //       if (response.ok) {
  //         const data: MainBoard[] = await response.json();
  //         setNavItems(data);
  //       } else {
  //         console.error('Failed to fetch navigation data:', response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching navigation data:', error);
  //     }
  //   };

  //   fetchNavItems();
  // }, []);

  const toggleMainBoard = (mainBoardId: string) => {
    setActiveMainBoard(prevState => prevState === mainBoardId ? null : mainBoardId);
  };

  const handleLogout = () => {
    router.push('/');
  };
  return (
    <div className="h-screen bg-teal-900 text-white flex flex-col " >

      {/* Sidebar Toggle Button */}
      {/* <button onClick={toggleSidebar} className="p-2 text-white hover:bg-teal-800 focus:outline-none">
        <Menu className="w-6 h-6" />
      </button> */}
      {/* Logo Section */}
      {/* {isSidebarOpen && ( */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
      <h1 className={`text-xl font-bold transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
      GBUSINESS.AI
    </h1>
         {/* Toggle Button (Always Visible) */}
    <button
      onClick={toggleSidebar}
      className="p-2 text-white hover:bg-teal-800 focus:outline-none"
    >
      {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
    </button>
      </div>
      {/* )} */}

      {/* Create Main Board Button */}
      {/* Button to Open Modal */}
      {/* Display the client user ID if needed */}
      {clientUserId && (
        <p className="text-sm text-green-300 mt-2">
          User ID: {clientUserId}
        </p>
      )}
      {isSidebarOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 m-4 rounded"
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
                className={`${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
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
                    className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => toggleMainBoard(String(item.main_board_id))}
                  >
                    <div className="flex items-center">
                      {activeMainBoard === String(item.main_board_id) ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <span>{item.name}</span> {/* Display main board name */}
                    </div>
                    <Plus
                      className="w-4 h-4 hover:text-blue-400"
                      onClick={(e) => handlePlusClick(e, String(item.main_board_id))}
                    />
                  </div>

                  {/* Boards Dropdown */}
                  {activeMainBoard === String(item.main_board_id) && isSidebarOpen &&(

                    <div className="ml-6 mt-2 space-y-2">
                      {Object.keys(item.boards)
                        .filter((boardId) => item.boards[boardId].is_active)
                        .map((boardId) => (
                          <div
                            key={boardId}
                            className="flex items-center justify-between p-2 hover:bg-gray-800 rounded"
                          >
                            {/* Board Link */}
                            <Link
                              href={{
                                pathname: "/Container",
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
                                onClick={() => handleEditClick(boardId, item.main_board_id)}
                              />
                              <Trash2
                                className="w-4 h-4 hover:text-red-400 cursor-pointer"
                                onClick={() => handleDelete(boardId, item.main_board_id)}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
                <ChartLine className="w-4 h-4 mr-2" />
                {isSidebarOpen && <span className="ml-2">Docs Review</span>}
              </div>
            </div>
          </div>

        </div>
      {/* )} */}


      {/* Logout Section */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-teal-600 hover:bg-gray-400 rounded text-white"
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
    </div>




  )
};

export default Sidebar;



function setMainBoardId(id: any) {
  throw new Error('Function not implemented.');
}

