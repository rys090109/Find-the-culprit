const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;

  if (!username || !password) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  const authEmail = `${username.toLowerCase()}@findtheculprit.com`;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: authEmail,
    password: password,
  });

  if (error) {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    console.error(error);
    return;
  }

  alert("로그인되었습니다!");
  location.href = "./difficulty_level.html";
});
