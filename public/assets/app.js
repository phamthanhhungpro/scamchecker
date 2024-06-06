const endpointb = "http://localhost:3000/api/";
const check = (key) => {
    return fetch(`${endpointb}check?key=${key}`)
        .then(response => response.json())
        .then(data => {
            return data;
        })

};

const getAllScams = (page) => {
    return fetch(`${endpointb}getAllScams?page=${page}`)
        .then(response => response.json())
        .then(data => {
            return data;
        });
};

const fillDataTableHomepage = () => {
    getAllScams(1)
        .then(data => {
            data.forEach(scammer => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${scammer.name}</td>
                    <td>${scammer.money}</td>
                    <td>${scammer.phone}</td>
                    <td>${scammer.bankAccount}</td>
                    <td>${scammer.bankName}</td>
                    <td>${scammer.viewCount}</td>
                    <td>${scammer.time}</td>
                `;
                let td = document.createElement("td");
                td.innerHTML = `<i class="fa-sharp fa-solid fa-eye eyeShowDetail"></i>`;
                td.addEventListener("click", () => {
                    gotoDetail(scammer.link);
                });
                row.appendChild(td);
                document.getElementById("list-scammers").appendChild(row);
            });

        })
        .catch(error => {
            console.error(error);
        });

};

const fillDataTableCheckPage = (key) => {
    check(key)
        .then(data => {
            // Append a warning message
            let element = document.getElementById("alert-check");
            element.innerText = data.text;

            if (data.scams.length === 0) {
                document.getElementById("alert-check").classList.remove("alert-danger");
                document.getElementById("alert-check").classList.add("alert-success");
            }
            data.scams.forEach(scammer => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${scammer.name}</td>
                    <td>${scammer.money}</td>
                    <td>${scammer.phone}</td>
                    <td>${scammer.bankAccount}</td>
                    <td>${scammer.bankName}</td>
                    <td>${scammer.viewCount}</td>
                    <td>${scammer.time}</td>
                `;
                row.addEventListener("click", () => {
                    gotoDetail(scammer.link);
                });
                document.getElementById("list-scammers").appendChild(row);
            });

        })
        .catch(error => {
            console.error(error);
        });

};

const getDetailScammer = (id) => {
    return fetch(`${endpointb}getScamDetail?id=${id}`)
        .then(response => response.json())
        .then(data => {
            return data;
        });
};

const gotoDetail = (link) => {
    const linkParts = link.split("/");
    const extractedLink = linkParts[linkParts.length - 1].replace(".html", "");
    window.location.href = `/detail?link=${extractedLink}`;
};

const registerUser = async () => {
    const username = document.getElementById('username').value;
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${endpointb}user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, fullName, email, phone }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Đăng kí thành viên thành công!');
        window.location.href = '/account/login';
    } else {
        alert('Có lỗi xảy ra!');
    }
}

const login = async () => {
    const emailOrPhone = document.getElementById('emailOrPhone').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${endpointb}user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrPhone, password }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Đăng nhập thành công!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('emailOrPhone', data.emailOrPhone);
        localStorage.setItem('role', data.role);

        window.location.href = '/';
    } else {
        alert('Có lỗi xảy ra!');
    }
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emailOrPhone');
    localStorage.removeItem('role');
    window.location.href = '/account/login';
}

document.addEventListener('DOMContentLoaded', () => {
    const accountButton = document.getElementById('account-button');
    const token = localStorage.getItem('token');

    if (token) {
        // User is logged in
        accountButton.outerHTML = `
            <div class="dropdown d-inline-block">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Tài khoản
                </button>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <a class="dropdown-item" href="/account/profile">Thông tin tài khoản</a>
                    <a class="dropdown-item" href="/bao-hiem">Đăng ký GDV/Bảo hiểm</a>
                    <a class="dropdown-item" href="#">Trung gian</a>
                    <a class="dropdown-item" href="#" id="logout">Đăng xuất</a>
                </div>
            </div>
        `;

        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');

            window.location.reload(); // Reload the page to show the Login button
        });
    } else {
        // User is not logged in
        accountButton.innerHTML = 'Đăng nhập';
        accountButton.addEventListener('click', () => {
            window.location.href = '/account/login';
        });
    }
});

function gotoBaoHiem() {
    window.location.href = "/bao-hiem";
}

const getProfileByEmailOrPhone = () => {
    let emailOrPhone = localStorage.getItem('emailOrPhone');
    // Make an API request with the query parameter
    // and handle the response
    return fetch(`${endpointb}user/info?emailOrPhone=${emailOrPhone}`)
        .then(response => response.json())
        .then(data => { return data; })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error(error);
        });
}
