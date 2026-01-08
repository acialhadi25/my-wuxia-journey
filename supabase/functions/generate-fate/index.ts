import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Wuxia/Jianghu fate generator specializing in classical Chinese martial arts world storytelling. Generate origin stories set EXCLUSIVELY in ancient China's Jianghu (江湖) - the world of martial artists, sects, and cultivators.

CRITICAL SETTING REQUIREMENTS - The story MUST include:
1. Chinese names for ALL characters (use pinyin, e.g., Li Wei, Zhang Feng, Chen Xiaoming)
2. Chinese locations (e.g., Huashan Mountain, Yangtze River, Jiangnan region, Luoyang city, Kunlun sect territory)
3. Chinese cultural elements: sects (门派), martial families (武林世家), cultivation halls (修炼堂), medicine halls (医馆), teahouses (茶馆)
4. Chinese concepts: face (面子), filial piety (孝), karma/fate (缘分), Dao (道), Qi (气)
5. Wuxia terminology: inner strength (内力), meridians (经脉), martial arts manuals (武功秘籍), sect masters (掌门), elders (长老)

AVOID these Western fantasy elements:
- NO Western names or European-sounding locations
- NO dragons, orcs, elves, or Western mythical creatures
- NO wizards, mages, or Western magic systems
- NO medieval European settings (castles, knights, etc.)

The origin should follow classic Wuxia tropes:
1. Tragic/humble beginning: orphan, destroyed sect, fallen noble family, servant, beggar
2. Hidden potential: blocked meridians with immense latent power, mysterious birthmark, inherited martial arts manual, master's dying gift
3. Motivation to enter Jianghu: revenge against rival sect, restore family honor, find missing parent, cure a poison, protect loved ones

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short Chinese-flavored title (3-5 words, e.g., 'Fallen Phoenix Disciple', 'Orphan of Azure Cloud')",
  "description": "One paragraph describing the origin in Jianghu context",
  "spiritRoot": "One of: Fire (火), Water (水), Earth (土), Wood (木), Metal (金), Lightning (雷), Darkness (阴), Light (阳), Trash (废)",
  "backstory": "A detailed 2-3 paragraph backstory with Chinese names, locations, and Wuxia elements",
  "startingLocation": "Chinese location name (e.g., 'Qingfeng Village', 'Ruins of the Seven Stars Sect', 'Luoyang City Slums')",
  "bonuses": {
    "strength": 0,
    "agility": 0,
    "intelligence": 0,
    "charisma": 0,
    "luck": 0,
    "cultivation": 0
  },
  "penalties": {
    "strength": 0,
    "agility": 0,
    "intelligence": 0,
    "charisma": 0,
    "luck": 0,
    "cultivation": 0
  }
}

Rules for bonuses/penalties:
- Total bonus points should be 3-5
- Total penalty points should be 1-3 (as negative numbers)
- "Trash (废)" spirit root should have cultivation penalty of -3 to -5 but luck bonus of +2 to +3 (classic underdog trope)
- Make bonuses and penalties match the backstory logically (e.g., orphan raised by beggars = high agility but low charisma)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a dramatic Jianghu origin story for a cultivator named "${characterName}". The story must be set in ancient China's martial world (Jianghu/江湖) with Chinese names, Chinese locations, and authentic Wuxia elements. Make it tragic, full of potential for greatness, and ready for a journey of cultivation and martial arts mastery.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let origin;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        origin = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Fallback origin
      origin = {
        title: "Wanderer of Lost Memories",
        description: "You awaken beside the banks of the Yangtze River with no memory of your past. Only a jade pendant and fragments of martial arts techniques remain in your mind.",
        spiritRoot: "Trash (废)",
        backstory: `${characterName} awakens at the shores of the Yangtze River (长江) with no memory of their past life. An old fisherman named Wang Bo found them unconscious among the reeds, with only a mysterious jade pendant bearing the symbol of a long-destroyed sect. Though the local medicine hall's physician declared their meridians completely blocked, sometimes in dreams, ${characterName} sees flashes of profound martial arts techniques and hears the voice of a stern master calling their name.`,
        startingLocation: "Qingfeng Fishing Village (清风渔村)",
        bonuses: { luck: 3, intelligence: 2 },
        penalties: { cultivation: -3 },
      };
    }

    return new Response(JSON.stringify(origin), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate fate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
