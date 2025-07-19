import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DatasetInfo, ChartData, Insight } from '../types';

// Parse CSV files
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Parse Excel files
export const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Process uploaded file
export const processFile = async (file: File): Promise<DatasetInfo> => {
  try {
    let data;
    if (file.name.endsWith('.csv')) {
      data = await parseCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      data = await parseExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }

    // Clean column names
    const cleanData = cleanDataset(data);
    
    // Generate dataset info
    const columns = Object.keys(cleanData[0] || {});
    const datasetInfo: DatasetInfo = {
      name: file.name,
      rowCount: cleanData.length,
      columnCount: columns.length,
      columns: columns,
      preview: cleanData.slice(0, 5),
      data: cleanData,
      summary: generateSummary(cleanData)
    };

    return datasetInfo;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

// Clean dataset (normalize column names, handle missing values)
const cleanDataset = (data: any[]): any[] => {
  if (!data || data.length === 0) return [];

  // Create a new array with cleaned data
  return data.map(row => {
    const cleanedRow: Record<string, any> = {};
    
    // Process each column in the row
    Object.entries(row).forEach(([key, value]) => {
      // Clean column names: lowercase and replace spaces with underscores
      const cleanKey = key.toLowerCase().replace(/\s+/g, '_');
      
      // Handle missing or null values
      cleanedRow[cleanKey] = value === null || value === '' ? null : value;
    });
    
    return cleanedRow;
  });
};

// Generate statistical summary of the dataset
const generateSummary = (data: any[]): any => {
  if (!data || data.length === 0) return {};

  const summary: Record<string, any> = {};
  const columns = Object.keys(data[0]);

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    
    // Check if values are numeric
    const numericValues = values.filter(val => !isNaN(Number(val))).map(val => Number(val));
    
    if (numericValues.length > 0) {
      // Calculate statistics for numeric columns
      summary[column] = {
        count: numericValues.length,
        mean: calculateMean(numericValues),
        median: calculateMedian(numericValues),
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        std: calculateStandardDeviation(numericValues)
      };
    } else {
      // For non-numeric columns, count unique values
      const uniqueValues = new Set(values);
      summary[column] = {
        count: values.length,
        unique: uniqueValues.size,
        mostCommon: findMostCommon(values)
      };
    }
  });

  return summary;
};

// Helper functions for statistical calculations
const calculateMean = (values: number[]): number => {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

const calculateStandardDeviation = (values: number[]): number => {
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
};

const findMostCommon = (values: any[]): any => {
  const counts: Record<string, number> = {};
  
  values.forEach(val => {
    const key = String(val);
    counts[key] = (counts[key] || 0) + 1;
  });
  
  let maxCount = 0;
  let mostCommon = null;
  
  Object.entries(counts).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });
  
  return { value: mostCommon, count: maxCount };
};

// Generate insights from the data
export const generateInsights = (data: any[]): Insight[] => {
  if (!data || data.length === 0) return [];
  
  const insights: Insight[] = [];
  
  // Find numeric columns
  const columns = Object.keys(data[0] || {});
  const numericColumns = columns.filter(column => {
    const values = data.map(row => row[column]);
    return values.some(val => !isNaN(Number(val)));
  });
  
  // Generate insights for each numeric column
  numericColumns.forEach(column => {
    const values = data
      .map(row => Number(row[column]))
      .filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      
      insights.push({
        title: `Average ${column}`,
        value: avg.toFixed(2),
        trend: 'neutral'
      });
      
      insights.push({
        title: `Total ${column}`,
        value: total.toFixed(2),
        trend: 'neutral'
      });
    }
  });
  
  // Add record count insight
  insights.push({
    title: 'Total Records',
    value: data.length,
    trend: 'neutral'
  });
  
  return insights;
};

// Generate charts based on the data
export const generateCharts = (data: any[]): ChartData[] => {
  if (!data || data.length === 0) return [];
  
  const charts: ChartData[] = [];
  const columns = Object.keys(data[0] || {});
  
  // Find numeric columns
  const numericColumns = columns.filter(column => {
    const values = data.map(row => row[column]);
    return values.some(val => !isNaN(Number(val)));
  });
  
  // Generate line charts for numeric columns
  numericColumns.forEach(column => {
    const values = data
      .map((row, index) => ({
        x: index,
        y: Number(row[column])
      }))
      .filter(point => !isNaN(point.y));
    
    if (values.length > 0) {
      charts.push({
        id: `${column}-trend`,
        type: 'line',
        title: `${column} Trend`,
        data: {
          labels: values.map(v => v.x.toString()),
          datasets: [{
            label: column,
            data: values.map(v => v.y),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `${column} Over Time`
            }
          }
        }
      });
    }
  });
  
  // Generate pie charts for categorical columns
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
  
  categoricalColumns.forEach(column => {
    const categories: Record<string, number> = {};
    data.forEach(row => {
      const value = String(row[column] || 'Unknown');
      categories[value] = (categories[value] || 0) + 1;
    });
    
    const chartData = {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ]
      }]
    };
    
    charts.push({
      id: `${column}-distribution`,
      type: 'pie',
      title: `${column} Distribution`,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: `Distribution of ${column}`
          }
        }
      }
    });
  });
  
  return charts;
};

// Get AI response for user questions
export const getAIResponse = async (question: string, datasetInfo: DatasetInfo): Promise<string> => {
  const API_KEY = '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';
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  // Create a context about the data
  const dataContext = {
    fileName: datasetInfo.name,
    rowCount: datasetInfo.rowCount,
    columnCount: datasetInfo.columnCount,
    columns: datasetInfo.columns,
    summary: datasetInfo.summary,
    sampleData: datasetInfo.preview
  };

  const prompt = `You are a data analysis expert. Analyze this dataset:
  
File: ${dataContext.fileName}
Rows: ${dataContext.rowCount}
Columns: ${dataContext.columns.join(', ')}

Sample Data:
${JSON.stringify(dataContext.sampleData, null, 2)}

Statistical Summary:
${JSON.stringify(dataContext.summary, null, 2)}

User Question: ${question}

Provide a detailed, accurate answer based on the data provided. Include specific numbers and insights where relevant.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'HTTP-Referer': 'https://stackblitz.com',
        'X-Title': 'DialogixAI',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { 
            role: 'system', 
            content: 'You are a data analysis expert assistant. Provide clear, concise answers with specific numbers and insights from the data.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.9,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I was unable to analyze the data. Please try asking your question differently.';
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'I apologize, but I encountered an error while analyzing the data. Please try again.';
  }
};