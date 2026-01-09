/**
 * Memory Panel Component
 * Displays character's memories with filtering, search, and timeline visualization
 */

import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { MemoryEvent, MemoryEventType, MemoryImportance } from '@/types/memory';
import { MemoryService } from '@/services/memoryService';
import { cn } from '@/lib/utils';
import { X, Search, Clock, MapPin, Users, Tag, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type MemoryPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  currentChapter: number;
  onPanelClose?: () => void; // Called when panel closes (for tutorial)
};

export function MemoryPanel({ character, isOpen, onClose, currentChapter, onPanelClose }: MemoryPanelProps) {
  const [memories, setMemories] = useState<MemoryEvent[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryEventType | 'all'>('all');
  const [selectedImportance, setSelectedImportance] = useState<MemoryImportance | 'all'>('all');
  const [selectedMemory, setSelectedMemory] = useState<MemoryEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const handleClose = () => {
    onClose();
    onPanelClose?.(); // Trigger tutorial callback if exists
  };

  // Load memories on mount
  useEffect(() => {
    if (isOpen && character.id) {
      loadMemories();
    }
  }, [isOpen, character.id]);

  // Filter memories when search or filters change
  useEffect(() => {
    filterMemories();
  }, [memories, searchQuery, selectedType, selectedImportance]);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      // Load all memories for character
      const allMemories = await MemoryService.queryMemories({
        characterId: character.id,
        queryText: '', // Empty query to get all
        limit: 100,
        similarityThreshold: 0
      });

      const memoryEvents = allMemories.map(r => r.event);
      setMemories(memoryEvents);

      // Load statistics
      const memoryStats = await MemoryService.getMemoryStats(character.id);
      setStats(memoryStats);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMemories = () => {
    let filtered = [...memories];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.summary.toLowerCase().includes(query) ||
        m.fullNarrative.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.involvedNPCs.some(npc => npc.toLowerCase().includes(query)) ||
        m.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.eventType === selectedType);
    }

    // Importance filter
    if (selectedImportance !== 'all') {
      filtered = filtered.filter(m => m.importance === selectedImportance);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    setFilteredMemories(filtered);
  };

  const getImportanceColor = (importance: MemoryImportance): string => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'important': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'minor': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'trivial': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: MemoryEventType): string => {
    const icons: Record<MemoryEventType, string> = {
      combat: '⚔️',
      social: '💬',
      cultivation: '🧘',
      betrayal: '🗡️',
      alliance: '🤝',
      murder: '💀',
      rescue: '🛡️',
      theft: '💰',
      discovery: '🔍',
      breakthrough: '✨',
      death: '☠️',
      romance: '💕',
      grudge: '😠',
      favor: '🙏',
      sect_event: '🏛️',
      treasure: '💎',
      technique_learned: '📜',
      item_obtained: '📦',
      location_discovered: '🗺️',
      npc_met: '👤',
      quest_completed: '✅',
      other: '📝'
    };
    return icons[type] || '📝';
  };

  const getEmotionColor = (emotion?: string): string => {
    if (!emotion) return 'text-gray-400';
    
    const colors: Record<string, string> = {
      joy: 'text-yellow-400',
      anger: 'text-red-400',
      fear: 'text-purple-400',
      sadness: 'text-blue-400',
      disgust: 'text-green-400',
      surprise: 'text-pink-400',
      pride: 'text-gold',
      shame: 'text-gray-400',
      guilt: 'text-orange-400',
      gratitude: 'text-jade',
      hatred: 'text-crimson',
      love: 'text-rose-400',
      neutral: 'text-gray-400'
    };
    return colors[emotion] || 'text-gray-400';
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getChaptersSince = (chapter: number): number => {
    return currentChapter - chapter;
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[500px] max-w-[95vw] bg-black/90 backdrop-blur-xl border-l border-white/10",
        "transform transition-transform duration-300 ease-out z-50",
        "flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="font-display text-xl text-purple-400">Memories</h2>
          <span className="text-sm text-white/60">({filteredMemories.length})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Statistics Bar */}
      {stats && (
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-white/5 rounded">
              <p className="text-white/40">Total</p>
              <p className="text-white font-medium">{stats.totalEvents}</p>
            </div>
            <div className="p-2 bg-white/5 rounded">
              <p className="text-white/40">Critical</p>
              <p className="text-red-400 font-medium">{stats.criticalEvents.length}</p>
            </div>
            <div className="p-2 bg-white/5 rounded">
              <p className="text-white/40">Retrieved</p>
              <p className="text-purple-400 font-medium">
                {stats.mostRetrievedEvents[0]?.retrievalCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-white/10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="combat">⚔️ Combat</option>
            <option value="social">💬 Social</option>
            <option value="cultivation">🧘 Cultivation</option>
            <option value="betrayal">🗡️ Betrayal</option>
            <option value="murder">💀 Murder</option>
            <option value="rescue">🛡️ Rescue</option>
            <option value="breakthrough">✨ Breakthrough</option>
            <option value="grudge">😠 Grudge</option>
          </select>

          <select
            value={selectedImportance}
            onChange={(e) => setSelectedImportance(e.target.value as any)}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm"
          >
            <option value="all">All Importance</option>
            <option value="critical">🔴 Critical</option>
            <option value="important">🟠 Important</option>
            <option value="moderate">🟡 Moderate</option>
            <option value="minor">🔵 Minor</option>
            <option value="trivial">⚪ Trivial</option>
          </select>
        </div>
      </div>

      {/* Memory List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="w-12 h-12 text-purple-400/50 animate-pulse mb-4" />
              <p className="text-white/60">Loading memories...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">No memories found</p>
              <p className="text-xs text-white/40">
                {searchQuery || selectedType !== 'all' || selectedImportance !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your journey has just begun'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <div
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer",
                  selectedMemory?.id === memory.id
                    ? "bg-purple-500/20 border-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{getTypeIcon(memory.eventType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {memory.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">
                          Ch.{memory.chapter}
                        </span>
                        {getChaptersSince(memory.chapter) > 0 && (
                          <span className="text-xs text-purple-400">
                            ({getChaptersSince(memory.chapter)} chapters ago)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", getImportanceColor(memory.importance))}>
                    {memory.importance}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  {memory.location && (
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-3 h-3" />
                      <span>{memory.location}</span>
                    </div>
                  )}
                  
                  {memory.involvedNPCs.length > 0 && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-3 h-3" />
                      <span>{memory.involvedNPCs.slice(0, 2).join(', ')}
                        {memory.involvedNPCs.length > 2 && ` +${memory.involvedNPCs.length - 2}`}
                      </span>
                    </div>
                  )}

                  {memory.emotion && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-white/40" />
                      <span className={cn("capitalize", getEmotionColor(memory.emotion))}>
                        {memory.emotion}
                      </span>
                    </div>
                  )}

                  {memory.retrievalCount > 0 && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Referenced {memory.retrievalCount}x</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {memory.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-black/90 border border-white/20 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getTypeIcon(selectedMemory.eventType)}</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg text-white mb-1">
                    {selectedMemory.summary}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock className="w-3 h-3" />
                    <span>Chapter {selectedMemory.chapter}</span>
                    <span>•</span>
                    <span>{formatTimestamp(selectedMemory.timestamp)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMemory(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {/* Importance */}
                <div>
                  <Badge className={cn("text-xs", getImportanceColor(selectedMemory.importance))}>
                    {selectedMemory.importance} (Score: {selectedMemory.importanceScore}/10)
                  </Badge>
                </div>

                {/* Full Narrative */}
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-2">Full Account:</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {selectedMemory.fullNarrative}
                  </p>
                </div>

                {/* Location */}
                {selectedMemory.location && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location:
                    </h4>
                    <p className="text-sm text-white/70">{selectedMemory.location}</p>
                  </div>
                )}

                {/* NPCs */}
                {selectedMemory.involvedNPCs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Involved NPCs:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.involvedNPCs.map((npc, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                        >
                          {npc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotion */}
                {selectedMemory.emotion && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Emotion:
                    </h4>
                    <span className={cn("text-sm capitalize", getEmotionColor(selectedMemory.emotion))}>
                      {selectedMemory.emotion}
                    </span>
                  </div>
                )}

                {/* Consequences */}
                {(selectedMemory.karmaChange || selectedMemory.statChanges) && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2">Consequences:</h4>
                    <div className="space-y-1 text-sm">
                      {selectedMemory.karmaChange && (
                        <p className={cn(
                          selectedMemory.karmaChange > 0 ? "text-jade" : "text-red-400"
                        )}>
                          Karma: {selectedMemory.karmaChange > 0 ? '+' : ''}{selectedMemory.karmaChange}
                        </p>
                      )}
                      {selectedMemory.statChanges && Object.keys(selectedMemory.statChanges).length > 0 && (
                        <p className="text-white/70">
                          Stats: {Object.entries(selectedMemory.statChanges)
                            .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedMemory.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retrieval Stats */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Referenced {selectedMemory.retrievalCount} times</span>
                    {selectedMemory.lastRetrieved && (
                      <span>Last: {formatTimestamp(selectedMemory.lastRetrieved)}</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
