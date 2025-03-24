"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../CXO/CXO.module.css'; // Use CSS modules for styling
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import Spinner from '../components/Spinner';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
);

// Define types for the data
interface Board {
    name: string;
    is_active: boolean;
    path?: string; // Added path for dynamic routing
}

interface MainBoard {
    main_board_id: string;
    name: string;
    boards: {
        [key: string]: Board;
    };
}

interface Prompt {
    prompt_text: string;
    id: string;
    prompt_title: string;
    prompt_content: string;
    user_name: string;
    created_at: string;
    // Add other properties as needed
}

export default function CXO() {
    const [navItems, setNavItems] = useState<MainBoard[]>([]); // To store fetched data
    const [selectedMainBoardId, setSelectedMainBoardId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBoardModal, setShowBoardModal] = useState(false); // First modal (board modal)
    const [showPromptsModal, setShowPromptsModal] = useState(false); // Second modal (prompts modal)
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [promptsLoading, setPromptsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0); // Track current prompt index
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null); // Track selected prompt
    const [newPromptName, setNewPromptName] = useState(''); // Input field for prompt
    const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for textarea
    const [activeTab, setActiveTab] = useState("prompts");
    const [, setShowCharts] = useState(false); // State to manage active tab
    const [isRunClicked, setIsRunClicked] = useState(false);
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');


    interface ChartData {
        chart_type: string;
        data_format: ChartDataFormat;
        insight: string[];
    }
    interface ChartDataFormat {
        labels: string[];
        categories?: string[];
        values: number[] | number[][];
        isStacked?: boolean;
    }

    type RunResult = {
        message: string[];
        table: {
            columns: string[];
            data: string[][];
        };
        charts: ChartData[];
    };

    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);



    const [user, setUser] = useState({
        name: "",
        email: "",
        id: "",
        role: "",
    });
    // Fetch main boards from the API
    // useEffect(() => {
    //     const fetchNavItems = async () => {
    //         try {
    //             Get the clientUserId from localStorage
    //             const clientUserId = localStorage.getItem('loggedInUserId');
    //             if (!clientUserId) {
    //                 console.error('User ID not found. Please log in again.');
    //                 return;
    //             }

    //             // Fetch main boards and boards from the API
    //             const response = await fetch(
    //                 `${process.env.NEXT_PUBLIC_API_URL}/main-boards/get_all_info_tree?client_user_id=${clientUserId}`,
    //                 {
    //                     method: 'GET',
    //                     headers: {
    //                         Accept: 'application/json',
    //                         'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
    //                     },
    //                 }
    //             );

    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setNavItems(data); // Update state with fetched data
    //             } else {
    //                 console.error('Failed to fetch main boards and boards:', response.statusText);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching main boards and boards:', error);
    //         } finally {
    //             setLoading(false); // Stop loading
    //         }
    //     };

    //     fetchNavItems();
    // }, []);



    const handleRunPrompt = async () => {
        setIsLoading(true);
        setIsRunClicked(true); // Set to true when Run is clicked

        // Validate input
        if (!newPromptName?.trim()) {
            console.error("Error: Prompt cannot be empty");
            alert("Please enter a valid prompt.");
            setIsLoading(false);
            return;
        }

        // Use selectedBoardId from the component's state
        if (!selectedBoardId) {
            console.error("Error: Board ID is missing");
            alert("Board ID is required to run the prompt.");
            setIsLoading(false);
            return;
        }

        try {
            const url = new URL(
                `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/run_prompt_v2?`
            );

            // Append parameters
            url.searchParams.append("input_text", newPromptName.trim());
            url.searchParams.append("board_id", selectedBoardId); // Use selectedBoardId
            url.searchParams.append("user_name", "Shashi Raj");
            url.searchParams.append("use_cache", "true");

            console.log("Making request to:", url.href);

            // Make the POST request with Axios
            const response = await axios.post(
                url.href,
                {
                    input_text: newPromptName.trim(),
                    board_id: selectedBoardId, // Use selectedBoardId
                    user_name: "Shashi Raj",
                    use_cache: true,
                },
                {
                    headers: {
                        "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
                    },
                }
            );

            // Process the API response
            if (response?.data) {
                console.log("Prompt run successfully:", response.data);
                setRunResult(response.data); // Set the result to display it

                // Check if the user asked for charts
                const chartKeywords = ["chart", "visualization"];
                const responseDetails = response.data.detail?.toLowerCase() || "";
                if (response.data.message?.length > 0) {
                    setActiveTab("message"); // Set active tab to 'message' if message exists
                } else if (response.data.table?.columns?.length > 0) {
                    setActiveTab("table"); // Set active tab to 'table' if table data exists
                } else if (response.data.charts?.length > 0) {
                    setActiveTab("charts"); // Set active tab to 'charts' if chart data exists
                }
                console.log("Response Details:", responseDetails); // Debugging

                // Determine if charts are needed based on prompt or response details
                const shouldShowCharts =
                    chartKeywords.some((keyword) =>
                        newPromptName.toLowerCase().includes(keyword)
                    ) ||
                    chartKeywords.some((keyword) => responseDetails.includes(keyword));

                console.log("Should Show Charts:", shouldShowCharts); // Debugging
                setShowCharts(shouldShowCharts); // Display the chart if applicable
            } else {
                console.warn("Warning: API returned no data.");
                alert("No data was returned from the server.");
            }
        } catch (error: unknown) {
            // Handle errors based on error type
            if (axios.isAxiosError(error)) {
                console.error("Axios Error:", error.response?.data || error.message);
                alert(
                    `Server Error (${error.response?.status || "Unknown"}): ${error.response?.data?.message || error.message || "An error occurred"
                    }`
                );
            } else if (error instanceof Error) {
                console.error("Error:", error.message);
                alert(`Error: ${error.message}`);
            } else {
                console.error("Unknown Error:", error);
                alert("An unknown error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false); // Reset loading state after API call (success or error)
        }
    };
    // Fetch prompts when a board is selected
    useEffect(() => {
        const fetchPrompts = async () => {
            if (!selectedBoardId) return;

            setPromptsLoading(true);
            setError(null);
            console.log("Fetching prompts for board ID:", selectedBoardId);

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/boards/${selectedBoardId}`,
                    {
                        headers: {
                            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error Response:", errorText);
                    throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Fetched prompts data:", data);

                // Check if data is an array
                if (!Array.isArray(data)) {
                    console.error("Expected array but got:", typeof data);
                    setPrompts([]);
                    throw new Error("Invalid response format: Expected an array of prompts");
                }

                // Handle empty array
                if (data.length === 0) {
                    console.log("No prompts found for this board");
                    setPrompts([]);
                    return;
                }

                // Inspect the first item to detect the data structure
                const firstItem = data[0];
                console.log("First prompt structure:", firstItem);

                setPrompts(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "An unknown error occurred");
                console.error("Error fetching prompts:", error);
            } finally {
                setPromptsLoading(false);
            }
        };

        fetchPrompts();
    }, [selectedBoardId]);

    // Handle main board click
    const handleMainBoardClick = (mainBoardId: string) => {
        setSelectedMainBoardId(mainBoardId); // Set the selected main board ID
    };

    // Handle back button click
    const handleBackClick = () => {
        setActiveTab("prompts"); // Set the active tab to "prompts"
        setSelectedMainBoardId(null); // Clear the selected main board ID
    };

    // Handle board click to show board modal
    const handleBoardClick = (boardId: string) => {
        setActiveTab("prompts"); // Set the active tab to "prompts"
        setSelectedBoardId(boardId);
        setShowBoardModal(true); // Open board modal
    };

    // Handle close board modal
    const handleCloseBoardModal = () => {
        setShowBoardModal(false);
        setSelectedBoardId(null);
        setActiveTab("prompts"); // Set the active tab to "prompts"
        setSelectedPrompt(null); // Clear selected prompt
        setNewPromptName('');
        setIsRunClicked(false); // Clear input field
    };

    // Handle view prompts button click
    const handleViewPromptsClick = () => {
        setShowPromptsModal(true); // Open prompts modal
    };

    // Handle close prompts modal
    const handleClosePromptsModal = () => {
        setShowPromptsModal(false);

        setCurrentPromptIndex(0); // Reset prompt index
    };


    const handlePromptClick = (prompt: Prompt) => {
        setNewPromptName(prompt.prompt_text); // Populate the input field with the selected prompt
        setShowPromptsModal(false); // Close the prompts modal
        if (textareaRef.current) {
            textareaRef.current.focus(); // Focus the input field
        }
    };


    // Handle next prompt
    const handleNextPrompt = () => {
        if (currentPromptIndex < prompts.length - 1) {
            setCurrentPromptIndex(currentPromptIndex + 1);
        }
    };

    // Handle previous prompt
    const handlePreviousPrompt = () => {
        if (currentPromptIndex > 0) {
            setCurrentPromptIndex(currentPromptIndex - 1);
        }
    };

    // Find the selected main board
    const selectedMainBoard = navItems.find(
        (item) => item.main_board_id === selectedMainBoardId
    );

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    const getPieData = (chartData: ChartData) => {
        if (!chartData || !chartData.data_format) {
            console.log("No chart data found.");
            return {
                labels: [],
                datasets: [{ data: [], backgroundColor: [] }],
            };
        }

        const { labels, values } = chartData.data_format;

        return {
            labels,
            datasets: [
                {
                    data: values as number[], // Ensure values is treated as an array of numbers
                    backgroundColor: labels.map(() => getRandomColor()),
                },
            ],
        };
    };


    const getChartData = (chartData: ChartData, type: "bar" | "line") => {
        if (!chartData || !chartData.data_format) {
            console.log("No chart data found.");
            return {
                labels: [],
                datasets: [],
            };
        }

        const { labels, categories, values } = chartData.data_format;

        return {
            labels,
            datasets: (categories || []).map((category, index) => ({
                label: category,
                data: (values as number[][]).map((value) => value[index]), // Ensure values is treated as a 2D array
                backgroundColor: getRandomColor(),
            })),
        };
    };


    const getRandomColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return hsl(hue, { hue }, 70, 60, null, 0);
    };


    const handleLogout = () => {
        router.push('/');
    };
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleRePrompt = async () => {
        setIsLoading(true); // Start loading

        try {
            // Make the API request to get a new prompt
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/re_prompt`,
                null, // No request body
                {
                    params: {
                        input_text: newPromptName,
                        board_id: selectedBoardId,
                    },
                    headers: {
                        'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
                    },
                }
            );

            console.log('API Response:', response.data);

            // Assuming the new prompt name is in response.data.newPromptName
            const fetchedPromptName = response.data.newPromptName || response.data;

            // Update the state with the fetched prompt
            setNewPromptName(fetchedPromptName);

            // Focus the textarea after fetching the prompt
            if (textareaRef.current) {
                textareaRef.current.focus(); // Focus works now with correct typing
            }
        } catch (error) {
            // Type guard for AxiosError or Error
            if (axios.isAxiosError(error)) {
                // Axios-specific error
                console.error('Axios Error:', error.response?.data || error.message);
                alert(
                    `Server Error (${error.response?.status || 'Unknown'}): ${error.response?.data?.message || error.message || 'An error occurred'
                    }`
                );
            } else if (error instanceof Error) {
                // Generic JavaScript Error
                console.error('Error:', error.message);
                alert(`Error: ${error.message}`);
            } else {
                // Unknown error type
                console.error('Unknown Error:', error);
                alert('An unknown error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
        }
    };


    // Close dropdown when clicking outside
    // The problematic hooks should also be here, with all other useEffects
    //  useEffect(() => {
    //   function handleClickOutside(event: MouseEvent) {
    //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //       setShowDropdown(false);
    //     }
    //   }
    //   document.addEventListener("mousedown", handleClickOutside);
    //   return () => {
    //     document.removeEventListener("mousedown", handleClickOutside);
    //   };
    // }, []);

    // useEffect(() => {
    //   if (typeof window !== "undefined") {
    //     setUser({
    //       name: localStorage.getItem("loggedInUserName") || "",
    //       email: localStorage.getItem("loggedInUserEmail") || "",
    //       id: localStorage.getItem("loggedInUserId") || "",
    //       role: localStorage.getItem("loggedInUserRole") || "",
    //     });
    //   }
    // }, []);


    return (
        <div>
            <div>
                <header className="bg-gray-200 py-2 px-4 flex justify-between items-center">
                    <div className="flex items-center">

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 cursor-pointer"
                                onClick={toggleDropdown} >
                                <User className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2" /> {/* User icon */}
                                {/* <span className="text-black">{user.email || "Guest"}</span> User email */}
                                {/* <span className="text-black">{loggedInUserEmail}</span> User email */}
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
            </div>
            <h1>CXO</h1>
            <div className={styles.dashboardContainer}>
                {!selectedMainBoardId ? (
                    // Display main boards
                    <div className={styles.mainboards}>
                        {navItems.map((item) => (
                            <div
                                key={item.main_board_id}
                                className={styles.card}
                                onClick={() => handleMainBoardClick(item.main_board_id)}
                            >
                                {item.name} {/* Display main board name */}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Display boards for the selected main board
                    selectedMainBoard && (
                        <div className={styles.boardsContainer}>
                            <div className={styles.headerContainer}>
                                <button onClick={handleBackClick} className={styles.backButton}>
                                    ← Back
                                </button>
                                <h2>{selectedMainBoard.name} Boards</h2>
                            </div>
                            <div className={styles.boardsRow}>
                                {Object.keys(selectedMainBoard.boards)
                                    .filter((boardId) => selectedMainBoard.boards[boardId].is_active) // Filter active boards
                                    .map((boardId) => (
                                        <div
                                            key={boardId}
                                            className={styles.card}
                                            onClick={() => handleBoardClick(boardId)}
                                        >
                                            {selectedMainBoard.boards[boardId].name}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Board Modal (First Modal) */}
            {showBoardModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Run Your Prompt</h3>
                            <button
                                className={styles.closeButton}
                                onClick={handleCloseBoardModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            {/* Input Field */}
                            <textarea
                                className={styles.inputField}
                                placeholder="Dynamic Prompt Entry..."
                                value={newPromptName}
                                rows={8}
                                ref={textareaRef}
                                onChange={(e) => setNewPromptName(e.target.value)}
                            />

                            {/* Action Buttons */}
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    // className={styles.viewPromptsButton}
                                    onClick={handleViewPromptsClick}
                                >
                                    View Prompts
                                </button>
                                {/* <button
                  onClick={handleRunPrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={!newPromptName.trim() || isLoading}
                >
                  {isLoading ? "Running..." : "Run"}
                </button> */}
                                <button
                                    onClick={handleRePrompt}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    disabled={isLoading} // Disable the button while loading
                                >
                                    Reprompt {isLoading && <Spinner />}
                                </button>
                                <button
                                    onClick={handleRunPrompt}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    disabled={!newPromptName.trim() || isLoading}
                                >
                                    {isLoading ? "Running..." : "Run"}
                                </button>
                            </div>


                            {isRunClicked && runResult && (
                                <div className="run-results mt-6">
                                    {/* Tab buttons for navigation */}
                                    <div className="tabs flex justify-end space-x-2 mb-4">
                                        {['message', 'table', 'charts'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`tab-button px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="tab-content max-h-[60vh] overflow-y-auto">
                                        {activeTab === 'message' && (
                                            <div className="message-tab">
                                                {runResult?.message && runResult.message.length > 0 ? (
                                                    <div>
                                                        <h4 className="font-medium text-lg">Message:</h4>
                                                        <p>{runResult.message[0]}</p>
                                                    </div>
                                                ) : (
                                                    <p>No message found.</p>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'table' && runResult.table && (
                                            <div className="table-tab">
                                                {runResult?.table && runResult.table.columns?.length > 0 ? (
                                                    <div className="mt-4">
                                                        {/* <button
                                          onClick={downloadExcel}
                                          className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                          Download as excel
                                        </button> */}
                                                        {/* <h4 className="font-medium text-lg">Table Data:</h4> */}
                                                        <div className="max-h-94 overflow-y-auto border border-gray-300 rounded">
                                                            <table className="min-w-full table-auto">
                                                                <thead>
                                                                    <tr>
                                                                        {runResult.table.columns.map((col, idx) => (
                                                                            <th key={idx} className="p-2 border-b text-left">
                                                                                {col}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {runResult.table.data.length > 0 ? (
                                                                        runResult.table.data.map((row, rowIdx) => (
                                                                            <tr key={rowIdx}>
                                                                                {row.map((cell, cellIdx) => (
                                                                                    <td key={cellIdx} className="p-2 border-b">
                                                                                        {cell}
                                                                                    </td>
                                                                                ))}
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td
                                                                                colSpan={runResult.table.columns.length}
                                                                                className="text-center p-2"
                                                                            >
                                                                                No data available.
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p>No table data found.</p>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'charts' && runResult.charts && (
                                            <div className="charts-tab">
                                                {/* <button
                                      onClick={downloadPPT}
                                      className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                                    >
                                      Download as PPT
                                    </button> */}
                                                {/* <p className="text-center">Charts will be displayed here.</p> */}

                                                {/* Flex container for charts */}
                                                <div className="my-4 flex flex-wrap justify-center gap-6">
                                                    {runResult.charts.map((chart: ChartData, index: number) => {
                                                        switch (chart.chart_type) {
                                                            case 'pie':
                                                                return (
                                                                    <div key={index} className="w-full max-w-[400px] flex-1 chart-container">
                                                                        <h5 className="text-lg font-semibold text-center">Pie Chart</h5>
                                                                        <div style={{ height: "400px" }}>
                                                                            <Pie data={getPieData(chart)}
                                                                                options={{
                                                                                    maintainAspectRatio: false,
                                                                                    plugins: { legend: { display: true, position: "top" } }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                                                            <h6 className="text-md font-semibold mb-2">Insights:</h6>
                                                                            <ul className="list-disc list-inside">
                                                                                {chart.insight.map((insight, insightIndex) => (
                                                                                    <li key={insightIndex} className="text-sm">
                                                                                        {insight}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            case 'bar':
                                                                return (
                                                                    <div key={index} className="w-full max-w-[500px] flex-1 chart-container">
                                                                        <h5 className="text-lg font-semibold text-center">Bar Chart</h5>
                                                                        <div style={{ height: "400px" }}>
                                                                            <Bar
                                                                                data={getChartData(chart, 'bar')}
                                                                                options={{
                                                                                    maintainAspectRatio: false,
                                                                                    plugins: { legend: { display: true, position: "top" } },
                                                                                    scales: { y: { beginAtZero: true } },
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                                                            <h6 className="text-md font-semibold mb-2">Insights:</h6>
                                                                            <ul className="list-disc list-inside">
                                                                                {chart.insight.map((insight, insightIndex) => (
                                                                                    <li key={insightIndex} className="text-sm">
                                                                                        {insight}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            case 'line':
                                                                return (
                                                                    <div key={index} className="w-full max-w-[500px] flex-1 chart-container">
                                                                        <h5 className="text-lg font-semibold text-center">Line Chart</h5>
                                                                        <div style={{ height: "400px" }}>
                                                                            <Line
                                                                                data={getChartData(chart, 'line')}
                                                                                options={{
                                                                                    maintainAspectRatio: false,
                                                                                    plugins: { legend: { display: true, position: "top" } },
                                                                                    scales: { y: { beginAtZero: true } },
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                                                            <h6 className="text-md font-semibold mb-2">Insights:</h6>
                                                                            <ul className="list-disc list-inside">
                                                                                {chart.insight.map((insight, insightIndex) => (
                                                                                    <li key={insightIndex} className="text-sm">
                                                                                        {insight}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                );

                                                            default:
                                                                return null;
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Prompts Modal (Second Modal) */}
            {showPromptsModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.promptsModal} ${styles.slideInLeft}`}>
                        <div className={styles.modalHeader}>
                            <h3>Prompts</h3>
                            <button
                                className={styles.closeButton}
                                onClick={handleClosePromptsModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            {promptsLoading ? (
                                <div className={styles.loadingOverlay}>
                                    <div className={styles.spinner}></div>
                                </div>
                            ) : error ? (
                                <div className={styles.error}>{error}</div>
                            ) : prompts.length === 0 ? (
                                <div>No prompts found for this board.</div>
                            ) : (
                                <div className={styles.promptContainer}>
                                    {/* Scrollable Prompts List */}
                                    <div className={styles.scrollablePrompts}>
                                        {prompts.map((prompt, index) => (
                                            <div
                                                key={prompt.id || index}
                                                className={styles.promptCard}
                                                onClick={() => handlePromptClick(prompt)}
                                            >
                                                <div className={styles.promptNumber}>
                                                    {index + 1}. {/* Display the prompt number */}
                                                </div>
                                                <h4>{prompt.prompt_title}</h4>
                                                <p>{prompt.prompt_text}</p>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function hsl(hue: number, p0: { hue: number; }, saturation: number, lightness: number, $: any, p1: number) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}