'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function WashroomSignOutApp() {
  const [students, setStudents] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [rawList, setRawList] = useState('');
  const [savedLogs, setSavedLogs] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStudents = localStorage.getItem('students');
      const savedStudentList = localStorage.getItem('studentList');

      setStudents(savedStudents ? JSON.parse(savedStudents) : []);
      setStudentList(savedStudentList ? JSON.parse(savedStudentList) : []);

      const logs = Object.keys(localStorage)
        .filter(k => k.startsWith('log-'))
        .map(k => ({ key: k, date: k.replace('log-', '') }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setSavedLogs(logs);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentList', JSON.stringify(studentList));
    }
  }, [studentList]);

  const handleSignOut = (name) => {
    const entry = {
      name,
      status: 'out',
      time: new Date().toISOString(),
    };
    setStudents([entry, ...students]);
  };

  const handleSignIn = (index) => {
    const updated = [...students];
    updated[index].status = 'in';
    updated[index].time = new Date().toISOString();
    setStudents(updated);
  };

  const handleClear = () => {
    setStudents([]);
    localStorage.removeItem('students');
  };

  const handleExportCSV = () => {
    const rows = students.map(s => [
      s.name,
      s.status,
      new Date(s.time).toLocaleString()
    ]);
    const csv = [['Name', 'Status', 'Time'], ...rows]
      .map(r => r.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'washroom_log.csv';
    link.click();
  };

  const handleSaveDayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`log-${today}`, JSON.stringify(students));
    alert("Today's log saved");
  };

  const handleLoadLog = (key) => {
    const data = localStorage.getItem(key);
    if (data) setStudents(JSON.parse(data));
  };

  const handleSaveStudentList = () => {
    const list = rawList.split('\n').map(n => n.trim()).filter(Boolean);
    setStudentList(list);
    setRawList('');
  };

  const getElapsed = (time) => {
    const diff = Date.now() - new Date(time).getTime();
    const mins = Math.floor(diff / 60000);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-4xl mx-auto">

      <h1 className="text-4xl font-bold text-center mb-6">
        Washroom Sign Out
      </h1>

      {/* STUDENT KIOSK BUTTONS */}
      {!adminMode && studentList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {studentList.map((student, i) => (
            <Button
              key={i}
              onClick={() => handleSignOut(student)}
              className="py-10 text-3xl rounded-2xl"
            >
              {student}
            </Button>
          ))}
        </div>
      )}

      {!adminMode && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Input
            type="password"
            placeholder="Teacher Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-xl p-4"
          />
          <Button
            className="px-8 py-4 text-xl"
            onClick={() => password === 'admin123' && setAdminMode(true)}
          >
            Admin Mode
          </Button>
        </div>
      )}

      {/* ADMIN PANEL */}
      {adminMode && (
        <div className="mb-10">
          <Textarea
            placeholder="Enter student names, one per line"
            value={rawList}
            onChange={(e) => setRawList(e.target.value)}
            className="text-lg min-h-[140px] mb-4"
          />

          <div className="flex flex-wrap gap-3">
            <Button className="px-6 py-4 text-lg" onClick={handleSaveStudentList}>
              Save Student List
            </Button>
            <Button className="px-6 py-4 text-lg" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button className="px-6 py-4 text-lg" onClick={handleSaveDayLog}>
              Save Today
            </Button>
            <Button className="px-6 py-4 text-lg" onClick={handleClear}>
              Clear
            </Button>
            <Button className="px-6 py-4 text-lg" onClick={() => setAdminMode(false)}>
              Exit Admin
            </Button>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Saved Logs</h2>
            <div className="flex flex-wrap gap-2">
              {savedLogs.map(log => (
                <Button key={log.key} onClick={() => handleLoadLog(log.key)}>
                  {log.date}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE LOG */}
      <div className="space-y-4">
        {students.map((s, i) => (
          <Card key={i} className="rounded-2xl shadow">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-2xl font-semibold">{s.name}</p>
                <p className="text-gray-500">
                  {s.status === 'out' ? 'Out' : 'In'} at{' '}
                  {new Date(s.time).toLocaleTimeString()}
                </p>
                {s.status === 'out' && (
                  <p className="text-blue-600">Out for {getElapsed(s.time)}</p>
                )}
              </div>

              {s.status === 'out' && (
                <Button
                  onClick={() => handleSignIn(i)}
                  className="px-10 py-6 text-2xl rounded-xl"
                >
                  SIGN IN
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
