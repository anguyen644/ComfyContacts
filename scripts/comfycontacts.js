// For privacy reasons this has been taken out.
const baseURL = ""
const extension = ".php";

const contactPerPage = 5;

var userId = -1;
var editID = -1;

function callLogin() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username == "") {
        document.getElementById("msg").innerHTML = "Please enter a username.";
        return;
    }
    if (password == "") {
        document.getElementById("msg").innerHTML = "Please enter a password.";
        return;
    }

    let jsonPayload = JSON.stringify({ username: username, password: password });
    let loginURL = baseURL + 'backend/login' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", loginURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userID = jsonObject.result.id;
                if (userID < 1) {
                    document.getElementById("msg").innerHTML = "Username or Password is incorrect.";
                    return;
                }
                makeCookie("userID", userID.toString());
                window.location.href = "contactlist.html";
            }
            else {
                let jsonObject = JSON.parse(xhr.responseText);
                document.getElementById("msg").innerHTML = this.statusText + ": " + jsonObject.error;
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("msg").innerHTML = err.message;
    }
}

function callSignup() {
    let firstname = document.getElementById("firstname").value;
    let lastname = document.getElementById("lastname").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (firstname == "") {
        document.getElementById("msg").innerHTML = "Please enter a first name.";
        return;
    }
    if (lastname == "") {
        document.getElementById("msg").innerHTML = "Please enter a last name.";
        return;
    }
    if (username == "") {
        document.getElementById("msg").innerHTML = "Please enter a username.";
        return;
    }
    if (password == "") {
        document.getElementById("msg").innerHTML = "Please enter a password.";
        return;
    }

    let jsonPayload = JSON.stringify({ firstname: firstname, lastname: lastname, username: username, password: password });
    let signupURL = baseURL + 'backend/signup' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", signupURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            if (this.status == 200) {
                document.getElementById("msg").innerHTML = "User has been created. Jumping to login page in 3s.";
                setTimeout(function () { document.getElementById("msg").innerHTML = "User has been created. Jumping to login page in 2s.." }, 1000);
                setTimeout(function () { document.getElementById("msg").innerHTML = "User has been created. Jumping to login page in 1s..." }, 2000);
                setTimeout(function () { document.getElementById("msg").innerHTML = "User has been created. Jumping to login page now" }, 3000);
                setTimeout(function () { window.location.href = "loginpage.html" }, 3000);
            }
            else {
                let jsonObject = JSON.parse(xhr.responseText);
                if (this.status == 400 && jsonObject.error.includes("Duplicate entry")) {
                    document.getElementById("msg").innerHTML = "User already exists";
                    return;
                }
                document.getElementById("msg").innerHTML = this.statusText + ": " + jsonObject.error;
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("msg").innerHTML = err.message;
    }
}

function readContactCount() {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }

    let jsonPayload = JSON.stringify({ userID: userID });
    let readCountURL = baseURL + 'backend/read-count' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", readCountURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            let jsonObject = JSON.parse(xhr.responseText);
            if (this.status == 200) {
                pageCount = jsonObject.result.count / contactPerPage;
                let table = document.getElementById("pagelist").getElementsByTagName('tbody')[0];
                let newTable = document.createElement('tbody');
                let row = newTable.insertRow(0);
                for (let i = 0; i < pageCount; i++) {
                    let cell = row.insertCell(row.cells.length);
                    let button = document.createElement("button");
                    button.innerText = i + 1;
                    button.onclick = function () {
                        readContact(i);
                    }
                    cell.appendChild(button);
                }
                table.parentNode.replaceChild(newTable, table);
                readContact(0);
            }
            else {
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function readContact(page) {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }

    let jsonPayload = JSON.stringify({ userID: userID, page: page, countsPerPage: contactPerPage });
    let readURL = baseURL + 'backend/read' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", readURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            let jsonObject = JSON.parse(xhr.responseText);
            if (this.status == 200) {
                contactList = jsonObject.result;
                table = document.getElementById('contactlist').getElementsByTagName('tbody')[0];
                let readTable = document.createElement('tbody');
                populateContacts(readTable, userID, contactList);
                table.parentNode.replaceChild(readTable, table);
                setPageButtonDisabled(page);
            }
            else {
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function deleteContact(userID, id) {
    let jsonPayload = JSON.stringify({ userID: userID, id: id });
    let deleteURL = baseURL + 'backend/delete' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", deleteURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            if (this.status == 200) {
                document.location.reload(true);
            }
            else {
                let jsonObject = JSON.parse(xhr.responseText);
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function editContact() {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }

    let firstname = document.getElementById("editfirstname").value;
    let lastname = document.getElementById("editlastname").value;
    let email = document.getElementById("editemail").value;
    let phonenumber = document.getElementById("editphone").value;
    let id = editID;

    if (firstname == "") {
        document.getElementById("editcontactmsg").innerHTML = "Please enter a first name.";
        return;
    }
    if (lastname == "") {
        document.getElementById("editcontactmsg").innerHTML = "Please enter a last name.";
        return;
    }
    if (email == "") {
        document.getElementById("editcontactmsg").innerHTML = "Please enter an email.";
        return;
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email) == false)
    {
        document.getElementById("editcontactmsg").innerHTML = "Please enter in a valid email.";
        return;
    }
    if (phonenumber == "") {
        document.getElementById("editcontactmsg").innerHTML = "Please enter a password.";
        return;
    }

    let jsonPayload = JSON.stringify({ userID: userID, id: id, firstName: firstname, lastName: lastname, email: email, phoneNumber: phonenumber });
    let updateURL = baseURL + 'backend/update' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", updateURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            if (this.status == 200) {
                document.location.reload(true);
            }
            else {
                let jsonObject = JSON.parse(xhr.responseText);
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function addContact() {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }

    let firstname = document.getElementById("addfirstname").value;
    let lastname = document.getElementById("addlastname").value;
    let email = document.getElementById("addemail").value;
    let phonenumber = document.getElementById("addphone").value;

    if (firstname == "") {
        document.getElementById("addcontactmsg").innerHTML = "Please enter a first name.";
        return;
    }
    if (lastname == "") {
        document.getElementById("addcontactmsg").innerHTML = "Please enter a last name.";
        return;
    }
    if (email == "") {
        document.getElementById("addcontactmsg").innerHTML = "Please enter an email.";
        return;
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email) == false)
    {
        document.getElementById("addcontactmsg").innerHTML = "Please enter in a valid email.";
        return;
    }
    if (phonenumber == "") {
        document.getElementById("addcontactmsg").innerHTML = "Please enter a password.";
        return;
    }

    let jsonPayload = JSON.stringify({ userID: userID, firstName: firstname, lastName: lastname, email: email, phoneNumber: phonenumber });
    let createURL = baseURL + 'backend/create' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", createURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            if (this.status == 200) {
                document.location.reload(true);
            }
            else {
                let jsonObject = JSON.parse(xhr.responseText);
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }

}

function searchContactCount() {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }
    let keyword = document.getElementById("search").value;

    let jsonPayload = JSON.stringify({ userID: userID, keyword: keyword });
    let searchCountURL = baseURL + 'backend/search-count' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", searchCountURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            let jsonObject = JSON.parse(xhr.responseText);
            if (this.status == 200) {
                pageCount = jsonObject.result.count / contactPerPage;
                let table = document.getElementById("pagelist").getElementsByTagName('tbody')[0];
                let newTable = document.createElement('tbody');
                let row = newTable.insertRow(0);
                for (let i = 0; i < pageCount; i++) {
                    let cell = row.insertCell(row.cells.length);
                    let button = document.createElement("button");
                    button.innerText = i + 1;
                    button.onclick = function () {
                        searchContact(i);
                    }
                    cell.appendChild(button);
                }
                table.parentNode.replaceChild(newTable, table);
                searchContact(0);
            }
            else {
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function searchContact(page) {
    let userID = fetchCookie("userID");
    if (userID == null) {
        console.log("You are not logged in. Please login.");
        window.location.replace(baseURL);
    }
    let keyword = document.getElementById("search").value;

    let jsonPayload = JSON.stringify({ userID: userID, keyword: keyword, page: page, countsPerPage: contactPerPage });
    let searchURL = baseURL + 'backend/search' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", searchURL, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) {
                return;
            }
            let jsonObject = JSON.parse(xhr.responseText);
            if (this.status == 200) {
                contactList = jsonObject.result;
                table = document.getElementById('contactlist').getElementsByTagName('tbody')[0];
                let searchTable = document.createElement('tbody');
                populateContacts(searchTable, userID, contactList);
                table.parentNode.replaceChild(searchTable, table);
                setPageButtonDisabled(page);
            }
            else {
                console.log(this.statusText + ": " + jsonObject.error);
            }
        }
        xhr.send(jsonPayload);
    }
    catch
    {
        console.log(err.message);
    }
}

function logout() {
    let date = new Date();
    date.getTime();
    document.cookie = "userID=0;path=/;expires=" + date.toGMTString();
    window.location.href = "loginpage.html";
}

function populateContacts(table, userID, contactList) {
    for (let i = 0; i < contactList.length; i++) {
        let row = table.insertRow(table.rows.length)
        let firstNameCell = row.insertCell(row.cells.length);
        let firstNameTextNode = document.createTextNode(contactList[i].FirstName);
        firstNameCell.appendChild(firstNameTextNode);
        let lastNameCell = row.insertCell(row.cells.length);
        let lastNameTextNode = document.createTextNode(contactList[i].LastName);
        lastNameCell.appendChild(lastNameTextNode);
        let emailCell = row.insertCell(row.cells.length);
        let emailTextNode = document.createTextNode(contactList[i].Email);
        emailCell.appendChild(emailTextNode);
        let phoneNumberCell = row.insertCell(row.cells.length);
        let phoneNumberTextNode = document.createTextNode(contactList[i].PhoneNumber);
        phoneNumberCell.appendChild(phoneNumberTextNode);
        let dateCreatedCell = row.insertCell(row.cells.length);
        let dateCreatedTextNode = document.createTextNode(contactList[i].DateCreated);
        dateCreatedCell.appendChild(dateCreatedTextNode);
        let deleteEditCell = row.insertCell(row.cells.length);
        let deleteButton = document.createElement('button');
        let editButton = document.createElement('button');
        editButton.href = "";
        editButton.setAttribute("data-toggle", "modal");
        editButton.setAttribute("data-target", "#editContactForm");
        editButton.className = "button"
        editButton.innerHTML = 'EDIT';
        editButton.onclick = function () {
            editID = contactList[i].ID;
            document.getElementById("editfirstname").value = contactList[i].FirstName;
            document.getElementById("editlastname").value = contactList[i].LastName;
            document.getElementById("editemail").value = contactList[i].Email;
            document.getElementById("editphone").value = contactList[i].PhoneNumber;
        }
        deleteButton.innerHTML = 'DELETE';
        deleteButton.onclick = function () {
            deleteContact(userID, contactList[i].ID);
        }
        deleteEditCell.appendChild(editButton);
        deleteEditCell.appendChild(deleteButton);
    }
}

function setPageButtonDisabled(page) {
    let table = document.getElementById("pagelist").getElementsByTagName('tbody')[0];
    let cells = table.rows[0].cells;
    for (let i = 0; i < cells.length; i++) {
        let pageButton = cells[i].childNodes[0];
        pageButton.disabled = false;
    }
    let pageButton = cells[page].childNodes[0];
    pageButton.disabled = true;
}

// Function used to create the cookie that will hold the user's userID.
function makeCookie(cookieName, userID) {
    document.cookie = cookieName + "=" + userID + ";path=/";
}

// Grabs the user's ID.
function fetchCookie(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}
