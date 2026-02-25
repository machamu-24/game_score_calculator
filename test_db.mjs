import { db } from './server/db.ts';

async function testDatabase() {
  console.log('=== Database Test ===');
  
  // テスト用のユーザーID
  const testUserId = 'test-user-123';
  
  // 1. プレイヤーを作成
  console.log('\n1. Creating players...');
  const players = [
    { id: 'player-1', name: 'プレイヤー 1' },
    { id: 'player-2', name: 'プレイヤー 2' },
    { id: 'player-3', name: 'プレイヤー 3' },
    { id: 'player-4', name: 'プレイヤー 4' },
  ];
  
  for (const player of players) {
    await db.createOrUpdatePlayer(player.id, player.name, testUserId);
  }
  console.log('Players created');
  
  // 2. セッションを作成
  console.log('\n2. Creating session...');
  const sessionId = 'test-session-' + Date.now();
  await db.createSession({
    id: sessionId,
    userId: testUserId,
    startedAt: Date.now(),
    rankPoints: [30, 10, -10, -30],
    players,
  });
  console.log('Session created:', sessionId);
  
  // 3. ゲーム結果を作成
  console.log('\n3. Creating game result...');
  const gameId = 'test-game-' + Date.now();
  await db.createGameResult({
    id: gameId,
    sessionId,
    timestamp: Date.now(),
    ranks: {
      'player-1': 1,
      'player-2': 2,
      'player-3': 3,
      'player-4': 4,
    },
    adjustments: {},
    finalPoints: {
      'player-1': 30,
      'player-2': 10,
      'player-3': -10,
      'player-4': -30,
    },
  });
  console.log('Game result created:', gameId);
  
  // 4. セッションを取得
  console.log('\n4. Fetching session...');
  const session = await db.getActiveSession(testUserId);
  console.log('Active session:', JSON.stringify(session, null, 2));
  
  // 5. セッションを終了
  console.log('\n5. Ending session...');
  await db.endSession(sessionId, testUserId, Date.now(), {
    'player-1': 30,
    'player-2': 10,
    'player-3': -10,
    'player-4': -30,
  });
  console.log('Session ended');
  
  // 6. 履歴を取得
  console.log('\n6. Fetching history...');
  const history = await db.getSessionHistories(testUserId);
  console.log('History:', JSON.stringify(history, null, 2));
  
  console.log('\n=== Test Complete ===');
}

testDatabase().catch(console.error);
