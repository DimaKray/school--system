import { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import _ from "lodash";

import { getAttendance } from "../services/attendanceService";

const COLORS = {
    present: "#2fb380",
    absent: "#e34848",
    late: "#e0a020"
};

const labels = {
    present: "Присутні",
    absent: "Відсутні",
    late: "Запізнення"
};

function AttendanceChart() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadData = async () => {

            try {

                const { data: res } = await getAttendance();
                const records = res.attendance || [];

                const grouped = _.countBy(records, "status");

                const chartData = Object.keys(labels).map((key) => ({
                    name: labels[key],
                    value: grouped[key] || 0,
                    color: COLORS[key]
                }));

                setData(chartData);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total === 0) {
        return <div style={{ color: "#999" }}>Немає даних про відвідуваність</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );

}

export default AttendanceChart;