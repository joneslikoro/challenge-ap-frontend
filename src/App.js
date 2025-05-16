import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css'; // Assumes Tailwind CSS is set up

const App = () => {
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [programmeData, setProgrammeData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [topSchools, setTopSchools] = useState([]);
  const [filters, setFilters] = useState({ year: '', programme: '' });
  const [availableYears, setAvailableYears] = useState([]);
  const [availableProgrammes, setAvailableProgrammes] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Total registrations
        const totalRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/total-registrations`);
        setTotalRegistrations(totalRes.data.total_registrations);

        // Registrations by programme
        const progRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/registrations-by-programme`);
        setProgrammeData(progRes.data);
        setAvailableProgrammes([...new Set(progRes.data.map(item => item.programme))]);

        // Registrations by year
        const yearRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/registrations-by-year`);
        setYearData(yearRes.data);
        setAvailableYears([...new Set(yearRes.data.map(item => item.registration_year))]);

        // Top schools
        const schoolRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/top-schools?limit=10`);
        setTopSchools(schoolRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    try {
      // Fetch filtered data for charts
      const progParams = new URLSearchParams(newFilters).toString();
      const progRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/registrations-by-programme?${progParams}`);
      setProgrammeData(progRes.data);

      const yearParams = new URLSearchParams(newFilters).toString();
      const yearRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/registrations-by-year?${yearParams}`);
      setYearData(yearRes.data);

      const schoolParams = new URLSearchParams(newFilters).toString();
      const schoolRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/top-schools?limit=10&${schoolParams}`);
      setTopSchools(schoolRes.data);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Registration Dashboard</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
          >
            <option value="">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Programme</label>
          <select
            name="programme"
            value={filters.programme}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
          >
            <option value="">All Programmes</option>
            {availableProgrammes.map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Registrations Widget */}
      <div className="mb-6">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Total Registrations</h2>
          <p className="text-4xl font-bold text-indigo-600">{totalRegistrations}</p>
        </div>
      </div>

      {/* Charts and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Registrations by Programme */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrations by Programme</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programmeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="programme" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Registrations by Academic Year */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrations by Academic Year</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="registration_year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table: Top 10 Secondary Schools */}
        <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top 10 Secondary Schools</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSchools.map((school, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.school}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
