import React, { useMemo, useState } from "react";

const departments = ["A店", "B店"];
const today = () => new Date().toISOString().slice(0, 10);
const monthNow = () => new Date().toISOString().slice(0, 7);
const timeNow = () => new Date().toTimeString().slice(0, 5);
const toMinutes = (value) => {
  if (!value) return 0;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};
const hoursBetween = (start, end) => Math.max(0, Math.round(((toMinutes(end) - toMinutes(start)) / 60) * 100) / 100);
const money = (value) => `$${Number(value || 0).toLocaleString()}`;
const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const seedEmployees = [
  { id: "owner", lineUserId: "owner", name: "Demo 管理者", role: "owner", status: "active", employeeType: "hourly", departments: ["A店", "B店"], department: "A店", hourlyWage: 0, baseSalary: 0, overtimeHourlyWage: 0, phone: "", note: "作品集展示帳號" },
  { id: "emp_a", lineUserId: "emp_a", name: "陳小安", role: "employee", status: "active", employeeType: "hourly", departments: ["A店"], department: "A店", hourlyWage: 190, baseSalary: 0, overtimeHourlyWage: 190, phone: "0912-000-001", note: "時薪員工" },
  { id: "emp_b", lineUserId: "emp_b", name: "林柏宇", role: "employee", status: "active", employeeType: "fullTime", departments: ["B店"], department: "B店", hourlyWage: 0, baseSalary: 32000, overtimeHourlyWage: 200, phone: "0912-000-002", note: "正職員工" },
];

const seedShifts = [
  { id: "shift_a_morning", name: "A店早班", department: "A店", startTime: "09:00", endTime: "18:00", graceMinutes: 10, isRest: false },
  { id: "shift_b_late", name: "B店晚班", department: "B店", startTime: "10:00", endTime: "19:00", graceMinutes: 10, isRest: false },
  { id: "shift_rest", name: "休息", department: "休息", startTime: "", endTime: "", graceMinutes: 0, isRest: true },
];

const seedSchedules = [
  { id: "sch_a", employeeId: "emp_a", employeeName: "陳小安", department: "A店", date: today(), month: monthNow(), shiftId: "shift_a_morning", shiftName: "A店早班", startTime: "09:00", endTime: "18:00", status: "scheduled" },
  { id: "sch_b", employeeId: "emp_b", employeeName: "林柏宇", department: "B店", date: today(), month: monthNow(), shiftId: "shift_b_late", shiftName: "B店晚班", startTime: "10:00", endTime: "19:00", status: "scheduled" },
];

const seedRecords = [
  { id: "rec_a", employeeId: "emp_a", employeeName: "陳小安", department: "A店", date: today(), month: monthNow(), clockIn: "09:02", clockOut: "18:00", workHours: 8.97, attendanceStatus: "normal", source: "demo" },
  { id: "rec_b", employeeId: "emp_b", employeeName: "林柏宇", department: "B店", date: today(), month: monthNow(), clockIn: "10:15", clockOut: "19:00", workHours: 8.75, attendanceStatus: "late", source: "demo" },
];

function statusText(status) {
  if (status === "normal") return "正常";
  if (status === "late") return "遲到";
  if (status === "earlyLeave") return "早退";
  if (status === "manual") return "主管修正";
  if (status === "pending") return "待審核";
  if (status === "approved") return "已通過";
  if (status === "rejected") return "已退回";
  return status || "未設定";
}

function App() {
  const [tab, setTab] = useState("clock");
  const [currentUser] = useState(seedEmployees[0]);
  const [employees, setEmployees] = useState(seedEmployees);
  const [records, setRecords] = useState(seedRecords);
  const [schedules, setSchedules] = useState(seedSchedules);
  const [shifts, setShifts] = useState(seedShifts);
  const [corrections, setCorrections] = useState([
    { id: "corr_1", employeeId: "emp_a", employeeName: "陳小安", department: "A店", date: today(), time: "09:00", type: "clockIn", reason: "忘記打上班卡", status: "pending" },
  ]);
  const [adjustments, setAdjustments] = useState([
    { id: "adj_1", employeeId: "emp_a", employeeName: "陳小安", month: monthNow(), type: "addition", title: "Demo 獎金", amount: 500, note: "展示資料" },
  ]);
  const [locations, setLocations] = useState([
    { id: "loc_a", name: "A店", latitude: 23.7096, longitude: 120.5433, radiusMeters: 150 },
    { id: "loc_b", name: "B店", latitude: 23.7096, longitude: 120.5433, radiusMeters: 150 },
  ]);
  const managerTabs = ["admin", "schedule", "salary"];

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-black">員工打卡系統 Demo</h1>
            <p className="text-xs text-neutral-500">作品集展示版｜本地假資料｜不連 Firebase / LIFF</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{currentUser.name}</div>
            <div className="text-xs text-neutral-500">{currentUser.departments.join("、")}｜{currentUser.role}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          這是獨立 Demo：你在此新增、修改、刪除資料，都只存在目前瀏覽器記憶體；重新整理後會回到預設展示資料。
        </div>
        <nav className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-7">
          <Tab active={tab === "clock"} onClick={() => setTab("clock")}>打卡</Tab>
          <Tab active={tab === "correction"} onClick={() => setTab("correction")}>補卡</Tab>
          <Tab active={tab === "myStats"} onClick={() => setTab("myStats")}>我的統計</Tab>
          <Tab active={tab === "mySchedule"} onClick={() => setTab("mySchedule")}>班表</Tab>
          {managerTabs.map((key) => <Tab key={key} active={tab === key} onClick={() => setTab(key)}>{key === "admin" ? "主管後台" : key === "schedule" ? "排班" : "薪資單"}</Tab>)}
        </nav>

        {tab === "clock" && <ClockPanel currentUser={currentUser} records={records} setRecords={setRecords} schedules={schedules} />}
        {tab === "correction" && <CorrectionPanel currentUser={currentUser} corrections={corrections} setCorrections={setCorrections} />}
        {tab === "myStats" && <StatsPanel currentUser={currentUser} records={records} />}
        {tab === "mySchedule" && <MySchedulePanel currentUser={currentUser} schedules={schedules} />}
        {tab === "admin" && <AdminPanel employees={employees} setEmployees={setEmployees} records={records} setRecords={setRecords} corrections={corrections} setCorrections={setCorrections} locations={locations} setLocations={setLocations} />}
        {tab === "schedule" && <SchedulePanel employees={employees} schedules={schedules} setSchedules={setSchedules} shifts={shifts} setShifts={setShifts} />}
        {tab === "salary" && <SalaryPanel employees={employees} records={records} adjustments={adjustments} setAdjustments={setAdjustments} />}
      </main>
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-2xl px-4 py-3 text-sm font-bold shadow-sm ${active ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}>{children}</button>;
}
function Card({ title, subtitle, children }) {
  return <section className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="text-lg font-black">{title}</h2>{subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}</div>{children}</section>;
}
function Input({ label, value, onChange, type = "text" }) {
  return <label className="block"><span className="mb-1 block text-sm font-bold text-neutral-700">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none focus:border-neutral-900" /></label>;
}
function Select({ label, value, onChange, children }) {
  return <label className="block"><span className="mb-1 block text-sm font-bold text-neutral-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 outline-none focus:border-neutral-900">{children}</select></label>;
}
function Info({ label, value }) {
  return <div className="rounded-2xl bg-neutral-100 p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>;
}
function Empty({ children }) {
  return <div className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500">{children}</div>;
}

function ClockPanel({ currentUser, records, setRecords, schedules }) {
  const [department, setDepartment] = useState("A店");
  const todayRecords = records.filter((r) => r.date === today());
  const open = todayRecords.find((r) => r.employeeId === currentUser.id && !r.clockOut);
  const userSchedules = schedules.filter((s) => s.date === today());
  function clockIn() {
    setRecords([{ id: newId(), employeeId: currentUser.id, employeeName: currentUser.name, department, date: today(), month: monthNow(), clockIn: timeNow(), clockOut: "", workHours: 0, attendanceStatus: "normal", source: "demo" }, ...records]);
  }
  function clockOut() {
    const now = timeNow();
    setRecords(records.map((r) => r.id === open.id ? { ...r, clockOut: now, workHours: hoursBetween(r.clockIn, now) } : r));
  }
  return <div className="space-y-4"><Card title="今日打卡" subtitle="展示版不檢查真實定位，也不寫入資料庫。">
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <Select label="打卡部門" value={department} onChange={setDepartment}>{departments.map((d) => <option key={d}>{d}</option>)}</Select>
      <Info label="今天日期" value={today()} />
      <Info label="現在時間" value={timeNow()} />
    </div>
    <div className="mb-4 grid gap-2 md:grid-cols-2">{userSchedules.map((s) => <div key={s.id} className="rounded-2xl border p-3"><b>{s.employeeName}</b>｜{s.department}<div className="text-sm text-neutral-500">{s.startTime} - {s.endTime}</div></div>)}</div>
    {!open ? <button onClick={clockIn} className="w-full rounded-3xl bg-neutral-900 px-4 py-5 text-xl font-black text-white">上班打卡</button> : <button onClick={clockOut} className="w-full rounded-3xl bg-blue-600 px-4 py-5 text-xl font-black text-white">下班打卡</button>}
  </Card><RecordList records={todayRecords} /></div>;
}

function RecordList({ records }) {
  return <Card title="打卡紀錄">{!records.length ? <Empty>目前沒有紀錄</Empty> : <div className="space-y-3">{records.map((r) => <div key={r.id} className="rounded-2xl border p-3"><div className="flex items-center justify-between"><div><b>{r.employeeName}</b>｜{r.department}<div className="text-sm text-neutral-500">{r.date}｜{r.clockIn || "-"} - {r.clockOut || "尚未下班"}</div></div><div className="text-right"><b>{r.workHours || 0} 小時</b><div className="text-xs text-neutral-500">{statusText(r.attendanceStatus)}</div></div></div></div>)}</div>}</Card>;
}

function CorrectionPanel({ currentUser, corrections, setCorrections }) {
  const [form, setForm] = useState({ date: today(), time: "09:00", type: "clockIn", reason: "" });
  function submit(e) {
    e.preventDefault();
    if (!form.reason.trim()) return alert("請填寫原因");
    setCorrections([{ id: newId(), employeeId: currentUser.id, employeeName: currentUser.name, department: "A店", status: "pending", ...form }, ...corrections]);
    setForm({ date: today(), time: "09:00", type: "clockIn", reason: "" });
  }
  return <div className="grid gap-5 md:grid-cols-2"><Card title="補卡申請"><form onSubmit={submit} className="space-y-3"><Input label="日期" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><Input label="時間" type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} /><Select label="類型" value={form.type} onChange={(v) => setForm({ ...form, type: v })}><option value="clockIn">補上班卡</option><option value="clockOut">補下班卡</option></Select><Input label="原因" value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} /><button className="w-full rounded-2xl bg-neutral-900 px-4 py-3 font-bold text-white">送出</button></form></Card><Card title="補卡紀錄"><CorrectionList corrections={corrections} /></Card></div>;
}
function CorrectionList({ corrections }) { return !corrections.length ? <Empty>沒有補卡紀錄</Empty> : <div className="space-y-3">{corrections.map((c) => <div key={c.id} className="rounded-2xl border p-3"><b>{c.employeeName}</b>｜{c.date} {c.time}<div className="text-sm text-neutral-500">{c.reason}｜{statusText(c.status)}</div></div>)}</div>; }

function StatsPanel({ currentUser, records }) {
  const rows = records.filter((r) => r.employeeId === currentUser.id || currentUser.role === "owner");
  const total = rows.reduce((s, r) => s + Number(r.workHours || 0), 0);
  return <Card title="我的統計"><div className="mb-4 grid gap-3 md:grid-cols-3"><Info label="月份" value={monthNow()} /><Info label="紀錄數" value={`${rows.length} 筆`} /><Info label="總工時" value={`${Math.round(total * 100) / 100} 小時`} /></div><RecordList records={rows} /></Card>;
}
function MySchedulePanel({ schedules }) { return <Card title="我的班表">{!schedules.length ? <Empty>尚無班表</Empty> : <div className="space-y-3">{schedules.map((s) => <div key={s.id} className="rounded-2xl border p-3"><b>{s.employeeName}</b>｜{s.department}<div className="text-sm text-neutral-500">{s.date}｜{s.startTime} - {s.endTime}</div></div>)}</div>}</Card>; }

function AdminPanel({ employees, setEmployees, records, setRecords, corrections, setCorrections, locations, setLocations }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("A店");
  function addEmployee(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const item = { id: newId(), lineUserId: newId(), name, role: "employee", status: "active", employeeType: "hourly", departments: [department], department, hourlyWage: 190, baseSalary: 0, overtimeHourlyWage: 190, phone: "", note: "手動新增 Demo" };
    setEmployees([item, ...employees]);
    setName("");
  }
  return <div className="space-y-5"><Card title="公司定位設定" subtitle="Demo 只保存在前端記憶體。"><div className="space-y-2">{locations.map((l) => <div key={l.id} className="flex items-center justify-between rounded-2xl border p-3"><div><b>{l.name}</b><div className="text-sm text-neutral-500">{l.latitude}, {l.longitude}｜{l.radiusMeters}m</div></div><button onClick={() => setLocations(locations.filter((x) => x.id !== l.id))} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">刪除</button></div>)}</div></Card>
  <Card title="員工管理"><form onSubmit={addEmployee} className="mb-4 grid gap-3 md:grid-cols-4"><Input label="姓名" value={name} onChange={setName} /><Select label="部門" value={department} onChange={setDepartment}>{departments.map((d) => <option key={d}>{d}</option>)}</Select><button className="rounded-2xl bg-neutral-900 px-4 py-3 font-bold text-white md:mt-6">新增員工</button></form><div className="space-y-3">{employees.map((e) => <div key={e.id} className="rounded-2xl border p-3"><div className="flex items-center justify-between gap-3"><div><b>{e.name}</b><div className="text-sm text-neutral-500">{e.departments.join("、")}｜{e.employeeType === "fullTime" ? "正職" : "時薪"}</div></div><button onClick={() => setEmployees(employees.filter((x) => x.id !== e.id))} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">刪除</button></div></div>)}</div></Card>
  <Card title="打卡紀錄管理"><RecordList records={records} /><button onClick={() => setRecords([])} className="mt-4 rounded-2xl bg-red-50 px-4 py-3 font-bold text-red-700">清空 Demo 紀錄</button></Card>
  <Card title="補卡審核"><div className="space-y-3">{corrections.map((c) => <div key={c.id} className="rounded-2xl border p-3"><b>{c.employeeName}</b>｜{c.date} {c.time}<div className="mt-2 flex gap-2"><button onClick={() => setCorrections(corrections.map((x) => x.id === c.id ? { ...x, status: "approved" } : x))} className="rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700">通過</button><button onClick={() => setCorrections(corrections.map((x) => x.id === c.id ? { ...x, status: "rejected" } : x))} className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">退回</button></div></div>)}</div></Card></div>;
}

function SchedulePanel({ employees, schedules, setSchedules, shifts, setShifts }) {
  const [form, setForm] = useState({ employeeId: employees[1]?.id || employees[0]?.id, date: today(), shiftId: shifts[0]?.id || "" });
  const selectedEmployee = employees.find((e) => e.id === form.employeeId) || employees[0];
  const selectedShift = shifts.find((s) => s.id === form.shiftId) || shifts[0];
  function addSchedule(e) {
    e.preventDefault();
    if (!selectedEmployee || !selectedShift) return;
    setSchedules([{ id: newId(), employeeId: selectedEmployee.id, employeeName: selectedEmployee.name, department: selectedShift.department, date: form.date, month: form.date.slice(0, 7), shiftId: selectedShift.id, shiftName: selectedShift.name, startTime: selectedShift.startTime, endTime: selectedShift.endTime, status: "scheduled" }, ...schedules]);
  }
  return <div className="space-y-5"><Card title="班次設定"><div className="space-y-3">{shifts.map((s) => <div key={s.id} className="rounded-2xl border p-3"><b>{s.name}</b>｜{s.department}<div className="text-sm text-neutral-500">{s.isRest ? "休息" : `${s.startTime} - ${s.endTime}`}</div></div>)}</div></Card><Card title="快速排班"><form onSubmit={addSchedule} className="grid gap-3 md:grid-cols-4"><Input label="日期" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><Select label="員工" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })}>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select><Select label="班次" value={form.shiftId} onChange={(v) => setForm({ ...form, shiftId: v })}>{shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select><button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white md:mt-6">加入排班</button></form></Card><MySchedulePanel schedules={schedules} /></div>;
}

function SalaryPanel({ employees, records, adjustments, setAdjustments }) {
  const [month, setMonth] = useState(monthNow());
  const rows = employees.filter((e) => e.role !== "owner").map((e) => {
    const empRecords = records.filter((r) => r.employeeId === e.id && r.month === month);
    const hours = empRecords.reduce((s, r) => s + Number(r.workHours || 0), 0);
    const empAdjustments = adjustments.filter((a) => a.employeeId === e.id && a.month === month);
    const additions = empAdjustments.filter((a) => a.type === "addition").reduce((s, a) => s + Number(a.amount || 0), 0);
    const deductions = empAdjustments.filter((a) => a.type === "deduction").reduce((s, a) => s + Number(a.amount || 0), 0);
    const base = e.employeeType === "fullTime" ? Number(e.baseSalary || 0) : Math.round(hours * Number(e.hourlyWage || 0));
    return { ...e, hours: Math.round(hours * 100) / 100, base, additions, deductions, salary: base + additions - deductions, records: empRecords, adjustments: empAdjustments };
  });
  const total = rows.reduce((s, r) => s + r.salary, 0);
  return <Card title="薪資單"><div className="mb-4 grid gap-3 md:grid-cols-4"><Input label="月份" type="month" value={month} onChange={setMonth} /><Info label="人數" value={`${rows.length} 人`} /><Info label="應發薪資" value={money(total)} /></div><div className="space-y-4">{rows.map((r) => <div key={r.id} className="rounded-3xl border bg-white p-4"><div className="grid gap-3 md:grid-cols-5"><div><b>{r.name}</b><div className="text-sm text-neutral-500">{r.department}｜{r.employeeType === "fullTime" ? "正職" : "時薪"}</div></div><Info label="工時" value={`${r.hours} 小時`} /><Info label="基本薪資" value={money(r.base)} /><Info label="加扣項" value={money(r.additions - r.deductions)} /><Info label="應發" value={money(r.salary)} /></div><div className="mt-3 text-sm text-neutral-500">打卡明細：{r.records.length ? r.records.map((x) => `${x.date} ${x.clockIn}-${x.clockOut || "未下班"}`).join(" / ") : "本月尚無打卡紀錄"}</div></div>)}</div></Card>;
}

export default App;
