// API 기본 URL (Vite 프록시를 통해 /api는 백엔드로, /upload와 /distribution도 백엔드로)
const API_BASE = "";

// 로컬 스토리지에서 JWT 토큰 가져오기
const getToken = () => localStorage.getItem("token");

// API 호출 헬퍼 함수
const fetchAPI = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// 인증 API
export const authAPI = {
  register: (userId, name, password, role = "USER") =>
    fetchAPI("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ userId, name, password, role }),
    }),

  login: async (userId, password) => {
    const data = await fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ userId, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  // 간단한 게스트 로그인 (이름만으로)
  guestLogin: (name) => {
    // 게스트는 토큰 없이 이름만 저장
    localStorage.setItem("guestName", name);
    return { name, role: "GUEST" };
  },

  // 현재 사용자 정보
  me: () => fetchAPI("/api/auth/me"),

  // 로그아웃
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guestName");
  },
};

// 음식 관리 API
export const foodAPI = {
  // 음식 목록 조회
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/foods${query ? `?${query}` : ""}`);
  },

  // 음식 상세 조회
  get: (id) => fetchAPI(`/api/foods/${id}`),

  // 음식 등록 (관리자)
  create: (menu, quantity, date, note) =>
    fetchAPI("/api/foods", {
      method: "POST",
      body: JSON.stringify({ menu, quantity, date, note }),
    }),

  // 음식 삭제 (관리자)
  delete: (id) =>
    fetchAPI(`/api/foods/${id}`, {
      method: "DELETE",
    }),

  // 수령 요청
  request: (foodId, userId, pickupTime) =>
    fetchAPI(`/api/foods/${foodId}/requests`, {
      method: "POST",
      body: JSON.stringify({ userId, pickupTime }),
    }),

  // 수령 희망자 목록 (관리자)
  listRequests: (foodId) => fetchAPI(`/api/foods/${foodId}/requests`),

  // 수령 완료 표시 (관리자)
  complete: (foodId, userId) =>
    fetchAPI(`/api/foods/${foodId}/requests/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    }),
};

// 배포 API
export const distributionAPI = {
  // 배포 시작
  start: (menuName, capacity) =>
    fetchAPI("/distribution/start", {
      method: "POST",
      body: JSON.stringify({ menuName, capacity }),
    }),

  // 반찬 수령
  claim: (sessionId, userName) =>
    fetchAPI("/distribution/claim", {
      method: "POST",
      body: JSON.stringify({ sessionId, userName }),
    }),
};

// 업로드 API
export const uploadAPI = {
  // 사진 업로드 및 분석
  upload: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },
};
