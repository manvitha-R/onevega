"use client"

import React from 'react'
import { useState, useEffect } from "react";
import { Play, Trash, Pencil } from 'lucide-react';


interface Prompt {
    id: string;
    prompt_text: string;
    user_name: string;
    updated_at: string;
  }  



export default function page({ boardId }: { boardId: string }) {

    const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [loadingPromptPlay, setLoadingPromptPlay] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('prompts'); // To track which section is active




  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/boards/${boardId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchPrompts();
    }
  }, [boardId]);


  const handleAddPrompt = () => {
    setIsAddingPrompt(true);
    setNewPromptName('');
    setIsEditingPrompt(false);
  };


  const handleEditPrompt = (prompt: Prompt) => {
    setIsEditingPrompt(true);
    setIsAddingPrompt(false);
    setNewPromptName(prompt.prompt_text);
    setEditPromptId(prompt.id);
  };



  
  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPromptName || newPromptName.length > 255) {
      console.error('Prompt must be between 1 and 255 characters');
      return;
    }

    if (!boardId) {
      console.error('boardId is undefined');
      return;
    }

    const promptData = {
      board_id: boardId,
      prompt_text: newPromptName,
      prompt_out: 'out_string',
      user_name: 'Shashi Raj',
    };

    try {
        const endpoint = isEditingPrompt
          ? `https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/${editPromptId}`
          : 'https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/';
        const method = isEditingPrompt ? 'PUT' : 'POST';
  
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promptData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save prompt');
        }
  
        await fetchPrompts();
        setIsAddingPrompt(false);
        setIsEditingPrompt(false);
        setNewPromptName('');
      } catch (error) {
        console.error('Error saving prompt:', error);
      }
    };


    const handleDeletePrompt = async (promptId: string) => {
        try {
          const response = await fetch(`https://llm-backend-lcrqhjywba-uc.a.run.app/main-boards/boards/prompts/${promptId}`, {
            method: 'DELETE',
          });
    
          if (!response.ok) {
            throw new Error('Failed to delete prompt');
          }
    
          await fetchPrompts();
        } catch (error) {
          console.error('Error deleting prompt:', error);
        }
      };
    
      const handlePlayClick = async (prompt: Prompt) => {
        setLoadingPromptPlay(prompt.id);
        try {
          // Implement your play functionality here
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
        } finally {
          setLoadingPromptPlay(null);
        }
      };


      
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
       <div className="container mx-auto p-3 bg-gray-100 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center text-sm font-semibold">
          <span className="mr-2">📊</span>
          Manage Tables
        </h3>
        <button
          onClick={handleAddPrompt}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          New Prompts +
        </button>
      </div>

      {isAddingPrompt || isEditingPrompt ? (
        <form onSubmit={handleSavePrompt} className="mb-6">
          <input
            type="text"
            value={newPromptName}
            onChange={(e) => setNewPromptName(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Enter prompt text..."
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
            >
              {isEditingPrompt ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingPrompt(false);
                setIsEditingPrompt(false);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="font-semibold mb-2">
              {index + 1}. "{prompt.prompt_text}"
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Created By: {prompt.user_name}</p>
              <p className="text-sm text-gray-600">
                Updated at: {new Date(prompt.updated_at).toLocaleDateString()}
              </p>
              <hr className="my-2" />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handlePlayClick(prompt)}
                  className="p-2 text-blue-500 hover:text-blue-600"
                  disabled={loadingPromptPlay === prompt.id}
                >
                  <Play />
                </button>
                <button
                  onClick={() => handleEditPrompt(prompt)}
                  className="p-2 text-green-500 hover:text-green-600"
                >
                  <Pencil />
                </button>
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <Trash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  
    </div>
  )
}
