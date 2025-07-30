const urlDummy = 'https://dummyjson.com/auth/';
const urlPlaceholder = 'https://jsonplaceholder.typicode.com/';
var posts = [];

async function direcionamento() {
    if (!await validaToken()) {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

async function inicio() {
   
    await direcionamento();
  
    await carregarPosts();
    renderizarPosts(posts);
}
inicio();

setInterval(() => {
    direcionamento();
}, 5000);

async function validaToken() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    let result = false;
    if (usuario) {
        const options = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + usuario.accessToken,
            }
        };

        await fetch(urlDummy + 'me', options)
            .then(response => response.json())
            .then(response => {
                if (response.id) {
                    result = true;
                }
            })
            .catch(err => console.error(err));
    }
    return result;
}

function sair() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

async function carregarPosts() {
    const response = await fetch(urlPlaceholder + 'posts');
    const data = await response.json();
    posts = data;
}

function renderizarPosts(dados) {
    const main = document.querySelector('main');
    main.innerHTML = '';  

    dados.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <button onclick='abrirModalDetalhes(${post.id})'>Detalhes</button>
        `;
        main.appendChild(postElement);
    });
}

function buscarPosts(query) {
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(query.toLowerCase()) || post.body.toLowerCase().includes(query.toLowerCase()));
    renderizarPosts(filteredPosts);
}

function abrirModalDetalhes(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        const modal = document.getElementById('modal');
        modal.classList.remove('oculto');
        const dados = document.getElementById('post-details');
        dados.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.body}</p>
            <p>Autor: ${post.userId}</p>
        `;
    }
}