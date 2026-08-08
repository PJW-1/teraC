import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Minus, Search, Coffee, 
  Droplets, Inbox, Save, CheckCircle2, History, X, Copy,
  CupSoda, Cake, IceCream, ShoppingBag, Utensils, RotateCcw,
  Download, RefreshCw, GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { supabase, isSupabaseConfigured } from './supabase';

// --- 재고 데이터 구조 정의 ---
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  count: number;
  display_order?: number;
}

interface SaveRecord {
  id?: string;
  timestamp: string;
  items: InventoryItem[];
}

// --- 테라커피 카테고리 구성 ---
const CATEGORIES = [
  { name: '파우더', icon: Inbox, color: 'text-orange-500' },
  { name: '청/잼/당류', icon: Droplets, color: 'text-yellow-500' },
  { name: '티백', icon: CupSoda, color: 'text-green-600' },
  { name: '아이스크림', icon: IceCream, color: 'text-blue-400' },
  { name: '토핑/부재료', icon: Utensils, color: 'text-pink-500' },
  { name: '베이커리', icon: Cake, color: 'text-amber-600' },
  { name: '소모품', icon: ShoppingBag, color: 'text-slate-500' }, 
  { name: '원두', icon: Coffee, color: 'text-amber-900' },
];

// --- 실제 재고 초기 데이터 ---
const INITIAL_DATA: InventoryItem[] = [
  { id: '1', name: '디카페인 원두', category: '원두', count: 0 },
  { id: '2', name: '싱글 원두', category: '원두', count: 0 },
  { id: '3', name: '블랜드 원두', category: '원두', count: 0 },
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
  { id: '28', name: '딸기잼', category: '청/잼/당류', count: 0 },
  { id: '29', name: '블루베리잼', category: '청/잼/당류', count: 0 },
  { id: '30', name: '한라봉잼', category: '청/잼/당류', count: 0 },
  { id: '31', name: '레몬청', category: '청/잼/당류', count: 0 },
  { id: '32', name: '생강청', category: '청/잼/당류', count: 0 },
  { id: '33', name: '연유', category: '청/잼/당류', count: 0 },
  { id: '34', name: '시럽', category: '청/잼/당류', count: 0 },
  { id: '35', name: '설탕', category: '청/잼/당류', count: 0 },
  { id: '36', name: '얼그레이 티백', category: '티백', count: 0 },
  { id: '37', name: '썸머베리 티백', category: '티백', count: 0 },
  { id: '38', name: '캐모마일 티백', category: '티백', count: 0 },
  { id: '39', name: '페퍼민트 티백', category: '티백', count: 0 },
  { id: '40', name: '초코소프트', category: '파우더', count: 0 },
  { id: '41', name: '바닐라스카이', category: '파우더', count: 0 },
  { id: '42', name: '콘', category: '아이스크림', count: 0 },
  { id: '43', name: '콘지', category: '아이스크림', count: 0 },
  { id: '44', name: '아이스크림컵', category: '아이스크림', count: 0 },
  { id: '45', name: '오레오 분태', category: '토핑/부재료', count: 0 },
  { id: '46', name: '쿠앤크', category: '토핑/부재료', count: 0 },
  { id: '47', name: '코코볼', category: '토핑/부재료', count: 0 },
  { id: '48', name: '콘푸로스트', category: '토핑/부재료', count: 0 },
  { id: '49', name: '컴파운드 초코칩', category: '토핑/부재료', count: 0 },
  { id: '50', name: '마카다미아', category: '토핑/부재료', count: 0 },
  { id: '51', name: '가당딸기', category: '토핑/부재료', count: 0 },
  { id: '52', name: '초코쉘', category: '토핑/부재료', count: 0 },
  { id: '53', name: '오렌지 건칩', category: '토핑/부재료', count: 0 },
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
  { id: '69', name: '큰빵봉지', category: '소모품', count: 0 },
];

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<SaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0].name);

  // --- 데이터 불러오기 함수 ---
  const loadData = useCallback(async () => {
    setIsLoading(true);

    // 로컬 스토리지에 저장된 수량 및 순서 가져오기
    const localSaved = localStorage.getItem('inventory_items');
    let localItemsMap: Record<string, { count: number; display_order?: number }> = {};
    if (localSaved) {
      try {
        const parsed: InventoryItem[] = JSON.parse(localSaved);
        parsed.forEach((item, index) => {
          localItemsMap[item.id] = {
            count: item.count || 0,
            display_order: item.display_order ?? index
          };
        });
      } catch (e) {
        console.error('로컬스토리지 파싱 에러', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Supabase에서 마스터 품목(이름, 카테고리 등) 불러오기
        const { data: dbItems, error: itemsError } = await supabase
          .from('inventory_items')
          .select('id, name, category, display_order')
          .order('display_order', { ascending: true });

        if (itemsError) throw itemsError;

        let baseItems: InventoryItem[] = [];

        if (dbItems && dbItems.length > 0) {
          baseItems = dbItems.map((dbItem, index) => ({
            id: String(dbItem.id),
            name: dbItem.name,
            category: dbItem.category,
            count: localItemsMap[String(dbItem.id)]?.count ?? 0,
            display_order: localItemsMap[String(dbItem.id)]?.display_order ?? dbItem.display_order ?? index
          }));
        } else {
          // DB가 비어있는 경우 초기 데이터 삽입
          const formattedInitial = INITIAL_DATA.map((item, index) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            display_order: index
          }));
          const { data: seeded, error: seedError } = await supabase
            .from('inventory_items')
            .insert(formattedInitial)
            .select();

          if (!seedError && seeded) {
            baseItems = seeded.map((item, index) => ({
              ...item,
              id: String(item.id),
              count: localItemsMap[String(item.id)]?.count ?? 0,
              display_order: localItemsMap[String(item.id)]?.display_order ?? index
            }));
          } else {
            baseItems = INITIAL_DATA;
          }
        }

        // 로컬 순서에 따라 정렬
        baseItems.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        setItems(baseItems);

        // 2. Supabase에서 공유 이력 불러오기
        const { data: dbHistory, error: historyError } = await supabase
          .from('inventory_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!historyError && dbHistory) {
          setHistory(dbHistory.map(h => ({ id: h.id, timestamp: h.timestamp, items: h.items })));
        }

      } catch (err) {
        console.error('Supabase 로딩 오류, 로컬스토리지 백업 데이터 사용:', err);
        fallbackToLocalStorage();
      }
    } else {
      fallbackToLocalStorage();
    }

    setIsLoading(false);
  }, []);

  const fallbackToLocalStorage = () => {
    const saved = localStorage.getItem('inventory_items');
    if (saved) {
      const parsedItems = JSON.parse(saved);
      const mergedItems = parsedItems.map((savedItem: InventoryItem) => {
        const originalItem = INITIAL_DATA.find(init => init.id === savedItem.id);
        if (originalItem) {
          return { ...savedItem, category: originalItem.category, name: originalItem.name };
        }
        return savedItem;
      });
      setItems(mergedItems);
    } else {
      setItems(INITIAL_DATA);
    }

    const savedHistory = localStorage.getItem('inventory_history');
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 로컬스토리지 백업 저장 (수량 및 개별 순서)
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('inventory_items', JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('inventory_history', JSON.stringify(history));
  }, [history]);

  // --- 수량 업데이트 (내 브라우저 로컬 저장소에만 업데이트) ---
  const updateCount = (id: string, delta: number) => {
    const updatedCount = Math.max(0, (items.find(i => i.id === id)?.count || 0) + delta);
    setItems(prev => prev.map(item => item.id === id ? { ...item, count: updatedCount } : item));
  };

  // --- 수량 직접 입력 (내 브라우저 로컬 저장소에만 업데이트) ---
  const handleInputChange = (id: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    if (isNaN(num)) return;
    const finalCount = Math.max(0, num);
    setItems(prev => prev.map(item => item.id === id ? { ...item, count: finalCount } : item));
  };

  // --- 품목 추가 (전체 클라우드 Supabase DB에 공유 저장) ---
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert("품목 이름을 입력해주세요.");
      return;
    }
    if (items.some(item => item.name === newItemName.trim())) {
      alert("이미 존재하는 품목입니다.");
      return;
    }

    const newId = Date.now().toString();
    const newItem: InventoryItem = {
      id: newId,
      name: newItemName.trim(),
      category: newItemCategory,
      count: 0,
      display_order: items.length
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemCategory(CATEGORIES[0].name);
    setShowAddModal(false);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').insert([{
        id: newId,
        name: newItemName.trim(),
        category: newItemCategory,
        display_order: items.length
      }]);
    }
  };

  // --- 전체 초기화 (내 수량만 0으로) ---
  const handleResetAll = () => {
    const isConfirmed = window.confirm("⚠️ 정말 모든 재고 수량을 '0'으로 초기화하시겠습니까?\n(등록된 품목은 삭제되지 않습니다.)");
    if (isConfirmed) {
      setItems(prev => prev.map(item => ({ ...item, count: 0 })));
    }
  };

  // --- 드래그 앤 드롭 순서 변경 (내 기기에만 순서 유지) ---
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;

    const catName = source.droppableId;
    const catItems = items.filter(i => i.category === catName);
    const otherItems = items.filter(i => i.category !== catName);

    const [draggedItem] = catItems.splice(source.index, 1);
    catItems.splice(destination.index, 0, draggedItem);

    const updatedItems = [...otherItems, ...catItems].map((item, index) => ({
      ...item,
      display_order: index
    }));

    setItems(updatedItems);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.includes(searchTerm)
    );
  }, [items, searchTerm]);

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

  // --- 재고 저장 및 기록 남기기 ---
  const handleFinalSave = async () => {
    const activeItems = items.filter(i => i.count > 0);
    if (activeItems.length === 0) {
      alert("숫자가 입력된 재고가 없습니다!");
      return;
    }

    const timestampStr = new Date().toLocaleString('ko-KR');
    const newRecord: SaveRecord = {
      timestamp: timestampStr,
      items: [...items]
    };

    setHistory(prev => [newRecord, ...prev].slice(0, 10));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_history').insert([{
        timestamp: timestampStr,
        items: items
      }]);
    }

    const textContent = generateReportText(items);
    navigator.clipboard.writeText(textContent);

    const element = document.createElement("a");
    const file = new Blob(["\uFEFF" + textContent], {type: 'text/plain;charset=utf-8'});
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
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-800" />
            테라커피 재고조사
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={handleResetAll} className="p-2 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl text-red-500 transition-colors shadow-sm" title="모든 수량 0으로 초기화">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 p-2 bg-amber-100 rounded-xl text-amber-700 hover:bg-amber-200 active:bg-amber-300 transition-colors font-semibold text-sm shadow-sm">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline pr-1">품목 추가</span>
            </button>
            <button onClick={() => setShowHistory(true)} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors shadow-sm">
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium">재고 데이터 로딩 중...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
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
                  <Droppable droppableId={cat.name} isDropDisabled={searchTerm !== ''}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                        {catItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                className={`transition-all ${
                                  snapshot.isDragging 
                                    ? 'bg-amber-50 shadow-xl rounded-xl z-50 ring-2 ring-amber-400 scale-[1.02]' 
                                    : 'hover:bg-slate-50/80 active:bg-slate-100/80'
                                }`}
                              >
                                <InventoryCard item={item} onUpdate={updateCount} onInput={handleInputChange} dragHandleProps={provided.dragHandleProps} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </section>
              );
            })}
          </main>
        </DragDropContext>
      )}

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-20">
        <button onClick={handleFinalSave} disabled={showSaved} className={`w-full max-w-lg flex items-center justify-center gap-2 py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 ${showSaved ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'}`}>
          {showSaved ? <><CheckCircle2 className="w-6 h-6" />저장 완료!</> : <><Save className="w-6 h-6" />재고 내역 저장</>}
        </button>
      </footer>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">새 품목 추가</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">품목 이름</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="예: 바닐라 마카롱" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all" onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">카테고리</label>
                <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none">
                  {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <button onClick={handleAddItem} className="w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md">추가하기</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
              <h3 className="font-bold text-lg">최근 조사 기록</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? <div className="text-center py-10 text-slate-400">아직 저장된 기록이 없습니다.</div> : history.map((record, idx) => (
                <div key={record.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-bold text-slate-400">{record.timestamp}</div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if(window.confirm("⚠️ 이 기록의 재고 수량과 순서로 현재 화면을 덮어쓰시겠습니까?")) {
                            setItems([...record.items]);
                            setShowHistory(false);
                            alert("기록을 성공적으로 불러왔습니다.");
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        불러오기
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(generateReportText(record.items)); alert("해당 기록이 복사되었습니다."); }} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg"><Copy className="w-4 h-4" /></button>
                    </div>
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
              ))}
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
  onInput,
  dragHandleProps
}: { 
  item: InventoryItem, 
  onUpdate: (id: string, d: number) => void,
  onInput: (id: string, v: string) => void,
  dragHandleProps?: any
}) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-transparent transition-colors">
      <div 
        {...dragHandleProps} 
        className="flex items-center gap-2.5 flex-1 min-w-0 py-1.5 pr-3 select-none cursor-grab active:cursor-grabbing touch-none group"
      >
        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
        <span className="font-semibold text-slate-800 text-base truncate">{item.name}</span>
      </div>

      <div className="flex items-center gap-2 pl-2 shrink-0">
        <button
          onClick={() => onUpdate(item.id, -0.5)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200 active:scale-95 transition-all shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          step="0.5"
          placeholder="0"
          value={item.count === 0 ? '' : item.count}
          onChange={(e) => onInput(item.id, e.target.value)}
          className="w-16 sm:w-20 h-10 text-center font-bold text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none [appearance:textfield] shrink-0"
        />

        <button
          onClick={() => onUpdate(item.id, 0.5)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}