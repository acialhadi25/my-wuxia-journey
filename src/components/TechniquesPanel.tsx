import { Character, getRankColor } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Swords, Search, Flame, Droplet, Mountain as MountainIcon, Leaf, Zap, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type TechniquesPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
};

export function TechniquesPanel({ character, isOpen, onClose }: TechniquesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'martial' | 'mystic' | 'passive'>('all');

  const filteredTechniques = character.techniques?.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tech.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || tech.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const elementIcons: Record<string, any> = {
    Fire: Flame,
    Water: Droplet,
    Earth: MountainIcon,
    Wood: Leaf,
    Metal: Swords,
    Lightning: Zap,
    Darkness: Moon,
    Light: Sun,
  };

  const typeColors: Record<string, string> = {
    martial: 'text-red-400 bg-red-400/10 border-red-400/30',
    mystic: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    passive: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-gold';
    if (mastery >= 50) return 'text-jade-glow';
    if (mastery >= 25) return 'text-blue-400';
    return 'text-white/60';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return 'Master';
    if (mastery >= 50) return 'Proficient';
    if (mastery >= 25) return 'Competent';
    return 'Novice';
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[420px] max-w-[90vw] bg-black/90 backdrop-blur-xl border-l border-white/10",
        "transform transition-transform duration-300 ease-out z-50",
        "flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-gold" />
          <h2 className="font-display text-xl text-gold">Techniques</h2>
          <span className="text-sm text-white/60">({character.techniques?.length || 0})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 space-y-3 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search techniques..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'martial', 'mystic', 'passive'] as const).map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => setFilterType(type)}
              className={cn(
                "flex-1 text-xs",
                filterType === type 
                  ? "bg-gold/20 text-gold border border-gold/30" 
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {character.techniques && character.techniques.length > 0 ? (
            filteredTechniques.length > 0 ? (
              filteredTechniques.map((tech) => {
                const ElementIcon = tech.element ? elementIcons[tech.element] : null;
                return (
                  <div
                    key={tech.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("font-display text-lg", getRankColor(tech.rank))}>
                            {tech.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("text-xs px-2 py-0.5 rounded border", typeColors[tech.type])}>
                            {tech.type}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded", getRankColor(tech.rank), "bg-opacity-20")}>
                            {tech.rank}
                          </span>
                          {tech.element && ElementIcon && (
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70 flex items-center gap-1">
                              <ElementIcon className="w-3 h-3" />
                              {tech.element}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/70 leading-relaxed mb-3">
                      {tech.description}
                    </p>

                    {/* Mastery Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Mastery</span>
                        <span className={getMasteryColor(tech.mastery)}>
                          {tech.mastery}% - {getMasteryLabel(tech.mastery)}
                        </span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            tech.mastery >= 80 ? "bg-gradient-to-r from-gold to-yellow-400" :
                            tech.mastery >= 50 ? "bg-gradient-to-r from-jade to-green-400" :
                            tech.mastery >= 25 ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                            "bg-gradient-to-r from-white/40 to-white/30"
                          )}
                          style={{ width: `${tech.mastery}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-white/60 pt-3 border-t border-white/10">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {tech.qiCost} Qi
                      </span>
                      {tech.cooldown && tech.cooldown !== 'none' && (
                        <span>⏱️ {tech.cooldown}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">No techniques found</p>
                <p className="text-xs text-white/40">
                  Try adjusting your search or filter
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Swords className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">No techniques learned yet</p>
              <p className="text-xs text-white/40">
                Learn techniques from masters, manuals, or observation
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10 bg-black/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Total</p>
            <p className="text-white font-medium">{character.techniques?.length || 0}</p>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Mastered</p>
            <p className="text-gold font-medium">
              {character.techniques?.filter(t => t.mastery >= 80).length || 0}
            </p>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <p className="text-white/40">Avg Mastery</p>
            <p className="text-white font-medium">
              {character.techniques && character.techniques.length > 0
                ? Math.round(character.techniques.reduce((sum, t) => sum + t.mastery, 0) / character.techniques.length)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
