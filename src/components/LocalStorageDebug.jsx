import React, { useState, useEffect } from 'react';

function LocalStorageDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          allData[key] = JSON.parse(localStorage.getItem(key));
        } catch (error) {
          allData[key] = localStorage.getItem(key);
        }
      }
      setData(allData);
    }
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleOpen}
        className="px-4 py-2 rounded-lg font-bold text-white bg-gray-600 hover:bg-gray-700 transition shadow-md"
      >
        {isOpen ? 'Hide Raw Data' : 'Show Raw Data'}
      </button>
      {isOpen && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="text-xs text-left overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LocalStorageDebug;
