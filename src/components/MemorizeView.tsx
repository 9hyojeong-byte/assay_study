import React, { useState, useEffect } from "react";
import { EssayContent } from "../types";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, ThumbsUp, ThumbsDown, RotateCcw, Check, BookOpen } from "lucide-react";

interface MemorizeViewProps {
  essay: EssayContent;
  onBack: () => void;
  onConfidenceChange: (id: string, newScore: number) => void;
}

export function MemorizeView({ essay, onBack, onConfidenceChange }: MemorizeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const [hasStudiedAll, setHasStudiedAll] = useState(false);

  const total = essay.koreanSentences.length;
  const currentKorean = essay.koreanSentences[currentIndex] || "";
  const currentEnglish = essay.englishSentences[currentIndex] || "";

  // Reset answer visibility when moving between cards
  useEffect(() => {
    setShowEnglish(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasStudiedAll(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowEnglish(false);
    setHasStudiedAll(false);
  };

  const handleAdjustConfidence = (amount: number) => {
    onConfidenceChange(essay.id, essay.confidence + amount);
  };

  return (
    <div id="memorize-view-container" className="space-y-6">
      {/* Back to details */}
      <div className="flex items-center justify-between">
        <button
          id="memorize-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer py-1 font-mono select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Challenge
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-[#F2F1EF] text-[#1A1A1A]/85 px-4 py-1.5 border border-[#1A1A1A]/5 rounded-full font-mono">
          Interactive Study Mode
        </span>
      </div>

      {/* Main card box */}
      {!hasStudiedAll ? (
        <div className="bg-[#1A1A1A] text-white rounded-3xl border border-black shadow-xl overflow-hidden flex flex-col justify-between min-h-[480px] p-6 md:p-10 relative">
          
          {/* Top Progress bar and confidence triggers */}
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-between text-[11px] text-white/50 uppercase tracking-widest font-bold font-mono">
              <span className="flex items-center gap-1.5 text-[#F27D26]">
                <BookOpen className="w-4 h-4" />
                {essay.title || "Untitled Diary"}
              </span>
              <span>{currentIndex + 1} of {total} Card{total !== 1 ? "s" : ""}</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-[#F27D26] h-full transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Central Flashcard with elegant layout */}
          <div className="flex-1 flex flex-col justify-center items-center py-8 text-center space-y-6 z-10">
            
            {/* Meaning Section (Korean) */}
            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase font-mono">
                뜻 (Korean Context)
              </span>
              <p className="font-serif font-light text-xl md:text-2xl text-white leading-relaxed">
                {currentKorean}
              </p>
            </div>

            <div className="h-px bg-white/10 w-20 mx-auto" />

            {/* Sentence Section (English) */}
            <div className="w-full max-w-xl mx-auto min-h-[100px] flex items-center justify-center">
              {showEnglish ? (
                <div className="space-y-2 animate-fade-in">
                  <span className="text-[9px] font-bold tracking-widest text-[#F27D26] uppercase font-mono">
                    영어 구문 (English Translation)
                  </span>
                  <p className="font-serif font-normal italic text-xl md:text-2xl text-[#F27D26] leading-relaxed">
                    {currentEnglish}
                  </p>
                </div>
              ) : (
                <button
                  id="reveal-english-btn"
                  onClick={() => setShowEnglish(true)}
                  className="px-6 py-4 border-2 border-dashed border-white/20 hover:border-[#F27D26] bg-white/5 hover:bg-white/10 text-white/90 text-[11px] uppercase tracking-widest font-bold rounded-2xl transition-all cursor-pointer w-full"
                >
                  영어 문장 직접 연상해보기
                  <span className="block text-[9px] font-normal text-white/40 font-mono mt-1">
                    (클릭하여 영문 정답 확인)
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Card control bar */}
          <div className="border-t border-white/10 pt-6 space-y-5 z-10">
            
            {/* Prompt simple confidence rating during studying */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-white/50 bg-black/40 p-4 rounded-xl border border-white/5">
              <span className="font-sans text-[11px]">이 지문이 전보다 익숙해지고 있습니까?</span>
              <div className="flex items-center gap-2.5 bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-white/10">
                <button
                  id="memorize-confidence-down"
                  onClick={() => handleAdjustConfidence(-1)}
                  className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-full transition-all cursor-pointer"
                  title="자신감 감소"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-serif font-black text-[#F27D26] min-w-[32px] text-center">
                  {essay.confidence > 0 ? `+${essay.confidence}` : essay.confidence}
                </span>
                <button
                  id="memorize-confidence-up"
                  onClick={() => handleAdjustConfidence(1)}
                  className="p-1.5 bg-white/5 hover:bg-teal-500/20 text-white/60 hover:text-teal-400 rounded-full transition-all cursor-pointer"
                  title="자신감 증가"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step navigation buttons */}
            <div className="flex justify-between items-center pt-1">
              <button
                id="memorize-prev-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono rounded-full transition-all cursor-pointer
                  ${currentIndex === 0 
                    ? "text-white/10 pointer-events-none" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev Card
              </button>

              <button
                id="memorize-next-btn"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#F27D26] hover:bg-[#df6d1d] text-white rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-md"
              >
                {currentIndex === total - 1 ? "Finish Study" : "Next Card"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Decorative background designs */}
          <div className="absolute -top-32 -left-32 w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>
        </div>
      ) : (
        /* Study Completed State Card */
        <div className="bg-[#FDFCFB] rounded-3xl border border-[#1A1A1A]/10 p-8 md:p-12 shadow-xs text-center min-h-[420px] flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-[#F2F1EF] border border-[#1A1A1A]/10 text-[#F27D26] rounded-full flex items-center justify-center">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="font-serif italic text-2xl font-light text-[#1A1A1A]">
              어휘 카드 암기 완료!
            </h3>
            <p className="text-xs text-[#1A1A1A]/50 leading-relaxed font-sans">
              에세이 &ldquo;{essay.title}&rdquo;의 모든 문장 카드 학습 사이클을 마쳤습니다. 문법 구조와 영작 템플릿이 성공적으로 익숙해지고 있습니다.
            </p>
          </div>

          <div className="bg-[#F2F1EF]/40 rounded-2xl p-5 border border-[#1A1A1A]/10 w-full max-w-sm flex items-center justify-between">
            <div className="text-left space-y-0.5">
              <span className="text-[8px] font-extrabold text-[#1A1A1A]/40 uppercase tracking-widest block font-mono">Confidence rating</span>
              <span className="text-xs font-bold text-[#1A1A1A]">최종 자신감 지수 수정</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="complete-confidence-down"
                onClick={() => handleAdjustConfidence(-1)}
                className="p-2 bg-transparent hover:bg-red-50 border border-[#1A1A1A]/10 text-[#1A1A1A]/50 hover:text-red-500 rounded-full transition-all cursor-pointer animate-none"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <span className={`text-base font-serif font-black px-2.5 min-w-[36px] text-center ${
                essay.confidence > 0 ? "text-teal-600" : essay.confidence < 0 ? "text-[#F27D26]" : "text-slate-400"
              }`}>
                {essay.confidence > 0 ? `+${essay.confidence}` : essay.confidence}
              </span>
              <button
                id="complete-confidence-up"
                onClick={() => handleAdjustConfidence(1)}
                className="p-2 bg-transparent hover:bg-teal-50 border border-[#1A1A1A]/10 text-[#1A1A1A]/50 hover:text-teal-600 rounded-full transition-all cursor-pointer animate-none"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              id="memorize-repeat-btn"
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#1A1A1A]/10 hover:bg-[#F2F1EF] text-[#1A1A1A]/60 hover:text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest rounded-full cursor-pointer transition-colors duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cards
            </button>
            <button
              id="memorize-finish-btn"
              onClick={onBack}
              className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-full cursor-pointer transition-colors duration-300 shadow-sm"
            >
              Finish Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
