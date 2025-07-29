// Função para deslogar (limpa localStorage e volta para login)
function logout() {
  localStorage.clear();
  window.location.href = './login.html';
}

// Verifica se token expirou (30 minutos)
function isTokenExpired() {
  const saved = localStorage.getItem('loginTime');
  return !saved || (Date.now() - parseInt(saved)) > 30 * 60 * 1000;
}

// Tenta renovar o token com refresh token
async function refreshTokenIfNeeded() {
  if (!isTokenExpired()) return;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    logout();
    return;
  }

  try {
    const res = await fetch('https://dummyjson.com/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
      // credentials: 'include' // REMOVIDO por CORS
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('loginTime', Date.now());
    } else {
      logout();
    }
  } catch {
    logout();
  }
}

// Carrega dados do usuário autenticado e exibe nome + avatar
async function loadUserData() {
  const token = localStorage.getItem('token');
  if (!token) {
    logout();
    return;
  }

  try {
    const res = await fetch('https://dummyjson.com/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
      // credentials: 'include' // REMOVIDO por CORS
    });
    const user = await res.json();
    if (user.message) {
      logout();
      return;
    }
    document.getElementById('user-name').innerText = `Olá, ${user.firstName}`;
    document.getElementById('avatar').src = user.image || 'https://via.placeholder.com/40';
  } catch {
    logout();
  }
}

// Carrega todos os posts do JSONPlaceholder e renderiza
async function loadPosts() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await res.json();
    renderPosts(posts);
  } catch (e) {
    document.getElementById('posts-container').innerText = 'Erro ao carregar posts.';
  }
}

// Renderiza cards com título e resumo do post
function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body.slice(0, 80)}...</p>
    `;
    card.onclick = () => openModal(post);
    container.appendChild(card);
  });
}

// Abre modal com detalhes do post
function openModal(post) {
  document.getElementById('modal-title').innerText = post.title;
  document.getElementById('modal-body').innerText = post.body;
  document.getElementById('modal').style.display = 'block';
}

// Fecha modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Busca em tempo real pelo título dos posts
document.getElementById('search').addEventListener('input', async (e) => {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await res.json();
    const filtered = posts.filter(p => p.title.toLowerCase().includes(e.target.value.toLowerCase()));
    renderPosts(filtered);
  } catch {
    document.getElementById('posts-container').innerText = 'Erro na busca.';
  }
});

// Função inicial executada ao carregar a página
(async function init() {
  if (!localStorage.getItem('token')) {
    logout();
    return;
  }
  await refreshTokenIfNeeded();
  await loadUserData();
  await loadPosts();
})();
