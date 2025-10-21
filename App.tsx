import React, { useState } from 'react';
import GenerateImage from './components/GenerateImage';
import EditImage from './components/EditImage';
import RestoreImage from './components/RestoreImage';
import MemorialPortrait from './components/MemorialPortrait';
import Tabs from './components/Tabs';
import type { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'generate', label: 'สร้างภาพ' },
    { id: 'repair', label: 'ซ่อมแซมภาพ' },
    { id: 'colorize', label: 'ลงสีภาพถ่าย' },
    { id: 'memorial', label: 'ภาพไว้อาลัย' },
  ];

  return (
    <div className="min-h-screen bg-base-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            MIX Image Studio
          </h1>
          <p className="mt-2 text-lg text-text-secondary">
            ชุดเครื่องมือ AI สำหรับสร้าง, ซ่อมแซม, ลงสี และทำภาพสำหรับที่ระลึก
          </p>
        </header>

        <main>
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6 bg-base-200 p-6 rounded-lg shadow-2xl border border-base-300">
            {activeTab === 'generate' && <GenerateImage />}
            {activeTab === 'repair' && <EditImage />}
            {activeTab === 'colorize' && <RestoreImage />}
            {activeTab === 'memorial' && <MemorialPortrait />}
          </div>
        </main>
         <footer className="text-center mt-12 text-sm text-gray-500">
          <p>ขับเคลื่อนโดย Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;