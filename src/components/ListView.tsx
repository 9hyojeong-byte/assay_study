import React, { useState, useMemo } from "react";
import { EssayContent } from "../types";
import { Star, Search, ThumbsUp, ThumbsDown, BookOpen, Clock, AlertCircle } from "lucide-react";

interface ListViewProps {
  essays: EssayContent[];
  onSelectEssay: (essay: EssayContent) => void;
  onToggleFavorite: (id: string) => void;
}

type FilterType = "all" | "favorite" | "low-confidence";

export function ListView({ essays, onSelectEssay, onToggleFavorite }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Sorted and filtered essays list
  const processedEssays = useMemo(() => {
    let list = [...essays];

    // Apply Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.memo.toLowerCase().includes(query) ||
          e.koreanSentences.some((s) => s.toLowerCase().includes(query)) ||
          e.englishSentences.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Apply Filters and Sorting
    if (activeFilter === "favorite") {
      list = list.filter((e) => e.isFavorite);
      // Sort favorites by date (newest first)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeFilter === "low-confidence") {
      // Sort by confidence (lowest confidence score first)
      list.sort((a, b) => {
        if (a.confidence !== b.confidence) {
          return a.confidence - b.confidence; // -2, -1, 0, 1, 2
        }
        // If confidence is same, show newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      // "all" - Sort by date (newest first)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [essays, searchQuery, activeFilter]);

  return (
    <div id="list-view-container" className="space-y-6">
      {/* Search and Filters Section */}
      <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 p-6 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
          <input
            id="search-essays"
            type="text"
            placeholder="에세이 제목, 문장, 단어, 혹은 메모 내용을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 bg-[#F2F1EF]/30 border border-[#1A1A1A]/10 focus:border-[#1A1A1A]/40 rounded-xl text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 transition-all font-sans"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            id="filter-all-btn"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold select-none cursor-pointer border transition-all duration-300 ${
              activeFilter === "all"
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                : "bg-transparent border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A]"
            }`}
          >
            All
          </button>
          <button
            id="filter-fav-btn"
            onClick={() => setActiveFilter("favorite")}
            className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold select-none cursor-pointer border transition-all duration-300 flex items-center gap-1 ${
              activeFilter === "favorite"
                ? "bg-[#F27D26] border-[#F27D26] text-white shadow-sm"
                : "bg-transparent border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A]"
            }`}
          >
            <Star className={`w-3 h-3 ${activeFilter === "favorite" ? "fill-white" : ""}`} />
            Favorites
          </button>
          <button
            id="filter-low-btn"
            onClick={() => setActiveFilter("low-confidence")}
            className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold select-none cursor-pointer border transition-all duration-300 flex items-center gap-1 ${
              activeFilter === "low-confidence"
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                : "bg-transparent border-[#1A1A1A]/10 text-orange-700 hover:border-orange-200 hover:bg-orange-50/30"
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            Review
          </button>
        </div>
      </div>

      {/* Essays Count Info */}
      <div className="flex items-center justify-between text-[11px] text-[#1A1A1A]/40 px-2 font-bold uppercase tracking-wider">
        <span>Total: {processedEssays.length} Collections</span>
        {activeFilter === "low-confidence" && (
          <span className="flex items-center gap-1 text-[#F27D26]">
            <AlertCircle className="w-3.5 h-3.5" />
            Sorted by confidence level
          </span>
        )}
      </div>

      {/* List content */}
      {processedEssays.length === 0 ? (
        <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 py-16 text-center text-[#1A1A1A]/40 text-sm space-y-2 font-serif italic">
          <p className="font-semibold text-[#1A1A1A]/60 text-base">No collections found.</p>
          <p className="text-xs font-sans not-italic text-[#1A1A1A]/40">새 한국어 지문을 쓰고 정교한 AI 영작 암기 훈련을 개시해 보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedEssays.map((essay, index) => {
            const numStr = (index + 1).toString().padStart(2, "0");
            return (
              <div
                key={essay.id}
                onClick={() => onSelectEssay(essay)}
                className="group p-5 bg-[#FDFCFB] border border-[#1A1A1A]/10 hover:border-[#F27D26]/45 rounded-2xl flex flex-col hover:shadow-md hover:shadow-black/2 transition-all duration-300 cursor-pointer gap-3.5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center font-serif text-sm italic text-[#1A1A1A]/60 bg-[#F2F1EF]/30 group-hover:border-[#F27D26]/40 group-hover:bg-white group-hover:text-[#F27D26] shrink-0 transition-all duration-300">
                    {numStr}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Date and Star Row */}
                    <div className="flex items-center gap-2 text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold font-mono">
                      <span>{essay.createdAt.split("T")[0]}</span>
                      <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/15" />
                      <span>{essay.koreanSentences.length} sentences</span>
                    </div>

                    <h4 className="font-serif text-base text-[#1A1A1A] leading-snug truncate group-hover:italic group-hover:text-[#F27D26] transition-all">
                      {essay.title || "Untitled Diary"}
                    </h4>
                  </div>
                </div>

                {essay.koreanSentences.length > 0 && (
                  <p className="text-xs text-[#1A1A1A]/50 truncate italic pl-3 border-l-2 border-[#1A1A1A]/10">
                    {essay.koreanSentences[0]}
                  </p>
                )}

                {/* Card Footer: Favorite star and Confidence Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold font-mono">Confidence rating</span>
                    <span
                      className={`
                        text-xs font-serif font-black px-2 py-0.5 rounded-md
                        ${
                          essay.confidence > 0
                            ? "bg-teal-50 text-teal-600"
                            : essay.confidence < 0
                            ? "bg-rose-50 text-[#F27D26]"
                            : "bg-[#F2F1EF] text-slate-500"
                        }
                      `}
                    >
                      {essay.confidence > 0 ? `+${essay.confidence}` : essay.confidence === 0 ? "0" : essay.confidence}
                    </span>
                  </div>

                  <button
                    id={`fav-star-${essay.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(essay.id);
                    }}
                    className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 hover:border-[#F27D26]/40 hover:bg-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                  >
                    <Star
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                        essay.isFavorite
                          ? "fill-[#F27D26] text-[#F27D26]"
                          : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
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
  );
}
