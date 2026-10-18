const joinForm = document.querySelector("#join-form");

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nickname = document.querySelector("#nickname").value.trim();
  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;
  const passwordConfirm = document.querySelector("#password-confirm").value;

  if (!nickname || !username || !password || !passwordConfirm) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  if (password !== passwordConfirm) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (password.length < 6) {
    alert("비밀번호는 6자리 이상 입력해주세요.");
    return;
  }

  const authEmail = `${username.toLowerCase()}@findtheculprit.com`;

  const { data, error } = await supabaseClient.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        username,
        nickname,
      },
    },
  });

  if (error) {
    alert(`회원가입 실패: ${error.message}`);
    console.error(error);
    return;
  }

  alert("회원가입이 완료되었습니다!");
  location.href = "./login.html";
});
