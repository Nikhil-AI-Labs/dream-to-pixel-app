import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Account } from '@/types/agent';
import AccountCard from './AccountCard';

interface DraggableAccountListProps {
  accounts: Account[];
  onReorder: (accounts: Account[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  testingAccountId?: string | null;
}

const DraggableAccountList = ({
  accounts,
  onReorder,
  onEdit,
  onDelete,
  onTest,
  testingAccountId,
}: DraggableAccountListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = accounts.findIndex((acc) => acc.id === active.id);
      const newIndex = accounts.findIndex((acc) => acc.id === over.id);

      const newAccounts = [...accounts];
      const [movedItem] = newAccounts.splice(oldIndex, 1);
      newAccounts.splice(newIndex, 0, movedItem);

      // Update priorities
      const updatedAccounts = newAccounts.map((acc, index) => ({
        ...acc,
        priority: index + 1,
      }));

      onReorder(updatedAccounts);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={accounts.map((acc) => acc.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={onEdit}
              onDelete={onDelete}
              onTest={onTest}
              isTestLoading={testingAccountId === account.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableAccountList;
