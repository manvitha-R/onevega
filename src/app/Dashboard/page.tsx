"use client"

import React from 'react';
import { Settings, ChevronDown, PlusCircle } from 'lucide-react';
import { LineChart, Legend, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const lineChartData = [
  { month: 'Jan', users: 4000, sessions: 2400 },
  { month: 'Feb', users: 3000, sessions: 1398 },
  { month: 'Mar', users: 2000, sessions: 9800 },
  { month: 'Apr', users: 2780, sessions: 3908 },
  { month: 'May', users: 1890, sessions: 4800 },
  { month: 'Jun', users: 2390, sessions: 3800 }
];

const barChartData = [
  { quarter: 'Mobile', sales: 3000 },
  { quarter: 'Desktop', sales: 2800 },
  { quarter: 'Tablet', sales: 2000 },
  { quarter: 'Other', sales: 1500 }
];

const pieChartData = [
  { name: 'Direct', value: 400 },
  { name: 'Email', value: 300 },
  { name: 'Social', value: 200 },
  { name: 'Internet', value: 100 }
];

const COLORS = ['#000033', '#000080', '#0000b3', '#0000e6'];

export default function Page() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-semibold">Sales Analysis Board</h1>
          <Settings className="text-gray-900" />
        </header>

        <main className="p-6 flex-1 bg-gray-200 overflow-y-auto flex flex-col">
  {/* Top Section - Data Management, Prompt Repository, Settings */}
  <div className="grid grid-cols-3 gap-6 mb-6">
    {/* Data Management */}
    <div className="container bg-white p-4 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <h3 className="flex items-center text-sm font-semibold mb-3">
        <span className="mr-2">📊</span> Data Management
      </h3>
      <div className="space-y-2 text-sm">
        <div className="text-blue-600">Configure Sources</div>
        <div className="text-blue-600">Upload Data</div>
      </div>
    </div>

    {/* Prompt Repository */}
    <div className="container bg-white p-4 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <h3 className="flex items-center text-sm font-semibold mb-3">
        <span className="mr-2">📝</span> Prompt Repository
      </h3>
      <div className="space-y-2 text-sm">
        <div className="text-blue-600">Saved Prompts</div>
        <div className="text-blue-600">Templates</div>
      </div>
    </div>

    {/* Settings */}
    <div className="container bg-white p-4 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <h3 className="flex items-center text-sm font-semibold mb-3">
        <span className="mr-2">⚙️</span> Settings
      </h3>
      <div className="space-y-2 text-sm">
        <div className="text-blue-600">Board Settings</div>
        <div className="text-blue-600">Permissions</div>
      </div>
    </div>
  </div>

  {/* Bottom Section - Visualization Area */}
  <div className="grid grid-cols-3 gap-6">
    {/* Revenue Over Time */}
    <div className="bg-white p-4 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <h3 className="text-lg font-semibold mb-4">Revenue Over Quarters</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#94b8b8" strokeWidth={2} />
            <Line type="monotone" dataKey="sessions" stroke="#000000" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Sales by Quarter */}
    <div className="bg-white p-4 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ">
      <h3 className="text-lg font-semibold mb-4">Sales By Quarter</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#1a1aff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Traffic Sources */}
    <div className="bg-white p-4 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</main>

      </div>

      {/* Right Sidebar */}
      {/* <div className="w-80 bg-white border-l shadow">
        <div className="p-6 space-y-6">
         
          <div className="container bg-gray-200 p-4 w-70 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <h3 className="flex items-center text-sm font-semibold mb-3">
                <span className="mr-2">📊</span>
                Data Management
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-blue-600">Configure Sources</div>
                <div className="text-blue-600">Upload Data</div>
              </div>
            </div>
          </div>

          <div className="container p-4 bg-gray-200 w-70 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <h3 className="flex items-center text-sm font-semibold mb-3">
                <span className="mr-2">📝</span>
                Prompt Repository
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-blue-600">Saved Prompts</div>
                <div className="text-blue-600">Templates</div>
              </div>
            </div>
          </div>

          
          <div className="container p-4 bg-gray-200 w-70 h-44 border rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <h3 className="flex items-center text-sm font-semibold mb-3">
                <span className="mr-2">⚙️</span>
                Settings
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-blue-600">Board Settings</div>
                <div className="text-blue-600">Permissions</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}