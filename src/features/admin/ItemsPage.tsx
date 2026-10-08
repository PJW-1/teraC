import { useState, type ReactNode } from 'react';
import { DragDropContext, Draggable, Droppable, useKeyboardSensor, useMouseSensor, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, Pencil, Plus } from 'lucide-react';
import { BottomSheet, Button, Card, SkeletonList, cn, toast } from '../../components/ui';
import { CATEGORY_ORDER, DEFAULT_UNIT, UNITS, orderCategories, type CatalogItem } from '../../lib/inventory/catalog';
import { useInventory } from '../../lib/inventory/inventoryContext';
import { useLongPressTouchSensor } from '../../useLongPressTouchSensor';
import { parseItemForm, toMove, type ItemFormErrors } from './itemForm';
import { PageHeader, PageShell } from './parts';

const DND_SENSORS = [useMouseSensor, useKeyboardSensor, useLongPressTouchSensor];

type Sheet = { kind: 'item'; category: string; item?: CatalogItem } | { kind: 'delete'; item: CatalogItem } | null;

export function ItemsPage() {
  const { status, items, moveItem, deleteItem } = useInventory();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = orderCategories([...CATEGORY_ORDER, ...items.map(i => i.category)]);

  const onDragEnd = (result: DropResult) => {
    const move = toMove(result);
    if (move) void moveItem(move.category, move.itemId, move.toIndex);
  };

  const header = (
    <PageHeader
      title="품목 관리"
      description="품목을 길게 누르거나 손잡이를 끌어 순서를 바꿉니다."
      action={
        <Button onClick={() => setSheet({ kind: 'item', category: categories[0] })}>
          <Plus className="size-5" aria-hidden />
          품목 추가
        </Button>
      }
    />
  );

  if (status === 'loading') {
    return (
      <PageShell>
        {header}
        <SkeletonList rows={6} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {header}
      <DragDropContext onDragEnd={onDragEnd} enableDefaultSensors={false} sensors={DND_SENSORS}>
        {categories.map(category => {
          const rows = items.filter(item => item.category === category);
          return (
            <Card key={category} role="region" aria-label={category} className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <h2 className="text-base font-bold">{category}</h2>
                <Button variant="ghost" aria-label={`${category}에 품목 추가`} onClick={() => setSheet({ kind: 'item', category })}>
                  <Plus className="size-4" aria-hidden />
                  품목 추가
                </Button>
              </div>
              <Droppable droppableId={category}>
                {provided => (
                  <ul ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-border">
                    {rows.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(drag, snapshot) => (
                          <li
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            aria-label={item.name}
                            className={cn(
                              'flex min-h-row items-center gap-2 bg-surface pr-2',
                              snapshot.isDragging && 'rounded-control shadow-popover ring-2 ring-accent-fill',
                            )}
                          >
                            <span
                              {...drag.dragHandleProps}
                              aria-label={`${item.name} 순서 바꾸기`}
                              className="flex size-touch shrink-0 touch-none items-center justify-center text-fg-muted"
                            >
                              <GripVertical className="size-5" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1 py-2">
                              <p className="truncate font-semibold">{item.name}</p>
                              <p className="text-xs text-fg-muted">{`단위 ${item.unit}`}</p>
                            </div>
                            <Button variant="ghost" size="icon" aria-label={`${item.name} 수정`} onClick={() => setSheet({ kind: 'item', category, item })}>
                              <Pencil className="size-4" aria-hidden />
                            </Button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {rows.length === 0 && <li className="px-4 py-4 text-sm text-fg-muted">아직 품목이 없습니다.</li>}
                  </ul>
                )}
              </Droppable>
            </Card>
          );
        })}
      </DragDropContext>

      <BottomSheet
        open={sheet?.kind === 'item'}
        onOpenChange={open => !open && setSheet(null)}
        title={sheet?.kind === 'item' && sheet.item ? '품목 수정' : '품목 추가'}
      >
        {sheet?.kind === 'item' && (
          <ItemForm
            key={sheet.item?.id ?? `new-${sheet.category}`}
            item={sheet.item}
            category={sheet.category}
            categories={categories}
            onDelete={item => setSheet({ kind: 'delete', item })}
            onDone={() => setSheet(null)}
          />
        )}
      </BottomSheet>

      <BottomSheet
        open={sheet?.kind === 'delete'}
        onOpenChange={open => !open && setSheet(null)}
        title="품목 삭제"
        description={sheet?.kind === 'delete' ? `'${sheet.item.name}' 품목을 삭제합니다. 모든 기기의 목록에서 사라지고, 지난 기록은 그대로 남습니다.` : undefined}
        footer={
          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              size="lg"
              fullWidth
              disabled={deleting}
              onClick={async () => {
                if (sheet?.kind !== 'delete') return;
                setDeleting(true);
                const ok = await deleteItem(sheet.item.id);
                setDeleting(false);
                if (ok) {
                  toast.success('품목을 삭제했습니다.');
                  setSheet(null);
                }
              }}
            >
              삭제하기
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setSheet(null)}>
              취소
            </Button>
          </div>
        }
      />
    </PageShell>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

const inputClass =
  'min-h-touch rounded-control border border-border bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-accent';

function ItemForm(props: {
  item?: CatalogItem;
  category: string;
  categories: string[];
  onDelete: (item: CatalogItem) => void;
  onDone: () => void;
}) {
  const { item, categories, onDelete, onDone } = props;
  const { items, addItem, updateItem } = useInventory();
  const [values, setValues] = useState({ name: item?.name ?? '', category: props.category, unit: item?.unit ?? DEFAULT_UNIT });
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues(v => ({ ...v, [key]: e.target.value }));
  const units = UNITS.includes(values.unit) ? UNITS : [...UNITS, values.unit];

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async e => {
        e.preventDefault();
        const otherNames = items.filter(i => i.id !== item?.id).map(i => i.name);
        const parsed = parseItemForm(values, otherNames);
        setErrors(parsed.ok ? {} : parsed.errors);
        if (!parsed.ok) return;
        setSaving(true);
        const ok = item
          ? await updateItem(item.id, { name: parsed.value.name, unit: parsed.value.unit })
          : await addItem(parsed.value);
        setSaving(false);
        if (ok) {
          toast.success(item ? '품목을 수정했습니다.' : '품목을 추가했습니다.');
          onDone();
        }
      }}
    >
      <Field id="item-name" label="품목 이름" error={errors.name}>
        <input id="item-name" className={inputClass} value={values.name} onChange={set('name')} maxLength={60} />
      </Field>
      {item ? (
        <p className="text-sm text-fg-muted">{`카테고리: ${item.category}`}</p>
      ) : (
        <Field id="item-category" label="카테고리" error={errors.category}>
          <select id="item-category" className={inputClass} value={values.category} onChange={set('category')}>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field id="item-unit" label="단위" error={errors.unit}>
        <select id="item-unit" className={inputClass} value={values.unit} onChange={set('unit')}>
          {units.map(u => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        {item && (
          <Button variant="secondary" className="text-danger" onClick={() => onDelete(item)}>
            삭제
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          저장
        </Button>
      </div>
    </form>
  );
}
