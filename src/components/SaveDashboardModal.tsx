import React from 'react';
import { X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import domtoimage from 'dom-to-image-more';
import { ChartData, Insight, DatasetInfo } from '../types';

interface SaveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  datasetInfo: DatasetInfo;
  insights: Insight[];
  charts: ChartData[];
}

interface SaveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveDashboardModal: React.FC<SaveDashboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    const dashboardElement = document.getElementById('dashboard');
    if (!dashboardElement) {
      toast.error('Dashboard not found!');
      return;
    }
  
    try {
      const dataUrl = await domtoimage.toPng(dashboardElement, {
        height: dashboardElement.scrollHeight, // Ensures full content capture
        width: dashboardElement.scrollWidth,
      });
  
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'full_dashboard.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      toast.success('Full Dashboard downloaded successfully!');
    } catch (error) {
      console.error('Error capturing dashboard:', error);
      toast.error('Failed to download the full dashboard.');
    }
  };  

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Download Full Dashboard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Download as Image Button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Download size={18} />
          Download Full Dashboard
        </button>
      </div>
    </div>
  );
};

export default SaveDashboardModal;

