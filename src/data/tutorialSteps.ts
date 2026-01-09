import { TutorialStep } from '@/types/tutorial';

// Complete 15-step hardcoded tutorial
export const tutorialSteps: TutorialStep[] = [
  // ==========================================
  // CHAPTER 1: SURVIVAL (Steps 1-5)
  // ==========================================
  
  // Step 1: Awakening - Status Effects Introduction
  {
    id: 1,
    chapter: 'survival',
    daoMasterMessage: {
      en: "Welcome, young cultivator. I am the Dao Master, your guide in this journey. Notice the red debuff 'Severe Hunger' - status effects can help or harm you.",
      id: "Selamat datang, kultivator muda. Aku adalah Dao Master, pembimbingmu dalam perjalanan ini. Perhatikan debuff merah 'Kelaparan Parah' - status effect bisa membantu atau merugikanmu."
    },
    narrative: {
      en: "You wake up in a cold, dark cave. Your body trembles with weakness, and your stomach aches with hunger. The chill seeps into your bones.",
      id: "Kamu terbangun di gua yang dingin dan gelap. Tubuhmu gemetar lemah, dan perutmu keroncongan kelaparan. Dingin merasuk hingga ke tulang."
    },
    actionText: {
      en: "Feel your weak body",
      id: "Rasakan kondisi tubuh yang lemah"
    },
    mechanicsTeaching: ['Active Effects Display', 'Debuff concept', 'Health drain over time'],
    autoActions: [
      {
        type: 'add_effect',
        params: {
          name: 'Kelaparan Parah',
          type: 'debuff',
          description: 'Tubuh sangat lemah karena kelaparan. HP berkurang 1/detik.',
          duration: -1, // Permanent until removed
          statModifiers: { strength: -3, agility: -2 },
          regenModifiers: { staminaRegen: -2 },
          damageOverTime: { healthDamage: 1, qiDrain: 0, staminaDrain: 0 }
        }
      },
      {
        type: 'stat_change',
        params: { health: -10 }
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // Step 2: Inventory Discovery
  {
    id: 2,
    chapter: 'survival',
    daoMasterMessage: {
      en: "You carry items with you. Click the 📦 Inventory button at the top to see what you have.",
      id: "Kamu membawa barang bersamamu. Klik tombol 📦 Inventory di atas untuk melihat apa yang kamu punya."
    },
    narrative: {
      en: "Through the haze of hunger, you remember - you had emergency supplies when you entered this cave.",
      id: "Melalui kabut kelaparan, kamu teringat - kamu membawa perbekalan darurat saat masuk ke gua ini."
    },
    actionText: {
      en: "Search your belongings",
      id: "Cari barang bawaan"
    },
    mechanicsTeaching: ['Inventory button location', 'Inventory panel UI', 'Item categories'],
    autoActions: [
      {
        type: 'add_item',
        params: {
          id: 'dried_bread',
          name: 'Roti Kering',
          type: 'misc',
          rarity: 'common',
          description: 'Roti kering yang keras tapi masih bisa dimakan. Memulihkan 20 HP dan 10 Stamina.',
          quantity: 1,
          effects: { health: 20, stamina: 10 }
        }
      },
      {
        type: 'add_item',
        params: {
          id: 'water_flask',
          name: 'Botol Air',
          type: 'misc',
          rarity: 'common',
          description: 'Air bersih dalam botol kulit. Memulihkan 15 Stamina.',
          quantity: 1,
          effects: { stamina: 15 }
        }
      }
    ],
    panelToOpen: 'inventory',
    highlightButton: 'inventory',
    waitForUserAction: true
  },

  // Step 3: Item Usage
  {
    id: 3,
    chapter: 'survival',
    daoMasterMessage: {
      en: "Click on the food item to consume it. Watch your health restore and the hunger effect disappear.",
      id: "Klik pada item makanan untuk mengkonsumsinya. Perhatikan HP-mu pulih dan efek kelaparan hilang."
    },
    narrative: {
      en: "You find dried bread and water. Your hands shake as you reach for the food.",
      id: "Kamu menemukan roti kering dan air. Tanganmu gemetar saat meraih makanan itu."
    },
    actionText: {
      en: "Eat the dried bread",
      id: "Makan roti kering"
    },
    mechanicsTeaching: ['How to use items', 'Item effects', 'Effect removal', 'Item consumption'],
    autoActions: [
      // Item consumption handled by user clicking in inventory
      // Effect removal handled automatically by GameScreen
    ],
    panelToOpen: undefined,
    highlightButton: undefined,
    waitForUserAction: true // Wait for user to actually consume item
  },

  // Step 4: Status Panel
  {
    id: 4,
    chapter: 'survival',
    daoMasterMessage: {
      en: "Good! Now click 👤 Status to see your complete character information.",
      id: "Bagus! Sekarang klik 👤 Status untuk melihat informasi lengkap karaktermu."
    },
    narrative: {
      en: "Strength returns to your limbs. You feel alive again.",
      id: "Kekuatan kembali ke anggota tubuhmu. Kamu merasa hidup kembali."
    },
    actionText: {
      en: "Check your condition",
      id: "Periksa kondisi diri"
    },
    mechanicsTeaching: ['Status panel', 'Character stats', 'Health/Qi/Stamina bars', 'Cultivation realm'],
    autoActions: [],
    panelToOpen: 'status',
    highlightButton: 'status',
    waitForUserAction: true
  },

  // Step 5: Regeneration System
  {
    id: 5,
    chapter: 'survival',
    daoMasterMessage: {
      en: "Notice your stamina slowly regenerating? Rest and meditation restore your energy over time.",
      id: "Perhatikan stamina-mu perlahan pulih? Istirahat dan meditasi memulihkan energimu seiring waktu."
    },
    narrative: {
      en: "You sit down to catch your breath. The cave is quiet except for the sound of dripping water.",
      id: "Kamu duduk untuk mengatur napas. Gua ini sunyi kecuali suara air menetes."
    },
    actionText: {
      en: "Rest for a moment",
      id: "Beristirahat sejenak"
    },
    mechanicsTeaching: ['Passive regeneration', 'Stamina regen rate', 'Health regen', 'Time passage'],
    autoActions: [
      {
        type: 'add_effect',
        params: {
          name: 'Resting',
          type: 'buff',
          description: 'Beristirahat memulihkan stamina lebih cepat.',
          duration: 30,
          statModifiers: {},
          regenModifiers: { staminaRegen: 5 }
        }
      },
      {
        type: 'wait',
        params: { duration: 3000 } // Wait 3 seconds to show regen
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // ==========================================
  // CHAPTER 2: COMBAT BASICS (Steps 6-9)
  // ==========================================

  // Step 6: Enemy Encounter
  {
    id: 6,
    chapter: 'combat',
    daoMasterMessage: {
      en: "Danger approaches! A wild beast senses your weakness. Prepare for combat.",
      id: "Bahaya mendekat! Binatang buas mencium kelemahanmu. Bersiap untuk bertarung."
    },
    narrative: {
      en: "A low growl echoes through the cave. A hungry wolf emerges from the shadows, its eyes gleaming with predatory intent.",
      id: "Geraman rendah bergema di gua. Seekor serigala lapar muncul dari bayangan, matanya bersinar dengan niat predator."
    },
    actionText: {
      en: "Prepare to face the wolf",
      id: "Bersiap menghadapi serigala"
    },
    mechanicsTeaching: ['Combat initiation', 'Enemy stats', 'Threat assessment'],
    autoActions: [
      {
        type: 'spawn_enemy',
        params: {
          name: 'Hungry Wolf',
          health: 30,
          maxHealth: 30,
          attack: 5,
          defense: 2
        }
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // Step 7: Basic Attack
  {
    id: 7,
    chapter: 'combat',
    daoMasterMessage: {
      en: "Attack with your basic strike. Combat uses stamina - watch your green bar!",
      id: "Serang dengan pukulan dasar. Pertarungan menggunakan stamina - perhatikan bar hijau!"
    },
    narrative: {
      en: "The wolf lunges forward! You raise your fists in defense.",
      id: "Serigala menyerang! Kamu mengangkat tinjumu untuk bertahan."
    },
    actionText: {
      en: "Strike with bare hands",
      id: "Serang dengan tangan kosong"
    },
    mechanicsTeaching: ['Basic attack', 'Stamina cost', 'Damage calculation', 'Combat log'],
    autoActions: [
      {
        type: 'deal_damage',
        params: {
          target: 'enemy',
          damage: 8,
          staminaCost: 5
        }
      },
      {
        type: 'deal_damage',
        params: {
          target: 'player',
          damage: 3,
          source: 'Hungry Wolf counterattack'
        },
        delay: 1000
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // Step 8: Techniques Introduction
  {
    id: 8,
    chapter: 'combat',
    daoMasterMessage: {
      en: "You know a basic technique! Click ⚔️ Techniques to see your skills.",
      id: "Kamu tahu teknik dasar! Klik ⚔️ Techniques untuk melihat skill-mu."
    },
    narrative: {
      en: "A memory surfaces - training from your childhood. You know how to channel Qi into your strikes!",
      id: "Sebuah ingatan muncul - latihan dari masa kecilmu. Kamu tahu cara menyalurkan Qi ke pukulanmu!"
    },
    actionText: {
      en: "Remember basic technique",
      id: "Ingat teknik dasar"
    },
    mechanicsTeaching: ['Techniques panel', 'Technique list', 'Qi cost', 'Technique effects'],
    autoActions: [
      {
        type: 'add_technique',
        params: {
          id: 'basic_palm_strike',
          name: 'Basic Palm Strike',
          description: 'Pukulan telapak tangan yang disalurkan Qi. Damage sedang dengan cost Qi rendah.',
          qiCost: 10,
          staminaCost: 5,
          damage: 15,
          element: 'neutral',
          mastery: 0,
          maxMastery: 100
        }
      }
    ],
    panelToOpen: 'techniques',
    highlightButton: 'techniques',
    waitForUserAction: true
  },

  // Step 9: Using Techniques
  {
    id: 9,
    chapter: 'combat',
    daoMasterMessage: {
      en: "Use your technique to finish the wolf! Techniques are powerful but cost Qi.",
      id: "Gunakan teknikmu untuk mengalahkan serigala! Teknik powerful tapi membutuhkan Qi."
    },
    narrative: {
      en: "You channel Qi into your palm. Energy crackles around your hand.",
      id: "Kamu menyalurkan Qi ke telapak tanganmu. Energi berkilat di sekitar tanganmu."
    },
    actionText: {
      en: "Use Basic Palm Strike",
      id: "Gunakan Basic Palm Strike"
    },
    mechanicsTeaching: ['Using techniques', 'Qi consumption', 'Technique damage', 'Combat victory'],
    autoActions: [
      // Technique usage handled by user clicking in techniques panel
      // Victory handled automatically when enemy HP reaches 0
    ],
    panelToOpen: undefined,
    highlightButton: undefined,
    waitForUserAction: true
  },

  // ==========================================
  // CHAPTER 3: CULTIVATION (Steps 10-12)
  // ==========================================

  // Step 10: Cultivation Panel
  {
    id: 10,
    chapter: 'cultivation',
    daoMasterMessage: {
      en: "You've gained experience! Click 🌟 Cultivation to see your progress on the path of immortality.",
      id: "Kamu mendapat pengalaman! Klik 🌟 Cultivation untuk melihat progresmu di jalan keabadian."
    },
    narrative: {
      en: "The wolf's body dissolves into motes of light. You feel Qi flowing stronger within you.",
      id: "Tubuh serigala larut menjadi titik-titik cahaya. Kamu merasakan Qi mengalir lebih kuat dalam dirimu."
    },
    actionText: {
      en: "Feel the Qi flow",
      id: "Rasakan aliran Qi"
    },
    mechanicsTeaching: ['Cultivation panel', 'Cultivation progress', 'Realm system', 'Breakthrough concept'],
    autoActions: [
      {
        type: 'gain_xp',
        params: {
          amount: 15,
          source: 'Defeated Hungry Wolf'
        }
      },
      {
        type: 'restore_stat',
        params: { qi: 20 }
      }
    ],
    panelToOpen: 'cultivation',
    highlightButton: 'cultivation',
    waitForUserAction: true
  },

  // Step 11: Meditation
  {
    id: 11,
    chapter: 'cultivation',
    daoMasterMessage: {
      en: "Meditate to cultivate Qi. This is how you grow stronger and advance through realms.",
      id: "Bermeditasi untuk mengkultivasi Qi. Ini cara kamu menjadi lebih kuat dan naik realm."
    },
    narrative: {
      en: "You sit in lotus position, closing your eyes. The world fades as you focus inward.",
      id: "Kamu duduk bersila, memejamkan mata. Dunia memudar saat kamu fokus ke dalam."
    },
    actionText: {
      en: "Meditate to cultivate",
      id: "Bermeditasi untuk kultivasi"
    },
    mechanicsTeaching: ['Meditation mechanics', 'Qi cultivation', 'Cultivation progress', 'Time investment'],
    autoActions: [
      {
        type: 'add_effect',
        params: {
          name: 'Meditating',
          type: 'buff',
          description: 'Bermeditasi untuk kultivasi. Cultivation progress meningkat.',
          duration: 10,
          statModifiers: {},
          regenModifiers: { qiRegen: 2 }
        }
      },
      {
        type: 'stat_change',
        params: {
          cultivationProgress: 20
        }
      },
      {
        type: 'restore_stat',
        params: { qi: 20 }
      },
      {
        type: 'wait',
        params: { duration: 2000 }
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // Step 12: Breakthrough Preview
  {
    id: 12,
    chapter: 'cultivation',
    daoMasterMessage: {
      en: "When you reach 100%, you can breakthrough to the next realm. Each realm grants permanent stat increases!",
      id: "Saat mencapai 100%, kamu bisa breakthrough ke realm berikutnya. Setiap realm memberikan peningkatan stat permanen!"
    },
    narrative: {
      en: "You understand now - this is the path of cultivation. Slow, steady progress toward immortality.",
      id: "Kamu mengerti sekarang - ini adalah jalan kultivasi. Progres perlahan dan stabil menuju keabadian."
    },
    actionText: {
      en: "Understand the cultivation path",
      id: "Pahami jalan kultivasi"
    },
    mechanicsTeaching: ['Breakthrough requirements', 'Realm benefits', 'Stat increases', 'Long-term progression'],
    autoActions: [],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // ==========================================
  // CHAPTER 4: GOLDEN FINGER (Steps 13-14)
  // ==========================================

  // Step 13: Golden Finger Awakening
  {
    id: 13,
    chapter: 'golden_finger',
    daoMasterMessage: {
      en: "Something ancient awakens within you... This is your Golden Finger - a unique power that defies heaven's will!",
      id: "Sesuatu yang kuno terbangun dalam dirimu... Ini adalah Golden Finger-mu - kekuatan unik yang menentang kehendak langit!"
    },
    narrative: {
      en: "A surge of power unlike anything you've felt before. This is YOUR unique gift.",
      id: "Lonjakan kekuatan yang belum pernah kamu rasakan sebelumnya. Ini adalah hadiah unikMU."
    },
    actionText: {
      en: "Feel the awakening power",
      id: "Rasakan kekuatan yang terbangun"
    },
    mechanicsTeaching: ['Golden Finger concept', 'Unique ability', 'Special mechanics', 'Power activation'],
    autoActions: [
      {
        type: 'unlock_golden_finger',
        params: {} // Will use character's selected Golden Finger
      }
    ],
    panelToOpen: undefined,
    highlightButton: undefined
  },

  // Step 14: Golden Finger Panel
  {
    id: 14,
    chapter: 'golden_finger',
    daoMasterMessage: {
      en: "Click ✨ Golden Finger to learn about your unique power and how to use it.",
      id: "Klik ✨ Golden Finger untuk mempelajari kekuatan unikmu dan cara menggunakannya."
    },
    narrative: {
      en: "The power courses through you. You must learn to control it.",
      id: "Kekuatan mengalir melalui dirimu. Kamu harus belajar mengendalikannya."
    },
    actionText: {
      en: "Learn your unique power",
      id: "Pelajari kekuatan unik"
    },
    mechanicsTeaching: ['Golden Finger panel', 'Ability description', 'Usage conditions', 'Cooldowns/costs'],
    autoActions: [],
    panelToOpen: 'goldenFinger',
    highlightButton: 'goldenFinger',
    waitForUserAction: true
  },

  // ==========================================
  // CHAPTER 5: ADVANCED FEATURES (Step 15)
  // ==========================================

  // Step 15: Memory System & Tutorial Complete
  {
    id: 15,
    chapter: 'advanced',
    daoMasterMessage: {
      en: "Finally, the 🧠 Memory system records important events. Your journey is now truly beginning. Go forth and forge your legend!",
      id: "Terakhir, sistem 🧠 Memory mencatat event penting. Perjalananmu sekarang benar-benar dimulai. Majulah dan ciptakan legendamu!"
    },
    narrative: {
      en: "You stand at the cave entrance, looking out at the vast world. Your adventure begins now.",
      id: "Kamu berdiri di pintu gua, memandang dunia yang luas. Petualanganmu dimulai sekarang."
    },
    actionText: {
      en: "Step into the cultivation world",
      id: "Melangkah ke dunia kultivasi"
    },
    mechanicsTeaching: ['Memory panel', 'Event recording', 'Memory importance', 'Long-term tracking'],
    autoActions: [
      {
        type: 'add_memory',
        params: {
          summary: 'Tutorial completed - Journey begins',
          importance: 'important',
          event_type: 'tutorial',
          emotion: 'determination'
        }
      }
    ],
    panelToOpen: 'memory',
    highlightButton: 'memory',
    waitForUserAction: false // Last step, auto-complete
  }
];
