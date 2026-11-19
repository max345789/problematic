/**
 * Storytelling Landing Page Content & Models
 * Problematic - Safe-Harbor Social Platform
 */

export const HERO_WHISPERS = [
  {
    id: 'w1',
    category: 'mental',
    categoryLabel: 'Mental Health',
    text: "I feel like I'm falling behind everyone my age, but I pretend everything is effortless.",
    tag: '#SilentBurnout',
    authorRole: 'Quiet whisper',
  },
  {
    id: 'w2',
    category: 'technology',
    categoryLabel: 'Engineering',
    text: "Production dropped on a race condition I've stared at for 16 hours. I feel completely incompetent.",
    tag: '#DevParalysis',
    authorRole: 'Solo Architect',
  },
  {
    id: 'w3',
    category: 'physical',
    categoryLabel: 'Physical Body',
    text: "My wrist & neck pain is getting so intense I dread opening my laptop every morning.",
    tag: '#RSIStruggles',
    authorRole: 'Remote Designer',
  },
  {
    id: 'w4',
    category: 'mental',
    categoryLabel: 'Emotional',
    text: "Surrounded by colleagues all day, yet I haven't had a single honest conversation all week.",
    tag: '#UrbanLoneliness',
    authorRole: 'Anonymous',
  },
  {
    id: 'w5',
    category: 'technology',
    categoryLabel: 'Tech Career',
    text: "AI tooling is moving so fast I don't know if the skills I spent 7 years mastering still matter.",
    tag: '#TechAnxiety',
    authorRole: 'Engineer',
  },
  {
    id: 'w6',
    category: 'physical',
    categoryLabel: 'Health & Energy',
    text: "Brain fog and sleep debt are sabotaging my decisions, and coffee just makes the tremors worse.",
    tag: '#ChronicFatigue',
    authorRole: 'Founder',
  }
];

export const PROBLEM_CATEGORIES = [
  {
    id: 'mental',
    title: 'Mental & Emotional Well-being',
    subtitle: 'From anxiety spirals to imposter syndrome, bring what feels too heavy to post on standard feeds.',
    description: 'A stigma-free zone with anonymous whisper options, trigger labeling, and certified peer advocates who respond with empathy, not toxic positivity.',
    accentColor: '#8b5cf6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.15)',
    iconName: 'Brain',
    badge: '🛡️ Safe Sanctuary',
    exampleProblems: [
      {
        id: 'ep-m1',
        title: 'Senior engineer dreading standups due to crippling imposter syndrome',
        author: 'Anonymous Member',
        timeAgo: '18m ago',
        text: "I was recently promoted to Tech Lead. Every meeting feels like an interrogation where everyone will suddenly realize I don't belong here. How do you silence the voice?",
        tags: ['ImposterSyndrome', 'CareerAnxiety', 'Burnout'],
        verifiedHelp: 'Moderated & verified by Clinical Peer Support',
        responsesCount: 14,
        empathyCount: 89,
      },
      {
        id: 'ep-m2',
        title: 'Sunday evening paralysis: can’t disconnect from weekly dread',
        author: 'OverwhelmedDev',
        timeAgo: '1h ago',
        text: "My weekends vanish in constant rumination about Jira tickets. My chest tightens by 4 PM Sunday. What boundary rituals actually worked for you?",
        tags: ['WorkLifeBoundaries', 'Overthinking'],
        verifiedHelp: 'Community advice vetted for psychological safety',
        responsesCount: 22,
        empathyCount: 143,
      }
    ]
  },
  {
    id: 'technology',
    title: 'Technology & Engineering Hurdles',
    subtitle: 'Deep architecture blocks, baffling memory leaks, and tooling exhaustion without stackoverflow condescension.',
    description: 'Post tricky code dilemmas, cryptic race conditions, or architecture fatigue. Every response is vetted by verified engineers who remember what being stuck felt like.',
    accentColor: '#38bdf8', // Sky/Cyan
    glowColor: 'rgba(56, 189, 248, 0.15)',
    iconName: 'Code',
    badge: '⚡ Verified Tech Advice',
    exampleProblems: [
      {
        id: 'ep-t1',
        title: 'Distributed lock starvation under unpredictable high concurrency',
        author: 'SysAdmin_Echo',
        timeAgo: '32m ago',
        text: "Redis redlock clusters are experiencing intermittent lease expirations before database flushes complete. We are on the edge of rollback.",
        tags: ['DistributedSystems', 'Redis', 'Postgres'],
        verifiedHelp: 'Verified by Staff Systems Engineer',
        responsesCount: 9,
        empathyCount: 52,
      },
      {
        id: 'ep-t2',
        title: 'Rewriting our legacy mono-repo or splitting into services?',
        author: 'ScaleStruggler',
        timeAgo: '3h ago',
        text: "CI build times hit 42 minutes. Management wants microservices, engineering wants TurboRepo. Need unvarnished field wisdom on real maintenance costs.",
        tags: ['Architecture', 'DevOps', 'CI-CD'],
        verifiedHelp: 'Verified by Infrastructure Lead',
        responsesCount: 31,
        empathyCount: 110,
      }
    ]
  },
  {
    id: 'physical',
    title: 'Physical Health & Ergonomics',
    subtitle: 'Chronic strain, desk posture ailments, sleep rhythm crashes, and long-recovery challenges.',
    description: 'Desk-worker ergonomics, physical therapy routines, and fatigue management. Medical claims are strictly filtered to keep advice safe and grounded in verified best practices.',
    accentColor: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.15)',
    iconName: 'Activity',
    badge: '🌿 Vetted Wellness',
    exampleProblems: [
      {
        id: 'ep-p1',
        title: 'Severe ulnar nerve tingling after 8 hours of Figma & code daily',
        author: 'ErgoSeeker',
        timeAgo: '45m ago',
        text: "Right pinky and ring finger are going numb. Tried vertical mice, but desk height is fixed. What tendon-gliding exercises or physical setups reversed this for you?",
        tags: ['RSI', 'Ergonomics', 'UlnarNerve'],
        verifiedHelp: 'Verified by Occupational Therapist & Ergonomist',
        responsesCount: 18,
        empathyCount: 97,
      },
      {
        id: 'ep-p2',
        title: 'Rebuilding physical endurance after 6 months of sedentary illness',
        author: 'GentleSteps',
        timeAgo: '4h ago',
        text: "Even a 15-minute walk wipes me out for two days. How do you pace without triggering post-exertional crashes?",
        tags: ['Recovery', 'Pacing', 'ChronicFatigue'],
        verifiedHelp: 'Community recovery logs verified by Health Advocates',
        responsesCount: 26,
        empathyCount: 178,
      }
    ]
  },
  {
    id: 'life',
    title: 'Life, Career & Interpersonal Crossroads',
    subtitle: 'Navigating toxic managers, career shifts, family misunderstandings, and daily friction.',
    description: 'Non-judgmental perspective when you need outside clarity on difficult personal or career decisions.',
    accentColor: '#f59e0b', // Amber
    glowColor: 'rgba(245, 158, 11, 0.15)',
    iconName: 'Compass',
    badge: '🤝 Compassionate Guidance',
    exampleProblems: [
      {
        id: 'ep-l1',
        title: 'Offered safe corporate role vs unstable startup with equity',
        author: 'Crossroads2026',
        timeAgo: '2h ago',
        text: "I have a baby on the way. Corporate offers predictable 9-5 and benefits; startup offers autonomy and massive upside. Terrified of choosing out of panic.",
        tags: ['LifeDecisions', 'FamilyFirst', 'CareerRisk'],
        verifiedHelp: 'Moderated for respectful, balanced perspectives',
        responsesCount: 37,
        empathyCount: 215,
      },
      {
        id: 'ep-l2',
        title: 'Aging parents refusing assisted care while living 800 miles away',
        author: 'LongDistanceSon',
        timeAgo: '5h ago',
        text: "Dad had a minor fall last week. Both parents refuse any in-home caregiver or moving closer. Feeling overwhelmed trying to balance work, child care, and constant fear of a midnight emergency.",
        tags: ['ElderCare', 'FamilySupport', 'DistanceCaregiving'],
        verifiedHelp: 'Vetted by Elder Care Family Navigators',
        responsesCount: 42,
        empathyCount: 310,
      }
    ]
  }
];

export const MODERATION_STEPS = [
  {
    stepNumber: '01',
    title: 'Express Without Fear',
    subtitle: 'Post openly or anonymously',
    iconName: 'Feather',
    detail: 'Users can publish openly or toggle Whisper Mode (anonymous with cryptographic safety). No follower counts or vanity algorithms.',
    badge: 'Encrypted & Anonymous Mode',
    guardrail: 'Immediate client-side sanitization ensures no accidental personal data leaks.'
  },
  {
    stepNumber: '02',
    title: 'Automated Safety Guardrails',
    subtitle: 'Real-time keyword & harm filtering',
    iconName: 'ShieldAlert',
    detail: 'Autonomous guardrails scan for self-harm keywords, hate speech, doxxing, predatory solicitation, or medical misinformation.',
    badge: 'AI Shield Active',
    guardrail: 'Flags vulnerable topics directly for empathetic human review or distress helpline pins.'
  },
  {
    stepNumber: '03',
    title: 'Certified Human Moderator Review',
    subtitle: 'Trained stewards oversee every thread',
    iconName: 'UserCheck',
    detail: 'Real human moderators review flagged items, maintain tone guidelines, and guarantee zero-tolerance for trolling or cynicism.',
    badge: '100% Human Stewarded',
    guardrail: 'Every moderator is trained in non-violent communication and trauma-informed community management.'
  },
  {
    stepNumber: '04',
    title: 'Domain Verification & Badges',
    subtitle: 'Accredited advice & peer consensus',
    iconName: 'Award',
    detail: 'Critical solutions (tech architecture, mental wellness, ergonomic physical routines) carry verified contributor badges so you know what advice is vetted.',
    badge: 'Verified Solution Seal',
    guardrail: 'Clear disclaimers distinguish between verified peer experience and clinical medical advice.'
  }
];

export const COMMUNITY_STORIES = [
  {
    id: 's1',
    category: 'Mental Health',
    author: 'Elena R.',
    location: 'Berlin',
    problem: "Felt isolated for 6 months after switching to 100% remote work. Panic attacks were creeping into every morning.",
    solution: "A verified peer circle shared daily grounding habits and scheduled asynchronous check-ins. For the first time in months, I didn't feel broken.",
    verifierRole: 'Verified Community Wellness Guide',
    impactMetric: 'Saved from severe burnout spiral',
    empathyVotes: 342,
    tag: '#MentalHealth'
  },
  {
    id: 's2',
    category: 'Technology',
    author: 'Karthik N.',
    location: 'Bangalore',
    problem: "Stuck on a silent memory leak in a high-throughput WebSockets server. Stakeholders were demanding immediate answers.",
    solution: "Two senior engineers in the Problematic community reviewed the heap dump breakdown and pointed out an uncleaned listener closure within 40 minutes.",
    verifierRole: 'Staff Distributed Systems Engineer',
    impactMetric: 'Outage averted & memory stable',
    empathyVotes: 289,
    tag: '#TechSolutions'
  },
  {
    id: 's3',
    category: 'Physical Well-being',
    author: 'Marcus T.',
    location: 'Toronto',
    problem: "Cervical radiculopathy radiating down both arms made typing excruciating. Doctor suggested surgery without exploring posture mechanics.",
    solution: "An ergonomist and physical therapist in the community reviewed my desk angles, recommended nerve glides and a split keyboard setup that resolved 80% of pain in 4 weeks.",
    verifierRole: 'Certified Ergonomic Specialist',
    impactMetric: 'Avoided unnecessary surgery',
    empathyVotes: 512,
    tag: '#Ergonomics'
  }
];

export const STATS_HIGHLIGHTS = [
  {
    stat: '100%',
    label: 'Verified & Moderated',
    description: 'Every post and response is governed by active human moderation and strict safety guardrails.'
  },
  {
    stat: 'Zero',
    label: 'Vanity Metrics',
    description: 'No follower counts, no algorithmic rage-bait, no performative clout chasing.'
  },
  {
    stat: '< 15m',
    label: 'Empathetic Response',
    description: 'Average time for a distressed user to receive a verified, compassionate response.'
  },
  {
    stat: '3 Pillars',
    label: 'Mind • Machine • Body',
    description: 'Dedicated sanctuary spaces for mental health, engineering dilemmas, and physical recovery.'
  }
];
