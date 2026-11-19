import assert from 'node:assert';

async function testLandingData() {
  console.log('Testing landingData.js exports and schema...');
  
  let data;
  try {
    data = await import('./src/components/landing/landingData.js');
  } catch (err) {
    console.error('Failed to import landingData.js:', err.message);
    process.exit(1);
  }

  const { HERO_WHISPERS, PROBLEM_CATEGORIES, MODERATION_STEPS, COMMUNITY_STORIES, STATS_HIGHLIGHTS } = data;

  // 1. Check HERO_WHISPERS
  assert(Array.isArray(HERO_WHISPERS), 'HERO_WHISPERS must be an array');
  assert(HERO_WHISPERS.length >= 4, 'HERO_WHISPERS should have at least 4 items');
  HERO_WHISPERS.forEach((item, idx) => {
    assert(typeof item.text === 'string' && item.text.length > 0, `Whisper ${idx} text missing`);
    assert(typeof item.category === 'string', `Whisper ${idx} category missing`);
  });

  // 2. Check PROBLEM_CATEGORIES (must include mental, technology, physical)
  assert(Array.isArray(PROBLEM_CATEGORIES), 'PROBLEM_CATEGORIES must be an array');
  const catIds = PROBLEM_CATEGORIES.map(c => c.id);
  assert(catIds.includes('mental'), 'Must have mental category');
  assert(catIds.includes('technology'), 'Must have technology category');
  assert(catIds.includes('physical'), 'Must have physical category');

  PROBLEM_CATEGORIES.forEach(cat => {
    assert(typeof cat.title === 'string', `Category ${cat.id} title missing`);
    assert(typeof cat.description === 'string', `Category ${cat.id} description missing`);
    assert(Array.isArray(cat.exampleProblems), `Category ${cat.id} exampleProblems must be an array`);
    assert(cat.exampleProblems.length >= 2, `Category ${cat.id} needs at least 2 example problems`);
  });

  // 3. Check MODERATION_STEPS
  assert(Array.isArray(MODERATION_STEPS), 'MODERATION_STEPS must be an array');
  assert(MODERATION_STEPS.length >= 4, 'MODERATION_STEPS must have at least 4 steps');
  MODERATION_STEPS.forEach(step => {
    assert(typeof step.title === 'string', 'Step title missing');
    assert(typeof step.detail === 'string', 'Step detail missing');
    assert(typeof step.badge === 'string', 'Step badge missing');
  });

  // 4. Check COMMUNITY_STORIES
  assert(Array.isArray(COMMUNITY_STORIES), 'COMMUNITY_STORIES must be an array');
  assert(COMMUNITY_STORIES.length >= 3, 'COMMUNITY_STORIES must have at least 3 stories');
  COMMUNITY_STORIES.forEach(story => {
    assert(typeof story.problem === 'string', 'Story problem missing');
    assert(typeof story.solution === 'string', 'Story solution missing');
    assert(typeof story.verifierRole === 'string', 'Story verifierRole missing');
  });

  // 5. Check STATS_HIGHLIGHTS
  assert(Array.isArray(STATS_HIGHLIGHTS), 'STATS_HIGHLIGHTS must be an array');
  assert(STATS_HIGHLIGHTS.length >= 3, 'STATS_HIGHLIGHTS must have at least 3 items');

  console.log('✅ ALL LANDING DATA TESTS PASSED!');
}

testLandingData().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
