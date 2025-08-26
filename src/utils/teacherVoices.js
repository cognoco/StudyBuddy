// Teacher Voice Profiles for Different Subjects
export const TEACHER_VOICES = {
  math: {
    name: "Professor Numbers",
    voice: {
      pitch: 0.8,        // Deeper voice
      rate: 0.9,         // Slower, more deliberate
      language: 'en-US',
      personality: 'precise'
    },
    quirks: {
      favoritePhrase: "Let's calculate this step by step!",
      thinkingSound: "Hmm...",
      excitementLevel: "measured",
      teachingStyle: "methodical"
    },
    phrases: {
      encouragement: [
        "Excellent calculation!",
        "You're thinking like a mathematician!",
        "That's the right approach!",
        "Keep up the logical thinking!"
      ],
      celebration: [
        "Outstanding mathematical work!",
        "You've solved it perfectly!",
        "Brilliant problem-solving!",
        "Your math skills are growing!"
      ]
    }
  },
  
  science: {
    name: "Dr. Discovery",
    voice: {
      pitch: 1.1,        // Higher, excited voice
      rate: 1.1,         // Faster, enthusiastic
      language: 'en-US',
      personality: 'curious'
    },
    quirks: {
      favoritePhrase: "Fascinating!",
      thinkingSound: "Interesting...",
      excitementLevel: "high",
      teachingStyle: "experimental"
    },
    phrases: {
      encouragement: [
        "What an amazing discovery!",
        "You're thinking like a scientist!",
        "Keep exploring and asking questions!",
        "Your curiosity is wonderful!"
      ],
      celebration: [
        "Fantastic scientific thinking!",
        "You've made a great observation!",
        "Your research skills are excellent!",
        "You're becoming a great scientist!"
      ]
    }
  },
  
  english: {
    name: "Ms. Literature",
    voice: {
      pitch: 1.0,        // Standard pitch
      rate: 0.95,        // Slightly slower, clear
      language: 'en-GB', // British accent
      personality: 'expressive'
    },
    quirks: {
      favoritePhrase: "How splendid!",
      thinkingSound: "Let me see...",
      excitementLevel: "elegant",
      teachingStyle: "storytelling"
    },
    phrases: {
      encouragement: [
        "Your writing is beautiful!",
        "You have such a way with words!",
        "Keep expressing yourself!",
        "Your creativity is inspiring!"
      ],
      celebration: [
        "Magnificent literary work!",
        "Your storytelling is wonderful!",
        "You've crafted something special!",
        "Your words have power!"
      ]
    }
  },
  
  art: {
    name: "Ms. Creative",
    voice: {
      pitch: 1.2,        // Higher, artistic voice
      rate: 1.0,         // Normal rate
      language: 'en-US',
      personality: 'artistic'
    },
    quirks: {
      favoritePhrase: "That's beautiful!",
      thinkingSound: "Oh my...",
      excitementLevel: "passionate",
      teachingStyle: "inspirational"
    },
    phrases: {
      encouragement: [
        "Your creativity is flowing!",
        "You're making something beautiful!",
        "Trust your artistic instincts!",
        "Your imagination is wonderful!"
      ],
      celebration: [
        "What a masterpiece you've created!",
        "Your artistic vision is amazing!",
        "You've made something unique!",
        "Your creativity knows no bounds!"
      ]
    }
  },
  
  history: {
    name: "Professor Time",
    voice: {
      pitch: 0.9,        // Slightly deeper, wise
      rate: 0.85,        // Slower, storytelling
      language: 'en-US',
      personality: 'storyteller'
    },
    quirks: {
      favoritePhrase: "Back in my day...",
      thinkingSound: "Ah yes...",
      excitementLevel: "contemplative",
      teachingStyle: "narrative"
    },
    phrases: {
      encouragement: [
        "You're connecting with the past!",
        "History is coming alive for you!",
        "You're learning from those who came before!",
        "Your understanding is growing!"
      ],
      celebration: [
        "You've uncovered something important!",
        "Your historical knowledge is impressive!",
        "You're preserving our stories!",
        "You've learned from history!"
      ]
    }
  },
  
  music: {
    name: "Maestro Melody",
    voice: {
      pitch: 1.0,        // Musical voice
      rate: 1.05,        // Slightly faster, rhythmic
      language: 'en-US',
      personality: 'musical'
    },
    quirks: {
      favoritePhrase: "Listen to that rhythm!",
      thinkingSound: "La la la...",
      excitementLevel: "rhythmic",
      teachingStyle: "harmonious"
    },
    phrases: {
      encouragement: [
        "You're finding your rhythm!",
        "Your musical ear is developing!",
        "Keep making beautiful sounds!",
        "You're creating harmony!"
      ],
      celebration: [
        "What beautiful music you've made!",
        "Your musical talent is shining!",
        "You've created something harmonious!",
        "Your rhythm is perfect!"
      ]
    }
  },
  
  // Default teacher for other subjects
  default: {
    name: "Study Buddy",
    voice: {
      pitch: 1.0,
      rate: 1.0,
      language: 'en-US',
      personality: 'friendly'
    },
    quirks: {
      favoritePhrase: "You've got this!",
      thinkingSound: "Hmm...",
      excitementLevel: "encouraging",
      teachingStyle: "supportive"
    },
    phrases: {
      encouragement: [
        "You're doing great!",
        "Keep up the excellent work!",
        "You're making progress!",
        "You've got this!"
      ],
      celebration: [
        "Amazing job!",
        "You've accomplished so much!",
        "You're incredible!",
        "Fantastic work!"
      ]
    }
  }
};

// Get teacher voice for a subject
export const getTeacherVoice = (subjectId) => {
  return TEACHER_VOICES[subjectId] || TEACHER_VOICES.default;
};

// Get a random encouragement phrase for a subject
export const getEncouragementPhrase = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  const phrases = teacher.phrases.encouragement;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// Get a random celebration phrase for a subject
export const getCelebrationPhrase = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  const phrases = teacher.phrases.celebration;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// Get teacher's favorite phrase
export const getTeacherFavoritePhrase = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  return teacher.quirks.favoritePhrase;
};

// Get teacher's thinking sound
export const getTeacherThinkingSound = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  return teacher.quirks.thinkingSound;
};

// Get teacher's excitement level
export const getTeacherExcitement = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  return teacher.quirks.excitementLevel;
};

// Get teacher's teaching style
export const getTeacherStyle = (subjectId) => {
  const teacher = getTeacherVoice(subjectId);
  return teacher.quirks.teachingStyle;
};

// Get a personalized message from the teacher
export const getPersonalizedMessage = (subjectId, messageType = 'encouragement') => {
  const teacher = getTeacherVoice(subjectId);
  const phrases = teacher.phrases[messageType] || teacher.phrases.encouragement;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  // Add teacher's personality touch
  const thinkingSound = teacher.quirks.thinkingSound;
  const favoritePhrase = teacher.quirks.favoritePhrase;
  
  // Sometimes add thinking sound or favorite phrase
  const shouldAddQuirk = Math.random() < 0.3; // 30% chance
  
  if (shouldAddQuirk) {
    if (Math.random() < 0.5) {
      return `${thinkingSound} ${randomPhrase}`;
    } else {
      return `${randomPhrase} ${favoritePhrase}`;
    }
  }
  
  return randomPhrase;
};
