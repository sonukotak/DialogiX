export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface DatasetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: any[];
  summary?: any;
  data: any[];
}

export interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';
  title: string;
  data: any;
  options?: any;
}

export interface Insight {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChatHistory {
  messages: Message[];
  currentDataset?: DatasetInfo;
}

export interface SavedDashboard {
  id: string;
  userId: string;
  name: string;
  datasetInfo: DatasetInfo;
  insights: Insight[];
  charts: ChartData[];
  createdAt: Date;
}


export interface User {
  id: string;
  email: string;
  created_at: Date;
}