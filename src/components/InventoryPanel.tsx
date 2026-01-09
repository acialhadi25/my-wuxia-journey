import { Character, getRarityColor, InventoryItem } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Package, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type InventoryPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onUseItem?: (item: InventoryItem) => void;
};

export function InventoryPanel({ character, isOpen, onClose, onUseItem }: InventoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredInventory = character.inventory?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const groupedInventory = filteredInventory.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof character.inventory>);

  const typeIcons: Record<string, string> = {
    weapon: '⚔️',
    armor: '🛡️',
    pill: '💊',
    material: '📦',
    treasure: '💎',
    misc: '📜'
  };

  const isConsumable = (item: InventoryItem) => {
    return item.type === 'pill' || (item.effects && Object.keys(item.effects).length > 0);
  };

  const handleUseItem = (item: InventoryItem) => {
    if (onUseItem && isConsumable(item)) {
      onUseItem(item);
      setSelectedItem(null);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[400px] max-w-[90vw] bg-black/90 backdrop-blur-xl border-l border-white/10",
        "transform transition-transform duration-300 ease-out z-50",
        "flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gold" />
          <h2 className="font-display text-xl text-gold">Inventory</h2>
          <span className="text-sm text-white/60">({character.inventory?.length || 0})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {character.inventory && character.inventory.length > 0 ? (
            <>
              {Object.entries(groupedInventory).map(([type, items]) => (
                <div key={type} className="space-y-2">
                  <h3 className="text-sm font-display text-white/60 uppercase tracking-wider flex items-center gap-2">
                    <span>{typeIcons[type] || '📦'}</span>
                    {type} ({items.length})
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-3 bg-white/5 hover:bg-white/10 rounded-lg border transition-all cursor-pointer group",
                          selectedItem?.id === item.id ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/20"
                        )}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium", getRarityColor(item.rarity))}>
                                {item.name}
                              </span>
                              {item.equipped && (
                                <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded border border-gold/30">
                                  Equipped
                                </span>
                              )}
                              {isConsumable(item) && (
                                <span className="text-xs px-2 py-0.5 bg-jade/20 text-jade rounded border border-jade/30">
                                  Usable
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("text-xs px-2 py-0.5 rounded", getRarityColor(item.rarity), "bg-opacity-20")}>
                                {item.rarity}
                              </span>
                              <span className="text-xs text-white/40">x{item.quantity}</span>
                            </div>
                          </div>
                          {isConsumable(item) && selectedItem?.id === item.id && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseItem(item);
                              }}
                              className="ml-2 bg-jade hover:bg-jade-glow text-black"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Use
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {item.description}
                        </p>
                        {item.effects && Object.keys(item.effects).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-jade-glow">
                              Effects: {Object.entries(item.effects).map(([key, value]) => 
                                `${key}: ${value}`
                              ).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">Your inventory is empty</p>
              <p className="text-xs text-white/40">
                Items you collect will appear here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10 bg-black/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Total Items</p>
            <p className="text-white font-medium">{character.inventory?.length || 0}</p>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Equipped</p>
            <p className="text-white font-medium">
              {character.inventory?.filter(i => i.equipped).length || 0}
            </p>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Types</p>
            <p className="text-white font-medium">
              {Object.keys(groupedInventory).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
