import React, { useState, useEffect } from "react";
import { EssayContent } from "../types";
import { Plus, Trash2, Sparkles, Save, ArrowLeft, HelpCircle, Edit3, Type as TypeIcon } from "lucide-react";

interface WriteEssayViewProps {
  initialEssay?: EssayContent | null; // For editing mode
  onSave: (essay: Omit<EssayContent, "id" | "createdAt" | "confidence" | "isFavorite"> & { id?: string }) => void;
  onCancel: () => void;
}

export function WriteEssayView({ initialEssay, onSave, onCancel }: WriteEssayViewProps) {
  // 1. Initial State
  const [koreanSentences, setKoreanSentences] = useState<string[]>([""]);
  const [englishSentences, setEnglishSentences] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  
  // States to control flow
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize if editing
  useEffect(() => {
    if (initialEssay) {
      setKoreanSentences(initialEssay.koreanSentences);
      setEnglishSentences(initialEssay.englishSentences);
      setTitle(initialEssay.title);
      setMemo(initialEssay.memo);
      setIsGenerated(true);
    }
  }, [initialEssay]);

  // Add a Korean sentence input line
  const handleAddSentence = () => {
    setKoreanSentences([...koreanSentences, ""]);
  };

  // Remove a Korean sentence input line
  const handleRemoveSentence = (index: number) => {
    if (koreanSentences.length <= 1) {
      setKoreanSentences([""]);
      return;
    }
    const updated = [...koreanSentences];
    updated.splice(index, 1);
    setKoreanSentences(updated);
  };

  // Update a specific Korean sentence value
  const handleKoreanSentenceChange = (index: number, val: string) => {
    const updated = [...koreanSentences];
    updated[index] = val;
    setKoreanSentences(updated);
  };

  // Update a specific English sentence value (post-generation)
  const handleEnglishSentenceChange = (index: number, val: string) => {
    const updated = [...englishSentences];
    updated[index] = val;
    setEnglishSentences(updated);
  };

  // Trigger Gemini API to generate English translations and Title
  const handleGenerateEnglish = async () => {
    // Basic validations
    const filteredKorean = koreanSentences.map((s) => s.trim()).filter(Boolean);
    if (filteredKorean.length === 0) {
      setErrorMsg("최소 한 문장 이상의 한국어 내용을 작성해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentences: filteredKorean }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "영문번역 도중 서버에서 오류를 반환했습니다.");
      }

      const data = await response.json();
      
      // Update state with generated contents
      setTitle(data.title || `${filteredKorean[0].slice(0, 15)}...`);
      setEnglishSentences(data.translations || filteredKorean.map(() => ""));
      setKoreanSentences(filteredKorean); // Trimmed versions
      setIsGenerated(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "서버 통신 실패 또는 자격증명 오류가 발생했습니다. AI Studio의 Settings > Secrets를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save the full essay after modification
  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg("에세이 제목을 입력해 주세요.");
      return;
    }
    
    // Check that we have valid sentence counts matching
    if (koreanSentences.length === 0) {
      setErrorMsg("저장할 에세이 문장이 없습니다.");
      return;
    }

    onSave({
      id: initialEssay?.id, // Keep if edit
      title,
      koreanSentences,
      englishSentences: englishSentences.length > 0 ? englishSentences : koreanSentences.map(() => ""),
      memo,
    });
  };

  return (
    <div id="write-essay-view" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="write-back-btn"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer pr-3 py-1 font-mono select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-[#F2F1EF] text-[#1A1A1A]/85 px-4 py-1.5 border border-[#1A1A1A]/5 rounded-full font-mono">
          {initialEssay ? "Edit Collection" : "Compose Draft"}
        </span>
      </div>

      <div className="bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6 shadow-xs">
        {/* Error Callout */}
        {errorMsg && (
          <div className="bg-rose-50 border border-thin border-rose-100 rounded-xl p-4 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Phase A: Write Korean sentences line-by-line */}
        {!isGenerated ? (
          <div className="space-y-6">
            <div className="border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="font-serif italic text-xl text-[#1A1A1A] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#F27D26]" />
                한국어로 한 문장씩 에세이 작성
              </h3>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">
                일기나 에세이를 한국어로 한 문장씩 아래에 기록해 보세요. 버튼을 누르면 정교한 영문 지문과 맞춤형 타이틀이 탄생합니다.
              </p>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {koreanSentences.map((sentence, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <span className="font-serif text-sm italic text-[#1A1A1A]/40 w-8 h-8 rounded-full border border-[#1A1A1A]/5 bg-[#F2F1EF]/40 flex items-center justify-center shrink-0 select-none">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <input
                    type="text"
                    value={sentence}
                    placeholder="한국어 표현을 기록해 주세요..."
                    onChange={(e) => handleKoreanSentenceChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#F2F1EF]/30 border border-[#1A1A1A]/10 focus:border-[#1A1A1A]/40 rounded-xl text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-none transition-all font-sans font-medium"
                  />
                  <button
                    id={`remove-sentence-btn-${index}`}
                    onClick={() => handleRemoveSentence(index)}
                    className="p-2.5 text-[#1A1A1A]/30 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="이 라인 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                id="add-sentence-btn"
                onClick={handleAddSentence}
                className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:text-[#F27D26] hover:border-[#F27D26]/40 hover:bg-orange-50/10 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer select-none"
              >
                <Plus className="w-4 h-4" />
                Add Sentence Row (새 문장 행 추가)
              </button>
            </div>

            {/* Submit Korean for Translate */}
            <div className="border-t border-[#1A1A1A]/10 pt-5 flex justify-end">
              <button
                id="generate-english-btn"
                onClick={handleGenerateEnglish}
                disabled={isLoading}
                className={`
                  px-6 py-3 bg-[#1A1A1A] hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer select-none shadow-sm flex items-center justify-center gap-2 min-w-[170px]
                  ${isLoading ? "opacity-75 cursor-not-allowed bg-neutral-700" : ""}
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Translating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    영어 지문 및 제목 생성
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Phase B: Review/Customize generated sentences & overall title & memo */
          <div className="space-y-6">
            <div className="border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="font-serif italic text-xl text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F27D26]" />
                영어 에세이 제목 & 문장 직접 검토 및 수정
              </h3>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">
                AI 추천 문법과 타이틀이 완성되었습니다. 원하시는 뉘앙스에 알맞게 내용을 수정한 후 보관할 수 있습니다.
              </p>
            </div>

            {/* Title Section */}
            <div className="space-y-1">
              <label id="title-label" className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 leading-none font-mono">
                Boutique Essay Title
              </label>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 명시하세요."
                className="w-full py-2 bg-transparent border-b border-[#1A1A1A]/15 focus:border-[#F27D26] text-xl font-serif text-[#1A1A1A] focus:outline-none transition-all placeholder-[#1A1A1A]/20"
              />
            </div>

            {/* Interactive Sentence Review Grid */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {koreanSentences.map((kor, index) => (
                <div key={index} className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-5 space-y-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold italic text-[#1A1A1A]/40 bg-[#F2F1EF]/50 px-3 py-1 rounded-full">
                      Sentence {(index + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                  {/* Korean Input Edit */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 font-mono">한국어 원문</span>
                    <input
                      type="text"
                      value={kor || ""}
                      onChange={(e) => handleKoreanSentenceChange(index, e.target.value)}
                      className="w-full bg-[#F2F1EF]/10 border border-[#1A1A1A]/10 px-3 py-2 text-sm text-[#1A1A1A] rounded-lg focus:outline-none focus:border-[#1A1A1A]/30 font-sans"
                    />
                  </div>
                  {/* English Input Edit */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 font-mono">추천 영어 지문</span>
                    <textarea
                      rows={2}
                      value={englishSentences[index] || ""}
                      onChange={(e) => handleEnglishSentenceChange(index, e.target.value)}
                      className="w-full bg-[#F2F1EF]/10 border border-[#1A1A1A]/15 px-3 py-2 text-sm text-[#1A1A1A] font-serif font-light leading-relaxed rounded-lg focus:outline-none focus:border-[#F27D26] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Memo Field */}
            <div className="space-y-2 pt-4 border-t border-[#1A1A1A]/10">
              <label id="memo-label" className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 leading-none font-mono">
                Grammar notes & dictionary (선택형 학습 메모)
              </label>
              <textarea
                id="memo-input"
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="지칭 대명사, 문법 설명, 중요 어휘들을 저장해 두고 암기할 때 펼쳐 보세요..."
                className="w-full px-4 py-3 bg-[#F2F1EF]/30 border border-[#1A1A1A]/10 focus:border-[#1A1A1A]/30 focus:bg-white rounded-xl text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-none transition-all font-sans leading-relaxed"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1A1A1A]/10 items-center justify-between">
              <button
                id="write-retranslate-btn"
                onClick={() => setIsGenerated(false)}
                className="px-5 py-2.5 bg-transparent border border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F2F1EF] rounded-full text-[10px] uppercase tracking-widest font-bold duration-300 cursor-pointer"
              >
                문장 재구성하기
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="write-cancel-review-btn"
                  onClick={onCancel}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-transparent border border-[#1A1A1A]/10 hover:bg-[#F2F1EF] text-[#1A1A1A]/60 rounded-full text-[10px] uppercase tracking-widest font-bold duration-300 cursor-pointer select-none"
                >
                  Cancel
                </button>
                <button
                  id="write-save-btn"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#F27D26] hover:bg-[#df6d1d] text-white rounded-full text-[10px] uppercase tracking-widest font-bold duration-300 select-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Collection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
