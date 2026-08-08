import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Minus, Search, Coffee, 
  Droplets, Inbox, Save, CheckCircle2, History, X, Copy,
  CupSoda, Cake, IceCream, ShoppingBag, Utensils, RotateCcw,
  Download, RefreshCw, GripVertical, Trash2, Edit2, ChevronDown, ChevronUp
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
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('전체');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 품목 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0].name);

  // 품목 수정 모달 상태 (1번 개선점)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // --- 데이터 불러오기 함수 ---
  const loadData = useCallback(async () => {
    setIsLoading(true);

    const localSaved = localStorage.getItem('inventory_items');
    let localCountsMap: Record<string, number> = {};
    if (localSaved) {
      try {
        const parsed: InventoryItem[] = JSON.parse(localSaved);
        parsed.forEach(item => {
          localCountsMap[item.id] = item.count || 0;
        });
      } catch (e) {
        console.error('로컬스토리지 파싱 에러', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
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
            count: localCountsMap[String(dbItem.id)] ?? 0,
            display_order: dbItem.display_order ?? index
          }));
        } else {
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
              count: localCountsMap[String(item.id)] ?? 0,
              display_order: item.display_order ?? index
            }));
          } else {
            baseItems = INITIAL_DATA;
          }
        }

        baseItems.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        setItems(baseItems);

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

  // --- (4번 개선점) Supabase Realtime 구독 설정 ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('public:inventory_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            setItems(prev => {
              if (prev.some(i => i.id === String(newItem.id))) return prev;
              return [...prev, {
                id: String(newItem.id),
                name: newItem.name,
                category: newItem.category,
                count: 0,
                display_order: newItem.display_order ?? prev.length
              }];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setItems(prev => prev.map(item => {
              if (item.id === String(updated.id)) {
                return {
                  ...item,
                  name: updated.name,
                  category: updated.category,
                  display_order: updated.display_order ?? item.display_order
                };
              }
              return item;
            }).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String(payload.old.id);
            setItems(prev => prev.filter(i => i.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  // 로컬스토리지 백업 저장
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('inventory_items', JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('inventory_history', JSON.stringify(history));
  }, [history]);

  // --- 수량 업데이트 ---
  const updateCount = (id: string, delta: number) => {
    const updatedCount = Math.max(0, (items.find(i => i.id === id)?.count || 0) + delta);
    setItems(prev => prev.map(item => item.id === id ? { ...item, count: updatedCount } : item));
  };

  // --- 수량 직접 입력 ---
  const handleInputChange = (id: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    if (isNaN(num)) return;
    const finalCount = Math.max(0, num);
    setItems(prev => prev.map(item => item.id === id ? { ...item, count: finalCount } : item));
  };

  // --- 품목 추가 ---
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

  // --- (1번 개선점) 품목 수정 저장 ---
  const handleUpdateItem = async () => {
    if (!editingItem || !editName.trim()) return;

    const updatedName = editName.trim();
    const updatedCat = editCategory;

    setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, name: updatedName, category: updatedCat } : i));
    setEditingItem(null);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').update({
        name: updatedName,
        category: updatedCat
      }).eq('id', editingItem.id);
    }
  };

  // --- (1번 개선점) 품목 삭제 ---
  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ '${name}' 품목을 삭제하시겠습니까?\n모든 사용자의 목록에서 삭제됩니다.`)) return;

    setItems(prev => prev.filter(i => i.id !== id));
    if (editingItem?.id === id) setEditingItem(null);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').delete().eq('id', id);
    }
  };

  // --- 전체 초기화 ---
  const handleResetAll = () => {
    const isConfirmed = window.confirm("⚠️ 정말 모든 재고 수량을 '0'으로 초기화하시겠습니까?\n(등록된 품목은 삭제되지 않습니다.)");
    if (isConfirmed) {
      setItems(prev => prev.map(item => ({ ...item, count: 0 })));
    }
  };

  // --- 드래그 앤 드롭 순서 변경 ---
  const handleDragEnd = async (result: DropResult) => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        const upsertData = updatedItems.map((item, index) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          display_order: index
        }));
        await supabase.from('inventory_items').upsert(upsertData, { onConflict: 'id' });
      } catch (err) {
        console.error('순서 저장 실패:', err);
      }
    }
  };

  // 3번 개선점: 검색어 및 탭 필터링
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.includes(searchTerm);
      const matchesCategoryTab = selectedCategoryTab === '전체' || item.category === selectedCategoryTab;
      return matchesSearch && matchesCategoryTab;
    });
  }, [items, searchTerm, selectedCategoryTab]);

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

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
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <div className="flex justify-between items-center mb-3">
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
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="품목 또는 카테고리 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 3번 개선점: 카테고리 필터 탭 바 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button
              onClick={() => setSelectedCategoryTab('전체')}
              className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
                selectedCategoryTab === '전체'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 보기
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategoryTab(cat.name)}
                className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
                  selectedCategoryTab === cat.name
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium">재고 데이터 로딩 중...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <main className="max-w-2xl mx-auto p-4 space-y-6">
            {CATEGORIES.map(cat => {
              if (selectedCategoryTab !== '전체' && selectedCategoryTab !== cat.name) return null;

              const catItems = filteredItems.filter(item => item.category === cat.name);
              if (catItems.length === 0) return null;
              const isCollapsed = collapsedCategories[cat.name];

              return (
                <section key={cat.name} className="transition-all">
                  {/* 3번 개선점: 카테고리 접기/펼치기 아코디언 헤더 */}
                  <div 
                    onClick={() => toggleCategoryCollapse(cat.name)}
                    className="flex items-center justify-between cursor-pointer mb-2.5 px-1 group select-none"
                  >
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${cat.color}`}>
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                      <span className="text-xs text-slate-400 font-normal">({catItems.length})</span>
                    </h2>
                    <div className="text-slate-400 group-hover:text-slate-600 p-1">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>

                  {!isCollapsed && (
                    <Droppable droppableId={cat.name} isDropDisabled={searchTerm !== ''}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
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
                                  <InventoryCard 
                                    item={item} 
                                    onUpdate={updateCount} 
                                    onInput={handleInputChange} 
                                    onEdit={() => {
                                      setEditingItem(item);
                                      setEditName(item.name);
                                      setEditCategory(item.category);
                                    }}
                                    dragHandleProps={provided.dragHandleProps} 
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
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

      {/* 새 품목 추가 모달 */}
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

      {/* 1번 개선점: 품목 수정/삭제 모달 */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">품목 정보 수정</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">품목 이름</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">카테고리</label>
                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => handleDeleteItem(editingItem.id, editingItem.name)} 
                  className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-bold rounded-xl transition-all border border-red-100 flex items-center justify-center gap-1.5 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button 
                  onClick={handleUpdateItem} 
                  className="flex-[2] py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                >
                  수정 완료
                </button>
              </div>
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
  onEdit,
  dragHandleProps
}: { 
  item: InventoryItem, 
  onUpdate: (id: string, d: number) => void,
  onInput: (id: string, v: string) => void,
  onEdit: () => void,
  dragHandleProps?: any
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-transparent transition-colors gap-2">
      <div 
        {...dragHandleProps} 
        className="flex items-center gap-2 flex-1 min-w-0 py-1 select-none cursor-grab active:cursor-grabbing touch-none group"
      >
        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
        <span className="font-semibold text-slate-800 text-sm sm:text-base leading-snug break-keep">
          {item.name}
        </span>
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 text-slate-300 hover:text-slate-600 active:text-slate-800 transition-colors ml-1"
          title="품목 수정/삭제"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onUpdate(item.id, -0.5)}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200 active:scale-95 transition-all shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          step="0.5"
          placeholder="0"
          value={item.count === 0 ? '' : item.count}
          onChange={(e) => onInput(item.id, e.target.value)}
          className="w-14 sm:w-18 h-9 sm:h-10 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none [appearance:textfield] shrink-0 px-1"
        />

        <button
          onClick={() => onUpdate(item.id, 0.5)}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}