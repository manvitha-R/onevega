import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

interface PopupProps {
    mainBoardId: string;
    boardId?: string | null;
    boardName?: string;
    closeModal: () => void;
    onSubmit: (boardData: { 
      mainBoardId: string; 
      boardName: string; 
    }) => Promise<void>;
  }


  
interface Board {
  boardId: string;
  name: string;
  is_active: boolean;
  path?: string; // Optional field
}

interface MainBoard {
  main_board_id: string;
  name: string;
  boards: Record<string, Board>; // Key-value pair of boards
}

type NavItems = MainBoard[];

  const Popup: React.FC<PopupProps> = ({ 
    mainBoardId, 
    boardId = null, 
    boardName = '', 
    closeModal,
    onSubmit 
  }) => {

    const router = useRouter();
  const [newPrompt, setNewPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(boardName || '');
  const [navItems, setNavItems] = useState<NavItems>([]);

  const handleSavePrompt = async () => {
    // Input validation
    if (!name.trim()) {
      setError("Board name cannot be empty");
      return;
    }
  
    try {
      const userId = localStorage.getItem("loggedInUserId");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }
  
      const isEditMode = !!boardId;
      const url = isEditMode
        ? `http://143.110.180.27:8002/main-boards/boards/${boardId}?user_id=${userId}`
        : `http://143.110.180.27:8002/main-boards/boards/?user_id=${userId}`;
  
      const requestBody = {
        main_board_id: mainBoardId,
        name: name,
      };
  
      console.log("Request Payload:", requestBody);
  
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log("Response Status:", response.status);
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Server error response:", errorBody);
        throw new Error(
          isEditMode
            ? `Failed to update board: ${response.status}`
            : `Failed to create board: ${response.status}`
        );
      }
  
      const data = await response.json();
      console.log(isEditMode ? "Board updated:" : "Board created:", data);
  
      // Update the frontend state immediately
      setNavItems((prevItems) => {
        if (isEditMode) {
          // Update the existing board
          return prevItems.map((item) =>
            item.main_board_id === mainBoardId
              ? {
                  ...item,
                  boards: {
                    ...item.boards,
                    [boardId]: {
                      ...item.boards[boardId],
                      name: name, // Update the board name
                    },
                  },
                }
              : item
          );
        } else {
          // Add the new board to the state
          const newBoard = {
            main_board_id: mainBoardId,
            name: name,
            boards: {
              [data.id]: {
                boardId: data.id,
                name: name,
                is_active: true,
              },
            },
          };
          return [...prevItems, newBoard];
        }
      });
  
      // Close modal and optionally navigate
      closeModal();
      router.push("/Dashboard");
    } catch (error) {
      console.error("Board operation error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };
  // useEffect(() => {
  //   if (boardName) {
  //     setNewPrompt(boardName);
  //   }
  // }, [boardName]);

  // const handleSavePrompt = async () => {
  //   try {
  //     const isEditMode = !!boardId;
  //     const requestBody = {
  //       main_board_id: mainBoardId,
  //       name: newPrompt,
  //     };

  //     const url = isEditMode
  //       ? `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/${boardId}`
  //       : `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/`;

  //     const response = await fetch(url, {
  //       method: isEditMode ? 'PUT' : 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       throw new Error(isEditMode ? 'Failed to update the board' : 'Failed to save the board');
  //     }

  //     const data = await response.json();
  //     console.log(isEditMode ? 'Board updated:' : 'Board created:', data);
  //     closeModal();
  //     router.push('/dashboard');
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  // const handleSubmit = async () => {
  //   try {
  //     setError(null);
  //     if (!name.trim()) {
  //       setError("Board name cannot be empty");
  //       return;
  //     }

  //     await onSubmit({ 
  //       mainBoardId, 
  //       boardName: name 
  //     });
  //     closeModal();
  //   } catch (error) {
  //     console.error('Submission error:', error);
  //     setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  //   }
  // };


    return(
        <div>
           {/* <div className="popup-container">
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Board Name"
        className="popup-input"
      />
      {error && <div className="error-message">{error}</div>}
      <div className="popup-actions">
        <button onClick={handleSubmit}>
          {boardId ? 'Update' : 'Create'}
        </button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    </div> */}
  <div className="p-4">
      <h4 className="text-lg font-semibold mb-4">
        {boardId ? 'Edit Board Name' : 'Create Board Name'}
      </h4>
      <textarea
        placeholder="Enter Board Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(null);
        }}
        className="w-full p-2 border text-black rounded-md mb-4 min-h-[100px]"
      />
      {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}
      <div className="flex justify-end">
        <button
          onClick={handleSavePrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {boardId ? 'Update' : 'Save'}
        </button>

        <button
                    onClick={closeModal}
                    className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    Cancel
                </button>
      </div>
    </div>
        </div>
    )

}

export default Popup;

function setNavItems(arg0: (prevItems: any) => any) {
  throw new Error('Function not implemented.');
}
