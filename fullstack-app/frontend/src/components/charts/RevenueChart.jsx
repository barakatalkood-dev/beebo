import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./RevenueChart.css";

function formatDay(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function RevenueChart({ data = [], title = "Revenue" }) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDay(point.date),
  }));

  return (
    <div className="chart-card">

      <h2>{title}</h2>

      {chartData.length === 0 ? (
        <div className="chart-empty">No revenue data for this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={chartData}>

            <XAxis dataKey="label" />

            <YAxis />

            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#C77B95"
              strokeWidth={3}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>
      )}

    </div>
  );
}

export default RevenueChart;
