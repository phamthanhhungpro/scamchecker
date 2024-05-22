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

            if(data.scams.length === 0) {
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
                document.getElementById("list-scammers").appendChild(row);
            });

        })
        .catch(error => {
            console.error(error);
        });

};
