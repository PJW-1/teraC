import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Minus, Search, Coffee, 
  Droplets, Inbox, Save, CheckCircle2, History, X, Copy,
  CupSoda, Cake, IceCream, ShoppingBag, Utensils
} from 'lucide-react';

// --- 재고 데이터 구조 정의 ---
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  count: number;
}

interface SaveRecord {
  timestamp: string;
  items: InventoryItem[];
}

// --- 테라커피 카테고리 구성 ---
const CATEGORIES = [
  { name: '원두', icon: Coffee, color: 'text-amber-900' },
  { name: '파우더', icon: Inbox, color: 'text-orange-500' },
  { name: '청/잼/당류', icon: Droplets, color: 'text-yellow-500' },
  { name: '티백', icon: CupSoda, color: 'text-green-600' },
  { name: '아이스크림', icon: IceCream, color: 'text-blue-400' },
  { name: '토핑/부재료', icon: Utensils, color: 'text-pink-500' },
  { name: '베이커리', icon: Cake, color: 'text-amber-600' },
  { name: '소모품', icon: ShoppingBag, color: 'text-slate-500' },
];

// --- 실제 재고 데이터 ---
const INITIAL_DATA: InventoryItem[] = [
  // --- 원두 ---
  { id: '1', name: '디카페인 원두', category: '원두', count: 0 },
  { id: '2', name: '싱글 원두', category: '원두', count: 0 },
  { id: '3', name: '블랜드 원두', category: '원두', count: 0 },

  // --- 파우더 ---
  { id: '4', name: '청송사과', category: '파우더', count: 0 },
  { id: '5', name: '그린티', category: '파우더', count: 0 },
  { id: '6', name: '말차', category: '파우더', count: 0 },
  { id: '7', name: '미숫가루', category: '파우더', count: 0 },
  { id: '8', name: '쌍화차', category: '파우더', count: 0 },
  { id: '9', name: '민트초코', category: '파우더', count: 0 },
  { id: '10', name: '고구마', category: '파우더', count: 0 },
  { id: '11', name: '더블초코자바칩', category: '파우더', count: 0 },
  { id: '12', name: '초코퍼지', category: '파우더', count: 0 },
  { id: '13', name: '프루맥스', category: '파우더', count: 0 },
  { id: '14', name: '레몬에이드', category: '파우더', count: 0 },
  { id: '15', name: '시그니처', category: '파우더', count: 0 },
  { id: '16', name: '바닐라', category: '파우더', count: 0 },
  { id: '17', name: '헤이즐넛', category: '파우더', count: 0 },
  { id: '18', name: '토피넛', category: '파우더', count: 0 },
  { id: '19', name: '핑크에너지', category: '파우더', count: 0 },
  { id: '20', name: '포도', category: '파우더', count: 0 },
  { id: '21', name: '블루오로라', category: '파우더', count: 0 },
  { id: '22', name: '체리에이드', category: '파우더', count: 0 },
  { id: '23', name: '밀크', category: '파우더', count: 0 },
  { id: '24', name: '밀크쉐이크', category: '파우더', count: 0 },
  { id: '25', name: '홍차', category: '파우더', count: 0 },
  { id: '26', name: '복숭아 아이스티', category: '파우더', count: 0 },
  { id: '27', name: '커피믹스', category: '파우더', count: 0 },

  // --- 청/잼/당류 ---
  { id: '28', name: '딸기잼', category: '청/잼/당류', count: 0 },
  { id: '29', name: '블루베리잼', category: '청/잼/당류', count: 0 },
  { id: '30', name: '한라봉잼', category: '청/잼/당류', count: 0 },
  { id: '31', name: '레몬청', category: '청/잼/당류', count: 0 },
  { id: '32', name: '생강청', category: '청/잼/당류', count: 0 },
  { id: '33', name: '연유', category: '청/잼/당류', count: 0 },
  { id: '34', name: '시럽', category: '청/잼/당류', count: 0 },
  { id: '35', name: '설탕', category: '청/잼/당류', count: 0 },

  // --- 티백 ---
  { id: '36', name: '얼그레이 티백', category: '티백', count: 0 },
  { id: '37', name: '썸머베리 티백', category: '티백', count: 0 },
  { id: '38', name: '캐모마일 티백', category: '티백', count: 0 },
  { id: '39', name: '페퍼민트 티백', category: '티백', count: 0 },

  // --- 아이스크림 관련 ---
  { id: '40', name: '초코소프트', category: '아이스크림', count: 0 },
  { id: '41', name: '바닐라스카이', category: '아이스크림', count: 0 },
  { id: '42', name: '콘', category: '아이스크림', count: 0 },
  { id: '43', name: '콘지', category: '아이스크림', count: 0 },
  { id: '44', name: '아이스크림컵', category: '아이스크림', count: 0 },

  // --- 토핑/부재료 ---
  { id: '45', name: '오레오 분태', category: '토핑/부재료', count: 0 },
  { id: '46', name: '쿠앤크', category: '토핑/부재료', count: 0 },
  { id: '47', name: '코코볼', category: '토핑/부재료', count: 0 },
  { id: '48', name: '콘푸로스트', category: '토핑/부재료', count: 0 },
  { id: '49', name: '컴파운드 초코칩', category: '토핑/부재료', count: 0 },
  { id: '50', name: '마카다미아', category: '토핑/부재료', count: 0 },
  { id: '51', name: '가당딸기', category: '토핑/부재료', count: 0 },
  { id: '52', name: '초코쉘', category: '토핑/부재료', count: 0 },
  { id: '53', name: '오렌지 건칩', category: '토핑/부재료', count: 0 },

  // --- 베이커리 ---
  { id: '54', name: '플레인 베이글', category: '베이커리', count: 0 },
  { id: '55', name: '어니언 베이글', category: '베이커리', count: 0 },
  { id: '56', name: '크로크무슈', category: '베이커리', count: 0 },
  { id: '57', name: '소금빵', category: '베이커리', count: 0 },
  { id: '58', name: '티라미슈', category: '베이커리', count: 0 },
  { id: '59', name: '뉴욕치즈타르트', category: '베이커리', count: 0 },
  { id: '60', name: '초코 마카롱', category: '베이커리', count: 0 },
  { id: '61', name: '딸기 마카롱', category: '베이커리', count: 0 },
  { id: '62', name: '피자붕어빵', category: '베이커리', count: 0 },
  { id: '63', name: '마카다미아 쿠키', category: '베이커리', count: 0 },
  { id: '64', name: '텍사스 화이트칩 쿠키', category: '베이커리', count: 0 },
  { id: '65', name: '스모어쿠키', category: '베이커리', count: 0 },
  { id: '66', name: '미니초코바이트', category: '베이커리', count: 0 },
  { id: '67', name: '베이글칩', category: '베이커리', count: 0 },
  { id: '68', name: '체다치즈 베이글칩', category: '베이커리', count: 0 },

  // --- 소모품 ---
  { id: '69', name: '큰빵봉지', category: '소모품', count: 0 },
];

export default function App() {
  // --- 기존 상태(State) ---
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory_items');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [history, setHistory] = useState<SaveRecord[]>(() => {
    const saved = localStorage.getItem('inventory_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // --- 새로 추가된 상태: '품목 추가 모달' 관련 ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0].name);

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    localStorage.setItem('inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('inventory_history', JSON.stringify(history));
  }, [history]);

  // 기존 재고 업데이트 로직
  const updateCount = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, count: Math.max(0, item.count + delta) } : item
    ));
  };

  const handleInputChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, count: Math.max(0, num) } : item
    ));
  };

  // --- 새로 추가된 함수: 품목 등록 로직 ---
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      alert("품목 이름을 입력해주세요.");
      return;
    }
    
    // 중복 체크
    if (items.some(item => item.name === newItemName.trim())) {
      alert("이미 존재하는 품목입니다.");
      return;
    }

    // 새 품목 객체 생성 (id는 현재 시간을 밀리초로 써서 겹치지 않게 만듦)
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      count: 0
    };

    setItems(prev => [...prev, newItem]); // 리스트에 추가
    setNewItemName(''); // 입력창 초기화
    setNewItemCategory(CATEGORIES[0].name); // 카테고리 초기화
    setShowAddModal(false); // 모달창 닫기
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.includes(searchTerm)
    );
  }, [items, searchTerm]);

  // 리포트 텍스트 생성
  const generateReportText = (inventory: InventoryItem[]) => {
    const date = new Date().toLocaleString('ko-KR');
    const activeItems = inventory.filter(i => i.count > 0);
    if (activeItems.length === 0) return "조사된 재고가 없습니다.";
    let text = `[테라커피 재고조사 - ${date}]\n\n`;
    activeItems.forEach(item => {
      text += `${item.name}: ${item.count}개\n`;
    });
    return text;
  };

  // 최종 저장 로직
  const handleFinalSave = () => {
    const activeItems = items.filter(i => i.count > 0);
    if (activeItems.length === 0) {
      alert("숫자가 입력된 재고가 없습니다!");
      return;
    }

    const newRecord: SaveRecord = {
      timestamp: new Date().toLocaleString('ko-KR'),
      items: [...items]
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 10));

    const textContent = generateReportText(items);
    navigator.clipboard.writeText(textContent);

    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `테라커피_재고조사_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    alert("저장 및 복사 완료!");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-800" />
            테라커피 재고조사
          </h1>
          {/* 우측 상단 버튼 영역 (품목 추가 버튼 신설) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 p-2 bg-amber-100 rounded-xl text-amber-700 hover:bg-amber-200 active:bg-amber-300 transition-colors font-semibold text-sm shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline pr-1">품목 추가</span>
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors shadow-sm"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="품목 또는 카테고리 검색..."
            className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        {CATEGORIES.map(cat => {
          const catItems = filteredItems.filter(item => item.category === cat.name);
          if (catItems.length === 0) return null;

          return (
            <section key={cat.name}>
              <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${cat.color}`}>
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {catItems.map(item => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    onUpdate={updateCount} 
                    onInput={handleInputChange}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* 하단 저장 버튼 */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-20">
        <button
          onClick={handleFinalSave}
          disabled={showSaved}
          className={`
            w-full max-w-lg flex items-center justify-center gap-2 py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95
            ${showSaved ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'}
          `}
        >
          {showSaved ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              저장 완료!
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              재고 내역 저장 및 공유
            </>
          )}
        </button>
      </footer>

      {/* 🟢 신규 기능: 새 품목 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">새 품목 추가</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">품목 이름</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="예: 바닐라 마카롱"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} // 엔터 치면 추가됨
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">카테고리</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddItem}
                className="w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기록 보기 모달 (기존 코드와 동일) */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
              <h3 className="font-bold text-lg">최근 조사 기록</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">아직 저장된 기록이 없습니다.</div>
              ) : (
                history.map((record, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold text-slate-400">{record.timestamp}</div>
                      <button 
                        onClick={() => {
                          const text = generateReportText(record.items);
                          navigator.clipboard.writeText(text);
                          alert("해당 기록이 복사되었습니다.");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {record.items.filter(i => i.count > 0).map(i => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span className="text-slate-600 truncate">{i.name}</span>
                          <span className="font-bold text-slate-900">{i.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryCard({ 
  item, 
  onUpdate, 
  onInput 
}: { 
  item: InventoryItem, 
  onUpdate: (id: string, d: number) => void,
  onInput: (id: string, v: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-medium text-slate-700 truncate ml-1">{item.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(item.id, -0.5)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          step="0.5"
          value={item.count}
          onChange={(e) => onInput(item.id, e.target.value)}
          className="w-20 h-10 text-center font-bold text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none [appearance:textfield]"
        />

        <button
          onClick={() => onUpdate(item.id, 0.5)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
