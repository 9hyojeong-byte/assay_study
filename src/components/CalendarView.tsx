import React, { useState } from "react";
import { EssayContent } from "../types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface CalendarViewProps {
  essays: EssayContent[];
  onSelectEssay: (essay: EssayContent) => void;
  onToggleFavorite: (id: string) => void;
}

export function CalendarView({ essays, onSelectEssay, onToggleFavorite }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get total days in month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Group essays by date string (YYYY-MM-DD)
  const essaysByDate = essays.reduce((acc, essay) => {
    const dateStr = essay.createdAt.split("T")[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(essay);
    return acc;
  }, {} as Record<string, EssayContent[]>);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysArray: (number | null)[] = [];
  // Fill initial blanks for the calendar grid
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Fill the days of the month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d);
  }

  const handleDateClick = (day: number) => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    setSelectedDateStr(`${year}-${monthStr}-${dayStr}`);
  };

  const selectedEssays = essaysByDate[selectedDateStr] || [];

  return (
    <div id="calendar-view-container" className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <CalendarIcon id="calendar-icon" className="w-5 h-5 text-[#F27D26]" />
            <h3 className="font-serif italic text-2xl font-light text-[#1A1A1A] tracking-tight">
              {year}년 {month + 1}월
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-[#F2F1EF]/60 p-1.5 rounded-full border border-[#1A1A1A]/5">
            <button
              id="prev-month-btn"
              onClick={prevMonth}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-full text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="next-month-btn"
              onClick={nextMonth}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-full text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/30 mb-4 font-mono">
          <span className="text-red-500/60">Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span className="text-indigo-400">Sa</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }

            const monthStr = String(month + 1).padStart(2, "0");
            const dayStr = String(day).padStart(2, "0");
            const dateStr = `${year}-${monthStr}-${dayStr}`;
            const isSelected = selectedDateStr === dateStr;
            const hasEssays = essaysByDate[dateStr] && essaysByDate[dateStr].length > 0;

            let textClass = "text-[#1A1A1A]";
            if (idx % 7 === 0) textClass = "text-red-500"; // Sunday
            if (idx % 7 === 6) textClass = "text-indigo-500"; // Saturday

            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDateClick(day)}
                className={`
                  relative aspect-square flex flex-col items-center justify-between py-2 rounded-xl transition-all cursor-pointer text-xs font-semibold
                  ${isSelected 
                    ? "bg-[#F27D26] text-white shadow-md hover:bg-[#df6d1d]" 
                    : "hover:bg-[#F2F1EF] bg-transparent border border-[#1A1A1A]/5"
                  }
                `}
              >
                <span className={isSelected ? "text-white" : textClass}>{day.toString().padStart(2, "0")}</span>
                
                {/* Dots Container */}
                <div className="flex justify-center h-1 w-full pb-0.5">
                  {hasEssays && (
                    <span 
                      className={`
                        w-1.5 h-1.5 rounded-full 
                        ${isSelected ? "bg-white" : "bg-[#F27D26]"}
                      `}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Essays for Selected Month Day */}
      <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 p-6 shadow-xs">
        <h4 className="font-serif italic text-lg text-[#1A1A1A] pb-3 border-b border-[#1A1A1A]/10 mb-5 flex items-center justify-between">
          <span>{selectedDateStr} Collections</span>
          <span className="text-[10px] bg-[#1A1A1A]/5 text-[#1A1A1A] px-3 py-1 rounded-full uppercase tracking-wider font-bold font-mono">
            {selectedEssays.length} item{selectedEssays.length !== 1 ? "s" : ""}
          </span>
        </h4>

        {selectedEssays.length === 0 ? (
          <div className="text-center py-10 text-[#1A1A1A]/40 text-xs italic font-serif">
            이 날짜에 기록된 콘텐츠가 존재하지 않습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEssays.map((essay, index) => {
              const serialNum = (index + 1).toString().padStart(2, "0");
              return (
                <div
                  key={essay.id}
                  onClick={() => onSelectEssay(essay)}
                  className="group flex flex-col p-4 bg-[#FDFCFB] border border-[#1A1A1A]/10 hover:border-[#F27D26]/40 rounded-xl transition-all cursor-pointer gap-2.5 duration-300"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center font-serif text-xs italic text-[#1A1A1A]/60 bg-[#F2F1EF]/30 group-hover:border-[#F27D26]/40 group-hover:bg-white group-hover:text-[#F27D26] shrink-0 transition-colors duration-300">
                      {serialNum}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h5 className="font-serif text-sm text-[#1A1A1A] leading-snug truncate group-hover:italic group-hover:text-[#F27D26] transition-all">
                        {essay.title || "Untitled Diary"}
                      </h5>
                      <div className="flex items-center gap-2 text-[8px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold font-mono">
                        <span>{essay.koreanSentences.length} Sentences</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A]/10" />
                        <span className="flex items-center gap-1">
                          Confidence: 
                          <span className={`font-semibold font-serif ${
                            essay.confidence > 0 
                              ? "text-teal-600" 
                              : essay.confidence < 0 
                              ? "text-[#F27D26]" 
                              : "text-slate-400"
                          }`}>
                            {essay.confidence > 0 ? `+${essay.confidence}` : essay.confidence}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]/5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 font-semibold text-[9px] uppercase tracking-wider text-[#1A1A1A]/40">
                      {essay.confidence >= 1 ? (
                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest">Mastered</span>
                      ) : essay.confidence <= -1 ? (
                        <span className="text-[#F27D26] bg-red-50 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest">Review Needed</span>
                      ) : (
                        <span className="text-[#1A1A1A]/40 bg-[#1A1A1A]/5 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest">Neutral</span>
                      )}
                    </div>

                    <button
                      id={`fav-btn-${essay.id}`}
                      onClick={() => onToggleFavorite(essay.id)}
                      className="w-7 h-7 rounded-full border border-[#1A1A1A]/10 hover:border-[#F27D26]/40 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-3 h-3 ${
                          essay.isFavorite 
                            ? "fill-[#F27D26] text-[#F27D26]" 
                            : "text-[#1A1A1A]/20 hover:text-[#1A1A1A]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
