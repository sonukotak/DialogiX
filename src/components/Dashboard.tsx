import React from 'react';
import { ChartData, Insight, DatasetInfo } from '../types';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Minus, FileSpreadsheet, Database } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  datasetInfo: DatasetInfo | undefined;
  insights: Insight[];
  charts: ChartData[];
  isVisible: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ datasetInfo, insights, charts, isVisible }) => {
  if (!isVisible || !datasetInfo) {
    return null;
  }

  const renderChart = (chart: ChartData) => {
    switch (chart.type) {
      case 'bar':
        return <Bar data={chart.data} options={chart.options} />;
      case 'line':
        return <Line data={chart.data} options={chart.options} />;
      case 'pie':
        return <Pie data={chart.data} options={chart.options} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };
  

  const renderTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="text-green-500" size={16} />;
      case 'down':
        return <ArrowDownRight className="text-red-500" size={16} />;
      default:
        return <Minus className="text-gray-500" size={16} />;
    }
  };
  return (
    <div id="dashboard" className="bg-gray-50 p-6 overflow-auto">
{/*   
   return (
     <div className="bg-gray-50 p-6 overflow-auto"> */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <FileSpreadsheet size={20} />
          Dataset Overview
        </h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-sm font-medium text-gray-500">File Name</h3>
              <p className="text-lg font-medium">{datasetInfo.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Rows</h3>
              <p className="text-lg font-medium">{datasetInfo.rowCount}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Columns</h3>
              <p className="text-lg font-medium">{datasetInfo.columnCount}</p>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-500 mb-2">Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {datasetInfo.columns.map((column) => (
                    <th
                      key={column}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datasetInfo.preview.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {datasetInfo.columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="px-3 py-2 text-xs text-gray-500 truncate max-w-[200px]">
                        {row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Database size={20} />
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-500">{insight.title}</h3>
                {renderTrendIcon(insight.trend)}
              </div>
              <p className="text-2xl font-semibold mt-2">{insight.value}</p>
              {insight.change && (
                <p className={`text-sm mt-1 ${insight.trend === 'up' ? 'text-green-500' : insight.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Visualizations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <div key={chart.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">{chart.title}</h3>
              <div className="h-64">
                {renderChart(chart)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;