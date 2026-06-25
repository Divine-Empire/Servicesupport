import React, { useState, useMemo, useEffect } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Calendar, User, X, Ticket, Loader2 } from "lucide-react";

// Curated premium HSL-tailored colors for engineers
const PREMIUM_COLORS = [
  { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", badge: "bg-emerald-100 text-emerald-800" },
  { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", badge: "bg-indigo-100 text-indigo-800" },
  { bg: "bg-amber-50 text-amber-700 border-amber-200", badge: "bg-amber-100 text-amber-800" },
  { bg: "bg-rose-50 text-rose-700 border-rose-200", badge: "bg-rose-100 text-rose-800" },
  { bg: "bg-sky-50 text-sky-700 border-sky-200", badge: "bg-sky-100 text-sky-800" },
  { bg: "bg-violet-50 text-violet-700 border-violet-200", badge: "bg-violet-100 text-violet-800" },
  { bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-800" },
  { bg: "bg-cyan-50 text-cyan-700 border-cyan-200", badge: "bg-cyan-100 text-cyan-800" },
  { bg: "bg-teal-50 text-teal-700 border-teal-200", badge: "bg-teal-100 text-teal-800" },
  { bg: "bg-orange-50 text-orange-700 border-orange-200", badge: "bg-orange-100 text-orange-800" },
];

const getEngineerColor = (name) => {
  if (!name) return { bg: "bg-slate-50 text-slate-700 border-slate-200", badge: "bg-slate-100 text-slate-800" };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PREMIUM_COLORS[Math.abs(hash) % PREMIUM_COLORS.length];
};

/**
 * IST formatter singleton — reused to avoid per-call overhead.
 */
const IST_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const getISTComponents = (date) => {
  const parts = {};
  IST_FORMATTER.formatToParts(date).forEach((p) => {
    if (p.type !== "literal") parts[p.type] = parseInt(p.value, 10);
  });
  return { year: parts.year, month: parts.month - 1, day: parts.day };
};

/**
 * Parse a dateOfVisit string and extract IST { year, month (0-indexed), day }.
 *
 * Google Apps Script serializes Sheets Date cells to JSON as ISO 8601 UTC strings
 * e.g. "2026-05-13T18:30:00.000Z" which represents midnight IST on May 14 2026.
 * Simply reading the digits from the UTC string gives the wrong day (13, not 14).
 *
 * Strategy:
 *   • If the string contains "T" or ends with "Z" → it is an ISO UTC timestamp.
 *     Create a real Date and extract IST components via Intl.
 *   • If the string contains "/" (e.g., "14/05/2026") → local formatted date.
 *     Extract day/month/year directly from the string (no timezone math needed).
 *   • If the string is YYYY-MM-DD (no T) → treat as a plain calendar date in IST.
 *     Extract directly.
 */
const parseIST = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  // ISO UTC timestamp (e.g., "2026-05-13T18:30:00.000Z" or "2026-05-14T00:00:00")
  if (dateStr.includes("T") || dateStr.endsWith("Z")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return getISTComponents(d);
    return null;
  }

  // DD/MM/YYYY or MM/DD/YYYY — sheets often use DD/MM/YYYY in Indian locale
  if (dateStr.includes("/")) {
    const datePart = dateStr.split(" ")[0];
    const parts = datePart.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
    }
  }

  // YYYY-MM-DD (plain date, no time component — treat as IST calendar date)
  if (dateStr.includes("-")) {
    const datePart = dateStr.split(" ")[0];
    const parts = datePart.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) return { day, month, year };
    }
    // DD-MM-YYYY
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
    }
  }

  return null;
};


export default function VisitCalendarModal({ isOpen, onClose, allData = [], masterData = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEngineer, setSelectedEngineer] = useState("all");
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Show spinner briefly when modal opens (data computation)
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Show spinner briefly when month changes
  const handlePrevMonth = () => {
    setIsLoading(true);
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleNextMonth = () => {
    setIsLoading(true);
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setTimeout(() => setIsLoading(false), 200);
  };

  const engineersList = useMemo(() => {
    const masterEngs = masterData[0]?.["Engineer Assign Name"] || [];
    if (masterEngs.length > 0) return [...new Set(masterEngs)].sort();
    return [...new Set(allData.map((t) => t.engineerAssign).filter(Boolean))].sort();
  }, [masterData, allData]);

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const numDaysPrev = new Date(currentYear, currentMonth, 0).getDate();
    const cells = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: numDaysPrev - i,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= numDays; i++) {
      cells.push({ day: i, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [currentMonth, currentYear]);

  /**
   * KEY OPTIMIZATION: Pre-compute a lookup map of { "YYYY-M-D": [tickets] }
   * for the currently visible months, instead of scanning all tickets 42 times.
   * Also pre-applies the engineer filter so each cell lookup is O(1).
   */
  const visitsLookup = useMemo(() => {
    const map = {};
    const engFilter = selectedEngineer !== "all" ? selectedEngineer.toLowerCase() : null;

    for (const ticket of allData) {
      if (!ticket.dateOfVisit) continue;
      const comp = parseIST(ticket.dateOfVisit);
      if (!comp) continue;

      if (engFilter && String(ticket.engineerAssign).toLowerCase() !== engFilter) continue;

      const key = `${comp.year}-${comp.month}-${comp.day}`;
      if (!map[key]) map[key] = [];
      map[key].push(ticket);
    }
    return map;
  }, [allData, selectedEngineer]);

  const todayIST = useMemo(() => getISTComponents(new Date()), []);

  const handleCellClick = (cell, visits) => {
    if (visits.length > 0) setSelectedDayDetails({ cell, visits });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Engineer Visit Calendar" size="4xl">
      <div className="flex flex-col gap-4 -mt-2 relative">
        {/* Loading Spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">Loading calendar...</span>
            </div>
          </div>
        )}

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-9 w-9 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-bold text-slate-800 min-w-[145px] text-center flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              {months[currentMonth]} {currentYear}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedEngineer}
              onChange={(e) => setSelectedEngineer(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Engineers</option>
              {engineersList.map((eng) => (
                <option key={eng} value={eng}>{eng}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-md bg-white">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xs font-semibold py-2.5 uppercase tracking-wider">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Days — uses O(1) lookup */}
          <div className="grid grid-cols-7 auto-rows-[65px] gap-px bg-slate-100">
            {calendarCells.map((cell, index) => {
              const key = `${cell.year}-${cell.month}-${cell.day}`;
              const visits = visitsLookup[key] || [];
              const isToday =
                todayIST.day === cell.day &&
                todayIST.month === cell.month &&
                todayIST.year === cell.year;

              return (
                <div
                  key={index}
                  onClick={() => handleCellClick(cell, visits)}
                  className={`bg-white p-1.5 flex flex-col justify-start gap-0.5 transition-all duration-150 ${
                    cell.isCurrentMonth ? "text-slate-800" : "bg-slate-50/60 text-slate-400"
                  } ${
                    visits.length > 0
                      ? "cursor-pointer hover:bg-blue-50/40 ring-1 ring-transparent hover:ring-blue-300"
                      : ""
                  } relative`}
                >
                  <div className="flex items-center justify-between leading-none mb-0.5">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {visits.length > 1 && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {visits.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 overflow-hidden select-none">
                    {visits.slice(0, 2).map((visit, vIdx) => {
                      const color = getEngineerColor(visit.engineerAssign);
                      return (
                        <div
                          key={vIdx}
                          className={`text-[8.5px] leading-tight px-1 py-0.5 rounded border truncate font-medium ${color.bg}`}
                          title={`${visit.engineerAssign} — ${visit.companyName || "No Company"}`}
                        >
                          {visit.engineerAssign || "Unassigned"}
                        </div>
                      );
                    })}
                    {visits.length > 2 && (
                      <div className="text-[8px] text-slate-400 font-semibold pl-1 leading-none">
                        +{visits.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Visits Overlay Popup */}
        {selectedDayDetails && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-sm">
                    Visits on {selectedDayDetails.cell.day} {months[selectedDayDetails.cell.month]} {selectedDayDetails.cell.year}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDayDetails(null)}
                  className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {selectedDayDetails.visits.map((visit, idx) => {
                  const color = getEngineerColor(visit.engineerAssign);
                  return (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-xl p-3 bg-gradient-to-r from-slate-50/50 to-white hover:border-blue-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            #{visit.ticketId || "N/A"}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
                          {visit.engineerAssign || "Unassigned"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wide">Company</span>
                          <span className="font-semibold text-slate-700">{visit.companyName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wide">Client</span>
                          <span className="font-semibold text-slate-700">{visit.clientName || "N/A"}</span>
                        </div>
                        <div className="col-span-2 mt-0.5">
                          <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wide">Issue</span>
                          <p className="text-slate-600 italic mt-0.5 leading-relaxed bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 max-h-14 overflow-y-auto">
                            {visit.mentionIssue || "No details provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
