$(function () {
    let debounce;

    const $dropdown = $("#dropdown-list");
    const $input = $("#user-search");
    const $avatar = $("#avatar");

    function buscarSugestoes(query) {
        $.ajax({
            url: `https://api.github.com/search/users?q=${query}+in:login&per_page=3`,
            method: "GET",
            dataType: "json",
            success: function (res) {
                const users = res.items.slice(0, 3);
                if (users.length === 0) {
                    $dropdown.hide();
                    return;
                }

                let html = "";
                users.forEach(user => {
                    html += `
                        <li class="user-dropdown" data-username="${user.login}">
                            <img src="${user.avatar_url}" class="w-10 h-10 rounded-full" alt="${user.login}">
                            <span class="text-[#CDD5E0]">${user.login}</span>
                        </li>
                    `;
                });

                $dropdown.html(html).show();
            },
            error: function () {
                $dropdown.hide();
            }
        });
    }

    function buscarUsuario(usernameParam) {
        const username = usernameParam || $input.val().trim();
        $("#erro").hide();
        $(".perfil").hide();
        $("#repositorios").html("");

        if (!username) {
            $("#erro").text("Digite um nome de usuário!").show();
            return;
        }

        $dropdown.hide();

        $.ajax({
            url: `https://api.github.com/users/${username}`,
            method: "GET",
            dataType: "json",
            success: function (data) {
                $(".perfil").show();
                $("#avatar").attr("src", data.avatar_url || "https://via.placeholder.com/120");
                $("#nome").text(data.name || "Sem nome público");
                $("#localizacao").text(data.location || "Não informada");
                $("#seguidores").text(data.followers);
                $("#seguindo").text(data.following);
                $("#link").attr("href", data.html_url);

                $.ajax({
                    url: `https://api.github.com/users/${username}/repos?sort=updated&per_page=4`,
                    method: "GET",
                    dataType: "json",
                    success: function (repos) {
                        let html = "";
                        if (repos.length === 0) {
                            html = "<p>Sem repositórios públicos.</p>";
                        } else {
                            repos.forEach(repo => {
                                const repoId = `repo-${repo.name.replace(/[^a-z0-9_-]/gi, '')}`;
                                html += `
                                    <div id="${repoId}" class="last-repo">
                                        <a href="${repo.html_url}" target="_blank"><strong>${repo.name}</strong></a>
                                        <p class="description">${repo.description || "Sem descrição"}</p>
                                        <div class="wrapper-info-repo">
                                            <div class="wrapper-bottom-repo">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M16.8 16.4L15 17.75C13.2222 19.0833 10.7778 19.0833 9 17.75L7.2 16.4C5.18555 14.8892 4 12.5181 4 10V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V10C20 12.5181 18.8144 14.8892 16.8 16.4Z" stroke="#97A3B6" stroke-width="2" stroke-linecap="round"/>
                                                    <circle cx="12" cy="10" r="1" fill="#97A3B6"/>
                                                    <circle cx="9" cy="10" r="1" fill="#97A3B6"/>
                                                    <circle cx="15" cy="10" r="1" fill="#97A3B6"/>
                                                </svg>
                                                <p>${repo.default_branch}</p>
                                            </div>
                                            <p class="wrapper-bottom-repo commits">Buscando total de commits...</p>
                                            <div class="wrapper-bottom-repo">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.1439 6.62753C10.9305 4.66653 11.3238 3.68604 12.0001 3.68604C12.6764 3.68604 13.0697 4.66653 13.8563 6.62753L13.893 6.71885C14.3373 7.82672 14.5595 8.38065 15.0124 8.71734C15.4652 9.05403 16.0597 9.10727 17.2486 9.21374L17.4636 9.23299C19.4094 9.40726 20.3823 9.49439 20.5905 10.1134C20.7986 10.7324 20.0761 11.3897 18.6311 12.7044L18.1488 13.1432C17.4173 13.8087 17.0515 14.1414 16.8811 14.5776C16.8493 14.6589 16.8228 14.7423 16.8019 14.8271C16.6899 15.2817 16.797 15.7645 17.0112 16.7299L17.0778 17.0305C17.4715 18.8048 17.6684 19.692 17.3247 20.0746C17.1963 20.2176 17.0293 20.3206 16.8439 20.3712C16.3477 20.5066 15.6433 19.9325 14.2343 18.7844C13.3091 18.0305 12.8465 17.6536 12.3154 17.5688C12.1065 17.5354 11.8937 17.5354 11.6847 17.5688C11.1536 17.6536 10.6911 18.0305 9.76589 18.7844C8.35694 19.9325 7.65246 20.5066 7.15626 20.3712C6.97084 20.3206 6.80393 20.2176 6.67551 20.0746C6.33183 19.692 6.52866 18.8048 6.92234 17.0305L6.98902 16.7299C7.20322 15.7645 7.31033 15.2817 7.19827 14.8271C7.17737 14.7423 7.15093 14.6589 7.11913 14.5776C6.94866 14.1414 6.58291 13.8087 5.8514 13.1432L5.36912 12.7044C3.92408 11.3897 3.20155 10.7324 3.40973 10.1134C3.61791 9.49439 4.59082 9.40726 6.53663 9.23299L6.75157 9.21374C7.94049 9.10727 8.53494 9.05403 8.98779 8.71734C9.44064 8.38065 9.66284 7.82672 10.1072 6.71885L10.1439 6.62753Z" stroke="#97A3B6" stroke-width="2"/>
                                                </svg>
                                                ${repo.stargazers_count}
                                            </div>
                                            <span>Updated ${new Date(repo.pushed_at).toLocaleDateString("pt-BR")}</span>
                                        </div>
                                    </div>
                                `;

                                $.ajax({
                                    url: `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
                                    method: "GET",
                                    complete: function (xhr) {
                                        const link = xhr.getResponseHeader("Link");
                                        let totalCommits = 1;

                                        if (link && link.includes('rel="last"')) {
                                            const match = link.match(/&page=(\d+)>; rel="last"/);
                                            if (match) totalCommits = parseInt(match[1]);
                                        }

                                        $(`#${repoId} .commits`).html(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="18" y="15" width="4" height="4" rx="2" transform="rotate(90 18 15)" stroke="#97A3B6" stroke-width="2"/>
                                        <rect x="6" y="8" width="4" height="4" rx="2" transform="rotate(-90 6 8)" stroke="#97A3B6" stroke-width="2"/>
                                        <path d="M8 8V13C8 14.8856 8 15.8284 8.58579 16.4142C9.17157 17 10.1144 17 12 17H14" stroke="#97A3B6" stroke-width="2"/>
                                        </svg> ${totalCommits}`);
                                    },
                                    error: function () {
                                        $(`#${repoId} .commits`).text(`Commits: não disponível`);
                                    }
                                });
                            });
                        }
                        $("#repositorios").html(html);
                    }
                });
            },
            error: function () {
                $("#erro").text("Usuário não encontrado.").show();
            }
        });
    }

    $input.on("input", function () {
        clearTimeout(debounce);
        const query = $(this).val().trim();

        debounce = setTimeout(() => {
            buscarSugestoes(query);
        }, 400);
    });

    $dropdown.on("click", "li", function () {
        const username = $(this).data("username");
        $input.val(username);
        $dropdown.hide();
        buscarUsuario(username);
    });

    $("#buscar").on("click", function () {
        const username = $input.val().trim();
        $dropdown.hide();
        buscarUsuario(username);
    });

    $input.on("keypress", function (e) {
        if (e.which === 13) {
            $dropdown.hide();
            buscarUsuario();
        }
    });
});