import React, { useState } from "react";
import { EssayContent } from "../types";
import { 
  ArrowLeft, Star, Edit3, Trash2, ThumbsUp, ThumbsDown, BookOpen, 
  Eye, EyeOff, Calendar, AlertTriangle, MessageSquare, ArrowRight 
} from "lucide-react";

interface EssayDetailViewProps {
  essay: EssayContent;
  onBack: () => void;
  onEdit: (essay: EssayContent) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onConfidenceChange: (id: string, newScore: number) => void;
  onStartMemorize: (essay: EssayContent) => void;
}

export function EssayDetailView({ 
  essay, 
  onBack, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onConfidenceChange, 
  onStartMemorize 
}: EssayDetailViewProps) {
  
  const [showEnglish, setShowEnglish] = useState(true);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [individualRevealed, setIndividualRevealed] = useState<Record<number, boolean>>({});

  const toggleRevealIndividual = (idx: number) => {
    setIndividualRevealed((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAdjustConfidence = (amount: number) => {
    onConfidenceChange(essay.id, essay.confidence + amount);
  };

  return (
    <div id="essay-detail-view" className="space-y-8">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer py-1 font-mono select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to List
        </button>
        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            id={`detail-fav-${essay.id}`}
            onClick={() => onToggleFavorite(essay.id)}
            className="flex items-center gap-2 px-5 py-2 bg-transparent hover:bg-[#F2F1EF] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 transition-all duration-300 cursor-pointer select-none"
          >
            <Star className={`w-3.5 h-3.5 ${essay.isFavorite ? "fill-[#F27D26] text-[#F27D26]" : "text-[#1A1A1A]/30"}`} />
            {essay.isFavorite ? "Favorite Active" : "Add to Favorites"}
          </button>
        </div>
      </div>

      {/* BIG LAUNCH MEMORIZE CARD */}
      <button
        id="detail-start-memorize-card"
        onClick={() => onStartMemorize(essay)}
        className="w-full bg-[#1A1A1A] text-white rounded-3xl p-8 shadow-xl hover:shadow-black/10 transition-all duration-300 hover:scale-[1.005] flex items-center justify-between text-left cursor-pointer relative overflow-hidden group"
      >
        <div className="space-y-2 pr-6 z-10 relative">
          <span className="inline-block bg-[#F27D26] text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-1">
            Challenge Study
          </span>
          <h3 className="font-serif font-light text-2xl md:text-3xl tracking-tight leading-none text-white flex items-center gap-2 group-hover:italic transition-all">
            <BookOpen className="w-6 h-6 text-[#F27D26] shrink-0" />
            이 지문 암기 카드 훈련 시작하기
          </h3>
          <p className="text-xs text-white/60 leading-relaxed max-w-xl font-sans font-light">
            독창적인 한영 카드 플립 시스템을 통해 문장별 연상 작용을 시험하고, 자신감 수준을 향상시키는 정교한 암기 모드를 로드합니다.
          </p>
        </div>
        <div className="bg-white/10 group-hover:bg-[#F27D26] p-4 rounded-full transition-all duration-300 z-10 shrink-0">
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-24 -right-24 w-60 h-60 border border-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 border border-white/10 rounded-full pointer-events-none"></div>
      </button>

      {/* Main Detail Container */}
      <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 p-6 md:p-10 space-y-8 shadow-xs">
        
        {/* Essay Header Info */}
        <div className="border-b border-[#1A1A1A]/10 pb-6 space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>Created at: {essay.createdAt.split("T")[0]}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A]/10" />
            <span>{essay.koreanSentences.length} sentences total</span>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-light italic text-[#1A1A1A] leading-snug">
            {essay.title || "Untitled Diary"}
          </h2>
        </div>

        {/* Confidence rating Adjuster Widget */}
        <div className="bg-[#F2F1EF]/40 rounded-2xl p-6 border border-[#1A1A1A]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[9px] font-extrabold text-[#1A1A1A]/40 uppercase tracking-widest leading-none block font-mono mb-1">
              Confidence Tracker
            </span>
            <h4 className="font-serif italic text-lg text-[#1A1A1A]">
              학습자 자신감 지수 (Confidence Level)
            </h4>
            <p className="text-xs text-[#1A1A1A]/50">
              낮게 책정할수록 첫 페이지의 &apos;외워보기 추천&apos; 훈련에 우선순위로 추천됩니다.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#FDFCFB] px-6 py-4 rounded-full border border-[#1A1A1A]/10 shadow-xs shrink-0 self-center md:self-auto">
            <button
              id="confidence-down-btn"
              onClick={() => handleAdjustConfidence(-1)}
              className="p-2.5 bg-red-50 hover:bg-red-100/65 text-red-500 rounded-full transition-all cursor-pointer"
              title="감소 (-1)"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>

            <div className="text-center min-w-[70px]">
              <span className={`text-2xl font-serif font-black tracking-tight ${
                essay.confidence > 0 
                  ? "text-teal-600" 
                  : essay.confidence < 0 
                  ? "text-[#F27D26]" 
                  : "text-slate-500"
              }`}>
                {essay.confidence > 0 ? `+${essay.confidence}` : essay.confidence}
              </span>
              <span className="text-[8px] text-[#1A1A1A]/40 block uppercase tracking-widest font-semibold font-mono mt-0.5">Rating</span>
            </div>

            <button
              id="confidence-up-btn"
              onClick={() => handleAdjustConfidence(1)}
              className="p-2.5 bg-teal-50 hover:bg-teal-100/65 text-teal-600 rounded-full transition-all cursor-pointer"
              title="증가 (+1)"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sentences Listing Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/10">
            <h3 className="font-serif italic text-lg text-[#1A1A1A]">
              문장별 번역 맵핑 리스트
            </h3>
            {/* English Show/Hide Toggle */}
            <button
              id="toggle-detail-english"
              onClick={() => setShowEnglish(!showEnglish)}
              className="px-4 py-2 border border-[#1A1A1A]/10 hover:border-black rounded-full text-[9px] uppercase tracking-widest font-bold bg-transparent text-[#1A1A1A] transition-all duration-300 cursor-pointer"
            >
              {showEnglish ? "Hide English" : "Show All English"}
            </button>
          </div>

          <div className="divide-y divide-[#1A1A1A]/10">
            {essay.koreanSentences.map((kor, idx) => {
              const eng = essay.englishSentences[idx] || "";
              const isRevealed = showEnglish || !!individualRevealed[idx];

              return (
                <div 
                  key={idx} 
                  className="py-5 first:pt-0 last:pb-0 flex items-start gap-4"
                >
                  <span className="font-serif text-base italic text-[#1A1A1A]/30 w-8 h-8 flex items-center justify-center shrink-0 bg-[#F2F1EF]/40 rounded-full select-none mt-0.5">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>

                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Korean Sentence */}
                    <p className="text-[#1A1A1A] text-[15px] font-normal leading-relaxed">
                      {kor}
                    </p>

                    {/* English Sentence under Korean */}
                    <div 
                      onClick={() => toggleRevealIndividual(idx)}
                      className={`
                        rounded-xl p-4 transition-all cursor-pointer select-none
                        ${isRevealed 
                          ? "bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 text-[14px] font-serif font-light leading-relaxed shadow-sm italic" 
                          : "bg-[#F2F1EF]/30 text-[#1A1A1A]/40 text-[10px] uppercase tracking-wider font-bold text-center border border-dashed border-[#1A1A1A]/10 py-5 hover:border-[#F27D26]/40 hover:bg-[#F2F1EF]/60"
                        }
                      `}
                    >
                      {isRevealed ? (
                        eng
                      ) : (
                        <span className="flex items-center justify-center gap-1.5 font-sans">
                          <Eye className="w-3.5 h-3.5 text-[#F27D26]" />
                          영문 보기 (터치하여 개별 정답 확인)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Essay Notes (Memo) */}
        {essay.memo ? (
          <div className="bg-[#F2F1EF]/50 rounded-2xl p-6 border border-[#1A1A1A]/10 space-y-2.5">
            <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#F27D26]" />
              학습 어휘집 및 구문 핵심 메모
            </h4>
            <p className="text-xs text-[#1A1A1A]/85 leading-relaxed font-sans whitespace-pre-line">
              {essay.memo}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 bg-[#F2F1EF]/20 rounded-xl border border-dashed border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/40 italic font-serif">
            지정된 노트 혹은 학습 장치가 비어 있습니다.
          </div>
        )}

        {/* Delete Confirm box if active */}
        {isDeleteConfirm && (
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-serif italic text-red-800 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              정말로 이 에세이 다이어리를 영구 삭제하시겠습니까?
            </h4>
            <p className="text-xs text-red-700/80 leading-relaxed font-sans">
              삭제하시면 그동안 학습한 자신감 점수 및 번역 결과가 완전히 소멸됩니다. 구글 스프레드시트가 연결된 상태라면 해당 행도 즉각 동조 소거됩니다.
            </p>
            <div className="flex gap-2">
              <button
                id="delete-confirm-yes"
                onClick={() => onDelete(essay.id)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors cursor-pointer"
              >
                예, 확실히 삭제합니다
              </button>
              <button
                id="delete-confirm-no"
                onClick={() => setIsDeleteConfirm(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors cursor-pointer"
              >
                아니오, 보관하겠습니다
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        {!isDeleteConfirm && (
          <div className="flex justify-between items-center pt-6 border-t border-[#1A1A1A]/10">
            <button
              id={`detail-delete-trigger-${essay.id}`}
              onClick={() => setIsDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 hover:text-red-500 text-[#1A1A1A]/40 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Collection
            </button>

            <button
              id={`detail-edit-btn-${essay.id}`}
              onClick={() => onEdit(essay)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#2b2b2b] text-white rounded-full text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Diary Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
