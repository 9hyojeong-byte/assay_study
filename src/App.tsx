import React, { useState, useEffect } from "react";
import { EssayContent, ViewMode } from "./types";
import { CalendarView } from "./components/CalendarView";
import { ListView } from "./components/ListView";
import { WriteEssayView } from "./components/WriteEssayView";
import { EssayDetailView } from "./components/EssayDetailView";
import { MemorizeView } from "./components/MemorizeView";
import { 
  Plus, Calendar as CalendarIcon, List as ListIcon, BookOpen, 
  Settings, Database, Star, CheckCircle, AlertCircle, RefreshCw, X
} from "lucide-react";

// Pre-seeded high fidelity beautiful essays so that the application is immediately testable
const MOCK_ESSAYS_DATA: EssayContent[] = [
  {
    id: "mock-1",
    title: "Refreshing Sunday Morning Walk",
    createdAt: "2026-05-24",
    koreanSentences: [
      "일요일 아침 일찍 일어나 근처 공원을 산책했습니다.",
      "선선하고 맑은 바람을 쐬니 마음이 절로 상쾌해졌습니다.",
      "주말 피로가 모두 풀리는 것 같아서 앞으로도 건강 증진을 위해 매주 가벼운 조깅이나 산책을 빠뜨리지 않고 실천해 볼 예정입니다."
    ],
    englishSentences: [
      "I woke up early on Sunday morning and took a walk in the nearby park.",
      "Feeling the cool, clean breeze naturally refreshed my mind and body.",
      "Since it felt like all my weekend fatigue was melting away, I plan to continue doing light jogging or walking every week without fail to boost my health."
    ],
    memo: "fatigue: 피로, 지침\nrefresh: 상쾌하게 하다, 기분 전환하다\nwithout fail: 차질 없이, 기어이",
    confidence: 0,
    isFavorite: false
  },
  {
    id: "mock-2",
    title: "First Steps into Regular Writing Diary",
    createdAt: "2026-05-24",
    koreanSentences: [
      "오늘부터 꾸준히 영어 에세이를 한 편씩 쓰기로 단짐했습니다.",
      "영어문장을 한 자씩 손수 적어보니 역시 처음에는 생각보다 작문이 서투르고 마땅한 표현을 찾기 어렵습니다.",
      "하지만 지능형 비서인 제미나이 인공지능과 하루씩 반복하여 암기 카드를 외우다 보면 조만간 유창해질 수 있으리라 굳게 믿습니다."
    ],
    englishSentences: [
      "Starting today, I made a firm commitment to write an English essay consistently.",
      "Since I am writing down English sentences letter by letter, composition feels naturally clumsy and finding suitable expressions is harder than expected at first.",
      "However, I firmly believe that by repeating with my intelligent assistant Gemini AI day by day and studying the flashcards, I will become fluent in no time."
    ],
    memo: "fluent: 유창한\nclumsy: 어설픈, 서툰\nmake a firm commitment to: ~하기로 굳게 다짐하다",
    confidence: -1,
    isFavorite: true
  }
];

export default function App() {
  // 1. Router State
  const [view, setView] = useState<'home' | 'detail' | 'write' | 'edit' | 'memorize'>('home');
  const [selectedEssay, setSelectedEssay] = useState<EssayContent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default shows list on home

  // 2. Data State
  const [essays, setEssays] = useState<EssayContent[]>([]);
  const [gasUrl, setGasUrl] = useState("");
  
  // 3. UI states
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Initial Settings & Essays
  useEffect(() => {
    // a. Retrieve Essays
    const savedEssays = localStorage.getItem("english_essay_diary_list");
    if (savedEssays) {
      try {
        setEssays(JSON.parse(savedEssays));
      } catch (e) {
        console.error("Local storage paring error:", e);
        setEssays(MOCK_ESSAYS_DATA);
      }
    } else {
      // Seed initial dummy essays
      setEssays(MOCK_ESSAYS_DATA);
      localStorage.setItem("english_essay_diary_list", JSON.stringify(MOCK_ESSAYS_DATA));
    }

    // b. Retrieve GAS URL
    const savedGasUrl = localStorage.getItem("google_sheets_gas_url");
    if (savedGasUrl) {
      setGasUrl(savedGasUrl);
    }
  }, []);

  // Display Toast messages
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Switch Google Spreadsheet URL
  const handleSaveGasUrl = (url: string) => {
    const trimmed = url.trim();
    setGasUrl(trimmed);
    localStorage.setItem("google_sheets_gas_url", trimmed);
    showToast('success', '구글 스프레드시트 앱스크립트 웹 앱 URL이 정상적으로 적용되었습니다.');
  };

  // Google App Script Sync Logic
  const handleSyncWithGas = async () => {
    if (!gasUrl) {
      showToast('error', '먼저 구글 스프레드시트 연동 설정을 완료해 주세요.');
      return;
    }
    setIsSyncing(true);
    showToast('success', '스프레드시트에서 데이터를 가져오는 중입니다...');
    try {
      const res = await fetch(`${gasUrl}?action=sync`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "sync", essays }),
      });

      const data = await res.json();
      if (data.success) {
        const syncedList = data.essays || [];
        setEssays(syncedList);
        localStorage.setItem("english_essay_diary_list", JSON.stringify(syncedList));
        showToast('success', `구글 스프레드시트와 동기화가 성공적으로 완료되었습니다! (총 ${syncedList.length}개)`);
      } else {
        showToast('error', `오류 발생: ${data.message || "동기화에 실패했습니다."}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'CORS 보안 혹은 네트워크 오류가 확인됩니다. 구글 앱스크립트의 배포 설정(액세스 권한: 모든 사용자)을 확인해 보세요.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle favorite on/off
  const handleToggleFavorite = async (id: string) => {
    let targetItem: EssayContent | undefined;
    const updated = essays.map((item) => {
      if (item.id === id) {
        targetItem = { ...item, isFavorite: !item.isFavorite };
        return targetItem;
      }
      return item;
    });

    setEssays(updated);
    localStorage.setItem("english_essay_diary_list", JSON.stringify(updated));

    // Update state of focus detail if viewing
    if (selectedEssay && selectedEssay.id === id) {
      setSelectedEssay(targetItem || null);
    }

    // Spreadsheet push in background
    if (gasUrl && targetItem) {
      try {
        fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", data: targetItem })
        });
      } catch (e) {
        console.warn("Spreadsheet background sync fallback", e);
      }
    }
  };

  // Adjust confidence score
  const handleConfidenceChange = async (id: string, newScore: number) => {
    let targetItem: EssayContent | undefined;
    const updated = essays.map((item) => {
      if (item.id === id) {
        targetItem = { ...item, confidence: newScore };
        return targetItem;
      }
      return item;
    });

    setEssays(updated);
    localStorage.setItem("english_essay_diary_list", JSON.stringify(updated));

    if (selectedEssay && selectedEssay.id === id) {
      setSelectedEssay(targetItem || null);
    }

    // Spreadsheet push in background
    if (gasUrl && targetItem) {
      try {
        fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", data: targetItem })
        });
      } catch (e) {
        console.warn("Spreadsheet background sync fallback", e);
      }
    }
  };

  // Delete an Essay Content
  const handleDeleteEssay = async (id: string) => {
    const updated = essays.filter((item) => item.id !== id);
    setEssays(updated);
    localStorage.setItem("english_essay_diary_list", JSON.stringify(updated));
    
    setView('home');
    setSelectedEssay(null);
    showToast('success', '에세이가 정상적으로 삭제되었습니다.');

    // Spreadsheet delete in background
    if (gasUrl) {
      try {
        fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id })
        });
      } catch (e) {
        console.warn("Spreadsheet background delete error:", e);
      }
    }
  };

  // Save/Update compiled from write view
  const handleSaveEssay = async (formData: Omit<EssayContent, "id" | "createdAt" | "confidence" | "isFavorite"> & { id?: string }) => {
    let updated;
    let finalItem: EssayContent;

    if (formData.id) {
      // Edit existing
      updated = essays.map((item) => {
        if (item.id === formData.id) {
          finalItem = {
            ...item,
            title: formData.title,
            koreanSentences: formData.koreanSentences,
            englishSentences: formData.englishSentences,
            memo: formData.memo || "",
          };
          return finalItem;
        }
        return item;
      });
      showToast('success', '에세이가 수정되었습니다.');
    } else {
      // Add new
      const todayStr = new Date().toISOString().split("T")[0];
      finalItem = {
        id: "essay-" + Date.now(),
        title: formData.title,
        createdAt: todayStr,
        koreanSentences: formData.koreanSentences,
        englishSentences: formData.englishSentences,
        memo: formData.memo || "",
        confidence: 0,
        isFavorite: false
      };
      updated = [finalItem, ...essays];
      showToast('success', '새 에세이와 영문 번역이 무사히 생성 및 등록되었습니다.');
    }

    setEssays(updated);
    localStorage.setItem("english_essay_diary_list", JSON.stringify(updated));
    
    // Switch view
    setSelectedEssay(finalItem!);
    setView('detail');

    // Spreadsheet push in background
    if (gasUrl && finalItem!) {
      try {
        fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", data: finalItem })
        });
      } catch (e) {
        console.warn("Spreadsheet save payload backup warning:", e);
      }
    }
  };

  // "외워보기" (Start practice for the essay with the lowest confidence)
  const handleQuickMemorize = () => {
    if (essays.length === 0) {
      showToast('error', '암기할 에세이 리스트가 아직 존재하지 않습니다. 먼저 한 편 작성해 보세요!');
      return;
    }

    // Pick the ones with lowest confidence score, breaking ties with newest first
    const sortedLowConfidence = [...essays].sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return a.confidence - b.confidence;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const lowestConfidenceEssay = sortedLowConfidence[0];
    setSelectedEssay(lowestConfidenceEssay);
    setView('memorize');
    showToast('success', `자신감 점수가장 낮음(${lowestConfidenceEssay.confidence}): "${lowestConfidenceEssay.title}" 훈련을 시작합니다.`);
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E4] flex justify-center selection:bg-[#F27D26]/20">
      <div 
        id="app-wrapper" 
        className="w-full max-w-[480px] min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased flex flex-col justify-between relative shadow-[0_0_50px_rgba(26,26,26,0.06)] border-x border-[#1A1A1A]/10"
      >
        {/* Top Floating Toast Notification */}
        {toast && (
          <div 
            id="toast-notification"
            className={`
              fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-full shadow-xl flex items-center gap-2.5 max-w-[400px] w-[calc(100%-2rem)] animate-fade-in border
              ${toast.type === 'success' 
                ? 'bg-[#FDFCFB] border-[#1A1A1A]/10 text-[#1A1A1A]' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
              }
            `}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4.5 h-4.5 text-[#F27D26] shrink-0" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
            )}
            <span className="text-xs font-serif italic tracking-wide leading-none">{toast.message}</span>
          </div>
        )}

        <div>
          {/* Main Header / Navigation rail */}
          <header className="h-20 border-b border-[#1A1A1A]/10 bg-[#FDFCFB] flex items-center sticky top-0 z-40">
            <div className="w-full px-4 flex items-center justify-between">
              <div className="flex flex-col cursor-pointer select-none" onClick={() => { setView('home'); setSelectedEssay(null); }}>
                <h1 className="font-serif italic text-2xl font-light tracking-tighter text-[#1A1A1A]">
                  Linguist.
                </h1>
                <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold mt-0.5">
                  Editor v1.0
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Quick Memorize Button - starting from lowest confidence */}
                <button
                  id="header-quick-memorize"
                  onClick={handleQuickMemorize}
                  className="px-3.5 py-1.5 border border-[#1A1A1A]/10 hover:border-[#1A1A1A] rounded-full text-[9px] uppercase tracking-widest font-extrabold hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 cursor-pointer select-none"
                  title="에세이 리스트 중 자신감이 가장 부족한 항목을 골라 바로 암기 훈련합니다"
                >
                  Study
                </button>

                {/* Write Essay Button */}
                <button
                  id="header-write-essay"
                  onClick={() => { setView('write'); setSelectedEssay(null); }}
                  className="px-4 py-2 bg-[#F27D26] hover:bg-[#df6d1d] text-white rounded-full text-[9px] uppercase tracking-widest font-extrabold shadow-sm transition-all duration-300 cursor-pointer select-none"
                >
                  Compose
                </button>

                {/* Set Connect URL buttons */}
                <button
                  id="header-settings-toggle"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-full transition-all border cursor-pointer ${
                    showSettings 
                      ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" 
                      : "bg-transparent border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30"
                  }`}
                  title="구글 스프레드시트 연동 데이터베이스 설정"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Embedded Settings Drawer/Panel */}
          {showSettings && (
            <div className="bg-[#F2F1EF]/95 border-b border-[#1A1A1A]/10 py-5 px-4 transition-all duration-300 space-y-4">
              {/* Left Column: Input Form */}
              <div className="bg-[#FDFCFB] p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif italic text-[#1A1A1A] text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#F27D26]" />
                    스프레드시트 DB 연동 설정
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-[#F2F1EF] text-[#1A1A1A]/40 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-[#1A1A1A]/40 tracking-widest uppercase font-mono">
                    구글 앱스크립트 웹 앱 URL (GAS Web App)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="settings-gas-url"
                      type="url"
                      defaultValue={gasUrl}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      onBlur={(e) => handleSaveGasUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-[10px] bg-[#F2F1EF]/30 border border-[#1A1A1A]/10 focus:border-[#1A1A1A]/30 rounded-lg text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-none"
                    />
                    <button
                      id="save-settings-btn"
                      onClick={() => handleSaveGasUrl((document.getElementById("settings-gas-url") as HTMLInputElement)?.value || "")}
                      className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#2b2b2b] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      저장
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1A1A1A]/10">
                  <p className="text-[9px] text-[#1A1A1A]/50 font-medium leading-normal flex-1">
                    {gasUrl ? "✓ 데이터베이스 연결됨: 스프레드시트와 자동 싱크가 구성되었습니다." : "데이터는 브라우저 내부(로컬)에 임시 저장되고 있습니다."}
                  </p>
                  {gasUrl && (
                    <button
                      id="sync-spreadsheet-btn"
                      onClick={handleSyncWithGas}
                      disabled={isSyncing}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] text-[9px] uppercase tracking-wider font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                      Sync
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Mini setup guide */}
              <div className="text-[11px] bg-[#FDFCFB]/55 p-5 rounded-2xl border border-[#1A1A1A]/5 text-[#1A1A1A]/70 space-y-2">
                <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#F27D26] fill-[#F27D26]/10" />
                  스프레드시트 3분 정비 가이드
                </h4>
                <ol className="list-decimal pl-4.5 space-y-1.5 text-[10px] text-[#1A1A1A]/50 font-sans leading-relaxed">
                  <li>새로운 구글 스프레드시트를 생성합니다.</li>
                  <li>상단 <b className="text-stone-800">확장 프로그램</b> &gt; <b className="text-[#1A1A1A]">Apps Script</b>를 클릭합니다.</li>
                  <li>동봉된 <b className="text-[#F27D26] font-bold">GAS.gs</b> 파일 코드를 통째 복사해 붙여넣습니다.</li>
                  <li>상단 우측 <b className="text-stone-800">배포</b> &gt; <b className="text-stone-800">새 배포</b>를 누릅니다.</li>
                  <li>유형을 <b>웹 앱</b>으로 고르고, <b>액세스 권한</b>을 <b className="text-stone-800 font-bold">모든 사용자(Anyone)</b>로 설정해 배포 후 웹앱 URL을 등록하세요!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Main Container */}
          <main className="w-full px-4 pt-6 pb-12 flex-1">
            
            {/* Sub Header - Toggles Calendar view OR List view ONLY when on Home viewpoint */}
            {view === 'home' && (
              <div className="flex flex-col gap-3.5 mb-6 pb-3 border-b border-[#1A1A1A]/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif italic text-xl text-[#1A1A1A] tracking-tight">
                    Collections
                  </h2>

                  <div className="flex items-center space-x-1 p-1 bg-[#F2F1EF] rounded-full border border-[#1A1A1A]/5">
                    <button
                      id="toggle-list-view"
                      onClick={() => setViewMode('list')}
                      className={`
                        flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer leading-none select-none
                        ${viewMode === 'list' 
                          ? "bg-white text-[#1A1A1A] shadow-xs" 
                          : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                        }
                      `}
                    >
                      <ListIcon className="w-3 h-3" />
                      List
                    </button>
                    <button
                      id="toggle-calendar-view"
                      onClick={() => setViewMode('calendar')}
                      className={`
                        flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer leading-none select-none
                        ${viewMode === 'calendar' 
                          ? "bg-white text-[#1A1A1A] shadow-xs" 
                          : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                        }
                      `}
                    >
                      <CalendarIcon className="w-3 h-3" />
                      Calendar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Core Render router */}
            <div className="animate-fade-in">
              {view === 'home' && (
                viewMode === 'calendar' ? (
                  <CalendarView 
                    essays={essays} 
                    onSelectEssay={(essay) => { setSelectedEssay(essay); setView('detail'); }} 
                    onToggleFavorite={handleToggleFavorite} 
                  />
                ) : (
                  <ListView 
                    essays={essays} 
                    onSelectEssay={(essay) => { setSelectedEssay(essay); setView('detail'); }} 
                    onToggleFavorite={handleToggleFavorite} 
                  />
                )
              )}

              {view === 'write' && (
                <WriteEssayView 
                  onSave={handleSaveEssay} 
                  onCancel={() => setView('home')} 
                />
              )}

              {view === 'edit' && (
                <WriteEssayView 
                  initialEssay={selectedEssay}
                  onSave={handleSaveEssay} 
                  onCancel={() => setView('detail')} 
                />
              )}

              {view === 'detail' && selectedEssay && (
                <EssayDetailView 
                  essay={selectedEssay}
                  onBack={() => { setView('home'); setSelectedEssay(null); }}
                  onEdit={(e) => setView('edit')}
                  onDelete={handleDeleteEssay}
                  onToggleFavorite={handleToggleFavorite}
                  onConfidenceChange={handleConfidenceChange}
                  onStartMemorize={(e) => setView('memorize')}
                />
              )}

              {view === 'memorize' && selectedEssay && (
                <MemorizeView 
                  essay={selectedEssay}
                  onBack={() => setView('detail')}
                  onConfidenceChange={handleConfidenceChange}
                />
              )}
            </div>
          </main>
        </div>

        {/* Footer Status Bar with Editorial Theme */}
        <footer className="py-5 border-t border-[#1A1A1A]/10 mt-12 px-6 flex flex-col items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold bg-[#FDFCFB]">
          <div className="flex items-center space-x-3">
            <span>Session Active: 2026</span>
            <span className="w-1 h-1 rounded-full bg-[#1A1A1A]/15" />
            <span>에세이 작문: {essays.length}편</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Database: <span className={gasUrl ? "text-[#F27D26]" : "text-amber-600 font-medium"}>{gasUrl ? "Spreadsheet Connected" : "Local Browser"}</span></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
