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
    const { characterName, origin, goldenFinger, currentStep, previousChoice, tutorialHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const goldenFingerScenarios: Record<string, string> = {
      'system': `The player awakens a game-like System that provides quests and rewards. 
        The System should introduce itself mechanically, explain daily quests, and give a simple first quest.
        The tutorial ends when the System is fully bound and the first quest is accepted.`,
      'grandpa': `The player finds an ancient ring containing a powerful soul from ancient times.
        The grandpa should be wise but eccentric, test the player's determination, and offer guidance.
        The tutorial ends when the grandpa accepts the player as a successor.`,
      'copycat': `The player's eyes mutate to see through techniques and copy them.
        They should witness a technique, feel the burning in their eyes, and successfully copy something.
        The tutorial ends when they master basic control of the Copycat Eye.`,
      'alchemy': `The player is poisoned but their body converts the poison to power.
        They discover they can sense pill ingredients and refine medicines naturally.
        The tutorial ends when they successfully absorb/refine their first substance.`,
      'reincarnator': `The player experiences flashbacks from past lives.
        These memories reveal crucial knowledge that saves them from danger.
        The tutorial ends when they accept and integrate memories from a past life.`,
      'heavenly-demon': `Dark energy awakens within the player during a moment of rage.
        They must choose to embrace or resist the demonic power within.
        The tutorial ends when they accept the Heavenly Demon constitution.`,
      'azure-dragon': `Dragon bloodline awakens, manifesting scales and overwhelming pressure.
        An ancient dragon consciousness may speak to guide them.
        The tutorial ends when they achieve initial bloodline awakening.`,
      'time-reversal': `The player dies but time reverses, giving them another chance.
        They must make different choices to survive this time.
        The tutorial ends when they understand the Karmic Time Wheel.`,
      'merchant': `A mystical shop interface appears only to the player.
        They can browse items from across dimensions and make their first trade.
        The tutorial ends when they complete their first transaction.`,
      'sword-spirit': `An ancient sword spirit chooses the player as their host.
        The spirit tests their sword intent and teaches basic sword manifestation.
        The tutorial ends when they form a bond with the sword spirit.`,
      'heaven-eye': `A third eye painfully opens, revealing hidden truths.
        They see through an illusion or detect a hidden treasure.
        The tutorial ends when they learn to control the Heaven Defying Eye.`,
      'soul-palace': `During meditation, the player enters a vast soul palace in their mind.
        They explore the first layer and discover its protective powers.
        The tutorial ends when they claim the Soul Palace as their own.`,
      'body-refiner': `The player's body refuses to break, hardening beyond normal limits.
        They test their new physical prowess and understand body refinement.
        The tutorial ends when they embrace the path of body cultivation.`,
      'fate-plunderer': `After defeating someone, their luck flows into the player.
        They experience immediate fortune and understand the karmic risks.
        The tutorial ends when they grasp the power of fate plundering.`,
      'poison-king': `A deadly poison becomes nourishment instead of death.
        The player learns to sense, absorb, and weaponize toxins.
        The tutorial ends when they embrace the path of poison.`,
    };

    const scenarioContext = goldenFingerScenarios[goldenFinger.id] || 'The player discovers their unique golden finger ability.';

    const systemPrompt = `You are a Wuxia/Xianxia narrative AI generating a tutorial scenario for awakening a Golden Finger ability.

CHARACTER CONTEXT:
- Name: ${characterName}
- Origin: ${origin.title}
- Origin Backstory: ${origin.backstory || origin.description}
- Golden Finger: ${goldenFinger.name}
- Golden Finger Description: ${goldenFinger.description}
- Golden Finger Effect: ${goldenFinger.effect}

SCENARIO REQUIREMENTS:
${scenarioContext}

CURRENT STEP: ${currentStep + 1}/5
${previousChoice ? `PLAYER'S PREVIOUS CHOICE: ${previousChoice}` : 'This is the first step.'}

${tutorialHistory ? `STORY SO FAR:\n${tutorialHistory}` : ''}

RULES:
1. Generate immersive Wuxia narrative (100-200 words)
2. Provide exactly 3 choices for the player
3. Each choice should lead to different outcomes
4. On step 5, the golden finger should fully awaken
5. Maintain dramatic tension and Wuxia atmosphere
6. Use classic tropes: face slapping, coughing blood, jade beauties, arrogant young masters

You must respond with ONLY valid JSON:
{
  "narrative": "The story text describing what happens...",
  "choices": [
    {"id": "choice1", "text": "Choice description", "outcome": "progress"},
    {"id": "choice2", "text": "Choice description", "outcome": "progress"},
    {"id": "choice3", "text": "Choice description", "outcome": "branch"}
  ],
  "isAwakening": false,
  "statChanges": {
    "qi": 0,
    "health": 0,
    "karma": 0
  }
}

For the final step (step 5), set "isAwakening": true and describe the dramatic moment of power awakening.`;

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
          { role: "user", content: `Generate step ${currentStep + 1} of the tutorial scenario for ${characterName}'s ${goldenFinger.name} awakening.${previousChoice ? ` They chose: "${previousChoice}"` : ' This is the beginning of their journey.'}` }
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
    
    let tutorialStep;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        tutorialStep = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Fallback response
      tutorialStep = {
        narrative: `${characterName} feels a strange power stirring within. The ${goldenFinger.name} responds to your determination...`,
        choices: [
          { id: "accept", text: "Embrace the awakening power", outcome: "progress" },
          { id: "resist", text: "Try to control the energy", outcome: "progress" },
          { id: "observe", text: "Wait and observe carefully", outcome: "branch" },
        ],
        isAwakening: currentStep >= 4,
        statChanges: { qi: 5, health: 0, karma: 0 },
      };
    }

    return new Response(JSON.stringify(tutorialStep), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate tutorial error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
