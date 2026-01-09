import { GoldenFingerAwakeningTemplate } from '@/types/tutorial';

// Hardcoded awakening narratives for each Golden Finger type
export const goldenFingerTemplates: Record<string, GoldenFingerAwakeningTemplate> = {
  "Heavenly Demon Body": {
    narrative_id: "Darah hitam mengalir dari luka {name}, tapi alih-alih melemah, {pronoun} merasakan kekuatan yang mengerikan membanjiri tubuh. Setiap tetes darah yang tumpah membuat {pronoun} lebih kuat. Ini adalah Tubuh Iblis Surgawi - kekuatan yang tumbuh dari pembunuhan.",
    narrative_en: "Black blood flows from {name}'s wound, but instead of weakening, {pronoun} feels terrifying power flooding through. Each drop of spilled blood makes {pronoun} stronger. This is the Heavenly Demon Body - power that grows from slaughter.",
    effect: "Gain cultivation from killing. Dark techniques cost less Qi. Beware of Heart Demons.",
    awakening_bonus: {
      stat_changes: { strength: 2, intelligence: 1 },
      new_technique: "Dark Palm Strike",
      special_effect: "Blood Thirst"
    }
  },

  "Copycat Eye": {
    narrative_id: "Mata {name} tiba-tiba berubah - iris berputar dengan pola aneh. {pronoun} dapat MELIHAT aliran Qi, memahami teknik hanya dengan mengamati. Ini adalah Mata Peniru - kekuatan untuk mencuri teknik apapun.",
    narrative_en: "{name}'s eyes suddenly change - irises spinning with strange patterns. {pronoun} can SEE Qi flow, understand techniques just by observing. This is the Copycat Eye - power to steal any technique.",
    effect: "Copy techniques by observing them in combat. Analyze enemy patterns.",
    awakening_bonus: {
      stat_changes: { intelligence: 3, agility: 1 },
      new_technique: "Qi Sense",
      special_effect: "Technique Analysis"
    }
  },

  "Grandpa Ring": {
    narrative_id: "Cincin tua di jari {name} bersinar. Suara tua dan bijaksana bergema di pikiran: 'Akhirnya kau bangun, murid. Aku adalah Guru Abadi yang terjebak dalam cincin ini. Biarkan aku membimbingmu ke puncak kultivasi.'",
    narrative_en: "The old ring on {name}'s finger glows. An ancient, wise voice echoes in {pronoun} mind: 'Finally you awaken, disciple. I am the Eternal Master trapped in this ring. Let me guide you to the peak of cultivation.'",
    effect: "Ancient master provides guidance and emergency power. Can ask for advice.",
    awakening_bonus: {
      stat_changes: { intelligence: 2, luck: 2 },
      new_technique: "Master's Guidance",
      special_effect: "Emergency Protection"
    }
  },

  "Trash to Treasure": {
    narrative_id: "{name} menatap sampah di sekitar - tapi sekarang {pronoun} MELIHAT potensi tersembunyi. Batu biasa bisa jadi jimat, ranting bisa jadi pedang spiritual. Ini adalah Mata Harta Karun - mengubah sampah menjadi harta.",
    narrative_en: "{name} looks at trash around - but now {pronoun} SEES hidden potential. Common stones become talismans, twigs become spirit swords. This is the Treasure Eye - turning trash into treasure.",
    effect: "Transform common items into cultivation resources. Find hidden treasures.",
    awakening_bonus: {
      stat_changes: { luck: 3, intelligence: 1 },
      new_technique: "Appraisal",
      special_effect: "Item Transmutation"
    }
  },

  "Fate Defier": {
    narrative_id: "Benang merah takdir muncul di penglihatan {name} - garis-garis yang menghubungkan masa lalu, sekarang, dan masa depan. {pronoun} dapat MELIHAT takdir dan MENGUBAHNYA. Ini adalah Mata Takdir - kekuatan melawan kehendak langit.",
    narrative_en: "Red threads of fate appear in {name}'s vision - lines connecting past, present, and future. {pronoun} can SEE destiny and CHANGE it. This is the Fate Eye - power to defy heaven's will.",
    effect: "Reroll critical moments and change outcomes. See glimpses of future.",
    awakening_bonus: {
      stat_changes: { luck: 4 },
      new_technique: "Fate Glimpse",
      special_effect: "Destiny Rewrite"
    }
  },

  "System": {
    narrative_id: "Layar transparan muncul di depan mata {name}. Teks bersinar: [SISTEM KULTIVASI AKTIF]. [QUEST TERSEDIA]. [REWARD: +10 STAT POINTS]. Ini adalah Sistem - kekuatan yang mengubah kultivasi menjadi game.",
    narrative_en: "A transparent screen appears before {name}'s eyes. Text glows: [CULTIVATION SYSTEM ACTIVE]. [QUEST AVAILABLE]. [REWARD: +10 STAT POINTS]. This is the System - power that turns cultivation into a game.",
    effect: "Receive quests with rewards. Level up system. Shop for items and skills.",
    awakening_bonus: {
      stat_changes: { intelligence: 2, luck: 2 },
      new_technique: "System Scan",
      special_effect: "Quest System"
    }
  },

  "Reincarnator": {
    narrative_id: "Ingatan dari kehidupan masa lalu membanjiri pikiran {name}. {pronoun} TAHU apa yang akan terjadi. {pronoun} TAHU rahasia dunia ini. Ini adalah Pengetahuan Reinkarnasi - kekuatan dari kehidupan kedua.",
    narrative_en: "Memories from a past life flood {name}'s mind. {pronoun} KNOWS what will happen. {pronoun} KNOWS the secrets of this world. This is Reincarnation Knowledge - power from a second life.",
    effect: "Knowledge of future events. Know locations of treasures and dangers.",
    awakening_bonus: {
      stat_changes: { intelligence: 3, luck: 1 },
      new_technique: "Future Insight",
      special_effect: "Past Life Knowledge"
    }
  },

  "Dual Cultivation": {
    narrative_id: "Energi Yin dan Yang berputar dalam dantian {name}, sempurna seimbang. {pronoun} dapat mengkultivasi KEDUA jalur sekaligus - sesuatu yang mustahil bagi kultivator biasa. Ini adalah Kultivasi Ganda - kekuatan harmoni sempurna.",
    narrative_en: "Yin and Yang energy swirl in {name}'s dantian, perfectly balanced. {pronoun} can cultivate BOTH paths simultaneously - something impossible for normal cultivators. This is Dual Cultivation - power of perfect harmony.",
    effect: "Cultivate both Yin and Yang paths. Double cultivation speed. Unique techniques.",
    awakening_bonus: {
      stat_changes: { intelligence: 2, charisma: 2 },
      new_technique: "Yin-Yang Palm",
      special_effect: "Dual Path"
    }
  },

  "Beast Tamer": {
    narrative_id: "{name} merasakan koneksi dengan semua makhluk hidup. Binatang, monster, bahkan beast spiritual - semuanya dapat {pronoun} pahami dan taklukkan. Ini adalah Jiwa Penjinak - kekuatan untuk memimpin semua makhluk.",
    narrative_en: "{name} feels connection with all living creatures. Animals, monsters, even spirit beasts - all can be understood and tamed. This is the Tamer Soul - power to lead all creatures.",
    effect: "Tame beasts as companions. Understand animal language. Beast army.",
    awakening_bonus: {
      stat_changes: { charisma: 3, luck: 1 },
      new_technique: "Beast Call",
      special_effect: "Taming Aura"
    }
  },

  "Alchemy Genius": {
    narrative_id: "Pengetahuan tentang ribuan ramuan dan pil membanjiri pikiran {name}. {pronoun} dapat MELIHAT properti setiap bahan, memahami kombinasi sempurna. Ini adalah Jiwa Alkemis - kekuatan untuk menciptakan keajaiban dari ramuan.",
    narrative_en: "Knowledge of thousands of herbs and pills floods {name}'s mind. {pronoun} can SEE properties of every ingredient, understand perfect combinations. This is the Alchemist Soul - power to create miracles from herbs.",
    effect: "Create powerful pills and potions. Identify all herbs. Alchemy mastery.",
    awakening_bonus: {
      stat_changes: { intelligence: 3, luck: 1 },
      new_technique: "Herb Identification",
      special_effect: "Alchemy Insight"
    }
  }
};

// Helper function to get awakening narrative with character info
export function getGoldenFingerAwakeningNarrative(
  goldenFingerName: string,
  characterName: string,
  gender: 'Male' | 'Female',
  language: 'en' | 'id'
): string {
  const template = goldenFingerTemplates[goldenFingerName];
  if (!template) {
    return language === 'id' 
      ? `Kekuatan ${goldenFingerName} terbangun dalam diri ${characterName}.`
      : `The power of ${goldenFingerName} awakens within ${characterName}.`;
  }

  const narrative = language === 'id' ? template.narrative_id : template.narrative_en;
  const pronoun = gender === 'Male' 
    ? (language === 'id' ? 'dia' : 'he')
    : (language === 'id' ? 'dia' : 'she');

  return narrative
    .replace(/{name}/g, characterName)
    .replace(/{pronoun}/g, pronoun);
}
