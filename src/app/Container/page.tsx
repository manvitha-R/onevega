'use client';

import { useState, useEffect, SetStateAction, useRef, ReactNode } from "react";
import PptxGenJS from "pptxgenjs";
import { useSearchParams } from "next/navigation";
// import { MdManageSearch } from "react-icons/md";
import { FaPlay, FaPen, FaTrash } from "react-icons/fa";
import { FaFileUpload, FaCaretUp, FaCaretDown, FaUpload, FaTimes } from 'react-icons/fa';
import axios from "axios";
import React from "react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// import { useDropzone } from "react-dropzone";

import { Pie, Bar, Line } from "react-chartjs-2";
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  // ChartData,
} from "chart.js";
import Spinner from "../components/Spinner";
import { FiEdit, FiSave } from "react-icons/fi";
import { Settings, User } from "lucide-react";
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type Prompt = {
  created_by: string;
  // loggedInUserName: ReactNode;
  id: string;
  prompt_text: string;
  user_name?: string;
};

type RunResult = {
  message?: string[];
  table?: {
    columns: string[];
    data: string[][];
  };
  detail?: string;
};

// interface ConfigurationDetails {
//   key1: string;
//   key2: number;
//   // Add other properties as per the actual structure
// }

// interface Item {
//   id?: string;
//   name?: string;
//   configuration_details: ConfigurationDetails;
// }

interface Item {
  id?: string;
  name?: string;
  configuration_details: Record<string, string>;
}



interface ChartDataFormat {
  labels: string[];
  categories?: string[];
  values: number[] | number[][];
  isStacked?: boolean;
}

interface ChartData {
  chart_type: string;
  data_format: ChartDataFormat;
  insight: string[];
}


export default function Page() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("board_id");
  // type Prompt = {
  //   id: string;
  //   prompt_text: string;
  //   user_name: string;
  // };
  const [isDropdownOpenn, setIsDropdownOpenn] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [, setLoading] = useState(false);
  const [, setShowCharts] = useState(false);
  type TableRow = {
    id: string;
    table_name: string;
    table_description: string;
    files: { id: string; month_year: string; filename: string; created_at: string }[];
  };

  const [rows, setRows] = useState<TableRow[]>([]);

  // const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
  // const [data, setData] = useState([]);
  const [newPromptName, setNewPromptName] = useState("");
  const [error, setError] = useState<string | null>(null);
  // const [loadingManageTables, setLoadingManageTables] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModallOpen, setIsModallOpen] = useState(false);
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
  const [view,] = useState("manage-tables");
  const [isRunClicked, setIsRunClicked] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tableName: "",
    tableDescription: "",
  });
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [, setLoadingPromptPlay] = useState<string | null>(null);
  const [loadingPromptsRepository,] = useState(false);
  const [activeTab, setActiveTab] = useState("prompts"); // State to manage active tab
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<TableRow | null>(null);
  const [, setDocId] = useState<string | null>(null);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editRowKey, setEditRowKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({});
  type DocumentationItem = {
    id: string;
    name: string;
    configuration_details: Record<string, string>;
  };
  // const chartStyles = {
  //   medium: { width: '980px', height: '900px' },
  //   small: { width: '550px', height: '800px' },
  // };
  const [isOpen, setIsOpen] = useState(false);
  // const [editRowId, setEditRowId] = React.useState(null);
  // const [editValues, setEditValues] = React.useState({});

  // Toggle dropdown
  const handleToggleDropdown = (id: SetStateAction<string | null>) => {
    setExpandedRow(prev => (prev === id ? null : id as string));
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (rowId: string | boolean | ((prevState: boolean) => boolean)) => {
    setIsDropdownOpenn(isDropdownOpenn === rowId ? null : rowId as string);
  };



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
    return hsl(hue, 70, 60);
  };

  // const onDrop = (acceptedFiles: SetStateAction<File | null>[]) => {
  //   // Handle file drop
  //   setSelectedFile(acceptedFiles[0]); // You can handle multiple files as well
  //   };

  const handleeOpenModal = () => {
    setIsModallOpen(true);
    setEditRow(null); // Reset editRow when opening modal for new entry
    setFormData({ tableName: "", tableDescription: "" }); // Reset form data
  };


  const handleeCloseModal = () => {
    setIsModallOpen(false);
    setEditRow(null); // Reset editRow
    setFormData({ tableName: "", tableDescription: "" }); // Reset the form
  };


  const downloadExcel = () => {
    if (!runResult?.table || runResult.table.data.length === 0) {
      alert("No data to download.");
      return;
    }

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([runResult.table.columns, ...runResult.table.data]);

    // Create a workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");

    // Write the workbook and trigger download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "table_data.xlsx");
  };


  const downloadPPT = () => {
    let ppt = new PptxGenJS();

    const chartContainers = document.querySelectorAll('.chart-container');
    runResult?.charts.forEach((chart: ChartData, index: number) => {
      let slide = ppt.addSlide();
      slide.addText(chart.chart_type.toUpperCase() + " Chart", {
        x: 0.5,
        y: 0.2,
        fontSize: 18,
        bold: true,
      });

      // Convert chart canvas to image
      if (chartContainers[index]) {
        const canvas = chartContainers[index].querySelector('canvas');
        if (canvas) {
          let imgData = canvas.toDataURL("image/png", 1.0);
          slide.addImage({ data: imgData, x: 0.5, y: 1.0, w: 6.5, h: 3.5 });
        }
      }

      // Add insights
      if (chart.insight && chart.insight.length) {
        // slide.addText("Insights:", { x: 0.5, y: 4.6, fontSize: 14, bold: true });
        let insightsText = chart.insight.map((insight) => `• ${insight}`).join("\n");
        slide.addText(insightsText, { x: 0.5, y: 4.8, fontSize: 12 });
      }
    });

    ppt.writeFile({ fileName: "Charts_Presentation.pptx" });
  };
  // Handle input changes
  // const handleChangess = (key: any, value: any) => {
  //   setEditValues((prev) => ({ ...prev, [key]: value }));
  // };

  // Save changes
  // const handleEditClicks = async (id: string, boardId: any) => {
  //   if (!id || !boardId) {
  //     console.error("Missing parameters:", { id, boardId });
  //     alert("Error: Missing required parameters. Please check.");
  //     return;
  //   }

  //   try {
  //     const updatedData = {
  //       board_id: boardId,
  //       configuration_details: JSON.stringify(editValues), // Ensure it's a string
  //       name: "Dataset used.csv", // Add the missing 'name' field
  //     };

  //     console.log("Payload being sent:", JSON.stringify(updatedData, null, 2));

  //     const response = await fetch(
  //       `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/ai-documentation/${id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updatedData),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error("Error details:", errorData);
  //       alert(`Error: ${JSON.stringify(errorData)}`);
  //       return;
  //     }

  //     const result = await response.json();
  //     console.log("Update successful:", result);

  //     setData((prevData) =>
  //       prevData.map((item) =>
  //         item.id === id
  //           ? { ...item, configuration_details: { ...editValues } }
  //           : item
  //       )
  //     );
  //     setEditRowId(null);
  //   } catch (error) {
  //     console.error("Network or unexpected error:", error);
  //     alert(
  //       "A network or unexpected error occurred. Check the console for details."
  //     );
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the AI Documentation data from the API
        const response = await axios.get(
          `http://143.110.180.27:8003/main-boards/boards/ai-documentation/`,
          {
            headers: {
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
          }
        );

        // Log fetched data for debugging
        console.log("Fetched Data:", response.data);

        // Filter the data to only include entries with the specific boardId passed dynamically
        const filteredData = response.data.filter(
          (item: { board_id: string }) => String(item.board_id) === String(boardId)
        );

        // Log filtered data for debugging
        console.log("Filtered Data:", filteredData);

        // Set the filtered data
        setData(filteredData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the AI documentation:", error);
        setLoading(false);
      }
    };

    // Only call fetchData if boardId exists
    if (boardId) {
      fetchData();
    } else {
      // If boardId does not exist, fetch all data or handle accordingly
      // Uncomment the following line if you want to fetch all data when no boardId
      // fetchData();
    }
  }, [boardId]);

  const handleSaveClicks = async (id: string, boardId: string | null) => {
    if (!id || !boardId) {
      console.error("Missing parameters:", { id, boardId });
      alert("Error: Missing required parameters. Please check.");
      return;
    }

    try {
      const updatedData = {
        board_id: boardId,
        configuration_details: JSON.stringify(editValues[id] || {}), // Ensure it's a string
        name: "Dataset used.csv", // Add the missing 'name' field
      };

      console.log("Payload being sent:", JSON.stringify(updatedData, null, 2));

      const response = await fetch(
        `http://143.110.180.27:8003/main-boards/boards/ai-documentation/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
        return;
      }

      const result = await response.json();
      console.log("Update successful:", result);

      setData((prevData) =>
        prevData.map((item) =>
          item.id === id
            ? { ...item, configuration_details: { ...editValues[id] } }
            : item
        )
      );
      setEditRowId(null);
      setEditRowKey(null);
      setEditValues((prev) => {
        const updatedEditValues = { ...prev };
        delete updatedEditValues[id]; // Remove only this row's edit values
        return updatedEditValues;
      });
    } catch (error) {
      console.error("Network or unexpected error:", error);
      alert(
        "A network or unexpected error occurred. Check the console for details."
      );
    }
  };


  const [data, setData] = useState<DocumentationItem[]>([]);


  // const handleInputChange = (e) => {
  //   setNewPromptName(e.target.value);

  //   // Auto-adjust height based on content
  //   const textarea = textareaRef.current;
  //   if (textarea) {
  //     textarea.style.height = "auto"; // Reset height
  //     textarea.style.height = textarea.scrollHeight + "px"; // Set height to scrollHeight
  //   }
  // };

  // const getPieData = (fallbackData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] }) => {
  //   if (!runResult || !runResult.table) return fallbackData;

  //   const { columns, data } = runResult.table;
  //   const categoryIndex = columns.indexOf("Category");
  //   const billingIndex = columns.indexOf("Total Billing Amount");

  //   if (categoryIndex === -1 || billingIndex === -1) return fallbackData;

  //   const categoryTotals: { [key: string]: number } = {};

  //   data.forEach((row) => {
  //     const category = row[categoryIndex];
  //     const billing = parseFloat(row[billingIndex]) || 0;
  //     categoryTotals[category] = (categoryTotals[category] || 0) + billing;
  //   });

  //   return {
  //     labels: Object.keys(categoryTotals),
  //     datasets: [
  //       {
  //         data: Object.values(categoryTotals),
  //         backgroundColor: Object.keys(categoryTotals).map(() => getRandomColor()),
  //       },
  //     ],
  //   };
  // };


  // const getChartData = (type: "bar" | "line"): ChartData<"bar" | "line", number[], string> | null => {
  //   if (!runResult || !runResult.table) return null;

  //   const { columns, data } = runResult.table;
  //   const categoryIndex = columns.indexOf("Category");
  //   const billingIndex = columns.indexOf("Total Billing Amount");
  //   const patientIndex = columns.indexOf("Total Patient Count");

  //   if (categoryIndex === -1 || billingIndex === -1 || patientIndex === -1) return null;

  //   const labels = data.map((row) => row[categoryIndex]);
  //   const billingData = data.map((row) => parseFloat(row[billingIndex]) || 0);
  //   const patientData = data.map((row) => parseInt(row[patientIndex]) || 0);

  //   return {
  //     labels,
  //     datasets: [
  //       {
  //         type,
  //         label: "Total Billing Amount",
  //         data: billingData,
  //         backgroundColor: labels.map(() => getRandomColor()),
  //       },
  //       {
  //         type,
  //         label: "Total Patient Count",
  //         data: patientData,
  //         backgroundColor: labels.map(() => getRandomColor()),
  //       },
  //     ],
  //   } as ChartData<typeof type, number[], string>;
  // };



  // const getRandomColor = () => {
  //   const hue = Math.floor(Math.random() * 360);
  //   return hsl(hue, 70, 60);
  // };


  // Fetch table data for the specific board
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://143.110.180.27:8003/main-boards/boards/data-management-table/get_all_tables_with_files`,
          {
            headers: {
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Filter the fetched data based on board_id
        const filteredData = data.filter(
          (row: { board_id: number }) => row.board_id === parseInt(boardId!)
        );
        setRows(filteredData); // Set the filtered data to the rows state
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (view === "manage-tables" && boardId) {
      fetchData();
    }
  }, [view, boardId]);


  useEffect(() => {

    const fetchPrompts = async () => {
      if (!boardId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://143.110.180.27:8003/main-boards/boards/prompts/boards/${boardId}`,
          {
            headers: {
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp", // Add API Key
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }

        const data: Prompt[] = await response.json();
        console.log("Fetched prompts data:", data); // Add this logging

        // Check each prompt's structure
        data.forEach((prompt, index) => {
          console.log(`Prompt ${index} structure:`, {
            user_name: prompt.user_name,
            // Log all properties to see what's available
            ...prompt
          });
        });
        setPrompts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        console.error("Error fetching prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [boardId]);

  const handleRunnPrompt = async (promptText: string) => {
    setIsLoading(true);  // Start loading indicator
    setIsRunClicked(true); // Set to true when the prompt is clicked

    // Validate that promptText is not empty
    if (!promptText.trim()) {
      console.error("Error: Prompt cannot be empty");
      alert("Please enter a valid prompt.");
      setIsLoading(false);  // Reset loading state
      return;
    }

    if (!boardId) {
      console.error("Error: Board ID is missing");
      alert("Board ID is required to run the prompt.");
      setIsLoading(false);  // Reset loading state
      return;
    }

    try {
      // Create the URL with query parameters
      const url = new URL(
        `http://143.110.180.27:8003/main-boards/boards/prompts/run_prompt_v2/`
      );
      url.searchParams.append("input_text", promptText);
      url.searchParams.append("board_id", boardId);  // Ensure boardId is set properly
      url.searchParams.append("user_name", "Shashi Raj");
      url.searchParams.append("use_cache", "true");

      console.log("Making request to:", url.href);

      // Send the POST request
      const response = await axios.post(url.href, {
        input_text: promptText,
        board_id: boardId,
        user_name: "Shashi Raj",
        use_cache: true,
      },
        {
          headers: {
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
        }
      );

      // Check the response and handle accordingly
      if (response?.data) {
        console.log("Prompt run successfully:", response.data);
        setRunResult(response.data);  // Set the run result state
      } else {
        console.error("API response is empty or invalid.");
        alert("No valid response received.");
      }
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data || error.message);
        alert(`Error running the prompt: ${error.response?.data?.message || error.message}`);
      } else {
        console.error("Unexpected Error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);  // Reset loading state after completion
    }
  };


  // Handle prompt play
  const handlePlayClick = async (prompt: Prompt) => {
    setLoadingPromptPlay(prompt.id);  // Set loading state based on prompt id
    const promptText = prompt.prompt_text; // Extract prompt text

    console.log("Play button clicked, opening modal for prompt:", promptText);
    setSelectedPrompt(promptText); // Set selected prompt

    try {
      await handleRunnPrompt(promptText); // Run the prompt
      setIsResultModalOpen(true);  // Open the modal with results

      // Automatically set active tab based on the result type
      if ((runResult?.message ?? []).length > 0) {
        setActiveTab('message');
      } else if (runResult?.table && runResult.table.columns?.length > 0) {
        setActiveTab('table');
      } else if ((runResult?.charts ?? []).length > 0) {
        setActiveTab('charts');
      } else {
        setActiveTab('message'); // Default to message if no specific result type found
      }
    } catch (error) {
      console.error("Error running prompt", error);
    } finally {
      setLoadingPromptPlay(null);  // Reset loading state
    }
  };

  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  //   setEditRow(null); // Reset editRow when opening modal for new entry
  //   setFormData({ tableName: "", tableDescription: "" }); // Reset form data
  // };


  // Function to open the modal
  const handleOpenUploadModal = (id: SetStateAction<string | null>) => {
    setSelectedTableId(id); // Set the selected table ID
    setIsUploadModalOpen(true); // Open the modal
  };


  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



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

    if (!boardId) {
      console.error("Error: Board ID is missing");
      alert("Board ID is required to run the prompt.");
      setIsLoading(false);
      return;
    }

    try {
      const url = new URL(
        "http://143.110.180.27:8003/main-boards/boards/prompts/run_prompt_v2/"
      );

      // Append parameters
      url.searchParams.append("input_text", newPromptName.trim());
      url.searchParams.append("board_id", boardId);
      url.searchParams.append("user_name", "Shashi Raj");
      url.searchParams.append("use_cache", "true");

      console.log("Making request to:", url.href);

      // Make the POST request with Axios
      const response = await axios.post(
        url.href,
        {
          input_text: newPromptName.trim(),
          board_id: boardId,
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
      setIsLoading(false); // Reset loading state after API call (success or error)
    }
  };

  const handleRePrompt = async () => {
    try {
      // Make the API request to get a new prompt
      const response = await axios.post(
        `http://143.110.180.27:8003/main-boards/boards/prompts/re_prompt`,
        null, // No request body
        {
          params: {
            input_text: newPromptName,
            board_id: boardId,
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
    } catch (error: unknown) {
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
    }
  };



  // Handle prompt execution
  // const handleRunPrompt = async () => {
  //   if (!newPromptName) {
  //     console.error("Prompt cannot be empty");
  //     return;
  //   }

  //   try {
  //     const url = new URL(
  //       "https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/run_prompt_v2"
  //     );

  //     url.searchParams.append("input_text", newPromptName);
  //     if (boardId) {
  //       url.searchParams.append("board_id", boardId.toString());
  //     } else {
  //       console.error("Board ID is null");
  //       return;
  //     }
  //     url.searchParams.append("user_name", "Shashi Raj");
  //     url.searchParams.append("use_cache", "true");

  //     console.log("Making request to:", url.href);

  //     const response = await axios.post(url.href, {
  //       input_text: newPromptName,
  //       board_id: boardId,
  //       user_name: "Shashi Raj",
  //       use_cache: true,
  //     });

  //     if (response?.data) {
  //       console.log("Prompt run successfully:", response.data);

  //       // setRunResult(response.data); // Set the result to display it
  //       // Check if the user asked for charts
  //       if (
  //         newPromptName.toLowerCase().includes("chart") ||
  //         response.data.detail.includes("chart")
  //       ) {
  //         setShowCharts(true);
  //       } else {
  //         setShowCharts(false);
  //       }
  //     } else {
  //       console.error("API response is not valid.");
  //     }
  //   } catch (error) {
  //     console.error("Error running prompt:", error);
  //   }
  // };




  // type TableRow = {
  //   id: string;
  //   table_name: string;
  //   table_description: string;
  // };

  const handleDeletes = async (row: TableRow) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the table "${row.table_name}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://143.110.180.27:8003/main-boards/boards/data-management-table/${row.id}`,
        {
          method: "DELETE",
          mode: "cors",  // Ensures CORS compliance
          headers: {
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        throw new Error("Failed to delete table: " + errorData.message);
      }

      // Remove the deleted row from the state
      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };


  // Function to open the modal
  // const handleOpenUploadModal = (id: any) => {
  //   setSelectedTableId(id); // Set the selected table ID
  //   setIsUploadModalOpen(true); // Open the modal
  // };



  const handleEdit = (rowId: TableRow) => {
    setEditRow(rowId); // Set the row to edit
    setFormData({
      tableName: rowId.table_name,
      tableDescription: rowId.table_description,
    }); // Fill the form with row data
    setIsModallOpen(true); // Open the modal
  };


  // const handleAddPrompt = () => {
  //   // setIsAddingPrompt(true);
  //   setNewPromptName("");
  //   // setIsEditingPrompt(false);
  // };

  // Close modal function
  // The close button for the modal
  // const closeResultModal = () => {
  //   setIsResultModalOpen(false); // Close the modal when the close button is clicked
  // };


  // const handlePlayClick = (prompt: Prompt) => {
  //   setLoadingPromptPlay(prompt.id);
  //   setTimeout(() => setLoadingPromptPlay(null), 2000);
  // };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditPromptId(prompt.id);
    setNewPromptName(prompt.prompt_text);
    setIsModalOpen(true);
  };


  const handleDeletePrompt = async (promptId: string) => {
    try {
      const response = await fetch(
        `http://143.110.180.27:8003/main-boards/boards/prompts/${promptId}`,
        {
          method: "DELETE",
          headers: {
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success alert
      alert("Prompt deleted successfully!");

      // Update the prompts list
      setPrompts(prompts.filter((prompt) => prompt.id !== promptId));
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      // Show error alert
      alert("Failed to delete prompt. Please try again.");
    }
  };


  // const handleSavePrompt = async () => {
  //   if (!newPromptName.trim()) {
  //     alert("Prompt cannot be empty!");
  //     return;
  //   }
  //   if (newPromptName.length > 255) {
  //     alert("Prompt must be between 1 and 255 characters.");
  //     return;
  //   }
  //   if (!boardId) {
  //     alert("Error: boardId is missing.");
  //     return;
  //   }

  //   const promptData = {
  //     board_id: boardId,
  //     prompt_text: newPromptName,
  //     prompt_out: "out_string",
  //     user_name: "Shashi Raj",
  //   };

  //   const url = editPromptId
  //     ? `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/${editPromptId}`
  //     : `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/`;

  //   const method = editPromptId ? "PUT" : "POST";

  //   try {
  //     const response = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(promptData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       alert(`Failed to save prompt: ${errorData.message || "Unknown error"}`);
  //       return;
  //     }

  //     const newPromptData = await response.json();

  //     setPrompts((prevPrompts) =>
  //       editPromptId
  //         ? prevPrompts.map((prompt) =>
  //             prompt.id === editPromptId ? newPromptData : prompt
  //           )
  //         : [...prevPrompts, newPromptData]
  //     );

  //     setIsModalOpen(false);
  //     setNewPromptName("");
  //     setEditPromptId(null);
  //   } catch (error) {
  //     console.error("Network Error:", error);
  //     alert("Network error: Failed to save the prompt.");
  //   }
  // };

  const handleSavePrompt = async () => {
    // Input validation
    if (!newPromptName.trim()) {
      alert("Prompt cannot be empty!");
      return;
    }
    // if (newPromptName.length > 255) {
    //   alert("Prompt must be between 1 and 255 characters.");
    //   return;
    // }
    if (!boardId) {
      alert("Error: boardId is missing.");
      return;
    }

    // Retrieve the logged-in user's name from localStorage
    const loggedInUserName = localStorage.getItem('loggedInUserName');
    if (!loggedInUserName || loggedInUserName.trim() === "") {
      alert("Error: User name is missing in localStorage. Please log in again.");
      return;
    } // Fallback to "Unknown User" if not found
    console.log("Logged-in User:", loggedInUserName);
    console.log(localStorage.getItem("loggedInUserName"));

    // Prepare request body
    const promptData = {
      board_id: boardId,
      prompt_text: newPromptName.trim(),
      prompt_out: "out_string", // Default value as per the API example
      user_name: loggedInUserName, // Use the logged-in user's name
      created_by: loggedInUserName
    };
    console.log("Prompt Data:", promptData);

    // Determine the URL and method based on edit mode
    const url = editPromptId
      ? `http://143.110.180.27:8003/main-boards/boards/prompts/${editPromptId}` // Update endpoint
      : `http://143.110.180.27:8003/main-boards/boards/prompts/`; // Create endpoint

    const method = editPromptId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp", // Add API Key
        },
        body: JSON.stringify(promptData),
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to save prompt: ${errorData.message || "Unknown error"}`);
        return;
      }

      const newPromptData = await response.json();
      console.log("API Response Data:", newPromptData);

      // Update the prompts state
      setPrompts((prevPrompts) =>
        editPromptId
          ? prevPrompts.map((prompt) =>
            prompt.id === editPromptId
              ? { ...prompt, ...newPromptData }  // Spread both objects to preserve all fields
              : prompt
          )
          : [...prevPrompts, newPromptData]
      );

      // Close modal and reset state
      setIsModalOpen(false);
      setNewPromptName("");
      setEditPromptId(null);
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error: Failed to save the prompt.");
    }
  };

  // const onDrop = (acceptedFiles: SetStateAction<File | null>[]) => {
  //   // Handle file drop
  //   setSelectedFile(acceptedFiles[0]); // You can handle multiple files as well
  //   };

  // const toggleDropdown = () => {
  //   setIsDropdownOpen(!isDropdownOpen);
  // };

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   accept: ".csv", // Specify accepted file types
  //   multiple: false, // Accept only a single file
  // });

  console.log("Board ID:", boardId);
  // console.log("Table ID:", tableId);


  // const handleToggleDropdown = (id: string) => {
  //   setExpandedRow(expandedRow === id ? null : id);
  // };

  // Function to close the modal
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };


  // const handleEditClick = (id: string | null, item: Item) => {
  //   setDocId(id);
  //   setEditRowId(id);
  //   setEditValues(item.configuration_details);
  // };

  const handleChanges = (id: string, key: string, value: string) => {
    setEditValues((prevValues) => ({
      ...prevValues,
      [id]: {
        ...prevValues[id],
        [key]: value
      }
    }));
  };

  //  const handleSaveClick = async (id: string) => {
  //   try {
  //     const updatedData = {
  //       configuration_details: editValues,
  //     };

  //     console.log("editValues:", editValues);
  //     console.log("Payload being sent:", updatedData);

  //     const response = await fetch(
  //       "http://143.110.180.27:8003/main-boards/boards/ai-documentation/${id}",
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
  //         },
  //         body: JSON.stringify(updatedData),
  //       }
  //     );

  //     if (response.ok) {
  //       setData((prevData) =>
  //         prevData.map((item) =>
  //           item.id === id ? { ...item, configuration_details: editValues } : item
  //         )
  //       );
  //       setEditRowId(null);
  //     } else {
  //       const errorData = await response.json(); // Get server error details
  //       console.error("Error updating data:", response.statusText, errorData);
  //     }
  //   } catch (error) {
  //     console.error("Error updating data:", error);
  //   }
  // };

  const handleSubmitfile = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!selectedMonth || !selectedFile) {
      alert("Please select a month and a file to upload.");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("month_year", selectedMonth); // Append the selected month
    formData.append("file", selectedFile); // Append the selected file

    // Make API request
    try {
      const response = await fetch(
        `http://143.110.180.27:8003/main-boards/boards/data-management-table/status/upload/${selectedTableId}`, // Ensure you're using selectedTableId
        {
          method: "POST",
          headers: {
            "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Upload success:", data);
        alert("File uploaded successfully!");
        handleCloseUploadModal(); // Close modal on success
      } else {
        console.error("Upload failed");
        alert("Failed to upload the file.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during the upload.");
    }
  };

  const handleMonthChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedMonth(event.target.value);
  };




  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!formData.tableName || formData.tableName.length > 255) {
      console.error("Table Name must be between 1 and 255 characters");
      return;
    }

    const tableData = {
      board_id: boardId,
      table_name: formData.tableName,
      table_description: formData.tableDescription,
      table_column_type_detail: "",
    };

    try {
      const response = editRow
        ? await fetch(
          `http://143.110.180.27:8003/main-boards/boards/data-management-table/${editRow.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
            body: JSON.stringify(tableData),
          }
        )
        : await fetch(
          `http://143.110.180.27:8003/main-boards/boards/data-management-table/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
            body: JSON.stringify(tableData),
          }
        );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        throw new Error("Failed to save or update table: " + errorData.message);
      }

      const newTableData = await response.json();

      if (editRow) {
        setRows((prevRows: TableRow[]) =>
          prevRows.map((row: TableRow) =>
            row.id === editRow.id ? newTableData : row
          )
        );
      } else {
        setRows((prevRows) => [...prevRows, newTableData]);
      }

      setIsModallOpen(false); // Close the modal
      setFormData({ tableName: "", tableDescription: "" }); // Reset the form
      setEditRow(null); // Reset editRow
    } catch (error) {
      console.error("Error saving or updating table:", error);
    }
  };



  const handleCloseModal = () => {

    setNewPromptName("");
    setEditPromptId(null);
    setIsModalOpen(false); // Close the modal
    setActiveTab("prompts"); // Set the active tab to "prompts"
    setRunResult(null); // Clear the result data
    setShowCharts(false); // Reset chart visibility
    setIsRunClicked(false); // Reset to hide the tabs
    // Reset the flag that controls visibility of results

  };

  const truncateText = (text: string, maxLines: number) => {
    const words = text.split(" ");
    let truncated = "";
    let lineCount = 0;

    for (const word of words) {
      truncated += word + " ";
      if (truncated.split("\n").length > lineCount + 1) {
        lineCount++;
      }
      if (lineCount >= maxLines) {
        truncated += "...";
        break;
      }
    }
    return truncated.trim();
  };

  // useEffect(() => {
  //   if (runResult) {
  //     if (runResult.table && runResult.table.columns && runResult.table.columns.length > 0) {
  //       setActiveTab("table");
  //     } else if ((runResult.message ?? []).length > 0) {
  //       setActiveTab("message");
  //     } else if (getPieData() || getChartData("bar") || getChartData("line")) {
  //       setActiveTab("charts");
  //     } else {
  //       setActiveTab("message"); // Default to message tab if nothing is found
  //     }
  //   }
  // }, [runResult]);

  return (

    <div>
      {/* <header className="bg-white border-b p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">Sales Analysis Board</h1>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <User className="text-black w-5 h-5" /> 
            <span className="text-black">{loggedInUserEmail}</span> 
          </div>
          <Settings className="text-gray-900 w-5 h-5" /> 
        </div>
      </header> */}

      <div className="p-10 h-screen overflow-y-auto">



        {/* Tab Navigation */}
        <div className="flex space-x-24 border-b border-gray-400 mb-10">
          <button
            className={`py-2 px-4 ${activeTab === "prompts" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("prompts")}
          >
            {/* <FaTasks className="text-lg" /> */}
            <b>Manage Prompts</b>
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "repository" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("repository")}
          >
            <b>Prompts Repository</b>
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "tables" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("tables")}
          >
            <b>Manage Tables</b>
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "documentation" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("documentation")}
          >
            <b>AI Documentation</b>
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "master" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("master")}
          >
            <b>Master Settings</b>
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "timeline" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <b>Timeline Settings</b>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "prompts" && (
          <>
            {/* New Prompts Button */}
            <div className="flex justify-end">
              <button
                className="new-prompt-btn py-2 px-4 bg-blue-500 text-white rounded-md"
                onClick={() => setIsModalOpen(true)} // Define handleAddPrompt function
              >
                New Prompts +
              </button>
            </div>
            {isLoading && <Spinner />}
            {/* {error && <p className="text-red-500">Error: {error}</p>} */}
            {prompts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
                {prompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="prompt-card border rounded-lg shadow-md p-4 bg-white transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl flex flex-col justify-between"
                    style={{ minWidth: "200px" }}
                  >
                    <p
                      className="text-lg font-semibold line-clamp-3 overflow-hidden text-ellipsis mb-4"
                      title={prompt.prompt_text} // Tooltip on hover
                    >
                      {index + 1}. &quot;{prompt.prompt_text}&quot;
                    </p>

                    <div className="prompt-footer mt-auto">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Created By: {prompt.user_name && prompt.user_name !== "undefined" ? prompt.user_name : "Shashi Raj"}</p>
                        <p className="text-sm text-gray-600">Updated at: {new Date().toLocaleDateString()}</p>
                      </div>
                      <hr className="my-3 border-t-2" />
                      <div className="flex justify-center items-center gap-6 mt-3">
                        <button
                          className="icon-btn play-btn text-black"
                          onClick={() => handlePlayClick(prompt)}
                        >
                          <FaPlay />
                        </button>
                        <button
                          className="icon-btn edit-btn text-black"
                          onClick={() => handleEditPrompt(prompt)}
                        >
                          <FaPen />
                        </button>
                        <button
                          className="icon-btn delete-btn text-black"
                          onClick={() => handleDeletePrompt(prompt.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      {/* {loadingPromptPlay === prompt.id && (
                      <div className="loading-overlay">
                        <div className="spinner"></div>
                      </div>
                    )} */}
                    </div>
                  </div>
                ))}
              </div>


            )}
          </>
        )}

        {activeTab === "repository" && (
          <div>
            {isLoading && <Spinner />}
            {loadingPromptsRepository ? (
              <div className="loading-overlay flex justify-center items-center h-40">
                <div className="spinner border-4 border-t-blue-500 border-gray-300 rounded-full w-10 h-10 animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
                {prompts.length > 0 &&
                  prompts.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      className="prompt-card border rounded-lg shadow-md p-4 bg-white transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl flex flex-col justify-between min-h-[200px]"
                      onClick={() => handlePlayClick(prompt)}
                    >
                      {/* Limit text to 4 lines with ellipsis */}
                      <p
                        className="text-lg font-semibold line-clamp-3 overflow-hidden text-ellipsis mb-6 flex-grow"
                        title={prompt.prompt_text} // Tooltip on hover
                      >
                        {index + 1}. &quot;{prompt.prompt_text}&quot;
                      </p>
                      {/* Divider */}
                      <hr className="my-3 border-t mt-6" />
                      <div className="mt-4 text-sm">
                        <p className="opacity-90 ">Created By:{prompt.user_name && prompt.user_name !== "undefined" ? prompt.user_name : "Shashi Raj"}</p>
                        <p className="opacity-80">Updated: {new Date().toLocaleDateString()}</p>
                      </div>

                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {isResultModalOpen && runResult && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full max-w-full relative overflow-y-auto">
              <div className="result-modal">
                <div className="result-modal-content">
                  <span
                    className="close-btn absolute top-2 right-2 cursor-pointer text-2xl text-gray-600"
                    onClick={() => {
                      setIsResultModalOpen(false); // Close the modal
                      setActiveTab("prompts"); // Switch back to the "prompts" tab
                    }}


                  >
                    &times;
                  </span>

                  <h3 className="text-xl font-semibold mb-4">Prompt</h3>
                  <textarea
                    value={selectedPrompt || ""} // Display the selected prompt text
                    readOnly
                    rows={7}
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <h3 className="text-xl font-semibold mt-6">Run Result</h3>
                  <div className="run-results mt-6">
                    {/* Tab buttons for navigation */}
                    <div className="tabs flex justify-end space-x-2 mb-4">
                      {['message', 'table', 'charts'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            setIsResultModalOpen(true); // Open modal only for the active tab
                          }}

                          className={`tab-button px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {activeTab === 'message' && runResult.message && (
                        <div className="message-tab">
                          {runResult?.message && runResult.message.length > 0 ? (
                            <div>
                              {/* <h4 className="font-medium text-lg">Message:</h4> */}
                              <p>{runResult.message[0]}</p>
                            </div>
                          ) : (
                            <p>No message found.</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'table' && runResult.table?.columns?.length > 0 && (
                        <div className="table-tab">
                          {runResult?.table && runResult.table.columns?.length > 0 ? (
                            <div className="mt-4">

                              {/* Download Excel Button */}
                              <button
                                onClick={downloadExcel}
                                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Download
                              </button>
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
                          <button
                            onClick={downloadPPT}
                            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                          >
                            Download as PPT
                          </button>
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



                      {/* Modal */}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        )}

        {isLoading && <Spinner />}
        {activeTab === "tables" && (
          <div>
            <div className="container" style={{ padding: "20px" }}>
              <div className="table-container" style={{ marginBottom: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
                <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* <h2><b>Manage Tables</b></h2> */}
                  <button
                    className="new-btn"
                    onClick={handleeOpenModal}
                    style={{
                      padding: "8px 16px",

                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    + New
                  </button>
                </div>
                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>Table Name</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Table Description</th>
                      <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", padding: "12px" }}>
                          No tables available for this board.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (

                        <tr key={row.id}>
                          <td style={{ padding: "12px" }}>{row.table_name}</td>
                          <td style={{ padding: "12px" }}>{row.table_description}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button
                              className="action-btn"
                              onClick={() => handleEdit(row)}
                              style={{
                                padding: "6px 12px",
                                // backgroundColor: "#ffc107",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <FaPen />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => handleDeletes(row)}
                              style={{
                                padding: "6px 12px",
                                // backgroundColor: "#dc3545",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <FaTrash />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => handleOpenUploadModal(row.id)}
                              style={{
                                padding: "6px 12px",
                                // backgroundColor: "#28a745",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <FaFileUpload />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => toggleDropdown(row.id)}
                              style={{
                                padding: "6px 12px",
                                // backgroundColor: "#6c757d",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              {isDropdownOpenn ? <FaCaretUp /> : <FaCaretDown />}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Dropdown Table */}
                {isDropdownOpenn && (
                  <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-md">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 border-b-2 border-gray-300">
                          <th className="px-4 py-2 text-left">Month Year</th>
                          <th className="px-4 py-2 text-left">File Name</th>
                          <th className="px-4 py-2 text-left">Created On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length > 0 ? (
                          rows.map((row) =>
                            row.files.map((file) => (
                              <tr
                                key={file.id}
                                className="border-b border-gray-300 hover:bg-gray-50 transition"
                              >
                                <td className="px-4 py-2">{file.month_year}</td>
                                <td className="px-4 py-2">{file.filename}</td>
                                <td className="px-4 py-2">
                                  {new Date(file.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center py-4 text-gray-500">
                              No files available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal for Uploading Files */}
              {isUploadModalOpen && (
                <div className="modal-overlays" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                  <div className="modals" style={{ backgroundColor: "#fff", margin: "50px auto", padding: "20px", width: "400px", borderRadius: "8px" }}>
                    <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>
                      <button type="button" className="close-btn" onClick={handleCloseUploadModal}>
                        <FaTimes />
                      </button>
                    </div>
                    <form onSubmit={handleSubmitfile}>
                      <div className="form-group">
                        <label htmlFor="monthPicker">Select Month Year:</label>
                        <input
                          type="month"
                          id="monthPicker"
                          name="month"
                          value={selectedMonth}
                          onChange={handleMonthChange}
                          className="border border-gray-300 rounded p-2"
                          required
                        />
                      </div>
                      <div className="form-group">
                        {/* <label htmlFor="fileInput">Select File</label> */}
                        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer">
                          <input
                            id="fileInput"
                            name="file"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                          />
                          <FaUpload className="text-gray-500 mx-auto mb-2" size={24} />
                          {/* <div className="p-10 h-screen overflow-y-auto"> */}
                          <p className="text-sm text-gray-600 mb-2">
                            {selectedFile ? `Selected File: ${selectedFile.name}` : 'Click or drag file to upload'}
                          </p>

                          {/* Rest of your JSX */}
                          {/* </div> */}
                        </div>
                      </div>
                      <div className="modal-actions" style={{ display: "flex-end", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>

                        <button type="submit" className="upload-btn" style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>
                          Upload
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal for Editing Table Details */}
              {isModallOpen && (
                <div className="modal-overlays" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                  <div className="modals" style={{ backgroundColor: "#fff", margin: "50px auto", padding: "20px", width: "400px", borderRadius: "8px" }}>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>Table Name</label>
                        <input
                          type="text"
                          name="tableName"
                          value={formData.tableName}
                          onChange={handleChange}
                          required
                          style={{ padding: "8px", width: "100%", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Table Description</label>
                        <input
                          type="text"
                          name="tableDescription"
                          value={formData.tableDescription}
                          onChange={handleChange}
                          required
                          style={{ padding: "8px", width: "100%", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                      </div>
                      <div className="modal-actionss" style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <button type="submit" className="save-btns" style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="close-btns"
                          onClick={handleeCloseModal}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>



        )}


        {activeTab === "documentation" && (
          <div>
            <div className="container">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="w-1/12 px-4 py-3 text-center">
                      <input type="checkbox" />
                    </th>
                    <th className="w-1/3 px-4 py-3 text-left">Name</th>
                    <th className="w-1/3 px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item) => {
                      const isDropdownOpen = expandedRow === item.id;
                      const isEditMode = editRowId === item.id; // Check if this row is in edit mode

                      return (
                        <React.Fragment key={item.id}>
                          {/* Main Row */}
                          <tr className="border-b border-gray-200 hover:bg-gray-100">
                            {/* Checkbox */}
                            <td className="px-4 py-3 text-center">
                              <input type="checkbox" />
                            </td>

                            {/* Display item.name */}
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.name}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                readOnly
                              />
                            </td>

                            {/* Actions with dropdown toggle */}
                            <td>
                              <button
                                onClick={() => handleToggleDropdown(item.id)}
                                className="text-blue-500 bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
                              >
                                {isDropdownOpen ? (
                                  <MdArrowDropUp className="ml-1" size={20} />
                                ) : (
                                  <MdArrowDropDown className="ml-1" size={20} />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Dropdown Row */}
                          {isDropdownOpen && (
                            <tr className="bg-gray-50">
                              <td></td>
                              <td >
                                <table className="min-w-full bg-white border">
                                  <thead>
                                    <tr className="bg-gray-200">
                                      <th className="px-4 py-3 text-left">Key</th>
                                      <th className="px-4 py-3 text-left">Description</th>
                                      <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(item.configuration_details).map(
                                      ([key, description], index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                          {/* Key with fixed width */}
                                          <td className="px-4 py-3">
                                            <input
                                              type="text"
                                              value={key}
                                              className="border border-gray-300 rounded-md p-2"
                                              readOnly
                                              style={{ width: '350px' }}
                                            />
                                          </td>

                                          {/* Description with fixed width */}
                                          <td className="px-4 py-3">
                                            {editRowId === item.id && editRowKey === key ? (
                                              <input
                                                type="text"
                                                value={editValues[item.id]?.[key] || description}
                                                onChange={(e) => handleChanges(item.id, key, e.target.value)}
                                                className="border border-gray-300 rounded-md p-2"
                                                style={{ width: '550px' }}
                                              />
                                            ) : (
                                              <input
                                                type="text"
                                                value={description}
                                                className="border border-gray-300 rounded-md p-2"
                                                readOnly
                                                style={{ width: '550px' }}
                                              />
                                            )}
                                          </td>

                                          {/* Edit and Save Buttons */}
                                          <td className="px-4 py-3 text-center">
                                            {editRowId === item.id && editRowKey === key ? (
                                              // Save Button (only visible in edit mode for this row)
                                              <button
                                                onClick={() => handleSaveClicks(item.id, boardId)}
                                                className="text-blue-500"
                                                data-tooltip="Save changes"
                                              >
                                                <FiSave className="mr-1" size={16} style={{ color: "blue" }} />
                                              </button>
                                            ) : (
                                              // Edit Button (only visible when not in edit mode for this row)
                                              <button
                                                onClick={() => {
                                                  setEditRowId(item.id); // Enable edit mode for this row
                                                  setEditRowKey(key); // Set the specific key being edited
                                                  setEditValues((prev) => ({
                                                    ...prev,
                                                    [item.id]: { ...item.configuration_details }, // Initialize only this row's values
                                                  })); // Initialize edit values
                                                }}
                                                className="text-blue-500"
                                              >
                                                <FiEdit className="mr-1" size={16} style={{ color: "blue" }} />
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      {/* <td className="px-4 py-3 text-center" colSpan="5">
              No data available for the selected board.
            </td> */}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Modal for Editing Table Details */}
        {isModalOpen && (
          <div className="modal-overlays" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modals" style={{ backgroundColor: "#fff", margin: "50px auto", padding: "20px", width: "400px", borderRadius: "8px" }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Table Name</label>
                  <input
                    type="text"
                    name="tableName"
                    value={formData.tableName}
                    onChange={handleChange}
                    required
                    style={{ padding: "8px", width: "100%", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>
                <div className="form-group">
                  <label>Table Description</label>
                  <input
                    type="text"
                    name="tableDescription"
                    value={formData.tableDescription}
                    onChange={handleChange}
                    required
                    style={{ padding: "8px", width: "100%", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>
                <div className="modal-actionss" style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                  <button type="submit" className="save-btns" style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="close-btns"
                    onClick={handleCloseModal}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center w-full h-full justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg  w-full h-full overflow-y-auto relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-2">Run Your Prompt</h2>

              {/* Input Field */}
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Type your prompt here..."
                value={newPromptName}
                rows={8}
                ref={textareaRef} // Attach the ref to the textarea
                onChange={(e) => setNewPromptName(e.target.value)}
              />

              {/* Action Buttons */}

              <div className="mt-4 flex justify-end space-x-2">

                <button onClick={handleRePrompt} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Reprompt {isLoading && <Spinner />}
                </button>
                {/* {isLoading && <Spinner/>} Display spinner when loading */}
                {isLoading && <Spinner />}
                <button
                  onClick={handleRunPrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={!newPromptName.trim() || isLoading}
                >
                  {isLoading ? "Running..." : "Run"}
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>

              {/* Only show the tabs if Run button is clicked */}
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
                            <button
                              onClick={downloadExcel}
                              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Download as excel
                            </button>
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
                        <button
                          onClick={downloadPPT}
                          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                          Download as PPT
                        </button>
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


        )}
      </div>
    </div>
  );




}


function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
//     <div className="p-4 h-screen overflow-y-auto">
//       <h1 className="text-xl font-bold mb-4">Prompts</h1>
//       {loading && <p>Loading prompts...</p>}
//       {error && <p className="text-red-500">Error: {error}</p>}
//       {prompts.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//             gap: "10px",
//           }}
//         >
//           {prompts.map((prompt, index) => (
//             <div
//               key={prompt.id}
//               className="prompt-card border rounded-lg shadow p-4 bg-white"
//               style={{ minWidth: "200px" }}
//             >
//               <p className="font-bold mb-2">
//                 {index + 1}. "{truncateText(prompt.prompt_text, 3)}"
//               </p>
//               <div className="prompt-footer">
//                 <div className="mb-2">
//                   <p className="text-sm text-gray-600">Created By: {prompt.user_name}</p>
//                   <p className="text-sm text-gray-600">Updated at: {new Date().toLocaleDateString()}</p>
//                 </div>
//                 <hr className="my-2" />
//                 <div className="flex justify-between">
//                   <button
//                     className="icon-btn play-btn text-blue-500"
//                     onClick={() => handlePlayClick(prompt)}
//                   >
//                     <FaPlay />
//                   </button>
//                   <button
//                     className="icon-btn edit-btn text-green-500"
//                     onClick={() => handleEditPrompt(prompt)}
//                   >
//                     <FaPen />
//                   </button>
//                   <button
//                     className="icon-btn delete-btn text-red-500"
//                     onClick={() => handleDeletePrompt(prompt.id)}
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//                 {loadingPromptPlay === prompt.id && (
//                   <div className="loading-overlay">
//                     <div className="spinner"></div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
