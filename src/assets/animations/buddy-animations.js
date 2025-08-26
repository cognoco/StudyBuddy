// ===================================
// MODULAR BUDDY SYSTEM
// Data-driven buddy configurations
// ===================================

// Buddy personality templates
const BUDDY_PERSONALITIES = {
  energetic: {
    sounds: ['boing', 'yay', 'woohoo'],
    animationStyle: 'bouncy',
    description: 'super excited and encouraging'
  },
  magical: {
    sounds: ['sparkle', 'magic', 'chime'],
    animationStyle: 'mystical',
    description: 'magical and supportive'
  },
  friendly: {
    sounds: ['roar', 'stomp', 'growl'],
    animationStyle: 'strong',
    description: 'friendly and brave'
  },
  playful: {
    sounds: ['purr', 'meow', 'chirp'],
    animationStyle: 'gentle',
    description: 'playful and encouraging'
  },
  loyal: {
    sounds: ['woof', 'bark', 'pant'],
    animationStyle: 'steady',
    description: 'loyal and supportive'
  },
  smart: {
    sounds: ['beep', 'boop', 'whir'],
    animationStyle: 'precise',
    description: 'smart and helpful'
  },
  cool: {
    sounds: ['roar', 'fire', 'whoosh'],
    animationStyle: 'powerful',
    description: 'cool and powerful'
  },
  focused: {
    sounds: ['howl', 'growl', 'breath'],
    animationStyle: 'calm',
    description: 'focused and strong'
  },
  mysterious: {
    sounds: ['beep', 'whoosh', 'hum'],
    animationStyle: 'ethereal',
    description: 'chill and mysterious'
  },
  minimal: {
    sounds: ['pulse', 'hum', 'tone'],
    animationStyle: 'subtle',
    description: 'minimal and focused'
  },
  zen: {
    sounds: ['rustle', 'grow', 'flow'],
    animationStyle: 'organic',
    description: 'calm and growing'
  },
  mystical: {
    sounds: ['chime', 'glow', 'resonate'],
    animationStyle: 'floating',
    description: 'mystical and serene'
  }
};

// Age-specific buddy templates
const BUDDY_TEMPLATES = {
  young: [
    {
      id: 'bunny',
      name: 'Bouncy',
      emoji: '🐰',
      baseColor: '#FFB6C1',
      personality: 'energetic'
    },
    {
      id: 'unicorn',
      name: 'Sparkles', 
      emoji: '🦄',
      baseColor: '#E6E6FA',
      personality: 'magical'
    },
    {
      id: 'dino',
      name: 'Rex',
      emoji: '🦕',
      baseColor: '#98FB98',
      personality: 'friendly'
    }
  ],
  
  elementary: [
    {
      id: 'cat',
      name: 'Whiskers',
      emoji: '🐱',
      baseColor: '#FFD93D',
      personality: 'playful'
    },
    {
      id: 'dog',
      name: 'Buddy',
      emoji: '🐶',
      baseColor: '#8B4513',
      personality: 'loyal'
    },
    {
      id: 'robot',
      name: 'Beep',
      emoji: '🤖',
      baseColor: '#C0C0C0',
      personality: 'smart'
    }
  ],
  
  tween: [
    {
      id: 'dragon',
      name: 'Blaze',
      emoji: '🐉',
      baseColor: '#FF6B6B',
      personality: 'cool'
    },
    {
      id: 'wolf',
      name: 'Shadow',
      emoji: '🐺',
      baseColor: '#4A5568',
      personality: 'focused'
    },
    {
      id: 'alien',
      name: 'Cosmic',
      emoji: '👽',
      baseColor: '#00D9FF',
      personality: 'mysterious'
    }
  ],
  
  teen: [
    {
      id: 'geometric',
      name: 'Hex',
      emoji: '⬡',
      baseColor: '#7C3AED',
      personality: 'minimal'
    },
    {
      id: 'plant',
      name: 'Zen',
      emoji: '🌱',
      baseColor: '#10B981',
      personality: 'zen'
    },
    {
      id: 'orb',
      name: 'Focus',
      emoji: '🔮',
      baseColor: '#EC4899',
      personality: 'mystical'
    }
  ]
};

// Generate complete buddy objects with personality traits
function generateBuddiesForAge(ageGroup) {
  const templates = BUDDY_TEMPLATES[ageGroup] || BUDDY_TEMPLATES.elementary;
  
  return templates.map(template => {
    const personality = BUDDY_PERSONALITIES[template.personality];
    
    return {
      ...template,
      color: template.baseColor,
      sounds: personality.sounds,
      animationStyle: personality.animationStyle,
      description: personality.description
    };
  });
}

// Export age-specific buddy configurations
export const BUDDIES_BY_AGE = Object.fromEntries(
  Object.keys(BUDDY_TEMPLATES).map(ageGroup => [
    ageGroup,
    generateBuddiesForAge(ageGroup)
  ])
);

// Fallback for old code
export const BUDDIES = BUDDIES_BY_AGE.elementary;

// Animation file references (for Lottie)
export const ANIMATIONS = {
  studying: 'studying.json',
  celebrating: 'celebrating.json',
  idle: 'idle.json',
  encouraging: 'encouraging.json',
  confetti: 'confetti.json'
};

// Utility functions for buddy system
export const getBuddyForAge = (ageGroup, buddyId) => {
  const buddies = BUDDIES_BY_AGE[ageGroup] || BUDDIES_BY_AGE.elementary;
  return buddies.find(buddy => buddy.id === buddyId) || buddies[0];
};

export const getBuddiesForAge = (ageGroup) => {
  return BUDDIES_BY_AGE[ageGroup] || BUDDIES_BY_AGE.elementary;
};
