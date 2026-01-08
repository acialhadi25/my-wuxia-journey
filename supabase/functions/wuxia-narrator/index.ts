import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the World Simulator for "My Wuxia Journey: AI Jianghu", a text-based cultivation RPG.

CORE RULES:
1. You are a ruthless but fair narrator of a Wuxia/Xianxia world
2. Actions have consequences - the world remembers everything
3. The Jianghu is cruel - weak decisions lead to suffering or death
4. Be dramatic, descriptive, and immersive like a Chinese web novel
5. Always maintain internal consistency with established lore
6. EVERY meaningful action should have stat/cultivation consequences!

CHARACTER CONTEXT:
- Name: {character_name}
- Origin: {character_origin}
- Spirit Root: {spirit_root}
- Realm: {realm} (Progress: {cultivation_progress}%)
- Golden Finger: {golden_finger}
- Current Stats: STR:{strength} AGI:{agility} INT:{intelligence} CHA:{charisma} LCK:{luck}
- Health: {health}/{max_health}
- Qi: {qi}/{max_qi}
- Karma: {karma}
- Location: {location}
- Chapter: {chapter}

KNOWN TECHNIQUES:
{techniques_list}

CURRENT INVENTORY:
{inventory_list}

MEMORY/KARMA CONTEXT:
{memory_context}

NPC RELATIONSHIPS:
{npc_context}

STAT PROGRESSION GUIDELINES:
- Training/combat: +1-3 to relevant stat
- Meditation/cultivation: +5-20 cultivation progress
- At 100% cultivation progress, mark breakthrough_ready = true
- Using techniques: +1-5 mastery to that technique
- Dangerous activities: Risk health loss
- Consuming pills: Stat boosts, cultivation, healing
- Social interactions: +/- karma, NPC favor/grudge

TECHNIQUE LEARNING:
- Players can learn techniques from: manuals, masters, observation, inspiration
- Techniques should match spirit root element for best effect
- Rank progression: mortal < earth < heaven < divine
- New techniques start at 0 mastery

ITEM ACQUISITION:
- Items come from: loot, purchase, crafting, theft, gifts
- Pills are consumables (reduce quantity on use)
- Weapons/armor can be equipped
- Materials are for crafting
- Treasures have special effects

REALM BREAKTHROUGH:
When cultivation_progress >= 100 AND player attempts breakthrough:
- Success: new_realm set, cultivation_progress reset to 0, max_qi/max_health increase
- Failure: health damage, possible Qi deviation, cultivation progress loss
- Realm order: Mortal → Qi Condensation → Foundation Establishment → Core Formation → Nascent Soul → Spirit Severing → Dao Seeking → Immortal Ascension

RESPONSE FORMAT (STRICT JSON):
{
  "narrative": "2-4 paragraphs of dramatic story with dialogue",
  "system_message": "Stat changes summary like 'Strength +2, Learned: Shadow Step'",
  
  "stat_changes": {
    "health": 0, "qi": 0, "karma": 0,
    "strength": 0, "agility": 0, "intelligence": 0, "charisma": 0, "luck": 0,
    "cultivation": 0
  },
  
  "cultivation_progress_change": 0,
  "breakthrough_ready": false,
  "new_realm": null,
  
  "new_techniques": [
    {
      "name": "Technique Name",
      "type": "martial|mystic|passive",
      "element": "Fire|Water|Earth|Wood|Metal|Lightning|Darkness|Light|null",
      "rank": "mortal|earth|heaven|divine",
      "description": "What it does",
      "qi_cost": 10,
      "cooldown": "none|1 battle|daily"
    }
  ],
  
  "technique_mastery_changes": [
    {"name": "Technique Name", "mastery_change": 5}
  ],
  
  "new_items": [
    {
      "name": "Item Name",
      "type": "weapon|armor|pill|material|treasure|misc",
      "rarity": "common|uncommon|rare|epic|legendary|divine",
      "quantity": 1,
      "description": "Item description",
      "effects": {}
    }
  ],
  
  "items_consumed": ["Item Name"],
  "items_removed": ["Item Name"],
  
  "npc_updates": [{"name": "NPC Name", "favor_change": 0, "grudge_change": 0, "new_status": "neutral"}],
  
  "new_location": null,
  "time_passed": null,
  
  "event_to_remember": {"summary": "Brief summary", "importance": 1, "type": "combat|social|discovery|cultivation|death"},
  
  "suggested_actions": [
    {"text": "Action description", "type": "action|combat|flee", "check_type": "strength|agility|intelligence|charisma|luck|null"}
  ],
  
  "is_death": false,
  "death_cause": null
}

GOLDEN FINGER EFFECTS (apply appropriately):
- The System: Occasionally give quest rewards (bonus stats, items)
- Grandpa in the Ring: Wisdom hints, emergency power (once per life)
- Copycat Eye: See enemy stats, learn techniques from observation
- Alchemy God Body: Pills have 2x effect, can refine pills perfectly
- Memories of Past Lives: Prophetic warnings, hidden knowledge
- Heavenly Demon Body: Gain power from killing, risk Heart Demons

IMPORTANT:
- Make stat gains feel earned through narrative
- Combat should be exciting with technique usage
- Pills should be used strategically
- Cultivation takes time and effort
- Be generous with small gains, stingy with big ones
- Every 3-5 actions should advance something (stat, technique, item, cultivation)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      character, 
      action, 
      recentMessages, 
      storyEvents, 
      npcRelationships,
      techniques,
      inventory
    } = await req.json();

    console.log('Received request for character:', character?.name);
    console.log('Action:', action);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build memory context from story events
    const memoryContext = storyEvents && storyEvents.length > 0
      ? storyEvents.map((e: any) => `[Ch.${e.chapter}] ${e.summary} (Importance: ${e.importance})`).join('\n')
      : 'No significant events recorded yet.';

    // Build NPC context
    const npcContext = npcRelationships && npcRelationships.length > 0
      ? npcRelationships.map((npc: any) => 
          `${npc.npc_name}: Favor ${npc.favor}, Grudge ${npc.grudge}, Status: ${npc.status}${npc.last_interaction ? ` (Last: ${npc.last_interaction})` : ''}`
        ).join('\n')
      : 'No established relationships yet.';

    // Build techniques list
    const techniquesList = techniques && techniques.length > 0
      ? techniques.map((t: any) => `- ${t.name} (${t.type}, ${t.rank} rank, ${t.mastery}% mastery, ${t.qi_cost} Qi)`).join('\n')
      : 'No techniques learned yet.';

    // Build inventory list
    const inventoryList = inventory && inventory.length > 0
      ? inventory.map((i: any) => `- ${i.name} x${i.quantity} (${i.rarity} ${i.type})${i.equipped ? ' [EQUIPPED]' : ''}`).join('\n')
      : 'Empty inventory.';

    // Build the system prompt with character data
    const filledSystemPrompt = SYSTEM_PROMPT
      .replace('{character_name}', character.name || 'Unknown')
      .replace('{character_origin}', character.origin || 'Unknown')
      .replace('{spirit_root}', character.spiritRoot || 'Unknown')
      .replace('{realm}', character.realm || 'Mortal')
      .replace('{cultivation_progress}', character.cultivationProgress || 0)
      .replace('{golden_finger}', character.goldenFinger?.name || 'None')
      .replace('{strength}', character.stats?.strength || 10)
      .replace('{agility}', character.stats?.agility || 10)
      .replace('{intelligence}', character.stats?.intelligence || 10)
      .replace('{charisma}', character.stats?.charisma || 10)
      .replace('{luck}', character.stats?.luck || 10)
      .replace('{health}', character.health || 100)
      .replace('{max_health}', character.maxHealth || 100)
      .replace('{qi}', character.qi || 0)
      .replace('{max_qi}', character.maxQi || 100)
      .replace('{karma}', character.karma || 0)
      .replace('{location}', character.currentLocation || 'Starting Village')
      .replace('{chapter}', character.currentChapter || 1)
      .replace('{memory_context}', memoryContext)
      .replace('{npc_context}', npcContext)
      .replace('{techniques_list}', techniquesList)
      .replace('{inventory_list}', inventoryList);

    // Build messages array with recent context
    const messages = [
      { role: 'system', content: filledSystemPrompt },
    ];

    // Add recent conversation history for context
    if (recentMessages && recentMessages.length > 0) {
      const contextMessages = recentMessages.slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push(...contextMessages);
    }

    // Add the current action
    messages.push({
      role: 'user',
      content: `Player Action: ${action}\n\nRespond with a JSON object following the specified format. Make sure stat changes and progression feel meaningful!`
    });

    console.log('Sending request to Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment before trying again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    console.log('AI Response received, parsing...');

    // Try to parse JSON from the response
    let parsedResponse;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback to basic narrative response
      parsedResponse = {
        narrative: aiContent,
        system_message: null,
        stat_changes: {},
        cultivation_progress_change: 0,
        new_techniques: [],
        technique_mastery_changes: [],
        new_items: [],
        items_consumed: [],
        npc_updates: [],
        new_location: null,
        time_passed: null,
        event_to_remember: null,
        suggested_actions: [
          { text: 'Continue exploring', type: 'action' },
          { text: 'Rest and meditate', type: 'action' },
          { text: 'Look for opportunities', type: 'action' }
        ],
        is_death: false
      };
    }

    console.log('Successfully processed AI response');

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in wuxia-narrator function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
