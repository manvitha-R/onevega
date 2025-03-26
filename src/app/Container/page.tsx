'use client';

import { useState, useEffect, SetStateAction, useRef, ReactNode, useCallback } from "react";
import PptxGenJS from "pptxgenjs";
import { useSearchParams } from "next/navigation";
// import { MdManageSearch } from "react-icons/md";
import { FaPlay, FaPen, FaTrash, FaEdit } from "react-icons/fa";
import { FaFileUpload, FaCaretUp, FaCaretDown, FaUpload, FaTimes, FaComment } from 'react-icons/fa';
import axios from "axios";
import React from "react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// import { useDropzone } from "react-dropzone";
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, Edit } from 'lucide-react';
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
import { toast } from "react-toastify";
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
    data: any;
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
  const [hasReprompted, setHasReprompted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
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
  const [isOpen, setIsOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  type Comment = {
    editedAt: any;
    id: number;
    text: string;
    createdAt: string;
  };

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [savedComments, setSavedComments] = useState<Comment[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  // Store comments for each prompt
  const [commentsMap, setCommentsMap] = useState<{
    [promptId: string]: Array<{
      id: number;
      text: string;
      createdAt: Date;
      editedAt: Date | null;
    }>
  }>({});

  // Open comment modal for a specific prompt
  const handleCommentClick = (promptId: string) => {
    setCurrentPromptId(promptId);
    setIsCommentOpen(true);
    setEditingCommentId(null);
    setCommentText('');
  };

  // Close comment modal
  const handleCloseComment = () => {
    setIsCommentOpen(false);
    setCommentText('');
    setEditingCommentId(null);
  };

  // Get comments for current prompt
  const getCurrentPromptComments = () => {
    if (!currentPromptId) return [];
    return commentsMap[currentPromptId] || [];
  };



  // Handle saving a comment
  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !currentPromptId) return;

    if (editingCommentId !== null) {
      // Update existing comment
      setCommentsMap(prev => {
        const updatedComments = (prev[currentPromptId] || []).map(comment =>
          comment.id === editingCommentId
            ? { ...comment, text: commentText, editedAt: new Date() }
            : comment
        );

        return {
          ...prev,
          [currentPromptId]: updatedComments
        };
      });

      setEditingCommentId(null);
    } else {
      // Add new comment
      const newComment = {
        id: Date.now(),
        text: commentText,
        createdAt: new Date(),
        editedAt: null
      };

      setCommentsMap(prev => ({
        ...prev,
        [currentPromptId]: [...(prev[currentPromptId] || []), newComment]
      }));
    }

    // Clear the form
    setCommentText('');
  };


  // Handle editing a comment
  const handleEditComment = (commentId: number) => {
    if (!currentPromptId) return;

    const commentToEdit = commentsMap[currentPromptId]?.find(comment => comment.id === commentId);
    if (commentToEdit) {
      setCommentText(commentToEdit.text);
      setEditingCommentId(commentId);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = (commentId: number) => {
    if (!currentPromptId) return;

    setCommentsMap(prev => {
      const filteredComments = (prev[currentPromptId] || []).filter(
        comment => comment.id !== commentId
      );

      return {
        ...prev,
        [currentPromptId]: filteredComments
      };
    });
  };

  // Format date for display
  const formatDate = (date: Date | string | number) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  // Get comment count for a specific prompt
  const getCommentCount = (promptId: string): number => {
    return commentsMap[promptId]?.length || 0;
  };



  // Toggle dropdown
  const handleToggleDropdown = (id: SetStateAction<string | null>) => {
    setExpandedRow(prev => (prev === id ? null : id as string));
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (rowId: string | boolean | ((prevState: boolean) => boolean)) => {
    setIsDropdownOpenn(isDropdownOpenn === rowId ? null : rowId as string);
  };

  const [items, setItems] = useState<Item[]>([]);
  const [newItemMode, setNewItemMode] = useState<boolean>(false);
  const [isNewItemDropdownOpen, setIsNewItemDropdownOpen] = useState<boolean>(false);


  const [dropdownRows, setDropdownRows] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  const handleAddDropdownRow = () => {
    setDropdownRows([...dropdownRows, { key: '', value: '' }]);
  };

  const handleDropdownInputChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedRows = [...dropdownRows];
    updatedRows[index][field] = value; // Now TypeScript knows field is either 'key' or 'value'
    setDropdownRows(updatedRows);
  };

  const handleDeleteDropdownItem = (index: number) => {
    const updatedRows = dropdownRows.filter((_, i) => i !== index);
    setDropdownRows(updatedRows);
  };

  const handleEditDropdownItem = (index: number) => {
    // Logic to handle editing the dropdown row
    console.log("Editing dropdown row at index:", index);
    // Example: Enable edit mode for the row or open a modal
  };

  // Mock functions for UI demonstration - these will be replaced with backend calls
  const handleAddItem = () => {
    // This will be replaced with your backend implementation
    setNewItemMode(false);
  };

  const handleEditItem = (id: number) => {
    // This will be replaced with your backend implementation
    console.log(`Edit item with id: ${id}`);
  };

  const handleSaveItem = (id: number) => {
    // This will be replaced with your backend implementation
    console.log(`Save item with id: ${id}`);
  };

  const handleDeleteItem = (id: number) => {
    // This will be replaced with your backend implementation
    console.log(`Delete item with id: ${id}`);
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


  // IMPLEMENT THIS DIRECTLY INSTEAD OF USING PREVIOUS SOLUTIONS


  // The problem is likely in how event listeners are attached or the modal is created.
  // This is a simpler implementation that should work reliably.

  // This is your existing PPT download function, modified to work with React
  const downloadPPT = (includeTableData = true, tableRowOption = 'limited') => {
    console.log(`Downloading PPT with includeTableData=${includeTableData}, tableOption=${tableRowOption}`);

    try {
      // Create PptxGenJS instance
      let ppt = new PptxGenJS();

      // Set presentation properties for metadata
      ppt.author = "Data Analysis Tool";
      ppt.company = "Your Company Name";
      ppt.subject = "Data Analysis Results";
      ppt.title = "Insight Analysis Report";

      // Define a professional theme color scheme
      const THEME = {
        primary: "2B579A", // Dark blue
        secondary: "4472C4", // Accent blue
        accent1: "ED7D31", // Orange
        accent2: "70AD47", // Green
        accent3: "5B9BD5", // Light blue
        background: "FFFFFF", // White
        text: "2F3542", // Dark gray
        headerBackground: "F2F2F2" // Light gray
      };

      // Define slide masters
      ppt.defineSlideMaster({
        title: "MASTER_SLIDE",
        background: { color: THEME.background },
        margin: [0.5, 0.25, 0.5, 0.25],
        slideNumber: { x: 0.5, y: "95%", fontFace: "Arial", fontSize: 8, color: "666666" },
        objects: [
          { rect: { x: 0, y: 0, w: "100%", h: 0.6, fill: { color: THEME.primary } } },
          { rect: { x: 0, y: "97%", w: "100%", h: 0.2, fill: { color: THEME.primary } } }
        ]
      });

      ppt.defineSlideMaster({
        title: "CLEAN_MASTER_SLIDE",
        background: { color: THEME.background },
        margin: [0.5, 0.25, 0.5, 0.25],
        slideNumber: { x: 0.5, y: "95%", fontFace: "Arial", fontSize: 8, color: "666666" }
      });

      // Helper function to split text across slides
      const addTextAcrossSlides = (text: string | any[], title: string, options = {}) => {
        const maxCharsPerSlide = 800;

        if (!text || text.length === 0) return;

        // Split text into chunks
        const textChunks = [];
        let currentText = Array.isArray(text) ? text.join("\n") : String(text);

        while (currentText.length > 0) {
          if (currentText.length <= maxCharsPerSlide) {
            textChunks.push(currentText);
            break;
          }

          let breakPoint = currentText.lastIndexOf('\n', maxCharsPerSlide);
          if (breakPoint === -1 || breakPoint < maxCharsPerSlide * 0.5) {
            breakPoint = currentText.lastIndexOf('. ', maxCharsPerSlide);
            if (breakPoint === -1 || breakPoint < maxCharsPerSlide * 0.4) {
              breakPoint = currentText.lastIndexOf(' ', maxCharsPerSlide);
            }
          }

          if (breakPoint === -1) breakPoint = maxCharsPerSlide;

          textChunks.push(currentText.substring(0, breakPoint));
          currentText = currentText.substring(breakPoint).trim();
        }

        // Create slides for each chunk
        const totalSlides = textChunks.length;
        textChunks.forEach((chunk, index) => {
          const slide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

          slide.addText(`${title}${totalSlides > 1 ? ` (${index + 1}/${totalSlides})` : ''}`, {
            x: 0.5,
            y: 0.7,
            fontSize: 20,
            fontFace: "Arial",
            color: THEME.primary,
            bold: true,
            align: "left"
          });

          slide.addText(chunk, {
            x: 0.5,
            y: 1.3,
            w: 8.5,
            h: 5.0,
            fontSize: 13,
            fontFace: "Arial",
            color: THEME.text,
            wrap: true,
            breakLine: true,
            valign: "top",
            lineSpacing: 16,
            ...options
          });

          if (index < totalSlides - 1) {
            slide.addText("Continued on next slide...", {
              x: 0.5,
              y: 6.5,
              fontSize: 10,
              fontFace: "Arial",
              italic: true,
              color: "666666",
            });
          }
        });
      };

      // Title slide
      const titleSlide = ppt.addSlide({ masterName: "MASTER_SLIDE" });
      titleSlide.addText("Insights Analysis Report", {
        x: 0.5,
        y: 2.0,
        fontFace: "Arial",
        fontSize: 36,
        color: THEME.primary,
        bold: true,
        align: "center"
      });

      titleSlide.addText("Generated on " + new Date().toLocaleDateString(), {
        x: 0.5,
        y: 3.0,
        fontFace: "Arial",
        fontSize: 18,
        color: THEME.text,
        align: "center"
      });

      // Add prompts if available
      if (typeof prompts !== 'undefined' && prompts.length > 0) {
        const promptTexts = prompts.map(prompt => prompt.prompt_text).join("\n\n");
        addTextAcrossSlides(promptTexts, "Prompt");
      }

      // Add table data slides (only if includeTableData is true)
      if (includeTableData && runResult?.table && runResult.table.data.length > 0) {
        try {
          // Get columns from runResult.table
          const columns = runResult.table.columns;

          // Prepare table header with styling
          const tableHeader = columns.map(col => ({
            text: col,
            fontFace: "Arial",
            bold: true,
            fill: THEME.headerBackground,
            color: THEME.primary,
            fontSize: 11,
          }));

          // IMPORTANT: Determine data to display based on the tableRowOption
          let dataToDisplay;
          if (tableRowOption === 'all') {
            console.log(`Using ALL ${runResult.table.data.length} rows from data`);
            dataToDisplay = runResult.table.data;
          } else {
            // Use limited data (default 20 rows)
            const limitRows = Math.min(20, runResult.table.data.length);
            console.log(`Using LIMITED ${limitRows} rows from data`);
            dataToDisplay = runResult.table.data.slice(0, limitRows);
          }

          // Check if we need to use horizontal column splitting
          const COLUMNS_PER_SLIDE_THRESHOLD = 8; // Adjust this threshold as needed

          if (columns.length > COLUMNS_PER_SLIDE_THRESHOLD) {
            // We have many columns, use horizontal splitting approach
            console.log(`Table has ${columns.length} columns, using horizontal splitting`);

            // First, add a column navigator slide
            const navSlide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

            navSlide.addText("Table Column Navigator", {
              x: 0.5,
              y: 0.7,
              fontSize: 20,
              fontFace: "Arial",
              color: THEME.primary,
              bold: true,
              align: "left"
            });

            navSlide.addText(
              `This table contains ${columns.length} columns which have been split across multiple slides for better readability.`,
              {
                x: 0.5,
                y: 1.3,
                w: 8.5,
                fontSize: 14,
                fontFace: "Arial",
                color: THEME.text,
                wrap: true
              }
            );

            // Determine how many columns to show per slide
            const columnsPerSlide = 8; // Adjust based on readability
            const totalColumnSlides = Math.ceil(columns.length / columnsPerSlide);

            // Show column distribution
            let columnDistText = "Column groups:\n";
            for (let i = 0; i < totalColumnSlides; i++) {
              const startCol = i * columnsPerSlide;
              const endCol = Math.min(startCol + columnsPerSlide, columns.length);
              columnDistText += `• Slide ${i + 1}: Columns ${startCol + 1}-${endCol} (${columns.slice(startCol, endCol).join(", ")})\n`;
            }

            navSlide.addText(columnDistText, {
              x: 0.5,
              y: 2.0,
              w: 8.5,
              h: 4.0,
              fontSize: 12,
              fontFace: "Arial",
              color: THEME.text,
              wrap: true,
              breakLine: true,
              valign: "top"
            });

            // Create slides for each column group
            for (let colSlideIndex = 0; colSlideIndex < totalColumnSlides; colSlideIndex++) {
              // Calculate column range for this slide
              const startCol = colSlideIndex * columnsPerSlide;
              const endCol = Math.min(startCol + columnsPerSlide, columns.length);
              const currentColumnSet = columns.slice(startCol, endCol);

              // Get table header for this subset of columns
              const partialTableHeader = currentColumnSet.map(col => ({
                text: col,
                fontFace: "Arial",
                bold: true,
                fill: THEME.headerBackground,
                color: THEME.primary,
                fontSize: 11,
              }));

              // Determine rows per slide - can fit more rows with fewer columns
              const rowsPerSlide = Math.min(15, dataToDisplay.length);

              // Calculate number of row slides needed for this column group
              const rowSlidesNeeded = Math.ceil(dataToDisplay.length / rowsPerSlide);

              // Create slides for each row chunk
              for (let rowSlideIndex = 0; rowSlideIndex < rowSlidesNeeded; rowSlideIndex++) {
                const startRow = rowSlideIndex * rowsPerSlide;
                const endRow = Math.min(startRow + rowsPerSlide, dataToDisplay.length);

                // Format current chunk of data for only these columns
                const currentRows = dataToDisplay.slice(startRow, endRow).map(row =>
                  row.slice(startCol, endCol).map(cell => ({
                    text: String(cell || ''), // Convert to string to handle non-string data
                    fontFace: "Arial",
                    fontSize: 10,
                    color: THEME.text
                  }))
                );

                // Create slide
                let tableSlide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

                // Add title showing which part of the table this is
                tableSlide.addText(
                  `Table Data - Columns ${startCol + 1} to ${endCol} of ${columns.length}`,
                  {
                    x: 0.5,
                    y: 0.5,
                    fontSize: 18,
                    fontFace: "Arial",
                    color: THEME.primary,
                    bold: true,
                    align: "left"
                  }
                );

                // Add subtitle showing column and row range
                tableSlide.addText(
                  `Column Group ${colSlideIndex + 1}/${totalColumnSlides} • Rows ${startRow + 1}-${endRow} of ${dataToDisplay.length}`,
                  {
                    x: 0.5,
                    y: 1.0,
                    fontSize: 14,
                    fontFace: "Arial",
                    color: THEME.secondary
                  }
                );

                // Combine header with data
                const formattedData = [partialTableHeader, ...currentRows];

                // Calculate optimal column widths for this subset
                const availableWidth = 8.5;
                const colWidth = availableWidth / currentColumnSet.length;

                // Add table to slide with properly sized columns
                tableSlide.addTable(formattedData, {
                  x: 0.5,
                  y: 1.4,
                  w: availableWidth,
                  border: { pt: 0.5, color: "CFCFCF" },
                  colW: currentColumnSet.map(() => colWidth), // Proper width for visible columns
                  rowH: Array(formattedData.length).fill(0.3),
                  fill: { color: "FFFFFF" },
                  valign: "middle",
                  align: "center", // Center alignment for better readability
                  fontSize: 10,
                  autoPage: true // Automatically paginate table rows if needed
                });

                // Add navigation hints
                let navText = "";

                if (rowSlideIndex < rowSlidesNeeded - 1) {
                  navText += "• More rows on next slide";
                }

                if (colSlideIndex < totalColumnSlides - 1) {
                  if (navText) navText += " • ";
                  navText += "More columns on following slides";
                }

                if (navText) {
                  tableSlide.addText(navText, {
                    x: 0.5,
                    y: 6.5,
                    fontSize: 10,
                    fontFace: "Arial",
                    italic: true,
                    color: "666666"
                  });
                }
              }
            }
          } else {
            // For tables with fewer columns, use the original row-based pagination approach
            // Determine rows per slide based on number of columns
            const rowsPerSlide = Math.max(10, Math.min(10, Math.floor(20 / columns.length)));

            // Calculate number of slides needed for rows
            const totalSlides = Math.ceil(dataToDisplay.length / rowsPerSlide);

            // Create a slide for each chunk of data
            for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
              const startRow = slideIndex * rowsPerSlide;
              const endRow = Math.min(startRow + rowsPerSlide, dataToDisplay.length);

              let tableSlide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

              // Add descriptive title with pagination info
              tableSlide.addText(`Table Data (${slideIndex + 1}/${totalSlides})`, {
                x: 0.5,
                y: 0.7,
                fontSize: 20,
                fontFace: "Arial",
                color: THEME.primary,
                bold: true,
                align: "left"
              });

              // Format current chunk of data
              const currentRows = dataToDisplay.slice(startRow, endRow).map(row =>
                row.map(cell => ({
                  text: String(cell || ''), // Convert to string to handle non-string data
                  fontFace: "Arial",
                  fontSize: 10,
                  color: THEME.text
                }))
              );

              // Combine header with data
              const formattedData = [tableHeader, ...currentRows];

              // Add table to slide
              tableSlide.addTable(formattedData, {
                x: 0.5,
                y: 1.3,
                w: 8.5,
                border: { pt: 0.5, color: "CFCFCF" },
                colW: columns.map(() => 8.5 / columns.length), // Distribute width evenly
                rowH: Array(formattedData.length).fill(0.3),
                fill: { color: "FFFFFF" },
                valign: "middle"
              });

              // Add navigation info with appropriate message based on the option
              let rowInfoText = "";
              if (tableRowOption === 'all') {
                rowInfoText = `Showing rows ${startRow + 1} to ${endRow} of ${dataToDisplay.length} total rows`;
              } else {
                rowInfoText = `Showing rows ${startRow + 1} to ${endRow} of 20 ${runResult.table.data.length > 20 ? `(limited from ${runResult.table.data.length} total rows)` : ''}`;
              }

              tableSlide.addText(rowInfoText, {
                x: 0.5,
                y: 6.5,
                fontSize: 10,
                fontFace: "Arial",
                italic: true,
                color: "666666",
              });
            }
          }
        } catch (error) {
          console.error("Error creating table slides:", error);
          const errorSlide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errorSlide.addText(`Could not display table data: ${errorMessage}`, {
            x: 0.5,
            y: 2.0,
            fontSize: 12,
            fontFace: "Arial",
            color: "FF0000",
          });
        }
      }

      // Add chart slides if available
      if (runResult?.charts && runResult.charts.length > 0) {
        const chartContainers = document.querySelectorAll('.chart-container');
        runResult.charts.forEach((chart, index) => {
          let slide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

          // Add chart title
          slide.addText(chart.chart_type.toUpperCase() + " Chart", {
            x: 0.5,
            y: 0.7,
            fontSize: 20,
            fontFace: "Arial",
            color: THEME.primary,
            bold: true,
            align: "left"
          });

          // Make chart image smaller to leave room for insights
          if (chartContainers[index]) {
            const canvas = chartContainers[index].querySelector('canvas');
            if (canvas) {
              let imgData = canvas.toDataURL("image/png", 1.0);
              // Position chart on the left side, reduce width
              slide.addImage({ data: imgData, x: 0.5, y: 1.3, w: 4.5, h: 3.5 });
            }
          }

          // Add insights beside the chart (on the right side)
          if (chart.insight && chart.insight.length) {
            // Add title for insights section
            slide.addText("Key Insights:", {
              x: 5.5, // Position to the right of chart
              y: 1.3,
              fontSize: 14,
              fontFace: "Arial",
              color: THEME.primary,
              bold: true,
            });

            // Calculate maximum insights that can fit
            const maxInsightsOnSlide = Math.min(8, chart.insight.length);

            // Add insights as a group with shorter height
            for (let i = 0; i < maxInsightsOnSlide; i++) {
              // Truncate long insights to prevent overflow
              let insightText = chart.insight[i];
              if (insightText.length > 80) {
                insightText = insightText.substring(0, 77) + '...';
              }

              slide.addText(insightText, {
                x: 5.5,
                y: 1.7 + (i * 0.4), // More compact spacing
                w: 3.5, // Fixed width to prevent overflow
                h: 0.35, // Fixed height
                fontSize: 11, // Smaller font size
                fontFace: "Arial",
                color: THEME.text,
                bullet: { type: "bullet" },
                wrap: true, // Enable text wrapping
                breakLine: true // Break long lines
              });
            }

            // If there are too many insights to fit, add pagination
            if (chart.insight.length > maxInsightsOnSlide) {
              slide.addText(`+ ${chart.insight.length - maxInsightsOnSlide} more insights`, {
                x: 5.5,
                y: 1.7 + (maxInsightsOnSlide * 0.4),
                fontSize: 10,
                fontFace: "Arial",
                italic: true,
                color: THEME.secondary,
              });

              // Create additional slides for remaining insights
              const remainingInsights = chart.insight.slice(maxInsightsOnSlide);
              const insightsPerAdditionalSlide = 12; // More insights on dedicated slides
              const additionalSlidesNeeded = Math.ceil(remainingInsights.length / insightsPerAdditionalSlide);

              for (let slideIdx = 0; slideIdx < additionalSlidesNeeded; slideIdx++) {
                const insightStartIdx = slideIdx * insightsPerAdditionalSlide;
                const insightEndIdx = Math.min(insightStartIdx + insightsPerAdditionalSlide, remainingInsights.length);
                const currentInsights = remainingInsights.slice(insightStartIdx, insightEndIdx);

                const additionalSlide = ppt.addSlide({ masterName: "CLEAN_MASTER_SLIDE" });

                additionalSlide.addText(`${chart.chart_type.toUpperCase()} Chart - Additional Insights (${slideIdx + 1}/${additionalSlidesNeeded})`, {
                  x: 0.5,
                  y: 0.7,
                  fontSize: 20,
                  fontFace: "Arial",
                  color: THEME.primary,
                  bold: true,
                  align: "left"
                });

                // Add all remaining insights on additional slides
                currentInsights.forEach((insight, idx) => {
                  additionalSlide.addText(insight, {
                    x: 0.5,
                    y: 1.3 + (idx * 0.4),
                    w: 8.5,
                    h: 0.35,
                    fontSize: 12,
                    fontFace: "Arial",
                    color: THEME.text,
                    bullet: { type: "bullet" },
                    wrap: true,
                    breakLine: true
                  });
                });
              }
            }
          }
        });
      }

      // Generate proper filename based on options
      let fileName = "Analysis_Report";
      if (!includeTableData) {
        fileName += "_Charts_Only";
      } else if (tableRowOption === 'all') {
        fileName += "_All_Data";
      } else {
        fileName += "_Limited_Data";
      }
      fileName += ".pptx";

      // Save the file
      ppt.writeFile({ fileName: fileName });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // React component for the download button with modal
  const DownloadPPTButton = () => {
    const [showModal, setShowModal] = useState(false);

    const handleDownloadClick = () => {
      setShowModal(true);
    };
  };

  // Alternative approach - if you're using a different selector or button
  // You can uncomment and modify this code as needed:
  /*
  const setupAlternativeButton = () => {
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.addEventListener('click', showDownloadOptions);
    }
  };
  setupAlternativeButton();
  */

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



  // Load comments from localStorage on component mount
  useEffect(() => {
    const savedComments = localStorage.getItem('promptComments');
    if (savedComments) {
      try {
        const parsed = JSON.parse(savedComments);

        // Process the dates in the parsed data
        const processedComments: { [key: string]: any[] } = {};

        Object.keys(parsed).forEach(promptId => {
          processedComments[promptId] = parsed[promptId].map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            editedAt: comment.editedAt ? new Date(comment.editedAt) : null
          }));
        });

        setCommentsMap(processedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  }, []);

  // Save comments to localStorage when they change
  useEffect(() => {
    localStorage.setItem('promptComments', JSON.stringify(commentsMap));
  }, [commentsMap]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the AI Documentation data from the API
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/ai-documentation/`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/ai-documentation/${id}`,
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

  const fetchData = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/data-management-table/get_all_tables_with_files`,
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
      setRows(data.filter((row: { board_id: number; }) => row.board_id === parseInt(boardId!)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [boardId]); // Only re-run if boardId changes

  useEffect(() => {
    if (view === "prompts" && boardId) {
      fetchData();
    }
  }, [view, boardId, fetchData]);


  useEffect(() => {

    const fetchPrompts = async () => {
      if (!boardId) return;
    
      setIsLoading(true);
      setError(null);
      const startTime = performance.now(); // Start timer
    
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/boards/${boardId}`,
          {
            headers: {
              "X-API-Key": "xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp",
            },
          }
        );
    
        const endTime = performance.now(); // End timer
        console.log(`API Response Time: ${(endTime - startTime).toFixed(2)} ms`);
    
        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }
    
        const data: Prompt[] = await response.json();
        console.log("Fetched prompts data:", data);
    
        setPrompts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        console.error("Error fetching prompts:", error);
      } finally {
        setIsLoading(false);
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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/run_prompt_v2?`
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

      // Check for charts first to prioritize them
      if ((runResult?.charts ?? []).length > 0) {
        setActiveTab('charts');
      } else if (runResult?.table && runResult.table.columns?.length > 0) {
        setActiveTab('table');
      } else if ((runResult?.message ?? []).length > 0) {
        setActiveTab('message');
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


    if (!hasReprompted) {
      // Show popup if user hasn't clicked reprompt first
      setShowPopup(true);
      return;
    }

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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/run_prompt_v2?`
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
  const closePopup = () => {
    setShowPopup(false);
  };


  const handleRePrompt = async () => {
    setHasReprompted(true);
    setIsLoading(true); // Start loading
    try {
      // Make the API request to get a new prompt
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/re_prompt?`,
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
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/data-management-table/${row.id}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/${promptId}`,
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
      // Show success toast message
      toast.success("Prompt deleted successfully!", {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      // Update the prompts list
      setPrompts(prompts.filter((prompt) => prompt.id !== promptId));
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      // Show error alert
      toast.error("Failed to delete prompt. Please try again.", {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
    setIsLoading(true); // Set loading to true when saving starts
    // Input validation
    if (!newPromptName.trim()) {
      alert("Prompt cannot be empty!");
      setIsLoading(false); // Reset loading state
      return;
    }
    // if (newPromptName.length > 255) {
    //   alert("Prompt must be between 1 and 255 characters.");
    //   return;
    // }
    if (!boardId) {
      alert("Error: boardId is missing.");
      setIsLoading(false); // Reset loading state
      return;
    }

    // Retrieve the logged-in user's name from localStorage
    const loggedInUserName = localStorage.getItem('loggedInUserName');
    if (!loggedInUserName || loggedInUserName.trim() === "") {
      alert("Error: User name is missing in localStorage. Please log in again.");
      setIsLoading(false); // Reset loading state
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
      ? `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/${editPromptId}` // Update endpoint
      : `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/prompts/`; // Create endpoint

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
        setIsLoading(false); // Reset loading state
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

      // Redirect to "Manage Prompts" tab
      setActiveTab("prompts"); // Redirect to the "prompts" tab
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error: Failed to save the prompt.");
    } finally {
      setIsLoading(false); // Reset loading state after the operation
    }
    // Redirect to Manage Prompts page

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
  //       "https://llm-backend-new-35486280762.us-central1.run.app/main-boards/boards/ai-documentation/${id}",
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
        `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/data-management-table/status/upload/${selectedTableId}`, // Ensure you're using selectedTableId
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
          `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/data-management-table/${editRow.id}`,
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
          `${process.env.NEXT_PUBLIC_API_URL}/main-boards/boards/data-management-table/create`,
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

  function handleDownloadClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  function setShowModal(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  // function downloadPPT(arg0: boolean, arg1: string) {
  //   throw new Error("Function not implemented.");
  // }

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
          <button
            className={`py-2 px-4 ${activeTab === "parameters" ? "border-b-4 border-blue-600" : ""}`}
            onClick={() => setActiveTab("parameters")}
          >
            <b>Other Parameters</b>
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
            {/* Show spinner while loading */}
            {/* {isLoading && (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )} */}
            {/* {error && <p className="text-red-500">Error: {error}</p>} */}
            {!isLoading && prompts.length > 0 && (
              // {prompts.length > 0 && (
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
                        <button
                          className="icon-btn comment-btn text-black relative"
                          onClick={() => handleCommentClick(prompt.id)} // Use the actual prompt ID
                        >
                          <FaComment />
                          {getCommentCount(prompt.id) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {getCommentCount(prompt.id)}
                            </span>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>


            )}

            {/* Show message if no prompts are found */}
            {/* {!isLoading && prompts.length === 0 && (
              <p className="text-center text-gray-500">No prompts found.</p>
            )} */}

          </>
        )}

        {activeTab === "repository" && (
          <div>
            {/* {isLoading && <Spinner />} */}
            {/* {loadingPromptsRepository ? (
              <div className="loading-overlay flex justify-center items-center h-40">
                <div className="spinner border-4 border-t-blue-500 border-gray-300 rounded-full w-10 h-10 animate-spin"></div>
              </div>
            ) : ( */}
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

          </div>
        )}

        {/* Inline Comment Modal */}
        {isCommentOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Semi-transparent overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={handleCloseComment}
            ></div>
            <div className="bg-white w-96 max-w-md rounded-lg shadow-lg z-10 relative">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium">
                  {editingCommentId !== null ? 'Edit Comment' : 'Comments'}
                </h3>
                <button onClick={handleCloseComment} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Existing Comments Section */}
              {getCurrentPromptComments().length > 0 && !editingCommentId && (
                <div className="px-4 py-2 max-h-60 overflow-y-auto">
                  {getCurrentPromptComments().map((comment) => (
                    <div key={String(comment.id)} className="border-b pb-2 mb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800">{comment.text}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(Number(comment.id))}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(Number(comment.id))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.editedAt
                          ? `Edited: ${formatDate(comment.editedAt)}`
                          : `Added: ${formatDate(comment.createdAt)}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSaveComment} className="p-3">
                <textarea
                  className="w-full p-2 border rounded-md mb-3 h-24 text-sm"
                  placeholder="Enter your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseComment}
                    className="px-3 py-1 text-xs border rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCommentId !== null ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* {comments.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Comments:</h4>
            <ul className="space-y-2">
              {comments.map(comment => (
                <li key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                  <p>{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )} */}

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
                          <p>{runResult.message[0]}</p>
                        </div>
                      )}

                      {activeTab === 'table' && runResult.table?.columns?.length > 0 && (
                        <div className="table-tab">
                          {runResult?.table && runResult.table.columns?.length > 0 ? (
                            <div className="mt-4">

                              {/* Download Excel Button */}
                              <div className="flex justify-end">
                                <button
                                  onClick={downloadExcel}
                                  className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  Download as Excel
                                </button>
                              </div>
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
                          <div className="flex justify-end">
                            <button
                              onClick={() => setShowDownloadModal(true)}
                              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                              Download as PPT
                            </button>
                            {showDownloadModal && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                  <h3 className="text-xl font-bold text-blue-700 mb-4">Download Report Options</h3>
                                  <p className="mb-4">Please select the type of report you would like to download:</p>

                                  <button
                                    onClick={() => {
                                      setShowDownloadModal(false);
                                      downloadPPT(false, 'limited');
                                    }}
                                    className="w-full mb-4 py-2 bg-blue-700 text-white rounded font-bold"
                                  >
                                    Charts Only
                                  </button>

                                  <div className="border-t border-gray-200 pt-4 mb-4">
                                    <p className="font-bold mb-2">Include table data in report:</p>

                                    <div className="space-y-2 mb-4">
                                      <div className="flex items-center">
                                        <input
                                          type="radio"
                                          id="limitedRows"
                                          name="tableRows"
                                          value="limited"
                                          defaultChecked
                                          className="mr-2"
                                        />
                                        <label htmlFor="limitedRows">First 20 rows only</label>
                                      </div>

                                      <div className="flex items-center">
                                        <input
                                          type="radio"
                                          id="allRows"
                                          name="tableRows"
                                          value="all"
                                          className="mr-2"
                                        />
                                        <label htmlFor="allRows">All table rows</label>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => {
                                        const selectedOptionElement = document.querySelector('input[name="tableRows"]:checked');
                                        const selectedOption = selectedOptionElement ? (selectedOptionElement as HTMLInputElement).value : null;
                                        setShowDownloadModal(false);
                                        downloadPPT(true, selectedOption ?? 'limited');
                                      }}
                                      className="w-full py-2 bg-blue-700 text-white rounded font-bold"
                                    >
                                      Download Complete Report
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => setShowDownloadModal(false)}
                                    className="w-full py-2 bg-gray-200 text-gray-800 rounded border border-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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
                                color: "blue", // Text/icon color for contrast
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
                                color: "red",
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
                                color: "green",
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
                                className="text-black bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
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
                                                <FaPen className="mr-1" size={16} style={{ color: "blue" }} />
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

                <button onClick={handleRePrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={isLoading}>
                  Reprompt
                </button>
                {/* {isLoading && <Spinner/>} Display spinner when loading */}
                {/* {isLoading && <Spinner />} */}
                <button
                  onClick={handleRunPrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={!newPromptName.trim() || isLoading}
                >
                  Run
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Save
                </button>

              </div>

              {/* Modal Popup - Kept outside the flex container */}
              {/* {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
                    <h3 className="text-xl font-semibold mb-2">Instruction</h3>
                    <p className="mb-4">Please click "Reprompt" first and then "Run" for better insights.</p>
                    <button
                      onClick={closePopup}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )} */}

              {/* Single loading indicator that displays when any action is in progress */}
              {isLoading && (
                <div className="fixed top-4 right-4">
                  <Spinner />
                </div>
              )}

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
                            <div className="flex justify-end">
                              <button
                                onClick={downloadExcel}
                                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Download as excel
                              </button>
                            </div>
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
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowDownloadModal(true)}
                            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                          >
                            Download as PPT
                          </button>


                          {showDownloadModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-xl font-bold text-blue-700 mb-4">Download Report Options</h3>
                                <p className="mb-4">Please select the type of report you would like to download:</p>

                                <button
                                  onClick={() => {
                                    setShowDownloadModal(false);
                                    downloadPPT(false, 'limited');
                                  }}
                                  className="w-full mb-4 py-2 bg-blue-500 text-white rounded font-bold"
                                >
                                  Charts Only
                                </button>

                                <div className="border-t border-gray-200 pt-4 mb-4">
                                  <p className="font-bold mb-2">Include table data in report:</p>

                                  <div className="space-y-2 mb-4">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id="limitedRows"
                                        name="tableRows"
                                        value="limited"
                                        defaultChecked
                                        className="mr-2"
                                      />
                                      <label htmlFor="limitedRows">First 20 rows only</label>
                                    </div>

                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id="allRows"
                                        name="tableRows"
                                        value="all"
                                        className="mr-2"
                                      />
                                      <label htmlFor="allRows">All table rows</label>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      const selectedOptionElement = document.querySelector('input[name="tableRows"]:checked');
                                      const selectedOption = selectedOptionElement ? (selectedOptionElement as HTMLInputElement).value : null;
                                      setShowDownloadModal(false);
                                      downloadPPT(true, selectedOption ?? 'limited');
                                    }}
                                    className="w-full py-2 bg-blue-700 text-white rounded font-bold"
                                  >
                                    Download Complete Report
                                  </button>
                                </div>

                                <button
                                  onClick={() => setShowDownloadModal(false)}
                                  className="w-full py-2 bg-gray-200 text-gray-800 rounded border border-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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


        {activeTab === "master" && (
          <div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items</h2>
                <button
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md flex items-center shadow-sm hover:bg-gray-50"
                  onClick={() => setNewItemMode(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1 bg-blue" /> New
                </button>
              </div>

              <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample data row - you'll replace this with actual data from your backend */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">Sample Item</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleEditItem(1)} className="text-blue-600 hover:text-blue-900">
                            <FaPen className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteItem(1)} className="text-red-600 hover:text-red-900">
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* New item row */}
                    {newItemMode && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={handleAddItem} className="text-green-600 hover:text-green-900">
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setNewItemMode(false)} className="text-red-600 hover:text-red-900">
                              <FaTrash className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsNewItemDropdownOpen(!isNewItemDropdownOpen)} className="text-blue-600 hover:text-blue-900">
                              {isNewItemDropdownOpen ? (
                                <ChevronUpIcon className="h-5 w-5" /> // Arrow Up icon
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" /> // Arrow Down icon
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Dropdown row */}
                    {isNewItemDropdownOpen && (
                      <>
                        <tr className="absolute bg-white border rounded-md shadow-md p-4 w-[950px] mt-1 z-10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Key
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {dropdownRows.map((row, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="text"
                                        className="border rounded px-2 py-1 w-40"
                                        placeholder="Enter key"
                                        value={row.key}
                                        onChange={(e) => handleDropdownInputChange(index, 'key', e.target.value)}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="text"
                                        className="border rounded px-2 py-1 w-40"
                                        placeholder="Enter value"
                                        value={row.value}
                                        onChange={(e) => handleDropdownInputChange(index, 'value', e.target.value)}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <button onClick={() => handleEditDropdownItem(index)} className="text-blue-600 hover:text-blue-900">
                                          <FaPen className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDeleteDropdownItem(index)} className="text-red-600 hover:text-red-900">
                                          <FaTrash className="h-5 w-5" />
                                        </button>
                                        <button
                                          onClick={handleAddDropdownRow}
                                          className="text-green-600 hover:text-green-900 flex items-center"
                                        >
                                          <PlusIcon className="h-5 w-5 mr-1" /> Add Row
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {/* <tr>
    <td  className="px-6 py-4 whitespace-nowrap">
      <button
        onClick={handleAddDropdownRow}
        className="text-green-600 hover:text-green-900 flex items-center"
      >
        <PlusIcon className="h-5 w-5 mr-1" /> Add Row
      </button>
    </td>
  </tr> */}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {activeTab === "timeline" && (
          <div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items</h2>
                <button
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md flex items-center shadow-sm hover:bg-gray-50"
                  onClick={() => setNewItemMode(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> New
                </button>
              </div>

              <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample data row - you'll replace this with actual data from your backend */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">Sample Item</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleEditItem(1)} className="text-blue-600 hover:text-blue-900">
                            <FaPen className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteItem(1)} className="text-red-600 hover:text-red-900">
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* New item row */}
                    {newItemMode && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={handleAddItem} className="text-green-600 hover:text-green-900">
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setNewItemMode(false)} className="text-red-600 hover:text-red-900">
                              <FaTrash className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsNewItemDropdownOpen(!isNewItemDropdownOpen)} className="text-blue-600 hover:text-blue-900">
                              {isNewItemDropdownOpen ? (
                                <ChevronUpIcon className="h-5 w-5" /> // Arrow Up icon
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" /> // Arrow Down icon
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Dropdown row */}
                    {isNewItemDropdownOpen && (
                      <>
                        <tr className="absolute bg-white border rounded-md shadow-md p-4 w-[950px] mt-1 z-10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Key
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {dropdownRows.map((row, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="text"
                                        className="border rounded px-2 py-1 w-40"
                                        placeholder="Enter key"
                                        value={row.key}
                                        onChange={(e) => handleDropdownInputChange(index, 'key', e.target.value)}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="text"
                                        className="border rounded px-2 py-1 w-40"
                                        placeholder="Enter value"
                                        value={row.value}
                                        onChange={(e) => handleDropdownInputChange(index, 'value', e.target.value)}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <button onClick={() => handleEditDropdownItem(index)} className="text-blue-600 hover:text-blue-900">
                                          <FaPen className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDeleteDropdownItem(index)} className="text-red-600 hover:text-red-900">
                                          <FaTrash className="h-5 w-5" />
                                        </button>
                                        <button
                                          onClick={handleAddDropdownRow}
                                          className="text-green-600 hover:text-green-900 flex items-center"
                                        >
                                          <PlusIcon className="h-5 w-5 mr-1" /> Add Row
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {/* <tr>
    <td  className="px-6 py-4 whitespace-nowrap">
      <button
        onClick={handleAddDropdownRow}
        className="text-green-600 hover:text-green-900 flex items-center"
      >
        <PlusIcon className="h-5 w-5 mr-1" /> Add Row
      </button>
    </td>
  </tr> */}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
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
