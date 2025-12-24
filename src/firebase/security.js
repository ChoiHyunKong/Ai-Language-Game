import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './config.js';
import CryptoJS from 'crypto-js';

const VALIDATION_KEY = 'ai-lang-game-2024';

function generateScoreHash(score, timestamp, userId) {
  const data = `${score}-${timestamp}-${userId}`;
  return CryptoJS.HmacSHA256(data, VALIDATION_KEY).toString();
}

function createGameSession(gameData) {
  return {
    startTime: Date.now(),
    endTime: null,
    actions: [],
    score: 0,
    mode: gameData.mode || 'normal',
    difficulty: gameData.difficulty || 'medium',
    sessionId: generateSessionId(),
    validationToken: null
  };
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function recordGameAction(session, action) {
  if (!session || !session.actions) return;

  session.actions.push({
    type: action.type,
    timestamp: Date.now(),
    data: action.data,
    score: action.score || 0
  });

  if (action.score) {
    session.score += action.score;
  }

  return session;
}


function validateScore(session) {
  const gameTime = (session.endTime - session.startTime) / 1000; // 초 단위
  const maxScorePerSecond = 100; // 초당 최대 100점
  const theoreticalMaxScore = gameTime * maxScorePerSecond;

  if (session.score > theoreticalMaxScore) {
    console.warn('점수가 이론적 최대치를 초과했습니다.');
    return false;
  }

  let calculatedScore = 0;
  let lastTimestamp = session.startTime;

  for (const action of session.actions) {
    if (action.timestamp < lastTimestamp) {
      console.warn('액션 시간 순서가 올바르지 않습니다.');
      return false;
    }

    if (action.timestamp - lastTimestamp < 100 && action.type === 'answer') {
      console.warn('너무 빠른 답변이 감지되었습니다.');
      return false;
    }

    calculatedScore += action.score || 0;
    lastTimestamp = action.timestamp;
  }

  if (Math.abs(calculatedScore - session.score) > 1) {
    console.warn('점수 계산이 일치하지 않습니다.');
    return false;
  }

  return true;
}

export async function authenticateUser() {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('인증 실패:', error);
    throw new Error('사용자 인증에 실패했습니다.');
  }
}

export async function submitRanking(playerName, session) {
  try {
    session.endTime = Date.now();

    if (!validateScore(session)) {
      throw new Error('점수 검증 실패');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('인증되지 않은 사용자');
    }

    const scoreHash = generateScoreHash(session.score, session.endTime, user.uid);

    const rankingData = {
      playerName: playerName.trim().substring(0, 20),
      score: session.score,
      mode: session.mode,
      difficulty: session.difficulty,
      timestamp: serverTimestamp(),
      clientTimestamp: session.endTime,
      gameTime: Math.floor((session.endTime - session.startTime) / 1000),
      userId: user.uid,
      sessionId: session.sessionId,
      actionCount: session.actions.length,
      scoreHash: scoreHash,
      validationToken: generateValidationToken(session),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };

    const docRef = await addDoc(collection(db, 'rankings'), rankingData);

    console.log('랭킹 저장 완료:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('랭킹 제출 실패:', error);
    throw error;
  }
}

function generateValidationToken(session) {
  const data = {
    score: session.score,
    actions: session.actions.length,
    gameTime: session.endTime - session.startTime,
    sessionId: session.sessionId
  };
  return btoa(JSON.stringify(data));
}


export async function fetchRankings(mode = 'all', timeRange = 'all') {
  try {
    let q = collection(db, 'rankings');

    if (mode !== 'all') {
      q = query(q, where('mode', '==', mode));
    }

    if (timeRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(today)));
    } else if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(weekAgo)));
    }

    q = query(q, orderBy('score', 'desc'), limit(100));

    const querySnapshot = await getDocs(q);
    const rankings = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rankings.push({
        id: doc.id,
        playerName: data.playerName,
        score: data.score,
        mode: data.mode,
        difficulty: data.difficulty,
        timestamp: data.timestamp?.toDate() || new Date(data.clientTimestamp),
        gameTime: data.gameTime
      });
    });

    return rankings;

  } catch (error) {
    console.error('랭킹 조회 실패:', error);
    throw error;
  }
}


export function startGameSession(gameConfig = {}) {
  const session = createGameSession(gameConfig);
  sessionStorage.setItem('currentGameSession', JSON.stringify(session));
  return session;
}

export function getCurrentSession() {
  const sessionData = sessionStorage.getItem('currentGameSession');
  return sessionData ? JSON.parse(sessionData) : null;
}

export function updateSession(session) {
  sessionStorage.setItem('currentGameSession', JSON.stringify(session));
  return session;
}

export function endGameSession() {
  sessionStorage.removeItem('currentGameSession');
}

export default {
  authenticateUser,
  submitRanking,
  fetchRankings,
  startGameSession,
  getCurrentSession,
  updateSession,
  endGameSession,
  recordGameAction
};