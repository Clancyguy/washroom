'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';

export default function WashroomSignOutApp() {
  const [students, setStudents] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [rawList, setRawList] = useState('');

  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedList = localStorage.getItem('studentList');
    setStudents(savedStudents ? JSON.parse(savedStudents) : []);
    setStudentList(savedList ? JSON.parse(savedList) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('studentList', JSON.stringify(studentList));
  }, [studentList]);

  const signOut = (name) => {
    setStudents([
      { name, status: 'out', time: new Date().toISOString() },
      ...students,
    ]);
  };

  const signIn = (index) => {
    const updated = [...students];
    updated[index].status = 'in';
    updated[index].time = new Date().toISOString();
    setStudents(updated);
  };

  const saveStudentList = () => {
    const list = rawList
      .split('\n')
      .map(n => n.trim())
      .filter(Boolean);
    setStudentList(list);
    setRawList('');
  };

  return (
    <div className="fixed inset-0 bg-gray-100 p-4 flex flex-col">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-center mb-4">
        Washroom Sign Out
      </h1>

      {/* STUDENT BUTTONS (PRIMARY UI) */}
      {!adminMode && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {studentList.map((name, i) => (
            <Button
              key={i}
              onClick={() => signOut(name)}
              className="h-28 text-3xl font-bold rounded-2xl"
            >
              {name}
            </Button>
          ))}
        </div>
      )}

      {/* ADMIN ACCESS */}
      {!adminMode && (
        <div className="flex gap-2 justify-center mb-3">
          <input
            type="password"
            placeholder="Admin password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={() => password === 'admin123' && setAdminMode(true)}
          >
            Admin
          </Button>
        </div>
      )}

      {/* ADMIN PANEL */}
      {adminMode && (
        <div className="mb-4">
          <textarea
            className="w-full border p-2 mb-2"
            rows={5}
            placeholder="One student name per line"
            value={rawList}
            onChange={(e) => setRawList(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={saveStudentList}>Save Names</Button>
            <Button onClick={() => setStudents([])}>Clear Log</Button>
            <Button onClick={() => setAdminMode(false)}>Exit Admin</Button>
          </div>
        </div>
      )}

      {/* COMPACT RUNNING LOG */}
      <div className="flex-1 overflow-auto border-t pt-2">
        {students.slice(0, 8).map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-lg py-1 border-b"
          >
            <div>
              <strong>{s.name}</strong>{' '}
              <span className="text-gray-500">
                {s.status === 'out' ? 'OUT' : 'IN'} ·{' '}
                {new Date(s.time).toLocaleTimeString()}
              </span>
            </div>
            {s.status === 'out' && (
              <Button
                onClick={() => signIn(i)}
                className="px-6 py-3 text-xl"
              >
                SIGN IN
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}