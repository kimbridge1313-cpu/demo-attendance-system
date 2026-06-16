import React, { useMemo, useState } from "react";

const DEPARTMENTS = ["A店", "B店"];
const DEFAULT_LOCATIONS = [
  { id: "loc-a", name: "A店", latitude: 23.7096, longitude: 120.5433, radiusMeters: 150 },
  { id: "loc-b", name: "B店", latitude: 23.7096, longitude: 120.5433, radiusMeters: 150 },
];
const DEFAULT_EMPLOYEES = [
  { id: "demo-owner", name: "Demo 管理者", role: "owner", status: "active", employeeType: "hourly", departments: ["A店", "B店"], hourlyWage: 0, baseSalary: 0 },
  { id: "emp-a", name: "A店 早班員工", role: "employee", status: "active", employeeType: "hourly", departments: ["A店"], hourlyWage: 190, baseSalary: 0 },
  { id: "emp-b", name: "B店 晚班員工", role: "employee", status: "active", employeeType: "hourly", departments: ["B店"], hourlyWage: 200, baseSalary: 0 },
];
const DEFAULT_RECORDS = [];
const DEMO_USER = DEFAULT_EMPLOYEES[0];

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function currentTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getMonthString() {
  return todayString().slice(0, 7);
}

function toMinutes(value) {
  if (!value) return null;
  const [h, m] = String(value).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function minutesBetween(start, end) {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null) return 0;
  return Math.max(0, e - s);
}

function formatHours(minutes) {
  return Math.round((Number(minutes || 0) / 60) * 100) / 100;
}

function getEmployeeDepartments(employee) {
  if (Array.isArray(employee?.departments) && employee.departments.length) return employee.departments;
  return ["A店"];
}

function App() {
  const [activeTab, setActiveTab] = useState("clock");
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [successPopup, setSuccessPopup] = useState(null);

  const employee = DEMO_USER;
  const todayRecords = records.filter((record) => record.employeeId === employee.id && record.date === todayString());

  function resetDemo() {
    setLocations(DEFAULT_LOCATIONS);
    setEmployees(DEFAULT_EMPLOYEES);
    setRecords(DEFAULT_RECORDS);
    setActiveTab("clock");
  }

  function clockIn(department) {
    const time = currentTimeString();
    const data = {
      id: `record-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department,
      date: todayString(),
      month: getMonthString(),
      clockIn: time,
      clockOut: "",
      workMinutes: 0,
      workHours: 0,
      attendanceStatus: "noSchedule",
      source: "portfolio-demo-local",
      status: "open",
      note: "作品集 Demo 本地紀錄，不會寫入 Firebase。",
    };
    setRecords((prev) => [data, ...prev]);
    setSuccessPopup({ title: "上班打卡成功", time, department, subtitle: "Demo 本地紀錄，不會寫入 Firebase" });
  }

  function clockOut(record) {
    const time = currentTimeString();
    const workMinutes = minutesBetween(record.clockIn, time);
    setRecords((prev) => prev.map((item) => item.id === record.id ? { ...item, clockOut: time, workMinutes, workHours: formatHours(workMinutes), status: "completed" } : item));
    setSuccessPopup({ title: "下班打卡成功", time, department: record.department, subtitle: `今日工時 ${formatHours(workMinutes)} 小時` });
  }

  return <div className="min-h-screen bg-neutral-100 text-neutral-900">
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">員工打卡系統</h1>
          <p className="text-xs text-neutral-500">作品集 Demo｜本地資料模式｜不連接 Firebase / LINE LIFF</p>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">{employee.name}</div>
          <div className="text-xs text-neutral-500">{getEmployeeDepartments(employee).join("、")}｜{employee.role}</div>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        目前是作品集 Demo。公司定位、員工資料、打卡紀錄都只存在前端 state；重新整理後回到預設資料，不會讀取或寫入 Firebase。
      </div>

      <nav className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-6">
        <TabButton active={activeTab === "clock"} onClick={() => setActiveTab("clock")}>打卡</TabButton>
        <TabButton active={activeTab === "records"} onClick={() => setActiveTab("records")}>打卡紀錄</TabButton>
        <TabButton active={activeTab === "employees"} onClick={() => setActiveTab("employees")}>員工管理</TabButton>
        <TabButton active={activeTab === "locations"} onClick={() => setActiveTab("locations")}>公司定位</TabButton>
        <TabButton active={activeTab === "salary"} onClick={() => setActiveTab("salary")}>薪資統計</TabButton>
        <button onClick={resetDemo} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">重置 Demo</button>
      </nav>

      {activeTab === "clock" && <ClockPanel employee={employee} records={todayRecords} onClockIn={clockIn} onClockOut={clockOut} />}
      {activeTab === "records" && <RecordsPanel records={records} setRecords={setRecords} employees={employees} />}
      {activeTab === "employees" && <EmployeesPanel employees={employees} setEmployees={setEmployees} />}
      {activeTab === "locations" && <LocationsPanel locations={locations} setLocations={setLocations} />}
      {activeTab === "salary" && <SalaryPanel employees={employees} records={records} />}
    </main>
    {successPopup && <ClockSuccessPopup data={successPopup} onClose={() => setSuccessPopup(null)} />}
  </div>;
}

function ClockPanel({ employee, records, onClockIn, onClockOut }) {
  const [department, setDepartment] = useState(getEmployeeDepartments(employee)[0]);
  const activeRecord = records.find((record) => !record.clockOut && record.department === department);
  return <div className="space-y-4">
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="bg-gradient-to-r from-neutral-950 to-neutral-800 px-4 py-4 text-white">
        <div className="text-xs font-bold tracking-widest text-neutral-300">TODAY SHIFT</div>
        <h2 className="mt-1 text-xl font-black">今日打卡</h2>
        <p className="mt-1 text-xs text-neutral-300">{todayString()}</p>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="mb-2 text-sm font-bold text-neutral-700">選擇打卡部門</div>
          <div className="grid grid-cols-2 gap-2">
            {getEmployeeDepartments(employee).map((item) => <button key={item} type="button" onClick={() => setDepartment(item)} className={`rounded-2xl px-4 py-3 text-sm font-black ${department === item ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"}`}>{item}</button>)}
          </div>
        </div>
        {!activeRecord
          ? <button onClick={() => onClockIn(department)} className="w-full rounded-3xl bg-neutral-900 px-4 py-5 text-xl font-black text-white">上班打卡</button>
          : <button onClick={() => onClockOut(activeRecord)} className="w-full rounded-3xl bg-blue-600 px-4 py-5 text-xl font-black text-white">下班打卡</button>}
      </div>
    </section>

    <Card title="今日紀錄" subtitle="Demo 資料只存在前端。">
      {records.length === 0 ? <Empty>今天尚無打卡紀錄</Empty> : <div className="space-y-3">{records.map((record) => <RecordCard key={record.id} record={record} />)}</div>}
    </Card>
  </div>;
}

function RecordsPanel({ records, setRecords, employees }) {
  const [form, setForm] = useState({ employeeId: employees[0]?.id || "", department: "A店", date: todayString(), clockIn: "09:00", clockOut: "18:00" });
  function addRecord(e) {
    e.preventDefault();
    const emp = employees.find((item) => item.id === form.employeeId) || employees[0];
    const workMinutes = minutesBetween(form.clockIn, form.clockOut);
    setRecords((prev) => [{ id: `record-${Date.now()}`, employeeId: emp.id, employeeName: emp.name, department: form.department, date: form.date, month: form.date.slice(0, 7), clockIn: form.clockIn, clockOut: form.clockOut, workMinutes, workHours: formatHours(workMinutes), attendanceStatus: "manualCorrection", source: "portfolio-demo-local", status: "completed" }, ...prev]);
  }
  return <Card title="打卡紀錄管理" subtitle="本地新增、修改、刪除，不會寫入 Firebase。">
    <form onSubmit={addRecord} className="mb-5 grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-5">
      <Select label="員工" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })}>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</Select>
      <Select label="部門" value={form.department} onChange={(v) => setForm({ ...form, department: v })}>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</Select>
      <Input label="日期" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
      <Input label="上班" type="time" value={form.clockIn} onChange={(v) => setForm({ ...form, clockIn: v })} />
      <Input label="下班" type="time" value={form.clockOut} onChange={(v) => setForm({ ...form, clockOut: v })} />
      <button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white md:col-span-5">新增本地紀錄</button>
    </form>
    {records.length === 0 ? <Empty>目前沒有打卡紀錄</Empty> : <div className="space-y-3">{records.map((record) => <div key={record.id} className="rounded-2xl border p-3"><RecordCard record={record} /><button onClick={() => setRecords((prev) => prev.filter((item) => item.id !== record.id))} className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">刪除</button></div>)}</div>}
  </Card>;
}

function EmployeesPanel({ employees, setEmployees }) {
  const [form, setForm] = useState({ name: "", role: "employee", employeeType: "hourly", departments: ["A店"], hourlyWage: 190 });
  function addEmployee(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("請填寫姓名");
    setEmployees((prev) => [...prev, { id: `emp-${Date.now()}`, status: "active", ...form, name: form.name.trim() }]);
    setForm({ name: "", role: "employee", employeeType: "hourly", departments: ["A店"], hourlyWage: 190 });
  }
  return <Card title="員工管理" subtitle="本地員工資料，不會讀寫 Firebase employees。">
    <form onSubmit={addEmployee} className="mb-5 grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-4">
      <Input label="姓名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Select label="權限" value={form.role} onChange={(v) => setForm({ ...form, role: v })}><option value="employee">員工</option><option value="manager">管理員</option><option value="owner">老闆</option></Select>
      <Select label="支援部門" value={form.departments[0]} onChange={(v) => setForm({ ...form, departments: [v] })}>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</Select>
      <Input label="時薪" type="number" value={String(form.hourlyWage)} onChange={(v) => setForm({ ...form, hourlyWage: Number(v || 0) })} />
      <button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white md:col-span-4">新增本地員工</button>
    </form>
    <div className="space-y-3">{employees.map((emp) => <div key={emp.id} className="grid gap-3 rounded-2xl border bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"><div><div className="font-bold">{emp.name}</div><div className="text-xs text-neutral-500">{emp.id}</div></div><div>{getEmployeeDepartments(emp).join("、")}</div><div>{emp.role}｜${Number(emp.hourlyWage || 0)}/hr</div><button onClick={() => setEmployees((prev) => prev.filter((item) => item.id !== emp.id))} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">刪除</button></div>)}</div>
  </Card>;
}

function LocationsPanel({ locations, setLocations }) {
  const [form, setForm] = useState({ name: "", latitude: "23.7096", longitude: "120.5433", radiusMeters: 150 });
  function addLocation(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("請填寫地點名稱");
    setLocations((prev) => [...prev, { id: `loc-${Date.now()}`, name: form.name.trim(), latitude: Number(form.latitude), longitude: Number(form.longitude), radiusMeters: Number(form.radiusMeters || 150) }]);
    setForm({ name: "", latitude: "23.7096", longitude: "120.5433", radiusMeters: 150 });
  }
  return <Card title="公司定位設定" subtitle="本地資料，不會讀寫 settings/companyLocations。">
    <form onSubmit={addLocation} className="mb-5 grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-5">
      <Input label="地點名稱" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Input label="緯度" type="number" value={String(form.latitude)} onChange={(v) => setForm({ ...form, latitude: v })} />
      <Input label="經度" type="number" value={String(form.longitude)} onChange={(v) => setForm({ ...form, longitude: v })} />
      <Input label="半徑/公尺" type="number" value={String(form.radiusMeters)} onChange={(v) => setForm({ ...form, radiusMeters: Number(v || 150) })} />
      <button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white">新增地點</button>
    </form>
    <div className="space-y-3">{locations.map((loc) => <div key={loc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-3"><div><div className="font-bold">{loc.name}</div><div className="text-xs text-neutral-500">{loc.latitude}, {loc.longitude}｜{loc.radiusMeters} 公尺</div></div><button onClick={() => setLocations((prev) => prev.filter((item) => item.id !== loc.id))} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">刪除</button></div>)}</div>
  </Card>;
}

function SalaryPanel({ employees, records }) {
  const rows = employees.map((emp) => {
    const empRecords = records.filter((record) => record.employeeId === emp.id);
    const totalMinutes = empRecords.reduce((sum, record) => sum + Number(record.workMinutes || 0), 0);
    const hours = formatHours(totalMinutes);
    const salary = Math.round(hours * Number(emp.hourlyWage || 0));
    return { ...emp, records: empRecords.length, hours, salary };
  });
  const totalPayroll = rows.reduce((sum, row) => sum + row.salary, 0);
  return <Card title="薪資統計" subtitle="依本地打卡紀錄試算，不會讀寫 Firebase payroll / attendanceRecords。">
    <div className="mb-4 grid gap-3 md:grid-cols-3"><InfoBox label="員工數" value={`${employees.length} 位`} /><InfoBox label="紀錄數" value={`${records.length} 筆`} /><InfoBox label="應發薪資合計" value={`$${totalPayroll.toLocaleString()}`} /></div>
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white"><table className="w-full min-w-[640px] text-sm"><thead className="bg-neutral-100 text-left text-neutral-500"><tr><th className="px-4 py-3">員工</th><th className="px-4 py-3">部門</th><th className="px-4 py-3">紀錄</th><th className="px-4 py-3">工時</th><th className="px-4 py-3">時薪</th><th className="px-4 py-3">薪資</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t"><td className="px-4 py-3 font-bold">{row.name}</td><td className="px-4 py-3">{getEmployeeDepartments(row).join("、")}</td><td className="px-4 py-3">{row.records}</td><td className="px-4 py-3">{row.hours}</td><td className="px-4 py-3">${Number(row.hourlyWage || 0)}</td><td className="px-4 py-3 font-bold">${row.salary.toLocaleString()}</td></tr>)}</tbody></table></div>
  </Card>;
}

function RecordCard({ record }) {
  return <div className="rounded-2xl bg-neutral-50 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><div className="font-bold">{record.employeeName}｜{record.department}</div><div className="text-sm text-neutral-500">{record.date}｜{record.clockIn || "-"} - {record.clockOut || "尚未下班"}</div></div>
      <div className="text-right text-sm"><div className="font-bold">{record.clockOut ? `${record.workHours || 0} 小時` : "進行中"}</div><div className="text-xs text-neutral-500">{record.source}</div></div>
    </div>
  </div>;
}

function ClockSuccessPopup({ data, onClose }) {
  return <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/35 p-6">
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">✓</div>
      <div className="text-xl font-black text-neutral-900">{data.title}</div>
      <div className="mt-3 rounded-2xl bg-neutral-50 p-4"><div className="text-3xl font-black text-neutral-900">{data.time}</div><div className="mt-2 text-sm font-bold text-neutral-600">{data.department}</div>{data.subtitle && <div className="mt-1 text-xs text-neutral-500">{data.subtitle}</div>}</div>
      <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-neutral-900 px-4 py-3 font-bold text-white">完成</button>
    </div>
  </div>;
}

function TabButton({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${active ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}>{children}</button>;
}
function Card({ title, subtitle, children }) {
  return <section className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="text-lg font-bold">{title}</h2>{subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}</div>{children}</section>;
}
function Empty({ children }) {
  return <div className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500">{children}</div>;
}
function Input({ label, value, onChange, type = "text" }) {
  return <label className="block min-w-0"><span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="box-border h-12 w-full min-w-0 rounded-2xl border border-neutral-200 bg-white px-4 text-base outline-none focus:border-neutral-900" /></label>;
}
function Select({ label, value, onChange, children }) {
  return <label className="block min-w-0"><span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="box-border h-12 w-full min-w-0 rounded-2xl border border-neutral-200 bg-white px-4 text-base outline-none focus:border-neutral-900">{children}</select></label>;
}
function InfoBox({ label, value }) {
  return <div className="rounded-2xl bg-neutral-100 p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></div>;
}

export default App;
