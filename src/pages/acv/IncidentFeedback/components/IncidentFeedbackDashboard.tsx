import { LineChart, ColumnChart, DonutChart } from 'components/organisms/chart';

interface PropTypes {
  data?: any;
}

const IncidentFeedbackDashboard = ({ data }: PropTypes) => {
  // Dummy data cho 7 ngày gần nhất
  const dailyRequestData = [
    { date: '2025-06-03', count: 5 },
    { date: '2025-06-04', count: 8 },
    { date: '2025-06-05', count: 6 },
    { date: '2025-06-06', count: 10 },
    { date: '2025-06-07', count: 7 },
    { date: '2025-06-08', count: 12 },
    { date: '2025-06-09', count: 9 }
  ];

  const lineChartCategories = dailyRequestData.map((item) => item.date);
  const lineChartSeries = [
    {
      name: 'Requests',
      data: dailyRequestData.map((item) => item.count)
    }
  ];

  const lineChartOptions = {
    chart: { type: 'line', zoom: { enabled: false } },
    title: { text: 'Daily Incident Feedbacks', align: 'left' },
    xaxis: {
      categories: lineChartCategories,
      labels: { rotate: -45 }
    },
    yaxis: {
      min: 0,
      tickAmount: 5
    },
    stroke: { curve: 'smooth' },
    markers: { size: 5 }
  };

  const typeChartOptions = {
    chart: { type: 'bar' },
    title: { text: 'Feedbacks by Type', align: 'left' },
    dataLabels: { enabled: true }
  };

  const typeChartSeries = [10, 20, 5];
  const typeCategories = ['Bug', 'Feature Request', 'Other'];

  // Chart resolved/unresolved
  const statusChartSeries = [
    {
      name: 'Resolved',
      data: [10, 5, 7, 8, 9],
      color: '#D3D3D3'
    },
    {
      name: 'Unresolved',
      data: [2, 1, 3, 0, 2],
      color: '#FFCC00'
    }
  ];
  const statusCategories = ['System Error', 'Data Issue', 'UI Bug', 'Performance', 'Integration'];
  const statusChartOptions = {
    chart: { type: 'bar', stacked: true },
    title: { text: 'Resolved vs Unresolved Feedbacks', align: 'left' },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '50%' }
    },
    xaxis: { categories: statusCategories },
    legend: { position: 'top' },
    dataLabels: { enabled: true }
  };

  return (
    <div className="space-y-6 mt-5">
      {/* Line chart: Daily requests */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <LineChart chartOptions={lineChartOptions} series={lineChartSeries} categories={lineChartCategories} />
      </div>

      {/* 2 Column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback by type */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <DonutChart chartOptions={typeChartOptions} series={typeChartSeries} titleY="" titleX="" labels={typeCategories} />
        </div>

        {/* Resolved vs Unresolved */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <ColumnChart
            columnChartOptions={statusChartOptions}
            series={statusChartSeries}
            categories={statusCategories}
            titleY=""
            titleX=""
          />
        </div>
      </div>
    </div>
  );
};

export default IncidentFeedbackDashboard;
