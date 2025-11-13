import { useState, useEffect } from "react";
import "./App.css";
import { authAPI, uploadAPI, distributionAPI } from "./api";

function App() {
  const [mode, setMode] = useState("guest");
  const [page, setPage] = useState("home");
  const [selectedDay, setSelectedDay] = useState("");
  const [dishes, setDishes] = useState([
    { name: "", count: "" },
    { name: "", count: "" },
    { name: "", count: "" },
    { name: "", count: "" },
  ]);
  const [userName, setUserName] = useState("");
  const [uploadResults, setUploadResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ userId: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ userId: "", name: "", password: "", role: "USER" });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authAPI.me();
          setUser(userData);
          if (userData.role === "ADMIN") {
            setMode("admin");
          }
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
    };
    checkAuth();
  }, []);

  if (page === "upload") {
    const handleFileUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setLoading(true);
      setError("");
      try {
        const results = await uploadAPI.upload(files);
        setUploadResults(results);
        alert(`${files.length}장의 사진이 성공적으로 분석되었습니다!`);
        console.log("분석 결과:", results);
      } catch (err) {
        setError(err.message);
        alert("업로드 실패: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <header className="header" onClick={() => setPage("manage")}>
          잔반이들: {selectedDay}요일
        </header>

        <main className="main-upload-container">
          <h2>{selectedDay}요일 사진 업로드</h2>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={loading}
          />
          <p>여러 장의 사진을 선택할 수 있습니다.</p>
          {loading && <p>업로드 중...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {uploadResults.length > 0 && (
            <div>
              <h3>분석 결과:</h3>
              {uploadResults.map((result, idx) => (
                <div key={idx}>
                  <p><strong>식판 {result.plate_id}</strong></p>
                  <ul>
                    {Object.entries(result.result).map(([food, ratio]) => (
                      <li key={food}>{food}: {(ratio * 100).toFixed(1)}% 남음</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button className="back-btn" onClick={() => setPage("manage")}>
            뒤로가기
          </button>
        </main>

        <footer className="footer">
          <button
            className={mode === "guest" ? "active" : ""}
            onClick={() => {
              setMode("guest");
              setPage("home");
            }}
          >
            손님용
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => {
              setMode("admin");
              setPage("home");
            }}
          >
            관리자용
          </button>
        </footer>
      </div>
    );
  }

  if (page === "manage") {
    return (
      <div>
        <header
          className="header"
          onClick={() => {
            setPage("home");
            setMode("guest");
          }}
        >
          잔반이들
        </header>

        <main className="main">
          <div className="week-container">
            <div className="week-bar">
              {["월", "화", "수", "목", "금"].map((day) => (
                <div
                  key={day}
                  className="day-box"
                  onClick={() => {
                    setSelectedDay(day);
                    setPage("upload");
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            <button className="analyze-btn">파악하기</button>
            
          </div>
        </main>

        <footer className="footer">
          <button
            className={mode === "guest" ? "active" : ""}
            onClick={() => {
              setMode("guest");
              setPage("home");
            }}
          >
            손님용
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => {
              setMode("admin");
              setPage("home");
            }}
          >
            관리자용
          </button>
        </footer>
      </div>
    );
  }

  if (page === "distribute") {
    const handleDishChange = (index, field, value) => {
      const newDishes = [...dishes];
      newDishes[index][field] = value;
      setDishes(newDishes);
    };

    const handleSubmit = async () => {
      setLoading(true);
      setError("");
      try {
        for (const dish of dishes) {
          if (dish.name && dish.count) {
            await distributionAPI.start(dish.name, parseInt(dish.count));
          }
        }
        alert("반찬 배포가 시작되었습니다!");
        console.log("배포할 반찬:", dishes);
        setPage("home");
      } catch (err) {
        setError(err.message);
        alert("배포 시작 실패: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <header className="header" onClick={() => setPage("manage")}>
          잔반 배포
        </header>

        <main className="main-upload-container">
          <h2>반찬 정보 입력 (총 4개)</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {dishes.map((dish, idx) => (
            <div key={idx} style={{ marginBottom: "15px", width: "100%" }}>
              <input
                type="text"
                placeholder={`반찬 ${idx + 1} 이름`}
                value={dish.name}
                onChange={(e) =>
                  handleDishChange(idx, "name", e.target.value)
                }
                style={{ marginBottom: "8px" }}
                disabled={loading}
              />
              <input
                type="number"
                placeholder={`반찬 ${idx + 1} 개수`}
                value={dish.count}
                onChange={(e) =>
                  handleDishChange(idx, "count", e.target.value)
                }
                disabled={loading}
              />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "배포 중..." : "저장"}
          </button>
          <button
            className="back-btn"
            onClick={() => setPage("home")}
            style={{ marginTop: "10px" }}
          >
            뒤로가기
          </button>
        </main>

        <footer className="footer">
          <button
            className={mode === "guest" ? "active" : ""}
            onClick={() => {
              setMode("guest");
              setPage("home");
            }}
          >
            손님용
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => {
              setMode("admin");
              setPage("home");
            }}
          >
            관리자용
          </button>
        </footer>
      </div>
    );
  }

  if (page === "login") {
    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const data = await authAPI.login(loginForm.userId, loginForm.password);
        const userData = await authAPI.me();
        setUser(userData);
        if (userData.role === "ADMIN") {
          setMode("admin");
        }
        alert(`${userData.name}님, 환영합니다!`);
        setPage("home");
        setLoginForm({ userId: "", password: "" });
      } catch (err) {
        setError(err.message || "로그인 실패");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <header className="header" onClick={() => setPage("home")}>
          로그인
        </header>

        <main className="main">
          <div className="login-box">
            <h2>로그인</h2>
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="사용자 ID"
                value={loginForm.userId}
                onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              계정이 없으신가요?{" "}
              <span
                onClick={() => setPage("register")}
                style={{ color: "#1976d2", cursor: "pointer", fontWeight: "600" }}
              >
                회원가입
              </span>
            </p>
          </div>
        </main>

        <footer className="footer">
          <button
            className={mode === "guest" ? "active" : ""}
            onClick={() => {
              setMode("guest");
              setPage("home");
            }}
          >
            손님용
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => {
              setMode("admin");
              setPage("home");
            }}
          >
            관리자용
          </button>
        </footer>
      </div>
    );
  }

  if (page === "register") {
    const handleRegister = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        await authAPI.register(
          registerForm.userId,
          registerForm.name,
          registerForm.password,
          registerForm.role
        );
        alert("회원가입 성공! 로그인해주세요.");
        setPage("login");
        setRegisterForm({ userId: "", name: "", password: "", role: "USER" });
      } catch (err) {
        setError(err.message || "회원가입 실패");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <header className="header" onClick={() => setPage("home")}>
          회원가입
        </header>

        <main className="main">
          <div className="login-box">
            <h2>회원가입</h2>
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <form onSubmit={handleRegister} style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="사용자 ID"
                value={registerForm.userId}
                onChange={(e) => setRegisterForm({ ...registerForm, userId: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="이름"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
              <select
                value={registerForm.role}
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", marginBottom: "20px" }}
              >
                <option value="USER">일반 사용자</option>
                <option value="ADMIN">관리자</option>
              </select>
              <button type="submit" disabled={loading}>
                {loading ? "가입 중..." : "회원가입"}
              </button>
            </form>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              이미 계정이 있으신가요?{" "}
              <span
                onClick={() => setPage("login")}
                style={{ color: "#1976d2", cursor: "pointer", fontWeight: "600" }}
              >
                로그인
              </span>
            </p>
          </div>
        </main>

        <footer className="footer">
          <button
            className={mode === "guest" ? "active" : ""}
            onClick={() => {
              setMode("guest");
              setPage("home");
            }}
          >
            손님용
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => {
              setMode("admin");
              setPage("home");
            }}
          >
            관리자용
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div>
      <header className="header" onClick={() => setPage("home")}>
        잔반이들 {user && `(${user.name}님)`}
      </header>

      <main className="main">
        {mode === "guest" ? (
          <div className="login-box">
            <h2>손님 모드</h2>
            {user && user.role === "USER" ? (
              <>
                <p style={{ marginBottom: "15px" }}>로그인됨: {user.name} ({user.userId})</p>
                <button onClick={() => {
                  authAPI.logout();
                  setUser(null);
                  alert("로그아웃되었습니다.");
                }}>로그아웃</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: "14px", marginBottom: "15px" }}>로그인이 필요합니다</p>
                <button onClick={() => setPage("login")}>로그인</button>
                <button onClick={() => setPage("register")} style={{ marginTop: "10px", background: "#43a047" }}>회원가입</button>
              </>
            )}
          </div>
        ) : (
          <div className="admin-box">
            {user && user.role === "ADMIN" ? (
              <>
                <p style={{ marginBottom: "15px", fontSize: "14px" }}>관리자: {user.name}</p>
                <button onClick={() => setPage("manage")}>잔반 관리 시작</button>
                <button onClick={() => setPage("distribute")}>잔반 배포 시작</button>
                <button onClick={() => {
                  authAPI.logout();
                  setUser(null);
                  setMode("guest");
                  alert("로그아웃되었습니다.");
                }} style={{ background: "#d32f2f" }}>로그아웃</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: "14px", marginBottom: "15px" }}>관리자 로그인이 필요합니다</p>
                <button onClick={() => setPage("login")}>로그인</button>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <button
          className={mode === "guest" ? "active" : ""}
          onClick={() => setMode("guest")}
        >
          손님용
        </button>
        <button
          className={mode === "admin" ? "active" : ""}
          onClick={() => setMode("admin")}
        >
          관리자용
        </button>
      </footer>
    </div>
  );
}

export default App;
